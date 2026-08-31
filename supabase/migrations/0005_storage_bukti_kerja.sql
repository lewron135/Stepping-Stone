-- Migrasi 5: bucket penyimpanan untuk bukti kerja
--
-- Sebelum ini, foto bukti cuma dibungkus URL.createObjectURL, yaitu alamat blob yang hidup
-- di memori satu tab browser saja. Akibatnya gambarnya hilang begitu halaman di-refresh,
-- dan klien tidak pernah bisa melihatnya karena alamat itu tidak berlaku di browser lain.
-- Portofolio yang mestinya terbentuk dari bukti kerja pun kosong gambarnya.
--
-- Bucket ini sengaja PUBLIC. Alasannya bukti kerja yang sudah dikonfirmasi otomatis jadi
-- entri portofolio yang memang ditampilkan terbuka di /u/:handle (masterplan bagian 4.6).
-- Kalau bucket-nya private, setiap tampilan portofolio harus minta signed URL yang bisa
-- kedaluwarsa. Konsekuensinya: siapa pun yang punya alamat file bisa membukanya, jadi
-- jangan dipakai untuk dokumen sensitif.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bukti-kerja',
  'bukti-kerja',
  true,
  5242880, -- 5 MB, sama dengan yang tertulis di UI
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- Nama file selalu berbentuk "<user_id>/<agreement_id>-<timestamp>.<ext>". Folder pertama
-- dipakai policy di bawah untuk memastikan orang cuma bisa menulis ke foldernya sendiri.

drop policy if exists "bukti kerja bisa dilihat siapa saja" on storage.objects;
create policy "bukti kerja bisa dilihat siapa saja" on storage.objects
  for select using (bucket_id = 'bukti-kerja');

drop policy if exists "unggah bukti ke folder sendiri" on storage.objects;
create policy "unggah bukti ke folder sendiri" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'bukti-kerja'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "ubah bukti sendiri" on storage.objects;
create policy "ubah bukti sendiri" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'bukti-kerja'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "hapus bukti sendiri" on storage.objects;
create policy "hapus bukti sendiri" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'bukti-kerja'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
