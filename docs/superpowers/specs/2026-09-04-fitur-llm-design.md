# Fondasi proxy LLM, Brief Assistant, dan Search Assistant

Status: disetujui Josep, keputusan detail didelegasikan ke Claude
Tanggal: 2026-09-04
Konteks waktu: 2 hari ke tenggat submit (6 September). Produksi sudah hidup di Vercel.

Menyambung catatan "LANJUTAN: Dua fitur LLM" di
`2026-09-01-profil-dan-ekstraksi-cv-design.md`. Yang di sana rencana, yang di sini desain.

## Masalah

Belum ada satu pun LLM di produk. Ekstraksi CV dan Career Compass dua-duanya deterministik.
Masterplan 4.11 menjanjikan AI Search Assistant dan 11.6 mewajibkan proxy backend untuk itu,
tapi keduanya belum ada barisnya. Brief wajib (masterplan 4.2) adalah pembeda produk, dan
mengisi tiga kolomnya dari nol adalah friksi terbesar di form Pasang Pekerjaan.

## Tujuan

- Satu fondasi proxy yang memegang `ANTHROPIC_API_KEY` dan dipakai dua fitur.
- Brief Assistant: satu kalimat niat jadi draf brief yang ditinjau user sebelum diposting.
- Search Assistant: kalimat bebas jadi filter terstruktur, dijalankan kode filter yang sudah ada.
- Tiga lapis penjaga berlaku untuk dua-duanya, ditegakkan kode bukan prompt.

## Non-tujuan

- Tidak membangun kerangka test otomatis. Repo tidak punya, dan 2 hari sebelum submit bukan
  waktunya memulai.
- Tidak menyentuh `api/extract-cv.py` yang sudah terbukti jalan, walau `_send`-nya jadi duplikat
  dari kelas dasar baru. Dirapikan setelah lomba.
- Tidak menyentuh alur kesepakatan, chat, notifikasi, atau `compass.ts`.
- LLM tidak pernah menyortir daftar pekerjaan. Itu tetap kode deterministik (masterplan 19).

## Keputusan

| Keputusan | Alasan |
|---|---|
| Batas pemakaian: verifikasi login plus batas in-memory | Tidak butuh migrasi baru yang memblokir, tidak butuh dependensi baru. Menahan penyalahgunaan biasa. Kelemahannya jujur: memori hilang saat instance didaur ulang |
| Panggilan Anthropic lewat `urllib`, bukan SDK | `requirements.txt` tetap satu baris. Batas ukuran function Vercel sudah pernah jadi masalah waktu membuang spaCy. API Messages cuma satu POST JSON |
| Keluaran terstruktur lewat tool use yang dipaksa | Skema tool jadi kontrak dan `tool_choice` mengunci model. Lebih kuat daripada meminta JSON di prosa |
| Dua endpoint terpisah, bukan satu endpoint bertugas banyak | Vercel memetakan satu file ke satu rute. Skema tool dan validasinya juga beda |
| Brief Assistant di kotak niat terpisah di atas form | Kalimat niat beda dari judul postingan. Judul cenderung pendek dan miskin konteks |
| Draf brief ikut mengusulkan judul, kategori, jenis | Gratis, satu request yang sama. Semua tetap draf yang disetujui user |
| Kolom yang sudah diketik user tidak ditimpa draf | Asisten yang menghapus ketikan orang lebih menyebalkan daripada asisten yang tidak jalan |
| Search Assistant memakai kotak cari yang sudah ada, dibesarkan dan diberi label asisten | Dua kotak pencarian dalam satu layar membingungkan. Sakelar mode tidak akan pernah ditemukan orang |
| Enter memanggil LLM hanya kalau kalimat lebih dari dua kata | Kontrol biaya. "poster" tidak perlu diterjemahkan |

## Arsitektur

```
Browser (React)
  |
  |-- draftBrief(text) -----> POST /api/draft-brief  --\
  |                                                     >-- _llm.py --> Claude Haiku 4.5
  '-- parseSearch(text) ----> POST /api/parse-search --/
                             keduanya memegang ANTHROPIC_API_KEY di sisi server
```

- `api/_json_http.py` kelas dasar handler: `_send`, `do_OPTIONS`, header CORS.
- `api/_llm.py`: `call_claude(...)`, `verify_user(token)`, `rate_limit(user_id)`.
- `api/draft-brief.py` dan `api/parse-search.py` tipis: validasi masuk, panggil, validasi keluar.
- `scripts/dev_api_server.py` merutekan ketiga endpoint ke handler yang sama persis dengan
  yang dipakai Vercel, menggantikan `scripts/dev_cv_server.py`.

Model: `claude-haiku-4-5-20251001`. Itu id yang benar-benar ada di akun Josep.

## Tiga lapis penjaga

1. System prompt mengurung peran ke urusan pekerjaan di Stepping Stone.
2. Skema tool punya kolom `intent`. **Proxy** yang membacanya dan menolak 422 kalau isinya
   di luar topik atau tidak pantas. Model tidak pernah diberi kesempatan menulis penolakannya
   sendiri. Nilai enum seperti kategori dicocokkan ke daftar di `src/data/reference.ts`;
   yang mengarang di luar daftar dibuang kode.
3. `verify_user` menukar token Supabase ke `/auth/v1/user`, tamu ditolak 401. Lalu 10 panggilan
   per 10 menit per user, dan input dipotong di 500 karakter.

`verify_user` tidak butuh rahasia baru. URL dan anon key Supabase sudah ada di environment, dan
anon key memang aman dibaca siapa pun.

## Bagian 1: fondasi proxy

`call_claude` mengirim `system`, satu pesan user, `tools`, dan `tool_choice` yang memaksa satu
tool. Balasannya diambil dari blok `tool_use` pertama, isinya sudah berupa objek.

Batas: `max_tokens` secukupnya, timeout jaringan, dan kegagalan apa pun dipetakan ke pesan yang
tidak membocorkan detail internal ke browser, mengikuti pola `api/extract-cv.py`.

`rate_limit` memakai dict di level modul berisi stempel waktu per user, jendela geser 10 menit.

## Bagian 2: Brief Assistant

`POST /api/draft-brief`, body `{"text": "..."}`, header `Authorization: Bearer <token supabase>`.
Balasan `{intent, type, category, title, scope, deliverable, deadline}`.

Validasi keluaran sebelum sampai ke browser:

- `deadline` harus tanggal sungguhan di masa depan, maksimal 180 hari. Di luar itu dibuang.
- `category` harus ada di daftar kategori. `type` harus cocok dengan daftar kategorinya.
- Teks dipotong ke batas yang sama dengan validasi form (`scope` 600 karakter).

UI di `src/pages/CreateJob.tsx`: kotak opsional di atas form, di luar `FormState` dan di luar
validasi. Mengisi hanya kolom yang masih kosong. Kolom yang terisi dari draf dapat penanda
"draf dari asisten" yang hilang begitu kolomnya diedit. Ini yang membuat langkah persetujuan
user kelihatan di layar.

Error: 401 mengajak masuk, 429 minta tunggu, 422 minta jelaskan pekerjaannya. Tidak ada yang
menghalangi pengisian manual.

## Bagian 3: Search Assistant

`POST /api/parse-search`, body `{"text": "...", "scope": "home|kerja-cepat|proyek"}`.
Balasan `{intent, tab, kategori, area, hargaMaks}`, semuanya boleh null.

UI di `src/pages/Feed.tsx` dan `src/components/feed/FeedFilters.tsx`: kotak cari dibesarkan dan
diberi label asisten plus contoh kalimat. Mengetik tetap menyaring langsung lewat pencocokan
kata. Enter memanggil proxy kalau kalimatnya lebih dari dua kata.

Filter harga maksimal (`priceMax`) memang belum ada di feed dan jadi tambahan nyata, dipakai
juga oleh orang yang tidak menyentuh asisten.

**Ganjalan yang harus ditangani:** `useEffect` di `Feed.tsx` mengosongkan `category` dan `area`
setiap kali tab berganti. Kalau asisten menyimpulkan tab lain, memasang filter lalu pindah tab
akan menghapus filter itu sendiri. Penanganannya: filter hasil asisten ditahan di ref, pindah
tab dulu, baru dipasang setelah efek pembersih itu berjalan.

Panel ringkas menyebut filter apa yang dipasang, dengan tombol batalkan yang mengembalikan
filter ke keadaan sebelumnya.

**Fallback mutlak:** gagal apa pun, koneksi mati, kuota habis, atau kalimat di luar topik,
kalimat yang diketik tetap dipakai sebagai pencarian kata biasa seperti perilaku hari ini.
Pencarian tidak pernah ikut mati bersama AI-nya.

## Cara memastikan benar

Tidak ada test otomatis, mengikuti keputusan spec sebelumnya. Pembuktiannya:

- `npx tsc --noEmit` dan `npm run lint` tetap bersih.
- `python3 scripts/dev_api_server.py` lalu panggil dua endpoint baru dengan curl memakai key
  asli, dan pastikan balasannya benar-benar terstruktur.
- Uji penjaga: panggil tanpa token (harus 401), panggil dengan kalimat di luar topik
  (harus 422), panggil berulang melewati batas (harus 429).
- Uji tangan di browser: draf brief mengisi form dan bisa dibetulkan, pencarian kalimat
  memasang filter dan bisa dibatalkan, dan matikan server proxy untuk memastikan fallback
  pencarian kata tetap jalan.

## Yang perlu Josep kerjakan sendiri

- Mendaftarkan `ANTHROPIC_API_KEY` di Vercel Environment Variables. Tanpa ini dua fitur di atas
  mati di produksi, walau lokal sudah jalan.
