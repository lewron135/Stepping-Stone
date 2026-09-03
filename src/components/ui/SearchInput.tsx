import { Loader2Icon, SearchIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  size?: 'md' | 'lg';
  busy?: boolean;
  // Dipanggil saat user menekan Enter. Sengaja terpisah dari onChange, karena mengetik menyaring
  // langsung sementara Enter memicu pekerjaan yang jauh lebih mahal.
  onSubmit?: () => void;
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  id,
  size = 'md',
  busy,
  onSubmit
}: SearchInputProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 border border-line-strong bg-surface px-3 transition-colors duration-150 ease-out focus-within:border-ink',
        className
      )}>
      
      <SearchIcon className="h-4 w-4 shrink-0 text-faint" aria-hidden />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && onSubmit) {
            event.preventDefault();
            onSubmit();
          }
        }}
        placeholder={placeholder ?? 'Cari pekerjaan'}
        className={cn(
          'w-full bg-transparent text-ink placeholder:text-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden',
          size === 'lg' ? 'h-12 text-[15px]' : 'h-10 text-sm'
        )} />
      
      {busy ?
      <Loader2Icon className="h-4 w-4 shrink-0 animate-spin text-faint" aria-label="Memproses" /> :
      value ?
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Hapus pencarian"
        className="text-faint transition-colors duration-150 ease-out hover:text-ink">
        
          <XIcon className="h-4 w-4" aria-hidden />
        </button> :
      null}
    </div>);

}
