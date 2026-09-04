-- Migrasi 9: perbaikan penyaring avatar di update_profile
--
-- Jalankan lewat SQL Editor di dashboard Supabase, setelah 0008. Idempotent.
--
-- Migrasi 0008 memakai bound {5,500} di dalam regex untuk membatasi panjang alamat avatar.
-- PostgreSQL membatasi angka pengulangan di regex maksimal 255, jadi bound itu tidak sah.
-- Yang bikin sulit terlihat: fungsinya tetap berhasil dibuat, karena regex baru diperiksa
-- saat dijalankan. Akibatnya menyimpan profil selalu aman selama kolom avatar kosong, dan
-- baru gagal dengan error 2201B begitu user memilih avatar atau mengunggah foto.
--
-- Perbaikannya panjang tidak lagi diurus regex, melainkan diperiksa sebagai panjang teks
-- biasa. Batas dan bentuk yang diterima tetap sama persis dengan niat semula.

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
  --
  -- Panjangnya diperiksa terpisah, bukan sebagai bound {5,500} di dalam regex seperti di
  -- migrasi 0008. PostgreSQL membatasi angka pengulangan di regex maksimal 255, dan bound
  -- yang melewatinya tidak ditolak saat fungsi dibuat melainkan saat dijalankan, dengan
  -- error 2201B "invalid regular expression: invalid repetition count(s)".
  v_avatar := nullif(btrim(coalesce(p_avatar_url, '')), '');
  if v_avatar is not null then
    if length(v_avatar) < 5 or length(v_avatar) > 500 then
      raise exception 'Avatar tidak dikenali';
    end if;
    if v_avatar !~ '^(preset:[a-z0-9-]{1,20}|https://[A-Za-z0-9._~:/?#%@!$&+,;=-]+)$' then
      raise exception 'Avatar tidak dikenali';
    end if;
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
