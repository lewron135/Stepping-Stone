import { initials } from '../../utils/format';
import { cn } from '../../utils/cn';
import { AvatarPresetMark } from './AvatarPresetMark';
import { presetFromValue } from './avatarPresets';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /**
   * Isi kolom `avatar_url`. Bisa berupa penanda avatar pilihan seperti "preset:p07", bisa
   * alamat foto yang diunggah user. Kalau kosong, inisial namanya yang dipakai.
   */
  src?: string;
}

const SIZES = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-20 w-20 text-xl'
};

export function Avatar({ name, size = 'md', className, src }: AvatarProps) {
  const preset = presetFromValue(src);
  const photo = !preset && src ? src : undefined;

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-subtle font-semibold tracking-tight text-ink',
        SIZES[size],
        className
      )}>
      
      {preset ?
      <AvatarPresetMark preset={preset} /> :
      photo ?
      <img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" /> :
      initials(name)
      }
    </span>);

}