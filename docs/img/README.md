# Tangkapan layar untuk README

Folder ini menampung gambar yang dipakai `README.md` di akar repositori.

## Yang perlu diambil

Ambil di browser desktop, lebar jendela sekitar 1440 piksel, **mode terang**, dengan feed yang
sudah berisi data contoh. Simpan sebagai PNG dengan nama persis seperti di bawah.

| Nama berkas | Halaman | Yang harus kelihatan |
|---|---|---|
| `feed.png` | Beranda atau tab Proyek | Feed yang ramai, kotak Asisten pencarian di panel kanan, dan filter kategori |
| `detail.png` | Detail satu pekerjaan | Brief lengkap (ruang lingkup, hasil akhir, tenggat), penawaran masuk, dan bagian Tanya jawab |
| `kesepakatan.png` | Halaman Kesepakatan | Status terkunci, rincian harga dan biaya admin, serta linimasa kesepakatan |
| `profil.png` | Profil sendiri | Avatar, portofolio berkelompok, rekam jejak, dan rekap pendapatan |
| `brief-assistant.png` | Pasang pekerjaan | Kotak "Bantu isi brief" beserta tiga kolom brief yang sudah terisi draf |

## Yang perlu dihindari

- Jangan menampilkan email, nomor telepon, atau nama orang yang tidak ikut tim.
- Jangan memakai jendela yang sangat sempit, tabel rincian jadi terpotong.
- Jangan pakai mode gelap untuk semuanya. Kalau mau menunjukkan tema gelap, cukup satu gambar
  dan beri keterangan.

## Setelah gambarnya ada

Blok markdown-nya **sudah ada** di `README.md`, tepat setelah bagian "Fitur Tambahan", tapi
masih dibungkus komentar HTML supaya README tidak menampilkan ikon gambar rusak selama
berkasnya belum ada.

Yang perlu dilakukan tinggal dua:

1. Hapus baris `<!--` dan `-->` yang membungkus bagian `### Tampilan` di `README.md`.
2. Tambahkan `- [Tampilan](#tampilan)` ke Daftar Isi, setelah baris `- [Fitur Unggulan](...)`.

Setelah itu cek hasilnya di pratinjau GitHub, bukan cuma di editor: tabel dua kolom dan tag
`<img>` di dalamnya baru kelihatan benar setelah dirender.
