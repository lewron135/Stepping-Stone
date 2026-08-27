import type { User } from '../types';
import { PROOF_IMAGES, daysAgo } from './reference';

export const users: User[] = [
{
  id: 'u1',
  handle: 'ranialifia',
  name: 'Rani Alifia',
  campus: 'Universitas Nusantara',
  faculty: 'Fakultas Ilmu Komputer',
  major: 'Sistem Informasi',
  year: 'Angkatan 2023',
  bio: 'Desain grafis + front-end. Suka kerja yang hasilnya bisa dilihat.',
  skills: ['Figma', 'Poster & Feed', 'HTML/CSS', 'React dasar', 'Spreadsheet'],
  stats: { completed: 12, cancelled: 1, unpaidReports: 0 },
  portfolio: [
  {
    id: 'p1',
    title: 'Poster rangkaian acara Pekan Wirausaha',
    category: 'Desain Grafis',
    workType: 'proyek',
    summary:
    'Tiga poster untuk rangkaian acara himpunan, termasuk versi cetak A3 dan versi feed Instagram.',
    deliverable: '3 poster (PNG + PDF cetak)',
    proofImage: PROOF_IMAGES.poster,
    price: 175000,
    completedAt: daysAgo(18),
    testimonial: {
      authorId: 'u4',
      rating: 5,
      text: 'Revisi cepat, hasil poster rapi, dan file cetak siap pakai tanpa diminta dua kali.',
      date: daysAgo(18)
    }
  },
  {
    id: 'p2',
    title: 'Landing page satu halaman untuk UMKM kopi',
    category: 'Coding & Web',
    workType: 'proyek',
    summary:
    'Halaman profil sederhana untuk kedai kopi di sekitar kampus, dengan menu dan tombol WhatsApp.',
    deliverable: 'Website 1 halaman + panduan update',
    proofImage: PROOF_IMAGES.website,
    price: 320000,
    completedAt: daysAgo(34),
    testimonial: {
      authorId: 'u5',
      rating: 5,
      text: 'Selesai dua hari lebih cepat dari tenggat dan saya diajari cara ganti menunya sendiri.',
      date: daysAgo(34)
    }
  },
  {
    id: 'p3',
    title: 'Rekap data penjualan bulanan UMKM katering',
    category: 'Data & Riset',
    workType: 'proyek',
    summary:
    'Merapikan 6 bulan catatan penjualan manual menjadi satu spreadsheet dengan ringkasan per menu.',
    deliverable: 'Spreadsheet + 1 halaman ringkasan',
    proofImage: PROOF_IMAGES.data,
    price: 140000,
    completedAt: daysAgo(52),
    testimonial: {
      authorId: 'u6',
      rating: 4,
      text: 'Datanya jadi kebaca, sekarang saya tahu menu mana yang paling laku.',
      date: daysAgo(52)
    }
  }]

},
{
  id: 'u2',
  handle: 'bayuprakoso',
  name: 'Bayu Prakoso',
  campus: 'Universitas Nusantara',
  faculty: 'Fakultas Teknik',
  major: 'Teknik Industri',
  year: 'Angkatan 2022',
  bio: 'Ketua divisi acara. Sering butuh bantuan desain dan dokumentasi.',
  skills: ['Manajemen acara', 'Sponsorship'],
  stats: { completed: 9, cancelled: 0, unpaidReports: 0 },
  portfolio: []
},
{
  id: 'u3',
  handle: 'dindamhrn',
  name: 'Dinda Maharani',
  campus: 'Universitas Nusantara',
  faculty: 'Fakultas Ilmu Budaya',
  major: 'Sastra Inggris',
  year: 'Angkatan 2023',
  bio: 'Copywriting dan penerjemahan non-akademik.',
  skills: ['Copywriting', 'Proofreading'],
  stats: { completed: 7, cancelled: 1, unpaidReports: 0 },
  portfolio: [
  {
    id: 'p4',
    title: 'Caption dan copy feed untuk toko thrift',
    category: 'Copywriting',
    workType: 'proyek',
    summary: 'Dua belas caption feed dengan gaya bahasa santai untuk toko thrift mahasiswa.',
    deliverable: '12 caption + 3 template',
    proofImage: PROOF_IMAGES.poster,
    price: 120000,
    completedAt: daysAgo(11),
    testimonial: {
      authorId: 'u2',
      rating: 5,
      text: 'Copy-nya nyambung banget sama pembeli kami.',
      date: daysAgo(11)
    }
  }]

},
{
  id: 'u4',
  handle: 'fajarng',
  name: 'Fajar Nugroho',
  campus: 'Universitas Nusantara',
  faculty: 'Fakultas Teknik',
  major: 'Teknik Elektro',
  year: 'Angkatan 2021',
  bio: 'Editing video acara dan dokumentasi himpunan.',
  skills: ['Premiere Pro', 'After Effects'],
  stats: { completed: 15, cancelled: 2, unpaidReports: 1 },
  portfolio: [
  {
    id: 'p5',
    title: 'After movie seminar nasional',
    category: 'Video & Motion',
    workType: 'proyek',
    summary: 'Video dokumentasi 90 detik dari 4 jam rekaman acara seminar.',
    deliverable: 'Video 90 detik (MP4 1080p)',
    proofImage: PROOF_IMAGES.video,
    price: 400000,
    completedAt: daysAgo(6),
    testimonial: {
      authorId: 'u2',
      rating: 5,
      text: 'Ritme videonya enak dan revisi cuma sekali.',
      date: daysAgo(6)
    }
  }]

},
{
  id: 'u5',
  handle: 'sekarayu',
  name: 'Sekar Ayu',
  campus: 'Universitas Nusantara',
  faculty: 'Fakultas Ekonomi & Bisnis',
  major: 'Manajemen',
  year: 'Angkatan 2022',
  bio: 'Bantu UMKM keluarga, sering cari partner desain dan data.',
  skills: ['Riset pasar', 'Excel'],
  stats: { completed: 5, cancelled: 0, unpaidReports: 0 },
  portfolio: []
},
{
  id: 'u6',
  handle: 'rizkyhdyt',
  name: 'Rizky Hidayat',
  campus: 'Universitas Nusantara',
  faculty: 'Fakultas Teknik',
  major: 'Teknik Sipil',
  year: 'Angkatan 2024',
  bio: 'Ambil Kerja Cepat di sekitar Fakultas Teknik.',
  skills: ['Antar barang', 'Titip beli'],
  stats: { completed: 21, cancelled: 0, unpaidReports: 0 },
  portfolio: []
}];


export function findUser(id: string): User {
  return users.find((user) => user.id === id) ?? users[0];
}

export function findUserByHandle(handle: string): User | undefined {
  return users.find((user) => user.handle === handle);
}