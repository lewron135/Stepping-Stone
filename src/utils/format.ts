export function rupiah(value: number): string {
  return 'Rp' + value.toLocaleString('id-ID');
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function timeAgo(iso: string, now: number = Date.now()): string {
  const diff = now - new Date(iso).getTime();
  if (diff < MINUTE) return 'baru saja';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}j`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}h`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function deadlineLabel(iso: string, now: number = Date.now()): string {
  const target = new Date(iso);
  const diff = target.getTime() - now;
  if (diff < 0) return 'Lewat tenggat';
  if (diff < HOUR) return `${Math.max(1, Math.floor(diff / MINUTE))} menit lagi`;
  if (diff < DAY)
  return `Hari ini ${target.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  if (diff < 2 * DAY)
  return `Besok ${target.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  return target.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function initials(name: string): string {
  return name.
  split(' ').
  slice(0, 2).
  map((part) => part[0]).
  join('').
  toUpperCase();
}

export function adminFeeFor(price: number): number {
  return Math.round(price * 0.05 / 500) * 500;
}