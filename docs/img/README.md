# Tangkapan layar untuk README

Folder ini menampung gambar yang dipakai `README.md` di akar repositori. **Semuanya sudah
terpasang** di bagian [Demo dan Screenshot](../../README.md#demo-dan-screenshot).

| Berkas | Yang ditampilkan |
|---|---|
| `hero.jpg` | Halaman depan, "Kerja kecil. Bukti yang besar." |
| `feed.png` | Feed dua jenis pekerjaan, filter, dan Asisten Pencarian |
| `portofolio.png` | Entri portofolio beserta bukti kerja dan testimoni |
| `brief-assistant.png` | Brief Assistant mengisi form Pasang Pekerjaan |
| `profil-cv.png` | Form profil dengan pengisian otomatis dari CV |

## Kalau perlu mengganti gambar

Ambil di browser desktop, lebar jendela sekitar 1440 piksel, mode terang, dengan feed yang sudah
berisi data. Jangan menampilkan email, nomor telepon, atau nama orang di luar tim.

Setelah itu perkecil supaya repositori tidak membengkak. Foto sebaiknya JPEG, tangkapan
antarmuka sebaiknya PNG:

```bash
sips -Z 1600 docs/img/<berkas>.png
sips -s format jpeg -s formatOptions 82 docs/img/<foto>.png --out docs/img/<foto>.jpg
```
