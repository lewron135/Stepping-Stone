# MASTERPLAN FINAL: Stepping Stone

> **Dokumen ini adalah konteks lengkap proyek.** Ditulis supaya bisa ditempel langsung ke AI assistant mana pun sebagai briefing awal. Setelah membaca ini, kamu (manusia atau AI) harus paham: ini aplikasi apa, kenapa dibangun begini, apa yang dibangun, apa yang TIDAK boleh dibangun, dan alasan di balik tiap keputusan.

---

## ATURAN MAIN UNTUK AI YANG MEMBACA DOKUMEN INI

Sebelum memberi saran apa pun, pahami hal berikut:

1. **Keputusan di dokumen ini sudah melewati riset dan uji tekan panjang.** Bagian "Keputusan yang Sudah Dikunci" berisi hal-hal yang sudah dipertimbangkan matang beserta alasannya. Jangan menyarankan membalikkannya tanpa membaca alasannya lebih dulu.
2. **Ada bagian "Jangan Dibangun".** Itu bukan daftar fitur yang belum sempat dipikirkan. Itu daftar hal yang sengaja ditolak, sebagian karena berisiko diskualifikasi lomba.
3. **Ini proyek kompetisi dengan tenggat ketat**, bukan startup yang dibangun bertahun-tahun. Saran yang benar secara arsitektur tapi memakan waktu berlebihan adalah saran yang salah untuk konteks ini.
4. **Prioritas utama: fungsi inti berjalan sempurna, bukan jumlah fitur banyak.** Rubrik juri menilai "keberhasilan implementasi fungsi utama", bukan panjang daftar fitur.

---

## 1. IDENTITAS PROYEK

| Hal | Isi |
|---|---|
| **Nama produk** | Stepping Stone |
| **Tagline** | Get paid. Get proof. |
| **Jenis** | Web app (bukan mobile app) |
| **Kompetisi** | ITechno Cup 2026, kategori Web Development Mahasiswa (Nasional) |
| **Penyelenggara** | HIMATIK, Politeknik Negeri Jakarta |
| **Tim** | 3 orang |
| **Deadline submit** | Minggu, 6 September 2026, 23.59 WIB |
| **Babak final** | Sabtu, 20 September 2026, 08.30 (daring, 10 finalis) |
| **Pengumuman pemenang** | 28 September 2026 |
| **SDG yang diangkat** | SDG 8 — Pekerjaan Layak dan Pertumbuhan Ekonomi |
| **Tema panitia** | Adaptive Innovation for a Future-Ready Digital Society |
| **Subtema panitia** | Smart Sustainable Digital Solution for Inclusive Society |

**Kalimat satu baris:** Stepping Stone adalah tempat mahasiswa mengambil kerja kecil berbayar dari sesama mahasiswa, dan setiap pekerjaan yang selesai menjadi bukti pengalaman yang tercatat.

---

## 2. MASALAH YANG DIPECAHKAN

### Masalah utama: paradoks pengalaman

Mahasiswa semester awal sering sudah punya skill (desain, edit video, ngoding), tapi susah dapat kesempatan menerapkannya karena hampir semua perusahaan minta pengalaman lebih dulu.

> Butuh pengalaman untuk dapat kerja. Butuh kerja untuk dapat pengalaman.

Yang kurang bukan skill-nya, tapi **kesempatan membuktikannya**.

### Kenapa sesama mahasiswa jadi jawabannya

Perusahaan mapan punya gerbang: minta pengalaman dulu baru kasih kesempatan. Sesama mahasiswa tidak punya gerbang itu. Panitia acara yang butuh poster besok tidak peduli kamu punya pengalaman dua tahun atau tidak — mereka cuma peduli hasilnya bagus dan harganya masuk akal.

Artinya ada kolam permintaan yang **letaknya dekat, jumlahnya banyak, dan pintunya terbuka**.

### Masalah pendukung: pasar jasa kampus yang berantakan

Pasar jasa antar mahasiswa sudah ada sekarang, terjadi tiap hari di kolom balasan menfess kampus, grup WhatsApp angkatan, dan story Instagram. Tiga kelemahannya:

| Kelemahan | Akibatnya |
|---|---|
| Tidak ada pengikat | Sudah janjian, tiba-tiba dibatalkan sepihak. Yang siap berangkat rugi waktu, tanpa konsekuensi apa pun |
| Perang harga | Semua penawaran terlihat terbuka, orang saling menurunkan harga untuk menang |
| Jejaknya hilang | Sudah mengerjakan 20 desain untuk teman sekampus, tapi tidak ada catatan yang bisa ditunjukkan |

### Kenapa dua masalah ini disatukan

Solusinya sama. Kalau kesepakatan dikunci di sistem, otomatis ada catatan siapa mengerjakan apa, untuk siapa, dengan hasil seperti apa. **Satu mekanisme, dua manfaat.**

---

## 3. KONSEP KUNCI: DUA JENIS PEKERJAAN

Ini keputusan desain paling penting di seluruh produk. Pekerjaan dipisah jadi dua kategori yang tampil di **dua tab berbeda**.

### Tab "Kerja Cepat"
- Contoh: antar jemput, titip beli makan, angkut barang pindahan
- Nilai: Rp5.000 – Rp15.000
- Frekuensi: hampir tiap hari
- **Fungsinya:** mesin yang membuat orang membuka website setiap hari

### Tab "Proyek"
- Contoh: desain poster, edit video, olah data, website sederhana
- Nilai: puluhan sampai ratusan ribu
- Frekuensi: lebih jarang
- **Fungsinya:** menghasilkan bukti pengalaman yang layak ditunjukkan

### Kenapa harus dipisah

- Kalau **digabung**: postingan antar jemput yang puluhan per hari akan menenggelamkan postingan desain yang cuma beberapa per minggu. Yang paling bernilai jadi paling tidak terlihat.
- Kalau **Kerja Cepat dihapus** supaya terlihat profesional: aplikasinya jadi sepi karena tidak ada alasan orang membukanya tiap hari.

Jadi dua-duanya dipertahankan, tapi beda tempat.

---

## 4. MEKANISME INTI (INI YANG BIKIN BEDA)

### 4.1 Kesepakatan Terkunci Dua Sisi

Setelah kedua pihak menekan setuju, sistem mengunci **harga, waktu, dan nama kedua belah pihak**. Harga tidak bisa ditawar ulang setelah terkunci, dan pembatalan meninggalkan jejak.

### 4.2 Brief Wajib

Waktu memasang pekerjaan, **tidak boleh cuma menulis judul bebas**. Wajib mengisi tiga kolom:
- **Lingkup kerja** — apa yang perlu dikerjakan
- **Hasil akhir** — apa yang diserahkan (contoh: "file PNG ukuran A3")
- **Tenggat** — kapan harus selesai

Ini yang membuat pekerjaan kecil berhenti terasa asal-asalan. Pekerjaan Rp15.000 dengan brief yang jelas tetap menunjukkan kemampuan bekerja dengan batasan.

### 4.3 Rekam Jejak Dua Arah

Bukan cuma pengerja yang punya catatan. **Pemberi kerja juga**, karena mereka bisa membatalkan sepihak atau kabur tanpa membayar.

Sebelum menerima tawaran, pengerja bisa lihat: orang ini sudah berapa kali memesan, berapa kali membatalkan, berapa kali dilaporkan belum membayar.

### 4.4 Testimoni sebagai Referensi

Setelah pekerjaan selesai, pemberi kerja menulis **satu kalimat** tentang hasilnya. Ini bukan sekadar rating bintang — ini referensi tertulis dari orang yang benar-benar membayar. Dalam dunia kerja, referensi lebih berharga daripada jumlah proyek.

### 4.5 Perlindungan Pengerja

Karena pembayaran terjadi di luar sistem, ada risiko pemberi kerja kabur setelah pekerjaan selesai. Tiga lapis perlindungan:

1. Kalau lewat **2 hari** tidak ada konfirmasi, status jadi **"Selesai (belum dikonfirmasi)"** — **TANPA rating dan TANPA testimoni**
2. Pengerja bisa klik **"Laporkan belum dibayar"**
3. Laporan itu tercatat **permanen di profil pemberi kerja**, terlihat sebelum orang menerima tawaran berikutnya

### 4.6 Profil sebagai Portofolio

Dua blok terpisah, karena mengukur hal berbeda:

| Blok | Isinya | Menjawab |
|---|---|---|
| **Portofolio** | Dikelompokkan per kategori dengan angka ("8 desain untuk 6 klien"), plus bukti foto dan testimoni | "Apa yang bisa dia kerjakan" |
| **Rekam Jejak** | Jumlah selesai, batal, dan laporan belum dibayar | "Apakah dia bisa diandalkan" |

Profil bisa dibagikan lewat **tautan publik**, bisa dibuka orang yang tidak punya akun.

### 4.7 Chat Dalam Aplikasi

Obrolan terjadi **di dalam sistem**, bukan dilempar ke WhatsApp. Ini memungkinkan negosiasi harga sebelum kesepakatan dikunci, sekaligus menjaga seluruh percakapan tetap terbaca sistem.

**Implementasi teknis: polling tiap 2–3 detik, BUKAN WebSocket.** Alasannya ada di bagian Keputusan Teknis.

### 4.8 Slot Jumlah Orang

Satu postingan bisa membutuhkan lebih dari satu pengerja (contoh: pindahan kos butuh 5 orang). Postingan punya kolom **"butuh berapa orang"** dan status **"3/5 terisi"** di feed.

**PENTING:** di baliknya, kesepakatan tetap **1-lawan-1**. Satu postingan "butuh 5 orang" adalah wadah untuk 5 kesepakatan terpisah, masing-masing punya status, bukti foto, testimoni, dan rekam jejak sendiri-sendiri.

Alasannya: tiap orang bisa selesai di waktu berbeda, satu bisa tidak datang, dan tiap orang harus punya jejak sendiri. Kesepakatan gabungan akan merusak seluruh sistem rekam jejak.

**Implementasi input jumlah orang:** dropdown 1–5 + opsi "Lainnya (isi sendiri)" tanpa batas atas — ditambah dari rencana awal atas permintaan tim, supaya bisa lebih dari 5 orang kalau perlu.

### 4.9 Tag Area

**Berubah dari rencana awal.** Semula direncanakan dropdown lokasi tetap per kampus ("Sekitar Fakultas Teknik", "Sekitar Kos Blok C"). Yang dipakai sekarang: **input teks bebas, opsional** ("Contoh: Sekitar Kampus, Dekat Stasiun, dll") — supaya aplikasi tidak terkunci ke satu kampus tertentu. Filter di feed dihitung dinamis dari area yang benar-benar ada di data, bukan daftar hardcode.

Tetap **BUKAN GPS atau koordinat** — cuma penanda area umum. Hanya relevan di tab Kerja Cepat — pekerjaan desain tidak butuh lokasi.

### 4.10 AI Career Compass (fitur pendukung)

Unggah CV → sistem mengekstrak skill → merekomendasikan pekerjaan di tab Proyek yang **sedikit di atas kemampuan sekarang** dan mengarah ke skill yang belum dimiliki.

**Prinsip:** kesenjangan skill adalah tujuan, pekerjaan adalah jalannya. Jangan merekomendasikan yang orangnya belum sanggup, tapi juga jangan yang sudah terlalu mudah.

**Privasi (wajib):** file CV mentah **dihapus** segera setelah ekstraksi. Hanya daftar skill yang disimpan. Sediakan tombol hapus data di pengaturan.

### 4.11 AI Search Assistant (fitur pendukung, opsional)

> Ditambahkan 29 Agustus 2026, setelah salah satu anggota tim mengusulkan ide kotak pencarian bahasa natural di feed.

**Ide:** kotak pencarian bahasa natural di atas feed. User mengetik kalimat bebas (misal *"cari kerjaan desain yang deket kampus, harga di bawah 50 ribu"*), sistem menerjemahkannya jadi filter terstruktur (tab, kategori, area, harga maksimal), lalu filter itu dijalankan lewat logika filter yang sudah ada di feed — **bukan** LLM yang menyortir daftar pekerjaan secara langsung.

**Kenapa begini, bukan chatbot yang "menyortir kerjaan":**
- LLM cuma bertugas menerjemahkan niat → JSON filter terstruktur (pakai Structured Outputs/Zod schema di Claude API, bukan parsing string bebas). Sorting/filtering tetap kode deterministik yang sudah ada di komponen filter feed. Ini jauh lebih murah, cepat, dan gampang diuji dibanding minta LLM mengembalikan daftar pekerjaan lengkap.
- Kalau API gagal, limit habis, atau tidak ada koneksi, **wajib ada fallback keyword-match biasa** (string match ke judul/kategori/tag) supaya pencarian tetap berfungsi tanpa AI sama sekali.

**Model & biaya:** Claude Haiku 4.5 (`claude-haiku-4-5`), model termurah yang cukup untuk tugas ekstraksi terstruktur seperti ini. Estimasi ±$0,001 per query — dengan budget $5 credit Anthropic yang tim punya, itu ±4.000–5.000 query, jauh lebih dari cukup untuk development sampai demo final.

**Kunci arsitektur (wajib dipatuhi):**
- API key Anthropic **tidak boleh** ada di kode frontend — harus lewat backend/serverless function (lihat Keputusan Teknis 11.6 dan catatan di bagian 20 soal opsi Supabase Edge Function/Vercel serverless, karena project settled di Vite tanpa server custom).
- Trigger saat submit, bukan tiap ketikan (kontrol biaya & UX).
- Saat demo di depan juri, siapkan beberapa query contoh dengan jawaban yang sudah direkam/di-cache — sama seperti aturan 11.4 untuk Career Compass.

**Positioning ke juri:** ini "asisten pencarian", bukan "AI job-matcher". Jangan disandingkan sebagai pengganti atau saingan Career Compass — dua fitur ini punya tujuan beda (Search Assistant = mempercepat menemukan, Career Compass = merekomendasikan yang sedikit di atas level skill).

**Prioritas:** masuk daftar "Sebaiknya Ada" (lihat bagian 10), dikerjakan Orang C setelah Career Compass dan fitur wajib lain selesai. Kalau waktu mepet menjelang 3 September, ini yang pertama dipotong — bukan Career Compass, karena Career Compass sudah lebih dulu direncanakan dan masuk penilaian dokumentasi.

**Status implementasi saat ini: belum dikerjakan.** Tim masih fokus membangun frontend dulu — bagian ini murni catatan rencana supaya konteksnya tidak hilang sebelum dieksekusi.

---

## 5. YANG STEPPING STONE TIDAK LAKUKAN

Ini menjaga produk tetap jujur dan tidak overclaim di depan juri.

- **Tidak mengurus CV siapa pun.** Tidak ada ekspor CV, template CV, atau skor kesiapan kerja. Platform cuma memastikan pekerjaan tercatat rapi dengan bukti dan testimoni. Mau dipakai di CV atau tidak, itu keputusan penggunanya.
- **Tidak menjanjikan siapa pun diterima kerja.** Yang dijanjikan cuma yang bisa dibuktikan di layar: pekerjaan ini terjadi, ini yang dikerjakan, ini yang membayar, ini kapan.

---

## 6. MODEL BISNIS

Stepping Stone mengambil **biaya admin dari setiap transaksi yang dikunci di sistem**, mirip Gojek, Tokopedia, atau Fiverr.

Ada **ambang minimum nilai transaksi**. Di bawah ambang itu bebas biaya, karena transaksi Rp10.000 tidak masuk akal dipotong biaya admin yang ongkos prosesnya sendiri bisa lebih besar. Artinya pendapatan terkonsentrasi di tab Proyek, sementara tab Kerja Cepat berfungsi menjaga orang tetap aktif.

| Tahap | Yang dilakukan |
|---|---|
| **Versi kompetisi (sekarang)** | Biaya admin ditampilkan sebagai rincian transparan di layar kesepakatan: *"Harga Rp50.000 + biaya admin Rp2.500"*. **Murni tampilan, tidak memproses uang sungguhan** |
| **Pengembangan lanjut** | Payment gateway (Midtrans/Xendit) dengan penahanan dana: uang masuk ke platform dulu, diteruskan ke pengerja setelah selesai |

---

## 7. TECH STACK

| Bagian | Teknologi | Alasan |
|---|---|---|
| Frontend | **Vite (React) + Tailwind CSS** | Cepat dibangun, komponen responsif. **(Berubah dari rencana awal Next.js — scaffold FE yang dipakai tim dari awal ternyata Vite, bukan Next.js, jadi rencana disesuaikan ke kenyataan alih-alih migrasi besar di tengah waktu sempit)** |
| Backend | **Tidak ada server custom** — FE (Vite) manggil Supabase langsung + Postgres RPC functions | **Berubah dari rencana awal (Node.js lewat API Routes Next.js).** Karena FE ternyata Vite bukan Next.js, API Routes jadi tidak relevan. Logika bisnis yang butuh ubah beberapa tabel sekaligus secara atomic dipindah ke database function (RPC), dipanggil lewat `supabase.rpc(...)` |
| Database | **Supabase (Postgres)** | **Berubah dari rencana awal MongoDB.** Skema datanya (jobs/offers/agreements/dst) relasional lewat foreign key, jadi lebih cocok Postgres. Supabase juga sekalian kasih Auth + Storage + Row Level Security bawaan, hemat waktu untuk deadline mepet |
| AI | **Claude API (Anthropic), model Haiku 4.5** | Ekstraksi skill dari CV (Career Compass) dan, kalau sempat, parsing query bahasa natural jadi filter terstruktur (Search Assistant — lihat 4.11). Dipilih karena tim punya $5 credit Anthropic; Haiku 4.5 murah (±$0,001/panggilan) dan cukup untuk tugas ekstraksi terstruktur, tidak butuh reasoning berat |
| Hosting | **Vercel** | Gratis, direkomendasikan panitia |

**Kenapa gak ada backend/server custom:** Supabase sekaligus jadi database, auth, dan lapisan API (PostgREST otomatis + RPC functions buat logika bisnis) — jadi gak perlu server terpisah yang harus dijaga hidup bersamaan saat live demo di depan juri. Satu dependency eksternal (Supabase), bukan dua layanan yang bisa gagal.

**Aturan lomba terkait teknologi:** framework dan library yang dipakai **wajib dijelaskan peruntukannya di dokumentasi**. Template instan (WordPress, Wix) dilarang.

---

## 8. RANCANGAN DATA (Supabase/Postgres)

**Berubah dari rencana awal (MongoDB, lihat bagian 7).** Ini skema yang beneran sudah dijalankan di project Supabase bersama tim — sumber kebenarannya ada di file `supabase/schema.sql` di repo. Testimoni tidak jadi tabel terpisah (masuk ke kolom `agreements.confirmation`), dan chat pakai nama `threads`/`messages`, bukan `conversations`.

### Tabel: `profiles`
Data tambahan user, terhubung ke `auth.users` bawaan Supabase (Supabase Auth yang pegang email/password, bukan kolom manual). Baris baru otomatis dibuat lewat trigger saat ada yang daftar.
```
id            -> auth.users.id
handle
name
campus
faculty
major
year
bio
skills text[] // hasil ekstraksi CV (Career Compass), boleh kosong
```
**Email TIDAK lagi wajib domain kampus** (lihat bagian 20 lama / catatan di bawah) — bebas Gmail dkk, sesuai keputusan tim supaya aplikasi tidak terkunci ke satu kampus.

### Tabel: `jobs` (postingan pekerjaan)
```
id
poster_id     -> profiles.id
type          // "kerja-cepat" | "proyek"
category
title
scope         // lingkup kerja, wajib
deliverable   // hasil akhir, wajib
deadline      // tenggat, wajib
price
area          // teks bebas, opsional — BUKAN dropdown lagi, lihat bagian 4.9
tags
slots_total   // default 1, bisa lebih untuk pekerjaan banyak orang
slots_filled  // dihitung dari agreement berstatus terkunci/selesai
status        // "open" | "offer-selected" | "in-agreement" | "closed"
created_at
```

### Tabel: `offers` (penawaran)
```
id
job_id        -> jobs.id
worker_id     -> profiles.id
price
note
status        // "pending" | "selected" | "declined"
created_at
```

### Tabel: `agreements` (kesepakatan — INTI SISTEM)
```
id
job_id
offer_id
client_id       -> profiles.id
worker_id       -> profiles.id
price
admin_fee       // tampilan saja, tidak diproses — masih hardcode 5% dari harga, lihat bagian 20
deadline
client_agreed   // boolean
worker_agreed   // boolean
status          // lihat daftar status di bawah
locked_at
proof           jsonb  // { imageUrl?, note, submittedAt }
confirmation    jsonb  // { rating, testimonial, confirmedAt } — testimoni ADA DI SINI, bukan tabel terpisah
cancelled_by    -> profiles.id, null kalau tidak dibatalkan
unpaid_reported // boolean
created_at
```

**Daftar status agreement (nama kolom Postgres, beda dari istilah bahasa Indonesia di diagram 9.1):**
- `waiting-approval` — satu penawaran dipilih, menunggu kedua pihak setuju (≈ "menunggu persetujuan")
- `locked` — kedua pihak sudah setuju, harga final (≈ "terkunci")
- `in-progress` — sudah terkunci, pengerja belum menandai selesai
- `waiting-confirmation` — sudah ditandai selesai, menunggu konfirmasi pemberi kerja
- `completed` — dikonfirmasi + ada testimoni (≈ "selesai")
- `completed-unconfirmed` — lewat 2 hari tanpa respon, tanpa rating (≈ "selesai belum dikonfirmasi")
- `cancelled` — salah satu pihak membatalkan (≈ "batal")

### Tabel: `threads` (wadah chat, dulu direncanakan bernama `conversations`)
```
id
job_id          -> jobs.id
participant_ids // 2 orang
created_at
```

### Tabel: `messages` (isi chat)
```
id
thread_id       -> threads.id
sender_id       -> profiles.id
text
created_at
```

### View (dihitung otomatis, bukan disimpan sebagai kolom)
- `user_stats` — jumlah selesai/batal/laporan belum dibayar per user (mengganti rencana lama "hitung dari collection agreements saat dibutuhkan" — sekarang dihitung lewat database view, prinsipnya sama: tidak disimpan sebagai angka terpisah yang bisa tidak sinkron)
- `user_portfolio` — portofolio (agreement yang sudah `completed`) per user

### Fungsi database (RPC) — logika bisnis atomic, dipanggil dari frontend lewat `supabase.rpc(...)`
`create_job`, `submit_offer`, `select_offer`, `agree_to_agreement`, `submit_proof`, `confirm_completion`, `close_without_confirmation`, `cancel_agreement`, `report_unpaid`, `get_or_create_thread`, `send_message`.

### Row Level Security (RLS)
Aktif di semua tabel. `jobs` dan `profiles` bisa dibaca publik tanpa login (preview feed & profil publik). Tabel lain dibatasi cuma untuk pihak yang terlibat.

---

## 9. ALUR APLIKASI

### 9.1 Diagram status pekerjaan

```
DIBUKA  (menunggu penawaran)
   |
   v
MENUNGGU PERSETUJUAN  (satu penawaran dipilih)
   |
   v
TERKUNCI  (harga final, tidak bisa diubah)
   |
   +----------------------+----------------------+
   v                      v                      v
SELESAI          SELESAI (BELUM           BATAL
                  DIKONFIRMASI)
dikonfirmasi     lewat 2 hari tanpa      salah satu pihak
+ testimoni      respon. TANPA rating.   membatalkan.
masuk portofolio Pengerja bisa klik      Tercatat di rekam
                 "Laporkan belum         jejak pihak yang
                  dibayar"               membatalkan
```

### 9.2 Alur lengkap dari memasang sampai jadi portofolio

```
Pemasang klik "+ Pasang Pekerjaan"
   -> Pilih tab (Kerja Cepat / Proyek) dan kategori
   -> Isi BRIEF WAJIB: lingkup kerja, hasil akhir, tenggat
   -> Isi perkiraan harga
   -> Isi "butuh berapa orang" (default 1)
   -> (Kalau Kerja Cepat) pilih tag area
   -> Postingan muncul di feed, status DIBUKA

Pengerja membuka detail pekerjaan
   -> Baca brief, cek rekam jejak pemasang
   -> Klik "Ajukan Penawaran" + isi harga + catatan
   -> Bisa mulai CHAT dengan pemasang untuk negosiasi harga

Pemasang memilih satu penawaran
   -> Layar Kesepakatan muncul untuk kedua pihak
   -> Kedua pihak klik "Setuju"
        baru satu pihak  -> MENUNGGU PERSETUJUAN
        keduanya sudah   -> TERKUNCI
   -> Setelah terkunci:
        - Harga tidak bisa diubah lagi
        - slotTerisi bertambah 1
        - Kalau slotTerisi == slotDibutuhkan, job jadi "penuh"
        - Tombol WhatsApp muncul sebagai opsi tambahan

Pengerja menyelesaikan pekerjaan
   -> Klik "Tandai Selesai" + unggah bukti foto
        Tab Proyek      -> bukti foto WAJIB
        Tab Kerja Cepat -> bukti foto OPSIONAL
   -> Pemberi kerja punya 2 HARI untuk konfirmasi + tulis testimoni
        lewat 2 hari -> SELESAI (BELUM DIKONFIRMASI), tanpa rating
   -> Kalau uang tidak ditransfer:
        Pengerja klik "Laporkan belum dibayar"
        -> tercatat permanen di profil pemberi kerja
   -> Rekam jejak kedua pihak diperbarui
   -> Kalau tab Proyek: bukti foto otomatis masuk portofolio pengerja
```

### 9.3 Daftar halaman

| Halaman | Isinya |
|---|---|
| **Landing (belum login)** | Nama produk, tagline, penjelasan singkat, **preview feed yang bisa dilihat tanpa login**, tombol Masuk/Daftar |
| **Daftar / Masuk** | Email (bebas, tidak wajib domain kampus — lihat catatan bagian 8), kata sandi, nama, jurusan |
| **Beranda** | Dua tab (Kerja Cepat / Proyek), pencarian, filter kategori dan area, daftar kartu pekerjaan, tombol "+ Pasang Pekerjaan" |
| **Form Pasang Pekerjaan** | Tab, kategori, judul, 3 kolom brief wajib, harga, jumlah orang, tag area |
| **Detail Pekerjaan** | Brief lengkap, profil + rekam jejak pemasang, daftar penawaran, tombol Ajukan Penawaran, chat |
| **Layar Kesepakatan** | Ringkasan, rincian biaya admin, tombol Setuju masing-masing pihak, indikator siapa sudah setuju |
| **Chat** | Daftar percakapan, isi percakapan (polling 2–3 detik) |
| **Aktivitas Saya** | Pekerjaan berjalan, dipisah sebagai pengerja / sebagai pemberi kerja, dengan statusnya |
| **Profil** | Blok Portofolio, blok Rekam Jejak, tombol Bagikan Profil, pengaturan privasi |
| **Career Compass** | Unggah CV, panel skill terdeteksi, rekomendasi pekerjaan tab Proyek |
| **Syarat & Ketentuan** | Halaman statis |

**Penting:** landing page harus menampilkan preview feed **tanpa perlu login**, supaya juri yang membuka tautan langsung melihat isi aplikasi, bukan halaman login kosong.

---

## 10. YANG DIBANGUN (MVP)

**Prinsip: sedikit fitur, tapi tidak satu pun setengah jadi.**

### WAJIB ADA

| Fitur | Penjelasan |
|---|---|
| Daftar & masuk | Email bebas (Gmail dkk, **berubah dari rencana awal yang wajib domain kampus** — keputusan tim supaya aplikasi tidak terkunci ke satu kampus, lihat bagian 8) |
| Dua tab feed | Kerja Cepat dan Proyek, tampil terpisah |
| Pasang pekerjaan + brief wajib | Lingkup kerja, hasil akhir, tenggat. Tidak boleh judul asal |
| Slot jumlah orang | Kolom "butuh berapa orang" + status "3/5 terisi" |
| Cari, filter, tag area | Kata kunci, kategori, area teks bebas opsional (bukan GPS, bukan dropdown lagi — lihat 4.9) |
| Kunci kesepakatan dua sisi | Penyedia menawar, pemasang memilih, keduanya setuju, terkunci |
| **Chat dalam aplikasi** | Polling 2–3 detik, bisa dipakai untuk negosiasi sebelum terkunci |
| Tombol WhatsApp opsional | Muncul setelah terkunci, sebagai pilihan tambahan bukan jalur utama |
| Tandai selesai + bukti foto | Pengerja menekan selesai dan mengunggah bukti |
| Konfirmasi & testimoni | Pemberi kerja konfirmasi + satu kalimat testimoni |
| Laporkan belum dibayar | Kalau uang tidak ditransfer, pengerja bisa melaporkannya |
| Rekam jejak dua arah | Kedua pihak punya catatan selesai, batal, laporan |
| Halaman profil publik | Portofolio berkelompok + rekam jejak, bisa dibagikan lewat tautan |
| README.md | Sesuai template panitia. Bobot 10 persen dari penilaian |

### SEBAIKNYA ADA

| Fitur | Penjelasan |
|---|---|
| **AI Career Compass** | Unggah CV, ekstraksi skill, rekomendasi pekerjaan tab Proyek. **Tetap dikerjakan Orang C sebagai tugas** |
| Rincian biaya admin | "Harga + biaya admin" di layar kesepakatan. Murni tampilan |
| Komentar di postingan | Tanya jawab sebelum menawar |
| Rekap pendapatan | Total penghasilan bulan ini di profil sendiri |
| **AI Search Assistant** | Kotak pencarian bahasa natural yang diterjemahkan jadi filter terstruktur (tab/kategori/area/harga) — lihat 4.11. LLM cuma menerjemahkan niat, bukan menyortir langsung; filtering/sorting tetap kode deterministik. Wajib ada fallback keyword-match kalau API tidak tersedia |

> **Catatan soal dua label di atas:** "Wajib" dan "Sebaiknya" itu **urutan pemotongan kalau waktu habis**, bukan urutan penting. Semua fitur di kedua daftar tetap dikerjakan. Kalau di satu titik jelas ada yang tidak akan selesai, potong dari daftar Sebaiknya dulu.

### JANGAN DIBANGUN

| Yang ditolak | Alasan |
|---|---|
| **Scraping situs mana pun** (Jobstreet, menfess, dll) | Guidebook menyebut **pelanggaran hak cipta berujung DISKUALIFIKASI**. Juga melanggar syarat perlindungan data pengguna |
| **Payment gateway / escrow sungguhan** | Memegang uang orang lain butuh kerja sama payment provider dan tanggung jawab hukum. Tidak realistis dalam waktu tersisa |
| **WebSocket untuk chat** | Vercel serverless tidak cocok untuk koneksi terbuka lama. Pakai polling (lihat Keputusan Teknis) |
| **GPS / pelacakan lokasi real time** | Risiko privasi, dan tag area (teks bebas opsional) sudah cukup |
| Sistem penyelesaian sengketa otomatis | Scope creep. Kalau kedua pihak tidak sepakat, status tetap "terkunci" dan diselesaikan sendiri |
| Notifikasi push | Tidak dinilai rubrik |
| Aplikasi mobile | Lombanya Web Development |
| Ekspor CV, template CV, skor kesiapan kerja | Bertentangan dengan posisi produk (lihat bagian 5) |
| Skrip auto-generate postingan palsu saat demo | Manipulasi tampilan, bukan fitur. Kalau juri tanya "ini yang posting siapa?", tidak ada jawaban yang enak |

---

## 11. KEPUTUSAN TEKNIS PENTING

### 11.1 Chat pakai polling, bukan WebSocket

**Masalah:** Vercel (serverless) tidak cocok untuk WebSocket. Fungsi serverless sifatnya nyala-mati per request, tidak bisa menahan koneksi terbuka lama. Memaksa WebSocket berarti butuh server terpisah yang berjalan terus, atau layanan pihak ketiga (Pusher/Ably) — menambah dependency baru di tengah waktu sempit.

**Solusi:** halaman chat melakukan fetch pesan baru **tiap 2–3 detik** (implementasi: ~2,5 detik). Tidak butuh infrastruktur baru, cukup tabel `messages` biasa di Supabase/Postgres (lihat bagian 8).

Bedanya dengan WebSocket cuma beberapa milidetik delay. Di depan juri saat demo, itu tidak kelihatan sama sekali.

### 11.2 Batas 2 hari dihitung saat halaman dibuka, bukan cron job

**Jangan pakai penjadwal atau background job.** Cukup hitung saat halaman dirender:

```
kalau (waktu_sekarang - waktuDitandaiSelesai) > 2 hari
   dan status masih "terkunci" dan sudah ditandai selesai
maka tampilkan sebagai "selesai_belum_dikonfirmasi"
```

Lebih sederhana, dan tidak ada proses latar yang bisa macet saat demo.

### 11.3 Alur kesepakatan tidak bisa diuji sendirian

Alur kunci dua sisi, chat, dan testimoni **butuh dua akun aktif bersamaan** untuk diuji dengan benar. Jadwalkan sesi uji berpasangan, jangan ditunda sampai H-1.

### 11.4 Modul AI saat demo pakai respons yang sudah di-cache

Saat presentasi 10 menit di depan juri, kalau modul AI memanggil API secara live dan internet venue lambat atau API telat respons, itu titik gagal yang tidak dikontrol tim. Siapkan respons yang sudah direkam untuk CV yang dipakai demo.

### 11.5 Privasi (diminta eksplisit oleh guidebook)

- File CV mentah **dihapus** setelah ekstraksi skill, hanya tag skill yang disimpan
- Sediakan tombol hapus data di pengaturan akun
- Halaman profil publik **tidak menampilkan** nomor WhatsApp atau data pribadi lain
- Tag area tidak menyimpan koordinat presisi

### 11.6 AI Search Assistant: proxy backend wajib, jangan panggil Claude API langsung dari browser

Kalau fitur AI Search Assistant (lihat 4.11) jadi dikerjakan, panggilan ke Claude API **harus** lewat backend/serverless function, bukan langsung dari kode frontend. Kalau API key ditaruh di kode client, siapa pun bisa membacanya lewat DevTools/view-source dan menghabiskan budget $5 credit tim dalam hitungan menit.

**Sudah diputuskan (lihat bagian 20): frontend tetap Vite, tidak ada server custom.** Karena logika bisnis lain sudah dipindah ke Supabase (Postgres RPC, bukan Next.js API Routes seperti rencana awal di bagian 7), dan RPC Postgres tidak cocok untuk memanggil API eksternal, opsi paling konsisten dengan arsitektur yang sudah ada: **Supabase Edge Function** (atau alternatif: folder `/api` berisi Vercel serverless function, Vercel mendukung ini untuk frontend apa pun tanpa wajib Next.js). Endpoint inilah yang memegang `ANTHROPIC_API_KEY` di environment variable server, menerima query teks dari frontend, memanggil Claude Haiku 4.5 dengan Structured Outputs, lalu mengembalikan JSON filter ke frontend.

---

## 12. RUBRIK PENILAIAN JURI

### Babak Penyisihan (submit 6 September)

| Aspek | Bobot |
|---|---|
| Kesesuaian Tema & Subtema | 20% |
| Inovasi & Orisinalitas Ide | 20% |
| Fungsionalitas Website | 20% |
| UI/UX & Responsivitas | 15% |
| Implementasi Teknologi | 15% |
| Dokumentasi & Repositori | 10% |

### Babak Final (20 September, 10 finalis)

| Aspek | Bobot |
|---|---|
| Presentasi & Pitching | 25% |
| Live Demo & Fungsionalitas Sistem | 25% |
| Inovasi & Dampak Solusi | 20% |
| Aspek Teknis & Teknologi | 20% |
| Tanya Jawab Dengan Juri | 10% |

**Yang perlu disadari:**
- Orisinalitas dinilai **dua kali** (20% + 20% = 40% kumulatif). Ini kriteria terberat dan paling sulit diperbaiki lewat coding.
- Dokumentasi 10% adalah **poin termurah** yang bisa diambil — cuma butuh README yang rapi.
- Di babak final, Presentasi + Live Demo + Tanya Jawab = **60%**. Fitur yang dibangun dinilai penuh di penyisihan, tapi di final yang dinilai adalah kemampuan menjelaskannya.

### Yang wajib disubmit di penyisihan
- Tautan repository GitHub
- Tautan hasil karya yang sudah di-hosting
- README.md sesuai template panitia, isinya: penjelasan aplikasi, fitur utama, teknologi yang digunakan (beserta peruntukan tiap library), cara instalasi, cara penggunaan

---

## 13. TIMELINE

Tanggal hari ini saat dokumen ini ditulis: **18 Agustus 2026**. Tersisa 19 hari ke deadline submit.

| Periode | Target | Detail |
|---|---|---|
| **18–22 Ags** | Fondasi | Setup repo, scaffold Vite, koneksi Supabase (Postgres). **Skema database disepakati bertiga di hari pertama.** Autentikasi (email bebas, tidak dibatasi domain kampus). Model data. Form pasang pekerjaan dengan brief wajib |
| **23–30 Ags** | Fitur inti | Beranda dua tab, kartu pekerjaan, pencarian, filter. Detail pekerjaan + sistem penawaran. **Layar Kesepakatan dan kunci dua sisi** (jangan ditunda). Chat polling. Alur selesai, bukti foto, testimoni, laporan belum dibayar. Logika slot jumlah orang |
| **31 Ags–3 Sep** | Pelengkap | Halaman profil, portofolio berkelompok, tautan bagikan. AI Career Compass. Rincian biaya admin, halaman S&K. Uji responsif di HP sungguhan |
| **4–6 Sep** | Finalisasi | Isi data contoh. Uji seluruh alur dengan dua akun. Tulis README sesuai template. Deploy ke Vercel. **Submit 6 Sep, targetkan siang bukan malam** |
| **12–20 Sep** | Babak final | 12 Sep pengumuman finalis. Buat slide, latihan pitching 10 menit, siapkan jawaban tanya jawab. **18 Sep rekam demo cadangan.** 19 Sep kirim slide. 20 Sep babak final |

---

## 14. PEMBAGIAN TUGAS

### Orang A — Backend dan Data
- Skema database dan model data
- Autentikasi (Supabase Auth, email bebas — tidak dibatasi domain kampus)
- API untuk jobs, offers, agreements
- Logika status dan alur kunci dua sisi
- Logika batas 2 hari dan mekanisme laporan belum dibayar
- Logika slot jumlah orang (satu job, banyak agreement)
- Backend chat (tabel `threads`/`messages` + RPC `send_message`, polling dilakukan di sisi klien — tidak ada endpoint custom, lihat bagian 8)

### Orang B — Frontend dan UI/UX
- Struktur halaman dan navigasi
- Beranda dua tab, kartu pekerjaan, pencarian, filter
- Form pasang pekerjaan dan halaman detail
- Layar Kesepakatan
- Tampilan chat (polling di sisi klien)
- Halaman profil dan tampilan portofolio
- Responsif di berbagai ukuran layar (uji di HP sungguhan, bukan cuma devtools)

### Orang C — AI, Dokumentasi, dan Konten
- **Modul Career Compass**: parsing CV, ekstraksi skill, logika rekomendasi
- Sistem unggah bukti foto
- **README.md sesuai template panitia** (bobot 10 persen)
- Halaman Syarat dan Ketentuan
- Menyiapkan data contoh untuk demo
- Slide presentasi babak final
- **(Opsional, prioritas rendah) Modul AI Search Assistant** (lihat 4.11): endpoint parsing query bahasa natural → filter terstruktur, pakai Claude Haiku 4.5 + fallback keyword-match. Dikerjakan setelah Career Compass dan fitur wajib lain selesai

> **Catatan tentang peran C:** sering dianggap paling ringan, padahal paling menentukan nilai. README bernilai 10 persen, dan data contoh menentukan apakah aplikasi terlihat hidup atau kosong saat dinilai juri.

### Dikerjakan bersama
- **Sepakati skema database di hari pertama** — ini menahan semua orang
- **Sesi uji berpasangan** — alur kesepakatan, chat, dan testimoni butuh dua akun aktif bersamaan
- **Uji menyeluruh sebelum submit** di deployment produksi, bukan cuma di komputer sendiri
- **Latihan presentasi** — di babak final, presentasi + tanya jawab bernilai 35%

---

## 15. CHECKLIST PERSYARATAN LOMBA

| Persyaratan | Status |
|---|---|
| Tim 2–3 orang | Aman (3 orang) |
| Maksimal 1 karya per tim | Aman |
| Tidak pakai template instan (WordPress, Wix) | Aman (Vite/React dari nol) |
| Framework dijelaskan peruntukannya di dokumentasi | **Harus dikerjakan** (masuk README) |
| Minimal satu SDG dari empat pilihan | Aman (SDG 8, melekat di mekanisme inti) |
| Karya orisinal, belum pernah menang lomba serupa | Perlu dipastikan sendiri oleh tim |
| AI dipakai etis, data pengguna terlindungi | **Perhatian khusus** (CV mentah dihapus, tidak ada data pribadi di halaman publik) |
| Bebas pelanggaran hak cipta | Aman selama tidak ada scraping |
| Submit: link GitHub + link hosting + README | **Harus dikerjakan** |

---

## 16. RENCANA CADANGAN

| Skenario | Rencana |
|---|---|
| Modul AI tidak selesai atau hasilnya meleset | Ganti panel rekomendasi sederhana berbasis pilihan jurusan dan minat, tanpa CV. Tetap punya momen demo |
| Chat polling bermasalah | Tombol WhatsApp yang sudah ada tetap jalan sebagai jalur komunikasi cadangan |
| Ada masalah saat live demo di babak final | Rekaman layar demo 90 detik sudah disiapkan sejak 18 September |
| Ada fitur yang jelas tidak akan selesai menjelang 3 September | Potong dari daftar "Sebaiknya Ada", jangan dari "Wajib Ada" |

---

## 17. ALUR DEMO 90 DETIK

Ini yang ditunjukkan ke juri di babak final. Latih sampai lancar.

| Waktu | Yang ditampilkan | Yang dikatakan |
|---|---|---|
| 0–10 dtk | Tangkapan layar menfess kampus asli, kolom balasan penuh perang harga | "Beginilah pasar jasa mahasiswa sekarang" |
| 10–25 dtk | Buka Stepping Stone, tab Kerja Cepat, feed ramai | "Kami pindahkan ke tempat yang lebih rapi" |
| 25–40 dtk | Geser ke tab Proyek, lapak desain dengan brief jelas | "Tapi bukan cuma jasa kilat. Di sini juga tempat membangun portofolio" |
| 40–55 dtk | Pasang permintaan dengan brief, tiga penawaran masuk, nego lewat chat | "Semua pekerjaan wajib punya lingkup, hasil akhir, dan tenggat" |
| 55–70 dtk | Kunci kesepakatan dua sisi, tandai selesai, bukti foto, testimoni muncul | "Kesepakatan dikunci di sistem. Ini yang tidak bisa dilakukan kolom balasan menfess" |
| 70–85 dtk | Halaman profil: portofolio berkelompok, testimoni, rekam jejak | "Dan setiap pekerjaan yang selesai jadi bukti yang bisa ditunjukkan" |
| 85–90 dtk | Tutup | "Get paid. Get proof. Stepping Stone, SDG 8" |

---

## 18. PERTANYAAN JURI DAN JAWABANNYA

Siapkan jawaban ini sebelum babak final.

**"Apa bedanya dengan menfess kampus?"**
Menfess berhenti di penemuan. Setelah itu semuanya terjadi di chat: harga bisa berubah, janji bisa dibatalkan tanpa konsekuensi, dan tidak ada jejak yang tersisa. Stepping Stone mengunci kesepakatan di dalam sistem dan menyimpan hasilnya sebagai bukti.

**"Kenapa tidak pakai Fiverr atau Sribu saja?"**
Platform seperti itu punya paradoks yang sama di dalamnya. Penjual baru butuh ulasan untuk dapat order pertama, tapi butuh order untuk dapat ulasan. Justru orang yang kami bidik adalah yang tidak bisa menembus itu. Di kampus, pekerjaan pertama datang karena kamu teman seangkatan, bukan karena punya rating.

**"Bagaimana kalian dapat uang?"**
Biaya admin dari transaksi yang terkunci di sistem, dengan ambang minimum supaya transaksi kecil tidak rugi biaya pemrosesan. Untuk versi kompetisi, biayanya ditampilkan sebagai rincian transparan. Pemungutan sungguhan lewat payment gateway adalah tahap berikutnya karena butuh kerja sama pihak ketiga.

**"Kalau pembayaran di luar sistem, bagaimana kalau pemberi kerja kabur tanpa membayar?"**
Ada tiga lapis. Pertama, pekerjaan yang tidak dikonfirmasi tidak otomatis dapat rating bagus — statusnya jadi "Selesai (belum dikonfirmasi)" tanpa rating. Kedua, pengerja bisa melaporkan pembayaran yang tidak masuk, dan laporan itu tercatat permanen di profil pemberi kerja. Ketiga, rekam jejak itu terlihat sebelum orang menerima tawaran berikutnya. Sistem penahanan dana adalah tahap berikutnya.

**"Bagaimana kalau ada kecelakaan saat antar jemput?"**
Sudah diatur di halaman Syarat dan Ketentuan: transaksi dan pertemuan fisik terjadi di luar tanggung jawab platform. Platform berperan sebagai tempat kesepakatan, bukan penyedia jasa.

**"Apa yang mencegah orang langsung pindah ke WhatsApp tanpa mengunci kesepakatan?"**
Chat sudah tersedia di dalam aplikasi sejak awal, jadi tidak ada alasan pindah ke luar untuk negosiasi. Selain itu insentifnya jelas: kalau tidak lewat sistem, pekerjaannya tidak tercatat di profil dan tidak jadi bukti pengalaman.

**"Bagaimana kalau testimoninya dipalsukan sesama teman?"**
Testimoni hanya bisa muncul lewat alur kesepakatan yang benar-benar terkunci. Memalsukannya berarti harus berpura-pura memasang pekerjaan dan berpura-pura menyelesaikannya, bukan sekadar klik bintang. Deteksi lebih lanjut adalah pengembangan tahap berikutnya.

**"Bagaimana rencananya berkembang ke kampus lain?"**
Bukan dengan cara viral otomatis, karena kepercayaan bersifat lokal. Modelnya replikasi per kampus. Yang menarik, hasilnya tetap portabel: portofolio yang dibangun di satu kampus tetap sah ditunjukkan ke mana pun.

**"Ini data asli atau contoh?"**
Ini data contoh untuk keperluan demo.

---

## 19. KEPUTUSAN YANG SUDAH DIKUNCI (JANGAN DIBALIK TANPA ALASAN KUAT)

Bagian ini penting untuk AI yang membaca dokumen ini. Semua di bawah sudah melewati riset dan uji tekan.

| Keputusan | Alasannya |
|---|---|
| **AI Career Compass adalah pendukung, bukan pilar utama** | Riset menemukan ruang "CV parsing + skill gap + rekomendasi" adalah yang **paling jenuh**: KitaLulus, GetHired, Skillverse, GreatNusa, Digitalskola, plus SkillGap Radar dan SkillBridge di Devpost yang nyaris identik. Menonjolkan fitur ini justru menurunkan nilai Orisinalitas |
| **Yang jadi pembeda adalah mekanisme kesepakatan + rekam jejak** | Kombinasi kunci kesepakatan dua sisi + rekam jejak dua arah + testimoni-sebagai-referensi tidak ditemukan padanannya saat riset. Pemain sejenis (komunitas antar jemput kampus, JASAQ) semuanya berhenti di penemuan dan menyerahkan kesepakatan ke chat |
| **Tab Kerja Cepat tidak boleh dihapus** | Itu mesin kunjungan harian. Tanpa itu aplikasi sepi karena kebutuhan jasa besar tidak muncul tiap hari |
| **Kesepakatan tetap 1-lawan-1 meski satu job butuh banyak orang** | Tiap orang bisa selesai di waktu berbeda, satu bisa tidak datang, dan tiap orang harus punya jejak sendiri. Kesepakatan gabungan merusak seluruh sistem rekam jejak |
| **Tidak ada rating otomatis 5 bintang** | Kalau pekerjaan yang tidak dikonfirmasi otomatis dapat bintang penuh, orang yang kabur tanpa membayar justru lolos tanpa jejak buruk, sementara pengerja yang dirugikan malah tercatat sukses |
| **Tidak ada scraping** | Guidebook menyebut pelanggaran hak cipta berujung diskualifikasi |
| **Data contoh untuk demo itu praktik standar** | Guideline tidak meminta bukti pengguna organik. Kalau juri bertanya, jawab jujur bahwa itu data contoh |
| **Positioning "web cari kerja sampingan anak kuliahan" diterima** | Itu bagus untuk penyebaran dari mulut ke mulut. Pitching ke juri tetap mengangkat satu lapis lebih dalam (portofolio + referensi). Dua lapis penjelasan, bukan kontradiksi |
| **Platform tidak mengurus CV pengguna** | Menghindari klaim yang tidak bisa dibuktikan ("bikin CV kamu diterima HR"). Yang diklaim cuma yang terlihat di layar |
| **AI Search Assistant hanya menerjemahkan niat, tidak menggantikan logika filter** | LLM dipakai sesempit mungkin (ekstraksi terstruktur ke JSON filter) supaya murah, cepat, dan gampang di-fallback. Filtering/sorting tetap kode deterministik yang sudah ada. Ke juri, fitur ini diposisikan sebagai "asisten pencarian", bukan "AI job-matcher", supaya tidak tumpang tindih dengan positioning Career Compass. Keputusan diambil 29 Agustus 2026 |

---

## 20. HAL YANG MASIH TERBUKA

- ~~Kampus mana yang jadi target pengguna pertama (menentukan isi dropdown tag area)~~ — **SELESAI/gugur:** area sekarang input teks bebas (bukan dropdown per-kampus) dan email tidak dibatasi domain kampus, jadi aplikasi memang didesain multi-kampus dari awal (lihat bagian 4.9 dan 8)
- Siapa di antara tiga anggota tim yang paling kuat di area apa
- Nama final kategori untuk pekerjaan olah data — **hindari yang bisa jadi pintu joki tugas kuliah**, karena jurinya dosen. Contoh aman: "olah data non-akademik", "analisis data UMKM"
- Angka pasti ambang minimum transaksi dan persentase biaya admin — **saat ini di-hardcode 5% dari harga** di RPC `select_offer` sebagai asumsi sementara, belum disepakati tim. Kalau mau ditampilkan di layar kesepakatan sebelum demo, pastikan angkanya sudah final
- ~~Frontend Vite vs migrasi ke Next.js~~ — **SUDAH DIPUTUSKAN:** tetap di Vite. Tidak ada server custom (Next.js API Routes/Vercel serverless functions) yang dibangun — logika bisnis dipindah ke Postgres RPC functions di Supabase (lihat bagian 7 dan 8). **Catatan buat AI Search Assistant (4.11) kalau jadi dikerjakan:** RPC Postgres tidak bisa memanggil API eksternal (Claude API) dengan aman, jadi proxy tetap butuh lapisan terpisah — opsi paling ringan sesuai keputusan ini adalah Supabase Edge Function (bukan Vercel serverless function seperti draf awal 11.6), supaya tetap satu ekosistem dengan Supabase yang sudah dipakai
