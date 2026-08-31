import { useRef, useState } from 'react';
import { ImageIcon, TrashIcon, UploadIcon } from 'lucide-react';
import { PROOF_MAX_BYTES, PROOF_MIME_TYPES } from '../../lib/api';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  value?: string;
  onChange: (url?: string) => void;
  // Pengunggahnya disuntik dari luar supaya komponen ini tetap murni tampilan dan tidak
  // terikat ke satu bucket tertentu.
  upload: (file: File) => Promise<string>;
  onUploadingChange?: (uploading: boolean) => void;
  hint?: string;
  invalid?: boolean;
}

const MAX_MB = Math.round(PROOF_MAX_BYTES / (1024 * 1024));

export function FileUpload({
  value,
  onChange,
  upload,
  onUploadingChange,
  hint,
  invalid
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const setBusy = (busy: boolean) => {
    setUploading(busy);
    onUploadingChange?.(busy);
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploadError('');

    // Divalidasi di sini juga, bukan cuma mengandalkan bucket, supaya pesannya bisa jelas
    // dalam bahasa Indonesia dan muncul sebelum file besar terlanjur dikirim.
    if (!PROOF_MIME_TYPES.includes(file.type)) {
      setUploadError('Format harus JPG, PNG, atau WebP.');
      return;
    }
    if (file.size > PROOF_MAX_BYTES) {
      setUploadError(`Ukuran file maksimal ${MAX_MB} MB.`);
      return;
    }

    setBusy(true);
    try {
      onChange(await upload(file));
    } catch (error) {
      console.error('Gagal mengunggah bukti:', error);
      setUploadError('Gagal mengunggah. Cek koneksi lalu coba lagi.');
    } finally {
      setBusy(false);
    }
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
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-center transition-colors duration-150 ease-out',
          uploading ? 'cursor-wait opacity-60' : 'hover:bg-subtle',
          invalid || uploadError ? 'border-ink' : 'border-line-strong'
        )}>

        <UploadIcon className="h-5 w-5 text-muted" aria-hidden />
        <span className="text-sm font-semibold text-ink">
          {uploading ? 'Mengunggah...' : 'Unggah foto bukti'}
        </span>
        <span className="text-[12px] text-muted">
          {hint ?? `JPG, PNG, atau WebP, maksimal ${MAX_MB} MB`}
        </span>
      </button>

      {uploading ?
      <div className="mt-2 h-1 w-full overflow-hidden bg-subtle">
          <div className="h-1 w-1/3 animate-pulse bg-ink" />
        </div> :
      null}

      {uploadError ?
      <p role="alert" className="mt-2 text-[12px] text-danger">
          {uploadError}
        </p> :
      null}

      <input
        ref={inputRef}
        type="file"
        accept={PROOF_MIME_TYPES.join(',')}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Direset supaya memilih file yang sama dua kali berturut-turut tetap memicu onChange,
          // misalnya setelah percobaan pertama gagal.
          event.target.value = '';
          handleFile(file);
        }} />

    </div>);

}
