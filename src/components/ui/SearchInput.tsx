import React from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function SearchInput({ value, onChange, placeholder, className, id }: SearchInputProps) {
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
        placeholder={placeholder ?? 'Cari pekerjaan'}
        className="h-10 w-full bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none [&::-webkit-search-cancel-button]:hidden" />
      
      {value ?
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