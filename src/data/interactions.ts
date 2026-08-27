import type { Agreement, Message, Offer, Thread } from '../types';
import { PROOF_IMAGES, daysAgo, daysFromNow, minutesAgo } from './reference';

export const offers: Offer[] = [
// pr1 — open project, the demo target for "Ajukan Penawaran"
{
  id: 'o1',
  jobId: 'pr1',
  workerId: 'u3',
  price: 240000,
  note: 'Bisa mulai malam ini, biasa pegang poster acara himpunan.',
  createdAt: minutesAgo(30),
  status: 'pending'
},
{
  id: 'o2',
  jobId: 'pr1',
  workerId: 'u4',
  price: 275000,
  note: 'Harga naik sedikit karena saya sekalian siapkan versi story.',
  createdAt: minutesAgo(22),
  status: 'pending'
},
{
  id: 'o3',
  jobId: 'pr1',
  workerId: 'u6',
  price: 230000,
  note: 'Saya bisa kirim draft pertama dalam 2 hari.',
  createdAt: minutesAgo(9),
  status: 'pending'
},
{ id: 'o4', jobId: 'pr3', workerId: 'u4', price: 430000, note: 'Pernah kerjakan after movie seminar nasional.', createdAt: minutesAgo(180), status: 'pending' },
{ id: 'o5', jobId: 'pr5', workerId: 'u6', price: 160000, note: 'Sesuai harga, bisa mulai besok.', createdAt: minutesAgo(400), status: 'pending' },

// pr7 — job posted by the current user (client side)
{ id: 'o6', jobId: 'pr7', workerId: 'u3', price: 190000, note: 'Gaya garis simpel, bisa 2 alternatif sketsa.', createdAt: minutesAgo(320), status: 'pending' },
{ id: 'o7', jobId: 'pr7', workerId: 'u4', price: 220000, note: 'Termasuk file stiker siap cetak.', createdAt: minutesAgo(260), status: 'pending' },
{ id: 'o8', jobId: 'pr7', workerId: 'u6', price: 200000, note: 'Sesuai harga, revisi 2x.', createdAt: minutesAgo(120), status: 'pending' },

// Selected offers behind existing agreements
{ id: 'o9', jobId: 'pr2', workerId: 'u1', price: 300000, note: 'Sesuai harga, saya kerjakan tanpa template berbayar.', createdAt: daysAgo(1), status: 'selected' },
{ id: 'o10', jobId: 'pr4', workerId: 'u1', price: 180000, note: 'Saya rapikan per menu supaya kebaca.', createdAt: daysAgo(3), status: 'selected' },
{ id: 'o11', jobId: 'pr8', workerId: 'u1', price: 175000, note: 'Bisa sekalian versi cetak.', createdAt: daysAgo(24), status: 'selected' },
{ id: 'o12', jobId: 'pr9', workerId: 'u3', price: 120000, note: 'Bisa selesai 2 hari.', createdAt: daysAgo(2), status: 'selected' },
{ id: 'o13', jobId: 'kc7', workerId: 'u1', price: 15000, note: 'Saya ada di sekitar FT.', createdAt: daysAgo(11), status: 'selected' },

// Kerja Cepat offers
{ id: 'o14', jobId: 'kc1', workerId: 'u6', price: 10000, note: 'Saya di kantin sekarang.', createdAt: minutesAgo(5), status: 'pending' },
{ id: 'o15', jobId: 'kc3', workerId: 'u6', price: 15000, note: 'Ikut angkat.', createdAt: minutesAgo(60), status: 'pending' },
{ id: 'o16', jobId: 'kc6', workerId: 'u3', price: 15000, note: 'Bisa shift pagi.', createdAt: minutesAgo(150), status: 'pending' }];


export const agreements: Agreement[] = [
{
  id: 'a1',
  jobId: 'pr2',
  offerId: 'o9',
  clientId: 'u5',
  workerId: 'u1',
  price: 300000,
  adminFee: 15000,
  deadline: daysFromNow(6),
  clientAgreed: true,
  workerAgreed: false,
  status: 'waiting-approval'
},
{
  id: 'a2',
  jobId: 'pr4',
  offerId: 'o10',
  clientId: 'u6',
  workerId: 'u1',
  price: 180000,
  adminFee: 9000,
  deadline: daysFromNow(3),
  clientAgreed: true,
  workerAgreed: true,
  status: 'in-progress',
  lockedAt: daysAgo(2)
},
{
  id: 'a3',
  jobId: 'pr8',
  offerId: 'o11',
  clientId: 'u4',
  workerId: 'u1',
  price: 175000,
  adminFee: 8500,
  deadline: daysAgo(18),
  clientAgreed: true,
  workerAgreed: true,
  status: 'completed',
  lockedAt: daysAgo(23),
  proof: {
    imageUrl: PROOF_IMAGES.poster,
    note: 'Tiga poster final, file cetak dan feed sudah dikirim lewat chat.',
    submittedAt: daysAgo(19)
  },
  confirmation: {
    rating: 5,
    testimonial:
    'Revisi cepat, hasil poster rapi, dan file cetak siap pakai tanpa diminta dua kali.',
    confirmedAt: daysAgo(18)
  }
},
{
  id: 'a4',
  jobId: 'pr9',
  offerId: 'o12',
  clientId: 'u1',
  workerId: 'u3',
  price: 120000,
  adminFee: 6000,
  deadline: daysFromNow(4),
  clientAgreed: true,
  workerAgreed: true,
  status: 'in-progress',
  lockedAt: daysAgo(2)
},
{
  id: 'a5',
  jobId: 'kc7',
  offerId: 'o13',
  clientId: 'u4',
  workerId: 'u1',
  price: 15000,
  adminFee: 1000,
  deadline: daysAgo(9),
  clientAgreed: true,
  workerAgreed: true,
  status: 'cancelled',
  lockedAt: daysAgo(11),
  cancelledBy: 'u1'
}];


export const threads: Thread[] = [
{ id: 't1', jobId: 'pr1', participantIds: ['u1', 'u2'] },
{ id: 't2', jobId: 'pr2', participantIds: ['u1', 'u5'] },
{ id: 't3', jobId: 'pr4', participantIds: ['u1', 'u6'] },
{ id: 't4', jobId: 'pr9', participantIds: ['u1', 'u3'] }];


export const messages: Message[] = [
{
  id: 'm1',
  threadId: 't1',
  senderId: 'u1',
  text: 'Halo, untuk poster ini logo sponsornya sudah final atau masih bisa berubah?',
  createdAt: minutesAgo(26)
},
{
  id: 'm2',
  threadId: 't1',
  senderId: 'u2',
  text: 'Sudah final, ada 4 logo. Nanti saya kirim file PNG-nya.',
  createdAt: minutesAgo(24)
},
{
  id: 'm3',
  threadId: 't1',
  senderId: 'u1',
  text: 'Oke. Revisi maksimal 2x ya, dan tenggat 5 hari saya sanggup.',
  createdAt: minutesAgo(18)
},
{
  id: 'm4',
  threadId: 't2',
  senderId: 'u5',
  text: 'Aku pilih penawaran kamu ya. Harga Rp300.000 dan tenggat 6 hari, cocok?',
  createdAt: minutesAgo(90)
},
{
  id: 'm5',
  threadId: 't2',
  senderId: 'u1',
  text: 'Cocok. Aku sudah buka halaman kesepakatannya.',
  createdAt: minutesAgo(84)
},
{
  id: 'm6',
  threadId: 't3',
  senderId: 'u6',
  text: 'Nota bulan Maret sudah aku foto semua, ada 41 lembar.',
  createdAt: minutesAgo(300)
},
{
  id: 'm7',
  threadId: 't4',
  senderId: 'u3',
  text: 'Draft teks sertifikatnya besok pagi aku kirim.',
  createdAt: minutesAgo(500)
}];


/** Simulated inbound messages, revealed by chat polling. */
export const incomingQueue: Record<string, string[]> = {
  t1: [
  'Kalau kamu ajukan penawaran hari ini, aku bisa langsung pilih.',
  'Materi teks dan logo sudah aku siapkan di satu folder.'],

  t2: ['Kalau sudah setuju, aku kirim aset fotonya ya.'],
  t3: ['Kalau ada nota yang buram, bilang aja nanti aku foto ulang.'],
  t4: ['Sudah aku cek, lanjut ya.']
};