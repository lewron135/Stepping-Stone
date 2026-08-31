-- Migrasi 1/4: tabel notifications
--
-- Jalankan lewat SQL Editor di dashboard Supabase, berurutan dari 0001 sampai 0004.
-- Setiap file berdiri sendiri dan idempotent, jadi aman dijalankan ulang kalau ragu.
--
-- Notifikasi disimpan sebagai baris tabel (bukan diturunkan di client) supaya bertahan
-- lintas refresh dan lintas device, dan supaya status "sudah dibaca" ikut akun, bukan
-- ikut browser.

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type text not null check (
    type in (
      'offer_received',
      'offer_selected',
      'agreement_locked',
      'proof_submitted',
      'completion_confirmed',
      'agreement_cancelled',
      'unpaid_reported',
      'completion_timeout'
    )
  ),
  text text not null,
  href text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Query utamanya selalu "notifikasi milik saya, terbaru dulu".
create index if not exists notifications_user_created_idx
  on notifications (user_id, created_at desc);

alter table notifications enable row level security;

drop policy if exists "select own notifications" on notifications;
create policy "select own notifications" on notifications
  for select using (user_id = auth.uid());

drop policy if exists "update own notifications" on notifications;
create policy "update own notifications" on notifications
  for update using (user_id = auth.uid());

drop policy if exists "delete own notifications" on notifications;
create policy "delete own notifications" on notifications
  for delete using (user_id = auth.uid());

-- Sengaja TIDAK ada policy insert untuk role authenticated. Baris cuma pernah dibuat oleh
-- trigger security definer di migrasi 0003, yang otomatis melewati RLS. Tanpa policy insert,
-- user biasa tidak bisa mengarang notifikasi palsu lewat panggilan langsung ke tabel.
