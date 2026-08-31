import { RotateCcwIcon, WifiOffIcon } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry: () => void;
  retrying?: boolean;
}

export function ErrorState({
  title = 'Gagal memuat',
  description = 'Koneksi terputus saat memuat data. Coba lagi.',
  onRetry,
  retrying
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center border border-line bg-surface px-6 py-14 text-center">
      
      <WifiOffIcon className="mb-3 h-5 w-5 text-muted" aria-hidden />
      <h3 className="text-[15px] font-bold tracking-tight text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">{description}</p>
      <Button
        className="mt-5"
        variant="secondary"
        size="sm"
        onClick={onRetry}
        loading={retrying}
        icon={<RotateCcwIcon className="h-3.5 w-3.5" aria-hidden />}>
        
        Coba lagi
      </Button>
    </div>);

}