# Notifikasi lintas pihak dan simplifikasi double-agree

Status: disetujui untuk lanjut ke rencana implementasi
Tanggal: 2026-08-31

## Masalah

Dua masalah yang ditemukan saat testing manual alur kesepakatan:

1. Notifikasi (`useNotifications.ts`, halaman `/notifikasi`) cuma mencakup satu event dari kurang lebih delapan event yang ada di siklus hidup kesepakatan: penawaran baru masuk. Semua event lain (offer dipilih, salah satu pihak setuju, terkunci, bukti dikirim, dikonfirmasi, dibatalkan, dilaporkan tidak dibayar) cuma memicu `toast()` lokal yang cuma terlihat oleh pihak yang barusan melakukan aksi itu sendiri, tidak pernah sampai ke lawan transaksinya kecuali mereka kebetulan membuka ulang halaman.
2. Setelah klien memilih satu penawaran (`selectOffer`), sistem masih meminta klien menekan tombol Setuju terpisah lagi di halaman Kesepakatan sebelum dianggap setuju. Memilih penawaran tertentu dari kemungkinan banyak penawaran yang masuk sudah merupakan tindakan yang tidak ambigu, jadi klik Setuju kedua dari pihak yang sama tidak menambah nilai, cuma menambah friksi.

Selain itu, ditemukan gap terpisah yang terkait langsung: batas waktu 2 hari untuk konfirmasi klien (status `waiting-confirmation` ke `completed-unconfirmed`) sudah punya RPC (`close_without_confirmation`) dan sudah di-wire di `StoreContext`, tapi tidak pernah dipanggil dari komponen manapun. Tanpa perbaikan ini, event terakhir dari siklus notifikasi (auto-timeout) tidak akan pernah muncul juga.

## Tujuan

- Setiap pihak dapat notifikasi yang persisten (bertahan lintas sesi/refresh, bukan cuma toast sekilas) untuk setiap event yang relevan bagi mereka di siklus hidup kesepakatan.
- Copy notifikasi terasa manusiawi, bukan seperti log sistem. Tanpa em dash dan tanpa emoji, sesuai preferensi yang sudah dikonfirmasi.
- Klien tidak perlu klik Setuju terpisah setelah memilih penawaran. Kesepakatan tetap butuh persetujuan eksplisit dari kedua pihak sebagai fakta yang tercatat, cuma klien mendapatkannya otomatis dari tindakan memilih.
- Batas waktu 2 hari benar-benar berjalan (dihitung saat halaman dibuka, sesuai keputusan masterplan bagian 11.2, bukan cron job).

## Non-tujuan

- Tidak membangun push notification (di luar scope kompetisi, lihat masterplan bagian 5 "Jangan Dibangun").
- Tidak mengubah badge chat yang sudah berfungsi (`unreadByThread`, `chatUnreadCount`) — itu sistem terpisah yang sudah bekerja dengan baik.
- Tidak mengubah tampilan/alur `OfferModal`, `CompletionModal`, `ConfirmationModal` di luar penghapusan kebutuhan tombol Setuju kedua dari klien (yang sudah otomatis hilang dari render tanpa perubahan komponen, lihat bagian Double-agree di bawah).

## Kendala penting

Repo ini tidak menyimpan source SQL dari fungsi-fungsi RPC yang sudah berjalan di Supabase (`create_job`, `submit_offer`, `select_offer`, `agree_to_agreement`, `submit_proof`, `confirm_completion`, `close_without_confirmation`, `cancel_agreement`, `report_unpaid`, `get_or_create_thread`, `send_message`). Tidak ada folder `supabase/`, tidak ada CLI Supabase ter-install, `.env` cuma punya anon key. Karena itu, desain ini sengaja **menghindari mengedit isi fungsi-fungsi RPC yang sudah ada** dan malah menambahkan trigger Postgres baru di tabel `offers` dan `agreements`. Trigger bekerja di level tabel, jadi berlaku otomatis untuk perubahan data lewat RPC manapun yang menyentuh tabel itu, tanpa perlu tahu isi fungsinya. Ini juga sekaligus jadi mekanisme untuk simplifikasi double-agree.

Perubahan skema/fungsi akan ditulis sebagai file migrasi SQL di repo. Josep (pemilik project) yang menjalankannya manual lewat SQL Editor di dashboard Supabase, karena sesi ini tidak punya kredensial untuk eksekusi langsung.

## Pendekatan yang dipilih

Trigger-based, bukan edit RPC langsung:

- **Tabel `notifications` baru**, diisi oleh trigger, dibaca lewat polling dari frontend (pola sama seperti chat: bukan WebSocket, sesuai keputusan masterplan 11.1).
- **Trigger `BEFORE INSERT` di `agreements`** memaksa `client_agreed = true` pada setiap baris baru. Ini menggantikan rencana awal "edit RPC `select_offer`" karena baris `agreements` cuma pernah dibuat sebagai akibat langsung klien memilih penawaran, jadi memaksa kolom ini benar untuk semua RPC yang membuat baris ini, apapun isi fungsinya.
- **Trigger `AFTER INSERT` di `offers`** dan **`AFTER UPDATE` di `agreements`** yang membaca `OLD`/`NEW` untuk mendeteksi transisi state, lalu `INSERT` satu baris ke `notifications` untuk pihak yang relevan.

Alternatif yang dipertimbangkan dan ditolak: menurunkan notifikasi di sisi client dengan cara diff data yang sudah di-poll (mirip cara "penawaran masuk" bekerja sekarang). Ditolak karena rapuh terhadap race condition, kehilangan informasi siapa pelaku sebenarnya, dan tidak bertahan lintas device karena state "sudah dilihat" cuma di localStorage sementara datanya sendiri tidak persisten.

## Desain

### 1. Simplifikasi double-agree

```sql
create or replace function trg_agreement_client_autoagree()
returns trigger as $$
begin
  new.client_agreed := true;
  return new;
end;
$$ language plpgsql;

create trigger agreement_client_autoagree
before insert on agreements
for each row execute function trg_agreement_client_autoagree();
```

Tidak ada perubahan komponen React yang dibutuhkan. `AgreementPage.tsx` sudah merender kondisional berdasarkan `agreement.clientAgreed`:

```
agreedByMe ? <p>Kamu sudah setuju...</p> : <Button>Setuju</Button>
```

Begitu `client_agreed` datang `true` dari server, tombol Setuju untuk klien otomatis tidak pernah tampil.

**Asumsi yang perlu diverifikasi saat implementasi**: logika penguncian di `agree_to_agreement` diasumsikan sudah berbentuk "set kolom agreed milik pemanggil jadi true, lalu kalau kedua kolom agreed true, set status jadi locked". Kalau asumsi ini benar, satu klik Setuju dari pekerja langsung mengunci kesepakatan begitu trigger di atas membuat `client_agreed` sudah true duluan. Ini harus diuji langsung di aplikasi sebagai langkah pertama sebelum melanjutkan bagian lain, karena repo ini tidak punya akses ke source RPC untuk memastikan asumsi ini dari kode.

### 2. Tabel `notifications`

```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in (
    'offer_received', 'offer_selected', 'agreement_locked',
    'proof_submitted', 'completion_confirmed', 'agreement_cancelled',
    'unpaid_reported', 'completion_timeout'
  )),
  text text not null,
  href text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "select own notifications" on notifications
  for select using (user_id = auth.uid());

create policy "update own notifications" on notifications
  for update using (user_id = auth.uid());

create policy "delete own notifications" on notifications
  for delete using (user_id = auth.uid());
```

Tidak ada policy `insert` untuk role `authenticated` secara sengaja. Baris cuma pernah dibuat lewat trigger, yang berjalan sebagai fungsi `security definer` di dalam RPC yang sudah ada, jadi otomatis melewati RLS. Ini mencegah user biasa membuat notifikasi palsu untuk dirinya sendiri lewat panggilan langsung ke tabel.

"Tandai dibaca" dan "hapus notifikasi" tidak lagi lewat RPC atau localStorage. Karena tabelnya sudah punya RLS yang membatasi ke baris milik sendiri, frontend bisa langsung:
- `UPDATE notifications SET read_at = now() WHERE user_id = me AND read_at IS NULL` saat halaman `/notifikasi` dibuka (menggantikan `markNotificationsSeen` yang sekarang cuma menyimpan timestamp di localStorage).
- `DELETE FROM notifications WHERE id = ...` saat tombol X diklik (menggantikan `dismiss` yang sekarang cuma menyimpan id di localStorage).

Efeknya, status baca dan status dismiss ikut akun, bukan ikut browser/device.

### 3. Trigger notifikasi per event

```sql
create or replace function trg_offer_notify()
returns trigger as $$
declare
  v_job jobs;
begin
  select * into v_job from jobs where id = new.job_id;
  insert into notifications (user_id, type, text, href)
  values (
    v_job.poster_id,
    'offer_received',
    'Ada yang tertarik nih sama kerjaanmu, cek penawarannya',
    '/pekerjaan/' || v_job.id
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger offer_notify
after insert on offers
for each row execute function trg_offer_notify();
```

```sql
create or replace function trg_agreement_notify()
returns trigger as $$
declare
  v_job jobs;
  v_client profiles;
  v_worker profiles;
begin
  select * into v_job from jobs where id = new.job_id;
  select * into v_client from profiles where id = new.client_id;
  select * into v_worker from profiles where id = new.worker_id;

  if tg_op = 'INSERT' then
    insert into notifications (user_id, type, text, href) values (
      new.worker_id,
      'offer_selected',
      'Kabar baik! ' || v_client.name || ' pilih penawaranmu buat "' || v_job.title || '", klik Setuju biar bisa mulai',
      '/kesepakatan/' || new.id
    );
    return new;
  end if;

  if new.status = 'locked' and old.status is distinct from 'locked' then
    insert into notifications (user_id, type, text, href) values (
      case when auth.uid() = new.client_id then new.worker_id else new.client_id end,
      'agreement_locked',
      'Deal! Kesepakatan sama ' ||
        (case when auth.uid() = new.client_id then v_worker.name else v_client.name end) ||
        ' buat "' || v_job.title || '" udah terkunci',
      '/kesepakatan/' || new.id
    );
  end if;

  if new.status = 'waiting-confirmation' and old.status is distinct from 'waiting-confirmation' then
    insert into notifications (user_id, type, text, href) values (
      new.client_id,
      'proof_submitted',
      v_worker.name || ' bilang "' || v_job.title || '" udah kelar, cek hasilnya dan kasih testimoni',
      '/kesepakatan/' || new.id
    );
  end if;

  if new.status = 'completed' and old.status is distinct from 'completed' then
    insert into notifications (user_id, type, text, href) values (
      new.worker_id,
      'completion_confirmed',
      v_client.name || ' baru aja kasih testimoni buat kerjaanmu di "' || v_job.title || '"',
      '/kesepakatan/' || new.id
    );
  end if;

  if new.status = 'completed-unconfirmed' and old.status is distinct from 'completed-unconfirmed' then
    insert into notifications (user_id, type, text, href) values (
      new.worker_id,
      'completion_timeout',
      'Yah, ' || v_client.name || ' tidak merespons dalam 2 hari buat "' || v_job.title || '". Statusnya jadi Selesai (Belum Dikonfirmasi), tanpa rating.',
      '/kesepakatan/' || new.id
    );
  end if;

  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    insert into notifications (user_id, type, text, href) values (
      case when new.cancelled_by = new.client_id then new.worker_id else new.client_id end,
      'agreement_cancelled',
      'Yah, ' ||
        (case when new.cancelled_by = new.client_id then v_client.name else v_worker.name end) ||
        ' batalin kesepakatan "' || v_job.title || '"',
      '/kesepakatan/' || new.id
    );
  end if;

  if new.unpaid_reported = true and coalesce(old.unpaid_reported, false) = false then
    insert into notifications (user_id, type, text, href) values (
      new.client_id,
      'unpaid_reported',
      v_worker.name || ' melaporkan pembayaran belum diterima untuk "' || v_job.title || '"',
      '/kesepakatan/' || new.id
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger agreement_notify
after insert or update on agreements
for each row execute function trg_agreement_notify();
```

Catatan: fungsi ini dan `trg_agreement_client_autoagree` harus jadi dua trigger terpisah pada `agreements` (satu `before insert`, satu `after insert or update`) supaya urutan eksekusinya jelas dan gampang ditest satu-satu.

### 4. Batas waktu 2 hari (frontend)

Ditambahkan di `useNotifications.ts`, di efek yang sama dengan yang sudah memuat data agreements (lewat `useStore`). Logikanya:

```
untuk setiap agreement di myAgreements:
  kalau status === 'waiting-confirmation'
  dan currentUser.id === agreement.clientId
  dan (Date.now() - new Date(agreement.proof.submittedAt).getTime()) > 2 hari
  maka panggil closeWithoutConfirmation(agreement.id)
```

Cek dilakukan cuma dari sisi klien (bukan pekerja) karena secara logis ini konsekuensi dari inaksi klien, jadi wajar kalau yang memicu pengecekan adalah sesi klien yang sedang membuka aplikasi. RPC `close_without_confirmation` diasumsikan sudah melakukan validasi ulang syarat di sisi server (bukan cuma percaya trigger dari 2 hari), jadi aman dipanggil lebih dari sekali. Ini juga perlu diverifikasi saat implementasi.

### 5. Perubahan frontend

- `src/lib/api.ts`: tambah `fetchNotifications(userId)`, `markNotificationsRead(userId)`, `dismissNotification(id)`. Hapus `fetchOffersReceived` kalau memang sudah tidak dipakai di tempat lain (sudah dicek, cuma dipakai `useNotifications.ts`).
- `src/hooks/useNotifications.ts`: ganti polling `receivedOffers` dengan polling `fetchNotifications(userId)` tiap `POLL_MS` (tetap 20000, tidak berubah). `unreadCount` dihitung dari `read_at IS NULL`, bukan dari perbandingan timestamp localStorage. Tambahkan efek pengecekan batas 2 hari dari bagian 4.
- `src/pages/Notifications.tsx`: `markNotificationsSeen` memanggil `markNotificationsRead` (server), `dismiss` memanggil `dismissNotification` (server, hapus baris). Tampilan list tidak berubah.
- Hapus fungsi-fungsi localStorage yang jadi tidak terpakai (`readDismissedSet`, `readMap`, `writeMap`, kunci `ss:notif:dismissed:*`) kalau memang sudah tidak ada pemakaian lain.

## Pengujian

Sesuai catatan masterplan bagian 11.3, alur ini butuh dua akun aktif bersamaan untuk diuji dengan benar. Skenario minimal:

1. Akun B ajukan penawaran ke job milik akun A. A harus dapat notifikasi "offer_received".
2. A pilih penawaran B. B harus dapat notifikasi "offer_selected". Cek juga bahwa halaman Kesepakatan untuk A tidak lagi menampilkan tombol Setuju (karena `client_agreed` sudah true).
3. B klik Setuju. Verifikasi status langsung jadi `locked` (bukan `waiting-approval`). A harus dapat notifikasi "agreement_locked".
4. B tandai selesai. A harus dapat notifikasi "proof_submitted".
5. A konfirmasi + testimoni. B harus dapat notifikasi "completion_confirmed".
6. Uji pembatalan dari kedua arah (A batalin, lalu di kesepakatan lain B batalin), pastikan notifikasi selalu ke pihak yang tidak membatalkan.
7. B lapor tidak dibayar. A harus dapat notifikasi "unpaid_reported".
8. Uji batas 2 hari: submit bukti, lalu manipulasi `proof.submittedAt` langsung di database jadi lebih dari 2 hari lalu (karena tidak realistis menunggu beneran), buka ulang aplikasi sebagai A, verifikasi status berubah jadi `completed-unconfirmed` dan B dapat notifikasi "completion_timeout".
9. Verifikasi tombol dismiss dan buka halaman notifikasi menghapus/menandai baca notifikasi itu secara permanen di database (refresh halaman, notifikasi yang sudah dibaca tidak balik lagi).

## Risiko dan asumsi terbuka

- Asumsi soal logika `agree_to_agreement` (lihat bagian 1) belum terverifikasi karena tidak ada akses ke source RPC yang sudah ada. Ini jadi langkah pertama yang wajib diuji sebelum melanjutkan sisa implementasi.
- Asumsi soal `close_without_confirmation` sudah divalidasi ulang syaratnya di server (lihat bagian 4), sama-sama belum terverifikasi dari kode.
- Semua perubahan skema dijalankan manual oleh Josep di SQL Editor Supabase. Tidak ada rollback otomatis kalau ada kesalahan di satu langkah; migrasi akan dipecah jadi urutan kecil (tabel dulu, lalu trigger double-agree, lalu trigger notifikasi) supaya gampang diverifikasi satu-satu.
