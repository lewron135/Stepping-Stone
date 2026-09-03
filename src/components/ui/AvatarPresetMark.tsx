import { cellPath, ORIGINS, type AvatarPreset } from './avatarPresets';

/**
 * Menggambar satu avatar pilihan. Datanya ada di `avatarPresets.ts`; berkas ini sengaja cuma
 * berisi komponen supaya fast refresh tetap bekerja.
 */
export function AvatarPresetMark({ preset }: {preset: AvatarPreset;}) {
  // Warnanya lewat variabel tema, jadi mode terang dan gelap terbalik sendiri tanpa aturan
  // tambahan: di mode gelap --ink memang sudah jadi warna terang.
  const background = preset.invert ? 'var(--ink)' : 'var(--subtle)';
  const shape = preset.invert ? 'var(--subtle)' : 'var(--ink)';

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden focusable="false">
      <rect width="100" height="100" fill={background} />
      {preset.cells.map((cell, index) => {
        const path = cellPath(cell, ORIGINS[index][0], ORIGINS[index][1]);
        return path ? <path key={index} d={path} fill={shape} /> : null;
      })}
    </svg>);

}
