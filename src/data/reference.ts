export const CURRENT_USER_ID = 'u1';

export const PROOF_IMAGES = {
  poster: "/7228dd34-a7a9-4f12-bab4-b1a3c1015d63.jpg",
  video: "/fa5cda4f-e866-4fa4-b7cd-36c058c7eb2b.jpg",
  website: "/98c51b34-7534-4b22-87e5-e2cbdf1b3dc3.jpg",
  delivery: "/e333ac73-fb92-4a5d-af6f-ca33a01d8c82.jpg",
  data: "/ba86232f-80a8-4761-94a1-e734177bd2ea.jpg"
};

export const KERJA_CEPAT_CATEGORIES = [
'Antar & Ambil',
'Titip Beli',
'Pindah Barang',
'Bantu Acara',
'Cetak & Fotokopi'];


export const PROYEK_CATEGORIES = [
'Desain Grafis',
'Video & Motion',
'Coding & Web',
'Data & Riset',
'Copywriting',
'Sosial Media'];


const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * HOUR).toISOString();
}

export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY).toISOString();
}

export function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

export function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString();
}