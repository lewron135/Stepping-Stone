-- Migrasi 7: komentar di postingan pekerjaan
--
-- Jalankan lewat SQL Editor di dashboard Supabase. Idempotent, aman dijalankan ulang.
--
-- Gunanya tanya jawab sebelum menawar (masterplan bagian 10, daftar "Sebaiknya Ada"):
-- calon pekerja bisa menanyakan hal yang belum jelas di brief tanpa harus lebih dulu
-- mengajukan penawaran atau membuka chat pribadi. Jawabannya terlihat semua orang, jadi
-- satu pertanyaan tidak perlu dijawab berulang kali ke orang berbeda.
--
-- Sengaja bukan chat. Chat itu ruang berdua setelah ada minat, komentar itu ruang terbuka
-- di postingan sebelum ada komitmen apa pun.


-- 1. Tipe notifikasi baru.
--
-- Check constraint di migrasi 0001 ditulis inline di kolom, jadi namanya dibuatkan Postgres
-- sendiri. Nama itu dicari lewat katalog, bukan ditebak: kalau ditebak dan tebakannya meleset,
-- baris drop-nya diam saja tanpa error, constraint lama tetap hidup, dan komentar akan gagal
-- dikirim dengan pesan check violation yang membingungkan.
--
-- Dijatuhkan lalu dipasang ulang, bukan diubah di tempat, karena Postgres tidak punya
-- ALTER CONSTRAINT untuk check.

do $$
declare
  v_name text;
begin
  for v_name in
    select conname
    from pg_constraint
    where conrelid = 'notifications'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%offer_received%'
  loop
    execute format('alter table notifications drop constraint %I', v_name);
  end loop;
end $$;

alter table notifications add constraint notifications_type_check check (
  type in (
    'offer_received',
    'offer_selected',
    'agreement_locked',
    'proof_submitted',
    'completion_confirmed',
    'agreement_cancelled',
    'unpaid_reported',
    'completion_timeout',
    'comment_received'
  )
);


-- 2. Tabel komentar.

create table if not exists job_comments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- Query utamanya selalu "komentar di pekerjaan ini, terlama dulu", karena tanya jawab
-- dibaca berurutan dari atas seperti percakapan.
create index if not exists job_comments_job_created_idx
  on job_comments (job_id, created_at);

alter table job_comments enable row level security;

-- Komentar memang dimaksudkan terbuka. Pekerjaannya sendiri terbuka di feed, dan gunanya
-- justru supaya jawaban satu orang ikut menolong yang lain.
drop policy if exists "select job comments" on job_comments;
create policy "select job comments" on job_comments
  for select using (true);

-- Sengaja TIDAK ada policy insert, update, maupun delete. Satu-satunya jalan menulis
-- adalah RPC di bawah, mengikuti prinsip masterplan bahwa semua operasi tulis lewat fungsi
-- database. Dengan begitu pembersihan teks dan batas panjangnya berlaku untuk semua
-- pemanggil, dan tidak ada cara menulis komentar atas nama orang lain dari console browser.


-- 3. Satu-satunya jalan menulis komentar.

create or replace function add_job_comment(p_job_id uuid, p_text text)
returns job_comments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author uuid := auth.uid();
  v_text text;
  v_job_exists boolean;
  v_row job_comments;
begin
  if v_author is null then
    raise exception 'Kamu belum masuk, jadi komentar tidak bisa dikirim';
  end if;

  select exists (select 1 from jobs where id = p_job_id) into v_job_exists;
  if not v_job_exists then
    raise exception 'Pekerjaannya sudah tidak ada';
  end if;

  v_text := nullif(btrim(coalesce(p_text, '')), '');
  if v_text is null then
    raise exception 'Komentar tidak boleh kosong';
  end if;
  v_text := left(v_text, 500);

  insert into job_comments (job_id, author_id, text)
  values (p_job_id, v_author, v_text)
  returning * into v_row;

  return v_row;
end;
$$;


-- 4. Pemasang pekerjaan diberi tahu ada pertanyaan masuk.
--
-- Trigger, bukan insert dari dalam RPC di atas, mengikuti pola migrasi 0003: aturannya
-- melekat di tabel sehingga tetap berlaku lewat jalur pemanggil mana pun.

create or replace function trg_job_comment_notify()
returns trigger as $$
declare
  v_job jobs;
  v_author_name text;
begin
  select * into v_job from jobs where id = new.job_id;
  if v_job.id is null then
    return new;
  end if;

  -- Pemasang yang menjawab komentar di lapaknya sendiri tidak perlu diberi tahu soal
  -- komentarnya sendiri.
  if v_job.poster_id = new.author_id then
    return new;
  end if;

  select name into v_author_name from profiles where id = new.author_id;

  insert into notifications (user_id, type, text, href)
  values (
    v_job.poster_id,
    'comment_received',
    coalesce(v_author_name, 'Seseorang') || ' nanya soal "' || v_job.title || '", dijawab yuk',
    '/pekerjaan/' || v_job.id
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists job_comment_notify on job_comments;
create trigger job_comment_notify
after insert on job_comments
for each row execute function trg_job_comment_notify();
