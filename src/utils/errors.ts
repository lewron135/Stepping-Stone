/**
 * Mengubah error apa pun jadi satu kalimat yang layak ditampilkan ke user.
 *
 * Kenapa tidak cukup `error.message`: error dari PostgREST menaruh petunjuk yang paling
 * berguna di `hint`, bukan di `message`. Contoh nyatanya, waktu tanda tangan fungsi
 * `update_profile` tidak cocok, `message` cuma bilang fungsinya tidak ditemukan sementara
 * `hint` menyebut persis fungsi mana yang tersedia. Menampilkan `message` saja membuat
 * kegagalan yang sebetulnya jelas jadi terlihat misterius.
 */
export function errorText(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (!error || typeof error !== 'object') return fallback;

  const detail = error as {message?: unknown;hint?: unknown;code?: unknown;};
  const parts = [detail.message, detail.hint].
  filter((part): part is string => typeof part === 'string' && part.trim().length > 0);

  if (parts.length === 0) return fallback;

  const text = parts.join(' ');
  return typeof detail.code === 'string' && detail.code ? `${text} (${detail.code})` : text;
}
