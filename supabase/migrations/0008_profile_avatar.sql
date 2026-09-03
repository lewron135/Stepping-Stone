-- Migrasi 8: foto profil
--
-- Jalankan lewat SQL Editor di dashboard Supabase. Idempotent, aman dijalankan ulang.
--
-- Sampai sekarang avatar cuma inisial nama. Satu kolom di sini menampung dua kemungkinan
-- sekaligus:
--   'preset:p07'                 avatar geometris pilihan, digambar di frontend sebagai SVG
--   'https://.../avatar/...'     foto yang diunggah user ke bucket di bawah
-- Frontend yang memutuskan cara menggambarnya, dan tetap jatuh ke inisial kalau kolomnya
-- kosong. Avatar pilihan sengaja tidak disimpan sebagai berkas gambar supaya tidak ada aset
-- yang perlu diunggah untuk akun yang tidak pernah memilih apa pun.


-- 1. Kolomnya.

alter table profiles add column if not exists avatar_url text;


-- 2. Bucket foto profil.
--
-- Public dengan alasan yang sama seperti bucket bukti-kerja di migrasi 0005: avatar tampil
-- di profil publik /u/:handle, di feed, dan di komentar, jadi memaksanya lewat signed URL
-- cuma menambah kerumitan tanpa menambah perlindungan. Batasnya jauh lebih kecil daripada
-- bukti kerja karena ini cuma foto kecil yang ditampilkan sebesar-besarnya 80 piksel.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatar',
  'avatar',
  true,
  2097152, -- 2 MB, sama dengan yang tertulis di UI
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Nama file selalu "<user_id>/<timestamp>.<ext>", sama seperti bucket bukti kerja, supaya
-- policy di bawah bisa memastikan orang cuma menulis ke foldernya sendiri.

drop policy if exists "avatar bisa dilihat siapa saja" on storage.objects;
create policy "avatar bisa dilihat siapa saja" on storage.objects
  for select using (bucket_id = 'avatar');

drop policy if exists "unggah avatar ke folder sendiri" on storage.objects;
create policy "unggah avatar ke folder sendiri" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatar'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "ubah avatar sendiri" on storage.objects;
create policy "ubah avatar sendiri" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatar'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "hapus avatar sendiri" on storage.objects;
create policy "hapus avatar sendiri" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatar'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- 3. update_profile menerima satu parameter baru.
--
-- Fungsi lama HARUS dijatuhkan lebih dulu. `create or replace` dengan daftar parameter yang
-- berbeda tidak menimpa fungsi lama melainkan membuat kembarannya, dan PostgREST lalu punya
-- dua kandidat untuk nama yang sama. Panggilan dari frontend bisa nyasar ke versi lama yang
-- tidak tahu apa-apa soal avatar, tanpa error yang jelas.

drop function if exists update_profile(text, text, text, text, text, text, text[]);

create or replace function update_profile(
  p_name text,
  p_campus text,
  p_faculty text,
  p_major text,
  p_year text,
  p_bio text,
  p_skills text[],
  p_avatar_url text default null
)
returns profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := auth.uid();
  v_name text;
  v_campus text;
  v_bio text;
  v_avatar text;
  v_skills text[];
  v_row profiles;
begin
  if v_id is null then
    raise exception 'Kamu belum masuk, jadi profil tidak bisa disimpan';
  end if;

  v_name := nullif(btrim(coalesce(p_name, '')), '');
  if v_name is null then
    raise exception 'Nama tidak boleh kosong';
  end if;
  if length(v_name) > 80 then
    raise exception 'Nama maksimal 80 karakter';
  end if;

  v_campus := nullif(btrim(coalesce(p_campus, '')), '');
  if v_campus is null then
    raise exception 'Kampus tidak boleh kosong';
  end if;
  if length(v_campus) > 80 then
    raise exception 'Kampus maksimal 80 karakter';
  end if;

  v_bio := btrim(coalesce(p_bio, ''));
  if length(v_bio) > 300 then
    raise exception 'Bio maksimal 300 karakter';
  end if;

  if length(btrim(coalesce(p_faculty, ''))) > 80
     or length(btrim(coalesce(p_major, ''))) > 80
     or length(btrim(coalesce(p_year, ''))) > 20 then
    raise exception 'Fakultas, jurusan, dan angkatan terlalu panjang';
  end if;

  -- Avatar cuma boleh dua bentuk. Tanpa penyaringan ini, kolomnya bisa diisi alamat
  -- javascript: atau data: lewat panggilan langsung dari console browser, dan alamat itu
  -- nanti dipasang apa adanya sebagai sumber gambar di halaman orang lain.
  v_avatar := nullif(btrim(coalesce(p_avatar_url, '')), '');
  if v_avatar is not null
     and v_avatar !~ '^(preset:[a-z0-9-]{1,20}|https://[A-Za-z0-9._~:/?#%@!$&+,;=-]{5,500})$' then
    raise exception 'Avatar tidak dikenali';
  end if;

  -- Pembersihan daftar skill dilakukan di sini, bukan di frontend, supaya aturannya sama
  -- untuk semua pemanggil: spasi dirapikan, entri kosong dibuang, kembar dihapus tanpa
  -- membedakan huruf besar kecil, urutan yang diketik user dipertahankan, dan jumlahnya
  -- dibatasi supaya tidak ada yang menempelkan seluruh isi CV ke satu kolom.
  with cleaned as (
    select btrim(value) as skill, ord
    from unnest(coalesce(p_skills, '{}'::text[])) with ordinality as t(value, ord)
    where btrim(value) <> ''
      and length(btrim(value)) <= 40
  ),
  deduped as (
    select distinct on (lower(skill)) skill, ord
    from cleaned
    order by lower(skill), ord
  )
  select coalesce(array_agg(skill order by ord), '{}'::text[])
    into v_skills
  from (select skill, ord from deduped order by ord limit 30) d;

  update profiles
     set name       = v_name,
         campus     = v_campus,
         faculty    = nullif(btrim(coalesce(p_faculty, '')), ''),
         major      = nullif(btrim(coalesce(p_major, '')), ''),
         year       = nullif(btrim(coalesce(p_year, '')), ''),
         bio        = v_bio,
         skills     = v_skills,
         avatar_url = v_avatar
   where id = v_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Profil kamu tidak ditemukan';
  end if;

  return v_row;
end;
$$;

-- Anon tidak perlu bisa memanggil ini sama sekali. Menyimpan profil selalu butuh sesi.
revoke all on function update_profile(text, text, text, text, text, text, text[], text) from public;
grant execute on function update_profile(text, text, text, text, text, text, text[], text) to authenticated;
