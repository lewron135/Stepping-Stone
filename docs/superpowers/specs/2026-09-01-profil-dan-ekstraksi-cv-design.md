# Detail profil, ekstraksi CV, dan asisten pencarian

Status: menunggu review Josep
Tanggal: 2026-09-01
Konteks waktu: 5 hari ke tenggat submit (6 September), deploy dijadwalkan 4 September

## Masalah

Tiga hal yang saling bergantung, ditemukan saat membaca ulang kode dan masterplan:

1. **Detail profil tidak pernah bisa diisi.** Kolom `bio`, `skills`, `faculty`, `major`, `year` sudah ada di tabel `profiles` dan di tipe `User`, dan tampilannya pun sudah ada di `Profile.tsx:147-158`. Yang tidak ada adalah jalan masuknya: form edit tidak pernah dibuat, dan tombol "Simpan perubahan" di `Settings.tsx:89` cuma memunculkan toast. Saat daftar hanya nama dan kampus yang dikumpulkan, sisanya `null` selamanya.
2. **Ekstraksi CV di Career Compass palsu, dan copy-nya mengklaim sesuatu yang tidak terjadi.** `CareerCompass.tsx:27` menunggu 1,1 detik lalu menampilkan tiga skill hardcode. Layarnya menulis "File CV sudah dihapus dari server" padahal file itu tidak pernah dikirim ke server mana pun. Checklist lomba bagian 15 menandai etika AI dan perlindungan data sebagai perhatian khusus, dan babak final punya sesi Tanya Jawab bernilai 10%.
3. **AI Search Assistant belum ada satu baris pun**, padahal sudah masuk dokumentasi sebagai fitur yang direncanakan (masterplan 4.11).

Rekomendasi Career Compass sendiri nyata dan tidak bermasalah. Logikanya deterministik di `utils/compass.ts`.

## Tujuan

- Detail profil bisa diisi dan disimpan, sehingga blok "Detail Profil" (masterplan 4.6) benar-benar ada isinya.
- Ekstraksi CV benar-benar terjadi, memakai model NLP tim sendiri, dan setiap klaim di layar bisa dipertanggungjawabkan.
- Hasil ekstraksi ditinjau user sebelum disimpan, sesuai masterplan 4.10 langkah 3.
- Search Assistant menerjemahkan kalimat jadi filter, dengan fallback yang membuatnya tetap berfungsi tanpa AI.

## Non-tujuan

- Tidak mengubah logika rekomendasi di `compass.ts`. Determinismenya justru yang bisa dijelaskan ke juri.
- Tidak membangun kerangka test otomatis baru. Repo tidak punya, masterplan tidak meminta, dan tenggat 5 hari bukan waktunya memulai.
- Tidak menyentuh alur kesepakatan, chat, atau notifikasi yang sudah jalan.
- Tidak deploy apa pun sebelum 4 September, kecuali Hugging Face Space yang memang harus hidup untuk diuji.

## Keputusan yang diambil di sesi brainstorming ini

| Keputusan | Alasan |
|---|---|
| Ekstraksi CV memakai Semantic_CV_Analyzer milik tim, bukan LLM | Karya sendiri, menaikkan nilai Aspek Teknis (20% di final) dan bisa dibedah saat Tanya Jawab. Biaya bukan pertimbangan: Haiku cuma sekitar $0,001 per panggilan |
| Gemini free tier ditolak | Kebijakan tier gratisnya membolehkan prompt dipakai untuk peningkatan produk. Itu tidak bisa disandingkan dengan klaim privasi di fitur CV. Juga menambah vendor ketiga tanpa manfaat, karena credit Anthropic sudah ada |
| Anthropic dipakai khusus Search Assistant | Di situ LLM memang alat yang tepat: menerjemahkan kalimat bebas jadi JSON filter |
| Proxy Anthropic di folder `api/` Vercel, bukan Supabase Edge Function | Tidak menambah CLI baru, tidak bergantung role Supabase Josep yang belum tentu Owner, dan ikut ter-deploy bareng frontend. Masterplan 11.6 menyebut ini alternatif sah dari condongan bagian 20 |
| Bio, fakultas, jurusan, angkatan diisi manual, bukan hasil ekstraksi | Model tim hanya mengekstrak skill. Empat kolom itu lebih cepat diketik daripada ditebak mesin, dan cerita privasinya jadi lebih bersih |
| Layar tinjau hasil ekstraksi = form profil yang sama, terisi sebagai draf | Tidak perlu membangun UI kedua, sekaligus menjawab pertanyaan terbuka masterplan bagian 20 soal apa yang terjadi kalau ekstraksi meleset: manusianya yang menyimpan, jadi kesalahan model tinggal dibetulkan seperti mengisi form biasa |
| Batas waktu satu sesi untuk rute NLP sendiri | Patokan lulus: endpoint mengembalikan daftar skill dari satu PDF asli. Kalau lewat, ekstraksi pindah ke Anthropic tanpa mengubah frontend |

## Arsitektur

```
Browser (React)
  |
  |-- simpan profil ---------> Supabase RPC update_profile      (migrasi 0006)
  |
  |-- ekstrak CV ------------> Hugging Face Space (FastAPI)     (spaCy + SBERT tim)
  |                            tidak ada secret, dipanggil langsung
  |
  '-- terjemah pencarian ----> /api/parse-search (Vercel) ----> Claude Haiku 4.5
                               memegang ANTHROPIC_API_KEY
```

Alamat ekstraksi CV disimpan sebagai `VITE_CV_EXTRACT_URL`. Frontend cuma kenal satu fungsi `extractCv(file)` di `lib/api.ts`. Kalau rute NLP sendiri gagal memenuhi batas waktu, env var itu diarahkan ke `/api/extract-cv` versi Anthropic dan tidak ada kode React yang berubah.

Ekstraksi CV tidak perlu lewat Vercel karena tidak ada rahasia yang dilindungi di situ. Search Assistant wajib lewat Vercel, karena kalau API key Anthropic ada di kode browser, siapa pun bisa membacanya lewat DevTools dan menghabiskan credit tim (masterplan 11.6).

## Bagian A: form edit profil dan penyimpanannya

**Migrasi `0006_update_profile.sql`**, idempotent, dijalankan Josep di SQL Editor.

Satu fungsi `update_profile(p_name, p_campus, p_faculty, p_major, p_year, p_bio, p_skills text[])`:

- Mengubah hanya baris milik pemanggil, dikunci `where id = auth.uid()`. Tidak ada cara mengubah profil orang lain walau dipanggil dari console browser.
- Membersihkan masukan: trim, buang skill kosong, buang skill kembar, batasi jumlah skill dan panjang bio.
- Mengembalikan baris yang sudah diperbarui.
- `handle` sengaja tidak ikut bisa diubah, karena dipakai sebagai alamat profil publik `/u/:handle`. Mengubahnya mematikan tautan yang sudah dibagikan.

Ini mengikuti prinsip masterplan bahwa semua operasi tulis lewat RPC, bukan `update` langsung dari browser.

**Frontend:**

- `lib/api.ts`: `updateProfile(input)` memanggil RPC lalu mengembalikan `User` lewat `buildUserFromProfile` yang sudah ada.
- `contexts/StoreContext.tsx`: tambah `updateProfile` supaya `currentUser` ikut segar tanpa refresh halaman.
- `pages/Settings.tsx`: kotak "Akun" jadi form sungguhan (nama, kampus, fakultas, jurusan, angkatan, bio, skill sebagai chip yang bisa ditambah dan dihapus). Kolom email yang sekarang menampilkan alamat karangan `${handle}@kampus.ac.id` diganti email asli dari sesi Supabase, dibuat baca saja karena mengubah email itu urusan Supabase Auth.
- `pages/Profile.tsx:147-151`: beri penjaga supaya kolom kosong tidak menyisakan titik pemisah menggantung, dan untuk profil sendiri tampilkan ajakan melengkapi ke halaman Pengaturan.

## Bagian B: layanan ekstraksi CV

**Sumbernya** repo `lewron135/Semantic_CV_Analyzer`: spaCy `en_core_web_md` dengan EntityRuler 50 istilah, noun chunk, disaring SBERT `all-MiniLM-L6-v2`, PDF dibaca PyPDF2, encoding dibetulkan ftfy.

**Yang harus dikerjakan pada kode itu:**

1. Lepaskan dari Streamlit. `src/extraction/engine.py` mengimpor `streamlit` dan memakai `@st.cache_resource` di fungsi pemuat model. Diganti pemuatan sekali saat proses start.
2. Bungkus jadi FastAPI dengan satu endpoint `POST /extract` yang menerima file PDF dan mengembalikan `{ "skills": ["...", "..."] }`.
3. Aktifkan CORS untuk origin localhost dan domain Vercel nanti.
4. File PDF diproses di memori dan tidak pernah ditulis ke disk. Ini yang membuat klaim "file CV tidak disimpan" benar secara harfiah.
5. Bagian TF-IDF dan pencocokan ke job description tidak dipakai. Stepping Stone hanya butuh ekstraksi skill. `models/tfidf_model.pkl` yang tidak ada di repo pun jadi tidak relevan.

**Rumahnya** Hugging Face Space gratis, tipe Docker. Alasannya torch plus spaCy `md` plus SBERT jauh melewati batas sekitar 250 MB untuk satu serverless function Vercel. RAM Space gratis cukup.

**Risiko yang diterima:** Space gratis tidur kalau lama tidak dipakai dan bangunnya butuh waktu memuat model. Penanganannya panaskan Space sebelum demo, dan tetap ikuti masterplan 11.4 yang meminta respons cached saat tampil di depan juri.

**Batas mutu yang perlu disadari:** modelnya Inggris. CV berbahasa Indonesia akan menghasilkan noun chunk berantakan. Karena hasilnya toh ditinjau user sebelum disimpan, ini tidak merusak, tapi jangan dijual ke juri sebagai ekstraktor dwibahasa.

**Alur di UI Career Compass:**

1. User memilih file CV.
2. Frontend mengirim ke `VITE_CV_EXTRACT_URL`.
3. Hasilnya tidak langsung disimpan. User dibawa ke form profil dengan kolom skill sudah terisi sebagai draf, ditandai jelas bahwa ini usulan dari CV.
4. User membetulkan, menghapus yang salah, lalu menekan Simpan. Baru saat itu `update_profile` dipanggil.
5. Kalau layanan mati atau lambat, munculkan pesan jujur dan arahkan mengisi manual. Fitur profil tidak ikut mati.

**Copy yang harus diganti** di `CareerCompass.tsx`: kalimat "File CV sudah dihapus dari server" dan "Skill diambil, file CV dihapus" diganti dengan yang menggambarkan kejadian sebenarnya, yaitu file dibaca di server, skill diambil, filenya tidak disimpan, dan yang tersimpan hanya yang user setujui.

## Bagian C: Career Compass memakai skill

`compass.ts` sekarang hanya melihat portofolio, sehingga user baru yang portofolionya kosong mendapat rekomendasi yang praktis cuma urut harga. Setelah skill bisa diisi, skill dipakai sebagai bahan cadangan saat portofolio masih kosong: kategori yang kata kuncinya cocok dengan skill user dinaikkan peringkatnya, dengan alasan yang tetap ditulis terang di kartu. Perubahannya kecil dan tetap deterministik.

## Bagian D: AI Search Assistant (dikerjakan terakhir, boleh dipotong)

- `api/parse-search.ts` di Vercel memegang `ANTHROPIC_API_KEY`, menerima teks query, memanggil Claude Haiku 4.5 dengan skema keluaran terstruktur, mengembalikan `{ tab, kategori, area, hargaMaks }`.
- Filter dijalankan kode yang sudah ada di `Feed.tsx`. LLM tidak pernah menyortir daftar pekerjaan (masterplan 19).
- `Feed.tsx` perlu tambahan satu filter harga maksimal yang memang belum ada.
- Fallback wajib: kalau proxy gagal atau tidak ada koneksi, jatuh ke pencocokan kata biasa ke judul, kategori, dan tag, seperti perilaku pencarian sekarang.
- Supaya bisa diuji di laptop tanpa deploy, handler yang sama dipanggil lewat middleware dev server Vite. Satu file handler, dipakai dua tempat.

## Urutan kerja dan titik henti

1. Bagian A sampai benar-benar menyimpan dan terlihat di profil publik. Tidak butuh AI. Kalau sisa waktu habis di sini, yang jadi tetap fitur utuh.
2. Bagian B sampai patokan lulus: endpoint mengembalikan skill dari satu PDF asli. Batas waktu satu sesi.
3. Bagian C, perubahan kecil di `compass.ts` plus perbaikan copy.
4. Bagian D, kalau waktu masih ada. Ini yang pertama dipotong sesuai masterplan 4.11.

Di luar rencana ini ada satu perbaikan lima menit yang sebaiknya ditempel di akhir: tombol Logout di `Navbar.tsx:80`, `Sidebar.tsx:134`, `SidebarRail.tsx:128`, dan `Settings.tsx:152` cuma `navigate('/')`, sedangkan `signOut` di `AuthContext` tidak pernah dipanggil dari mana pun.

## Cara memastikan benar

Tidak ada test otomatis. Pembuktiannya:

- `npx tsc --noEmit` dan `npm run lint` tetap bersih.
- Uji tangan: isi form, refresh, buka `/u/:handle` dari akun kedua dan pastikan datanya muncul.
- Uji ekstraksi dengan PDF asli, bukan file contoh buatan sendiri.
- Kalau ada yang aneh di sisi data, probe dulu PostgREST dengan anon key sebelum menuduh frontend, sesuai catatan masterplan.

## Yang perlu Josep kerjakan sendiri

- Menjalankan `0006_update_profile.sql` di SQL Editor dashboard Supabase.
- Membuat akun Hugging Face dan Space kosong bertipe Docker.
- Menyiapkan file CV PDF asli untuk uji, idealnya satu berbahasa Inggris dan satu Indonesia.
- Menyimpan `ANTHROPIC_API_KEY` untuk nanti, jangan sampai masuk repo.
