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