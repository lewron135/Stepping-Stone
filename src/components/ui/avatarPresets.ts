/**
 * Avatar pilihan, digambar sebagai SVG dan bukan disimpan sebagai berkas gambar.
 *
 * Kenapa begini: tidak ada aset yang perlu diunggah atau dihosting, tajam di ukuran berapa
 * pun dari 28 sampai 80 piksel, dan warnanya ikut variabel tema sehingga benar sendirinya di
 * mode terang maupun gelap.
 *
 * Kenapa bentuk dan bukan warna: palet aplikasi ini sepenuhnya monokrom, satu-satunya warna
 * adalah merah untuk bahaya. Dua belas avatar warna-warni akan terlihat seperti tempelan dari
 * aplikasi lain. Jadi yang membedakan adalah siluetnya, dan setengahnya dibalik terang gelap
 * supaya tetap gampang dibedakan di ukuran terkecil.
 *
 * Tiap avatar adalah bidang 2x2. Tiap kuadran diisi salah satu dari: kosong, blok penuh,
 * seperempat lingkaran menghadap salah satu sudut, atau segitiga diagonal.
 */

type Cell =
'e' | 'f' |
'q0' | 'q1' | 'q2' | 'q3' |
'd0' | 'd1' | 'd2' | 'd3';

export interface AvatarPreset {
  id: string;
  /** Urutannya kiri atas, kanan atas, kiri bawah, kanan bawah. */
  cells: [Cell, Cell, Cell, Cell];
  /** Menukar peran latar dan bentuk, supaya satu deret avatar tidak terlihat seragam. */
  invert: boolean;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
{ id: 'p01', cells: ['q2', 'q3', 'q1', 'q0'], invert: false },
{ id: 'p02', cells: ['q0', 'q1', 'q3', 'q2'], invert: true },
{ id: 'p03', cells: ['q2', 'q3', 'f', 'f'], invert: false },
{ id: 'p04', cells: ['f', 'e', 'e', 'f'], invert: true },
{ id: 'p05', cells: ['f', 'f', 'e', 'e'], invert: false },
{ id: 'p06', cells: ['f', 'e', 'f', 'e'], invert: true },
{ id: 'p07', cells: ['f', 'd1', 'd3', 'e'], invert: false },
{ id: 'p08', cells: ['q2', 'e', 'e', 'q0'], invert: true },
{ id: 'p09', cells: ['e', 'q3', 'q1', 'e'], invert: false },
{ id: 'p10', cells: ['f', 'f', 'f', 'e'], invert: true },
{ id: 'p11', cells: ['d0', 'd1', 'd2', 'd3'], invert: false },
{ id: 'p12', cells: ['q2', 'q2', 'q2', 'q2'], invert: true }];


const PRESET_PREFIX = 'preset:';
const SIZE = 50;

export function presetValue(id: string): string {
  return `${PRESET_PREFIX}${id}`;
}

export function isPresetValue(value: string | undefined): boolean {
  return Boolean(value && value.startsWith(PRESET_PREFIX));
}

export function presetFromValue(value: string | undefined): AvatarPreset | undefined {
  if (!value || !isPresetValue(value)) return undefined;
  const id = value.slice(PRESET_PREFIX.length);
  return AVATAR_PRESETS.find((preset) => preset.id === id);
}

/**
 * Jalur SVG untuk satu kuadran. `x` dan `y` adalah sudut kiri atas kuadrannya.
 *
 * Seperempat lingkaran selalu berjari-jari selebar kuadran dan berpusat di salah satu
 * sudutnya, jadi busurnya selalu menyentuh dua sudut tetangganya dengan pas.
 */
export function cellPath(cell: Cell, x: number, y: number): string | null {
  const r = SIZE;
  switch (cell) {
    case 'e':
      return null;
    case 'f':
      return `M${x} ${y}h${r}v${r}h${-r}Z`;
    case 'q0':
      return `M${x} ${y}L${x + r} ${y}A${r} ${r} 0 0 1 ${x} ${y + r}Z`;
    case 'q1':
      return `M${x + r} ${y}L${x + r} ${y + r}A${r} ${r} 0 0 1 ${x} ${y}Z`;
    case 'q2':
      return `M${x + r} ${y + r}L${x} ${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
    case 'q3':
      return `M${x} ${y + r}L${x} ${y}A${r} ${r} 0 0 1 ${x + r} ${y + r}Z`;
    case 'd0':
      return `M${x} ${y}L${x + r} ${y}L${x} ${y + r}Z`;
    case 'd1':
      return `M${x + r} ${y}L${x + r} ${y + r}L${x} ${y}Z`;
    case 'd2':
      return `M${x + r} ${y + r}L${x} ${y + r}L${x + r} ${y}Z`;
    case 'd3':
      return `M${x} ${y + r}L${x} ${y}L${x + r} ${y + r}Z`;
  }
}

export const ORIGINS: [number, number][] = [
[0, 0],
[SIZE, 0],
[0, SIZE],
[SIZE, SIZE]];
