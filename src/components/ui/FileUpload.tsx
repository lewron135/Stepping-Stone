import React, { useRef, useState } from 'react';
import { ImageIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  value?: string;
  onChange: (url?: string) => void;
  hint?: string;
  invalid?: boolean;
}

export function FileUpload({ value, onChange, hint, invalid }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = (prev ?? 0) + 18;
        if (next >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => {
            setProgress(null);
            onChange(url);
          }, 180);
          return 100;
        }
        return next;
      });
    }, 90);
  };

  if (value) {
    return (
      <div className="border border-line bg-surface">
        <img src={value} alt="Bukti pekerjaan yang diunggah" className="h-48 w-full object-cover" />
        <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
          <span className="flex items-center gap-2 text-[12px] text-muted">
            <ImageIcon className="h-3.5 w-3.5" aria-hidden />
            Bukti terunggah
          </span>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-muted transition-colors duration-150 ease-out hover:text-ink">
            
            <TrashIcon className="h-3.5 w-3.5" aria-hidden />
            Hapus
          </button>
        </div>
      </div>);

  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-center transition-colors duration-150 ease-out hover:bg-subtle',
          invalid ? 'border-ink' : 'border-line-strong'
        )}>
        
        <UploadIcon className="h-5 w-5 text-muted" aria-hidden />
        <span className="text-sm font-semibold text-ink">Unggah foto bukti</span>
        <span className="text-[12px] text-muted">{hint ?? 'JPG atau PNG, maksimal 5 MB'}</span>
      </button>
      {progress !== null ?
      <div className="mt-2">
          <div className="h-1 w-full bg-subtle">
            <div
            className="h-1 bg-ink transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }} />
          
          </div>
          <p className="mt-1 text-[11px] tabular-nums text-muted">Mengunggah {progress}%</p>
        </div> :
      null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])} />
      
    </div>);

}