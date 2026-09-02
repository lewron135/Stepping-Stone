-- Migrasi 6: form edit profil bisa benar-benar menyimpan
--
-- Kolom bio, skills, faculty, major, dan year sudah ada di tabel profiles sejak awal dan
-- sudah dirender di halaman Profil, tapi tidak pernah ada jalan masuknya: form edit tidak
-- pernah dibuat, dan tombol Simpan di halaman Pengaturan cuma memunculkan toast. Migrasi
-- ini menyediakan satu-satunya jalan tulis yang sah ke kolom-kolom itu.
--
-- Ditulis sebagai RPC, bukan mengandalkan update langsung dari browser, mengikuti prinsip
-- masterplan bahwa semua operasi tulis lewat fungsi database. Fungsinya security definer
-- tapi tetap aman karena baris yang disentuh dikunci ke auth.uid(), jadi tidak ada cara
-- mengubah profil orang lain walaupun dipanggil dari console browser.
--
-- handle sengaja TIDAK ikut bisa diubah. Dia dipakai sebagai alamat profil publik
-- /u/:handle, jadi mengubahnya akan mematikan tautan yang sudah dibagikan orang.
-- Email juga tidak di sini, itu urusan Supabase Auth, bukan tabel profiles.

create or replace function update_profile(
  p_name text,
  p_campus text,
  p_faculty text,
  p_major text,
  p_year text,
  p_bio text,
  p_skills text[]
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
     set name    = v_name,
         campus  = v_campus,
         faculty = nullif(btrim(coalesce(p_faculty, '')), ''),
         major   = nullif(btrim(coalesce(p_major, '')), ''),
         year    = nullif(btrim(coalesce(p_year, '')), ''),
         bio     = v_bio,
         skills  = v_skills
   where id = v_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'Profil kamu tidak ditemukan';
  end if;

  return v_row;
end;
$$;

-- Anon tidak perlu bisa memanggil ini sama sekali. Menyimpan profil selalu butuh sesi.
revoke all on function update_profile(text, text, text, text, text, text, text[]) from public;
grant execute on function update_profile(text, text, text, text, text, text, text[]) to authenticated;
