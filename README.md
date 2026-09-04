<div align="center">

  # Stepping Stone
  ### Kerja Kampus, Kesepakatan Jelas, Portofolio Nyata

  [![Live Demo](https://img.shields.io/badge/Live_Demo-Online-2ea44f?style=for-the-badge)](https://stepping-stone-eight.vercel.app)
  [![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/lewron135/Stepping-Stone)
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

  **Submission untuk ITECHNO CUP 2026 - Web Development**

  **By Entar ajadeh**

</div>

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Unggulan](#fitur-unggulan)
- [Teknologi](#teknologi)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Skema Database](#skema-database)
- [Cara Kerja AI](#cara-kerja-ai)
- [Instalasi dan Setup](#instalasi-dan-setup)
- [Penggunaan](#penggunaan)
- [Keputusan Teknis](#keputusan-teknis)
- [Status Pengembangan](#status-pengembangan)
- [Tim Pengembang](#tim-pengembang)
- [Lisensi](#lisensi)

---

## Tentang Proyek

### Latar Belakang

Mahasiswa sering butuh uang cepat atau pengalaman kerja, tapi platform freelance yang ada terlalu besar dan kompetitif untuk kebutuhan sekecil "titip beli" atau "desain poster acara kampus". Di sisi lain, kerjaan informal antar teman kampus rawan masalah klasik: harga berubah di tengah jalan, tenggat molor tanpa kejelasan, sampai hasil kerja yang sudah selesai tidak dibayar, dan semuanya tidak meninggalkan bukti apa pun untuk portofolio.

### Solusi yang Ditawarkan

**Stepping Stone** adalah forum kerja antar mahasiswa dengan alur yang jelas dari awal sampai akhir: temukan pekerjaan, ajukan penawaran dan nego lewat chat, kunci kesepakatan (harga dan tenggat tidak bisa berubah lagi), kerjakan dan unggah bukti, lalu dapat testimoni yang otomatis masuk ke portofolio. Setiap transaksi menghasilkan dua hal sekaligus: uang dan bukti pengalaman yang bisa ditunjukkan.

### Tujuan Proyek

- **Tujuan utama**: Mempertemukan mahasiswa yang butuh pekerjaan cepat atau proyek dengan mahasiswa lain yang punya skill terkait, lewat kesepakatan yang jelas dan terlindungi bagi kedua pihak.
- **Target pengguna**: Mahasiswa dalam lingkup kampus yang sama, baik sebagai pemberi kerja (klien) yang memasang pekerjaan, maupun pekerja yang mengajukan penawaran.
- **Value proposition**: Kesepakatan yang terkunci, bukti kerja dan testimoni yang otomatis membangun portofolio, serta Career Compass yang menyarankan proyek sedikit di atas level skill pengguna supaya portofolio naik bertahap.

---

## Fitur Unggulan

| Fitur | Deskripsi | Keunggulan |
|-------|-----------|------------|
| **Feed Kerja Cepat dan Proyek** | Dua jenis pekerjaan: Kerja Cepat (Antar & Ambil, Titip Beli, Pindah Barang, Bantu Acara) dan Proyek (Desain Grafis, Coding & Web, Copywriting, Data & Riset) | Menyesuaikan skala kebutuhan, dari tugas singkat sampai proyek berbayar besar |
| **Ajukan dan Nego lewat Chat** | Pekerja mengajukan harga plus catatan, lalu lanjut nego langsung dengan pemberi kerja | Transparan, kedua pihak bisa diskusi sebelum berkomitmen |
| **Kesepakatan Terkunci** | Setelah kedua pihak setuju, harga dan tenggat dikunci di level database dan tidak bisa diubah sepihak | Melindungi kedua pihak dari perubahan di tengah jalan |
| **Bukti Kerja dan Testimoni** | Pekerja mengunggah bukti hasil kerja, klien mengonfirmasi sambil memberi rating dan testimoni | Hasil kerja otomatis jadi entri portofolio yang bisa ditunjukkan ke pemberi kerja berikutnya |
| **Notifikasi Lintas Pihak** | Delapan event siklus hidup kesepakatan dikirim otomatis ke pihak yang relevan | Tidak ada yang tertinggal informasi, status baca ikut akun bukan browser |

### Fitur Tambahan

- **Career Compass** merekomendasikan pekerjaan yang sedikit di atas level skill pengguna berdasarkan riwayat kerja.
- **Track Record dan Profil Publik** menampilkan statistik pekerjaan selesai, dibatalkan, dan laporan belum dibayar, plus galeri portofolio yang bisa dilihat publik di `/u/:handle`.
- **Laporan Belum Dibayar** sebagai mekanisme perlindungan pekerja, tercatat permanen di track record klien.
- **Batas 2 Hari Konfirmasi** membuat pekerjaan tetap masuk track record walau klien tidak merespons.
- **Isi Profil dari CV** membaca berkas PDF di server, mengambil daftar skill, lalu menyerahkannya ke form profil sebagai draf. Berkasnya diproses di memori dan tidak pernah disimpan, dan yang tersimpan hanya yang pengguna setujui.
- **Brief Assistant** menyusun draf ruang lingkup, hasil akhir, dan tenggat dari satu kalimat di form Pasang Pekerjaan. Hanya kolom kosong yang diisi, dan hasilnya ditandai draf sampai pengguna mengeditnya.
- **Search Assistant** menerjemahkan kalimat bebas di feed jadi filter terstruktur, yang lalu dijalankan logika filter biasa. Kalau asisten gagal, pencarian kata tetap berfungsi.
- **Mode Terang dan Gelap** yang didesain setara, bisa diganti kapan saja.

---

## Teknologi

### Frontend

| Bagian | Pilihan |
|--------|---------|
| Framework | React 18.3 + Vite 5.2 + TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 (tema lewat CSS variable, dark mode berbasis class) |
| Animasi | Framer Motion 11.5 |
| Ikon | lucide-react 0.522 |
| Routing | React Router DOM 6.26 |
| State | React Context (AuthContext, StoreContext, ThemeContext, ToastContext) |

### Backend

| Bagian | Pilihan |
|--------|---------|
| Platform | Supabase (`@supabase/supabase-js` 2.112) |
| Database | PostgreSQL dengan Row Level Security di semua tabel |
| Autentikasi | Supabase Auth (email dan password) |
| Logika bisnis | 11 fungsi RPC PostgreSQL, dipanggil lewat `supabase.rpc(...)` |
| Otomasi | 5 trigger PostgreSQL (notifikasi, auto-agree, auto-lock, pagar batas waktu) |
| Penyimpanan file | Supabase Storage, bucket publik `bukti-kerja` |
| Serverless function | Python di folder `api/`, dijalankan Vercel. Ekstraksi CV dan dua asisten AI |
| Model AI | Claude Haiku 4.5 lewat Anthropic Messages API, keluaran terstruktur dengan tool use |

### Alasan Pemilihan Teknologi

| Teknologi | Alasan |
|-----------|--------|
| **Vite + React + TypeScript** | Dev experience cepat dengan type safety untuk model data yang cukup kompleks (Job, Offer, Agreement, dan seterusnya). |
| **Tailwind CSS** | Utility first sehingga cepat membangun UI konsisten, dipadukan CSS variable custom agar tema terang dan gelap dikelola dari satu sumber warna. |
| **Supabase** | Auth, Postgres, RLS, dan Storage dalam satu layanan, sehingga tim kecil tidak perlu membangun dan merawat server sendiri. |
| **Logika bisnis di RPC, bukan di frontend** | Perubahan status kesepakatan harus atomic dan tidak boleh bisa diakali dari browser. Menaruhnya sebagai fungsi database membuat aturan mainnya berlaku untuk semua pemanggil. |
| **React Context, bukan Redux** | Skala state aplikasi masih cukup sederhana untuk dikelola tanpa state management eksternal. |

---

## Arsitektur Sistem

Stepping Stone adalah Single Page Application yang berbicara langsung ke Supabase. Yang menjaga aturan main adalah database itu sendiri, lewat Row Level Security, fungsi RPC, dan trigger.

Satu-satunya kode server ada di folder `api/`, berupa beberapa serverless function Python. Itu bukan server aplikasi: tidak ada logika bisnis di sana, dan tidak ada yang menyentuh tabel domain. Fungsi-fungsi itu ada karena dua hal yang memang tidak bisa dikerjakan di browser, yaitu membaca berkas PDF dan memegang API key Anthropic. Kalau API key ditaruh di kode frontend, siapa pun bisa membacanya lewat DevTools.

```mermaid
flowchart TB
    A["Browser (React SPA)"]
    A --> B["AuthContext<br/>sesi Supabase Auth"]
    A --> C["StoreContext<br/>state Job/Offer/Agreement/Thread"]
    C --> D["lib/api.ts<br/>satu-satunya lapisan akses data"]
    D --> E["Supabase PostgREST<br/>baca data + RLS"]
    D --> F["Supabase RPC<br/>11 fungsi, semua operasi tulis"]
    D --> G["Supabase Storage<br/>bucket bukti-kerja"]
    F --> H["Trigger PostgreSQL<br/>notifikasi, auto-lock, pagar batas waktu"]
    H --> I["Tabel notifications"]
    E --> I
    A --> J["Vercel Functions (api/)<br/>ekstraksi CV, Brief dan Search Assistant"]
    J --> K["Anthropic Claude Haiku 4.5"]
    J --> L["Supabase Auth<br/>verifikasi sesi pemanggil"]
```

### Prinsip yang Dipegang

1. **Semua operasi tulis lewat RPC.** Frontend tidak pernah `INSERT` atau `UPDATE` langsung ke tabel domain. Ini membuat perubahan status kesepakatan atomic dan tidak bisa dipecah-pecah dari browser.
2. **Aturan main ditegakkan di level tabel, bukan di komponen.** Contohnya penguncian kesepakatan dan batas 2 hari konfirmasi diwujudkan sebagai trigger, sehingga berlaku apa pun jalur pemanggilnya.
3. **Notifikasi lahir dari trigger, bukan diturunkan di client.** Baris `notifications` dibuat oleh trigger yang membaca transisi `OLD` ke `NEW`, jadi tidak ada race condition dan status baca ikut akun, bukan browser.
4. **Polling, bukan WebSocket.** Chat menyegarkan tiap 2,5 detik dan notifikasi tiap 20 detik. Cukup untuk skala kampus dan jauh lebih sederhana untuk dirawat.

---

## Skema Database

### Tabel

| Tabel | Isi |
|-------|-----|
| `profiles` | Profil pengguna, satu baris per akun Supabase Auth |
| `jobs` | Postingan pekerjaan, punya tipe `kerja-cepat` atau `proyek` |
| `offers` | Penawaran harga dari pekerja ke satu pekerjaan |
| `agreements` | Inti sistem. Kesepakatan hasil penawaran yang dipilih, lengkap dengan status, bukti, dan konfirmasi |
| `threads` | Wadah percakapan, selalu terikat ke satu pekerjaan |
| `messages` | Isi percakapan |
| `notifications` | Notifikasi per pengguna, diisi otomatis oleh trigger |

View `user_stats` dan `user_portfolio` dihitung otomatis dari tabel di atas, tidak disimpan sebagai kolom.

```mermaid
erDiagram
    PROFILES ||--o{ JOBS : memasang
    PROFILES ||--o{ OFFERS : mengajukan
    PROFILES ||--o{ NOTIFICATIONS : menerima
    JOBS ||--o{ OFFERS : menerima
    JOBS ||--o| AGREEMENTS : menghasilkan
    OFFERS ||--o| AGREEMENTS : menjadi
    AGREEMENTS }o--|| PROFILES : client
    AGREEMENTS }o--|| PROFILES : worker
    JOBS ||--o{ THREADS : membuka
    THREADS ||--o{ MESSAGES : berisi
```

### Status Kesepakatan

```mermaid
stateDiagram-v2
    state "waiting-approval" as WA
    state "locked" as LO
    state "in-progress" as IP
    state "waiting-confirmation" as WC
    state "completed" as CO
    state "completed-unconfirmed" as CU
    state "cancelled" as CA

    [*] --> WA: klien memilih satu penawaran
    WA --> LO: pekerja menekan Setuju
    LO --> IP: pekerjaan dimulai
    IP --> WC: bukti kerja diunggah
    WC --> CO: klien konfirmasi, beri rating dan testimoni
    WC --> CU: lewat 2 hari tanpa respons klien

    WA --> CA
    LO --> CA
    IP --> CA

    CO --> [*]
    CU --> [*]
    CA --> [*]
```

Begitu masuk `locked`, harga dan tenggat tidak bisa diubah lagi oleh siapa pun, termasuk lewat
panggilan langsung ke database. Jalur ke `completed-unconfirmed` memastikan pekerjaan tetap masuk
rekam jejak pekerja walaupun kliennya menghilang, hanya saja tanpa rating dan testimoni.

### Fungsi RPC

Semua operasi tulis dilakukan lewat fungsi berikut, bukan lewat akses tabel langsung.

`create_job`, `submit_offer`, `select_offer`, `agree_to_agreement`, `submit_proof`, `confirm_completion`, `close_without_confirmation`, `cancel_agreement`, `report_unpaid`, `get_or_create_thread`, `send_message`

### Migrasi

Folder `supabase/migrations/` berisi perubahan skema yang bisa dijalankan ulang (idempotent).

| File | Isi |
|------|-----|
| `0001_notifications_table.sql` | Tabel `notifications` beserta policy RLS |
| `0002_double_agree.sql` | Klien otomatis dianggap setuju saat memilih penawaran, dan kesepakatan terkunci sendiri begitu kedua pihak setuju |
| `0003_notification_triggers.sql` | Trigger untuk delapan event siklus hidup kesepakatan |
| `0004_completion_timeout_guard.sql` | Pagar sisi server untuk batas 2 hari konfirmasi |
| `0005_storage_bukti_kerja.sql` | Bucket `bukti-kerja` beserta policy penyimpanan |
| `0006_update_profile.sql` | Fungsi `update_profile` untuk menyimpan detail profil dan skill |

---

## Cara Kerja AI

Ada tiga tempat AI dipakai, dan ketiganya memegang aturan yang sama: **AI tidak pernah
memutuskan apa pun, dia hanya menyiapkan draf, dan manusia selalu jadi penentu akhir.**

| Fitur | Yang dikerjakan AI | Yang tetap dikerjakan manusia atau kode |
|-------|--------------------|------------------------------------------|
| **Isi Profil dari CV** | Membaca PDF di server dan menarik daftar skill | Pengguna meninjau, membetulkan, lalu menekan Simpan. Berkasnya tidak pernah disimpan |
| **Brief Assistant** | Menyusun draf ruang lingkup, hasil akhir, dan tenggat dari satu kalimat | Hanya kolom kosong yang diisi, ditandai draf, dan pengguna bebas menimpanya sebelum diposting |
| **Search Assistant** | Menerjemahkan kalimat bebas jadi filter terstruktur | Penyaringan daftar pekerjaan tetap dijalankan kode filter biasa. Model tidak pernah menyortir atau memilihkan pekerjaan |

### Tiga lapis penjaga

Semuanya ditegakkan di sisi server, dan yang menolak adalah kode, bukan model. Penolakan yang
dijalankan kode jauh lebih sulit dijebol daripada penolakan yang hanya dititipkan lewat prompt.

```mermaid
flowchart TD
    A["Kalimat dari pengguna"] --> B{"Punya sesi Supabase yang sah?"}
    B -- tidak --> X1["401 ditolak"]
    B -- ya --> C{"Masih di bawah 10 panggilan per 10 menit?"}
    C -- tidak --> X2["429 ditolak"]
    C -- ya --> D["Lapis 1: system prompt mengurung peran ke urusan pekerjaan kampus"]
    D --> E["Claude Haiku 4.5, keluaran terstruktur lewat tool use yang dipaksa"]
    E --> F{"Lapis 2: kode membaca kolom intent"}
    F -- di luar topik atau tidak pantas --> X3["422 ditolak"]
    F -- sesuai --> G["Nilai dicocokkan ulang ke daftar kategori dan area yang benar-benar ada"]
    G --> H["Draf ditampilkan sebagai usulan, pengguna yang memutuskan"]
```

Lapis ketiga adalah dua pemeriksaan paling awal di diagram: endpoint berbayar hanya melayani
pengguna yang sudah masuk, dengan batas pemakaian per orang per waktu, dan panjang pertanyaan
dipotong di 500 karakter. Tanpa itu, satu endpoint publik bisa menghabiskan kredit tim dalam
hitungan menit.

### Kenapa proxy, bukan panggilan langsung dari browser

`ANTHROPIC_API_KEY` disimpan sebagai environment variable di sisi server dan dibaca hanya oleh
serverless function di folder `api/`. Kalau key itu ada di kode frontend, siapa pun bisa
membacanya lewat DevTools. Karena itu namanya sengaja **tanpa** awalan `VITE_`: Vite menanamkan
setiap variabel berawalan itu ke dalam bundel JavaScript yang dikirim ke browser.

Model yang dipakai Claude Haiku 4.5, sekitar $0,001 per panggilan. Aplikasinya tetap berjalan
penuh tanpa API key, hanya ketiga fitur di atas yang mati dan mengatakannya apa adanya.

---

## Instalasi dan Setup

### Prasyarat

- Node.js v18 atau lebih tinggi
- npm
- Git
- Satu project Supabase

### 1. Clone Repository

```bash
git clone https://github.com/lewron135/Stepping-Stone.git
cd Stepping-Stone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Siapkan Environment Variable

```bash
cp .env.example .env
```

Isi `.env` dengan nilai dari Supabase Dashboard, menu Project Settings lalu API.

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=

# Dikosongkan saat sudah di Vercel. Isi hanya untuk pengujian lokal.
VITE_CV_EXTRACT_URL=
VITE_AI_BASE_URL=

# Dibaca serverless function di sisi server, tidak pernah sampai ke browser.
ANTHROPIC_API_KEY=
```

Anon key aman berada di sisi browser karena setiap tabel dilindungi Row Level Security. Jangan pernah menaruh `service_role` key di file ini.

`ANTHROPIC_API_KEY` sengaja **tanpa** awalan `VITE_`. Vite menanamkan setiap variabel berawalan `VITE_` ke dalam bundel JavaScript yang dikirim ke browser, jadi awalan itu akan membocorkan key ke siapa pun yang membuka DevTools. Aplikasi tetap berjalan penuh tanpa key ini, hanya dua fitur asisten yang mati dan membalas apa adanya.

Dua asisten AI juga menolak permintaan dari pengunjung yang belum masuk, jadi endpoint berbayarnya tidak bisa dipakai siapa saja yang menemukan alamatnya.

### 4. Siapkan Database

Buka SQL Editor di dashboard Supabase, lalu jalankan isi `supabase/migrations/` secara berurutan dari `0001` sampai `0005`. Semuanya idempotent, jadi aman dijalankan ulang.

> **Catatan penting untuk setup dari nol.** Repository ini belum menyimpan definisi SQL dari 11 fungsi RPC dan skema tabel awal (`profiles`, `jobs`, `offers`, `agreements`, `threads`, `messages`). Fungsi-fungsi itu dibuat lebih dulu langsung di dashboard Supabase sebelum praktik migrasi berbasis file diterapkan. Artinya, menjalankan folder `migrations/` saja belum cukup untuk membangun project Supabase yang benar-benar baru. Memindahkan sisa skema ke file migrasi masih jadi pekerjaan yang belum selesai.

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi berjalan di `http://localhost:5173`.

---

## Penggunaan

### Perintah yang Tersedia

```bash
npm run dev        # mode development
npm run build      # build produksi
npm run preview    # pratinjau hasil build
npm run lint       # ESLint
npx tsc --noEmit   # pemeriksaan tipe

python3 scripts/dev_api_server.py   # menjalankan folder api/ di localhost:8787
```

Perintah terakhir dibutuhkan hanya kalau kamu ingin menguji ekstraksi CV atau kedua asisten AI di laptop. Server itu menjalankan handler yang sama persis dengan yang nanti dijalankan Vercel, jadi tidak ada logika yang ditulis dua kali. Setelah jalan, isi `VITE_CV_EXTRACT_URL` dan `VITE_AI_BASE_URL` di `.env` seperti dicontohkan di file `.env.example`.

### Alur Pengguna

```mermaid
sequenceDiagram
    actor K as Klien
    participant DB as Supabase
    actor P as Pekerja

    K->>DB: create_job, brief wajib diisi
    DB-->>P: pekerjaan muncul di feed
    P->>DB: submit_offer, harga dan catatan
    DB-->>K: notifikasi penawaran masuk
    K->>DB: select_offer
    Note over DB: trigger menandai klien otomatis setuju
    DB-->>P: notifikasi penawaranmu dipilih
    P->>DB: agree_to_agreement
    Note over DB: kedua pihak setuju, harga dan tenggat terkunci
    P->>DB: submit_proof, foto bukti kerja
    DB-->>K: notifikasi bukti dikirim
    K->>DB: confirm_completion, rating dan testimoni
    DB-->>P: portofolio dan rekam jejak bertambah
```

1. **Daftar atau masuk.** Autentikasi memakai email dan password lewat Supabase Auth.
2. **Jelajahi pekerjaan.** Dari Feed, pilih tab Kerja Cepat atau Proyek, lalu buka detail pekerjaan.
3. **Ajukan penawaran.** Isi harga dan catatan, lalu lanjutkan nego lewat Chat. Pemasang pekerjaan langsung mendapat notifikasi.
4. **Kunci kesepakatan.** Saat klien memilih satu penawaran, dia otomatis dianggap setuju. Kesepakatan terkunci begitu pekerja menekan Setuju, dan sejak itu harga dan tenggat tidak bisa diubah.
5. **Kerjakan dan buktikan.** Pekerja mengunggah foto bukti, klien mengonfirmasi sambil memberi rating dan testimoni.
6. **Portofolio terbentuk.** Bukti dan testimoni otomatis jadi entri portofolio di profil publik pekerja.

Jika klien tidak merespons dalam 2 hari sejak bukti dikirim, kesepakatan berubah jadi Selesai (Belum Dikonfirmasi). Pekerjaan tetap masuk track record pekerja, hanya tanpa rating dan testimoni.

---

## Keputusan Teknis

| Keputusan | Alasan |
|-----------|--------|
| **Chat pakai polling, bukan WebSocket** | Untuk skala kampus, penyegaran tiap 2,5 detik sudah terasa langsung, tanpa perlu merawat koneksi persisten. |
| **Batas 2 hari dihitung saat halaman dibuka, bukan cron job** | Menghindari ketergantungan pada penjadwal eksternal. Syaratnya tetap divalidasi ulang oleh trigger di server, jadi jam browser yang meleset tidak bisa mempercepat penutupan. |
| **Notifikasi dari trigger, bukan diturunkan di client** | Bertahan lintas device dan refresh, tahan race condition, dan tidak kehilangan informasi siapa pelaku sebenarnya. |
| **Bucket bukti kerja bersifat publik** | Bukti yang sudah dikonfirmasi otomatis jadi entri portofolio yang memang ditampilkan terbuka. Bucket privat akan memaksa setiap tampilan portofolio meminta signed URL yang bisa kedaluwarsa. |
| **Tabel `notifications` tanpa policy insert** | Baris hanya pernah dibuat oleh trigger `security definer`, sehingga pengguna biasa tidak bisa mengarang notifikasi palsu lewat panggilan langsung ke tabel. |
| **AI hanya menyiapkan draf, manusia yang memutuskan** | Berlaku di ketiga fitur AI. Ekstraksi CV mengisi form profil sebagai usulan, Brief Assistant mengisi kolom yang masih kosong dan menandainya draf, Search Assistant memasang filter yang bisa dibatalkan sekali klik. Tidak ada satu pun keluaran model yang tersimpan atau tampil tanpa dikonfirmasi pengguna. |
| **Model tidak pernah menyortir daftar pekerjaan** | Search Assistant hanya menerjemahkan kalimat jadi filter, lalu logika filter yang sudah ada yang menjalankannya. Ini membuat hasilnya deterministik dan bisa diuji, jauh lebih murah, dan menghindarkan keadaan ketika model mengarang pekerjaan yang tidak ada. |
| **Penolakan ditegakkan kode, bukan diminta lewat prompt** | Keluaran model memuat kolom niat, dan proxy di server yang membaca kolom itu lalu menolak permintaan di luar topik atau tidak pantas, termasuk permintaan joki tugas kuliah. Penolakan yang dijalankan kode jauh lebih sulit dijebol daripada penolakan yang hanya dititipkan di prompt. |

---

## Status Pengembangan

### Sudah Berjalan

- Autentikasi, pembuatan pekerjaan, penawaran, chat, siklus penuh kesepakatan, unggah bukti, testimoni, portofolio, notifikasi, dan Career Compass.
- Form edit profil beserta pengisian skill dari CV.
- Brief Assistant dan Search Assistant, keduanya di atas proxy di folder `api/`.
- Sudah ter-deploy dan bisa diakses publik.
- Pemeriksaan tipe dan lint bersih tanpa error.

### Belum Ada

- **Test suite.** Belum ada unit, integration, maupun end to end test. Pengujian sejauh ini dilakukan manual dengan dua akun.
- **Definisi SQL untuk skema awal dan 11 fungsi RPC.** Lihat catatan di bagian Instalasi.
- **Batas pemakaian AI yang persisten.** Batas 10 panggilan per 10 menit per pengguna disimpan di memori instance, jadi ikut hilang saat instance didaur ulang. Cukup untuk menahan pemakaian berlebihan yang wajar, belum cukup untuk menahan penyalahgunaan yang disengaja.
- **Asisten pencarian di layar kecil.** Kotaknya baru muncul di panel filter versi desktop.

---

## Tim Pengembang

| Nama | GitHub |
|------|--------|
| **Josep Natanael Pasaribu** | [@lewron135](https://github.com/lewron135) |
| **Marcellino Varian Saputra** | [@marcellinovs](https://github.com/marcellinovs) |
| **Stanley Lin** | [@Linneisa](https://github.com/Linneisa) |

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE). Lihat file LICENSE untuk detail lebih lanjut.

<div align="center">

  **Dibuat oleh Entar ajadeh untuk ITECHNO CUP 2026**

</div>
