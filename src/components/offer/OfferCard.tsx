import { Link } from 'react-router-dom';
import { CheckIcon, MessageSquareIcon } from 'lucide-react';
import type { Offer } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useUser } from '../../hooks/useUser';
import { rupiah, timeAgo } from '../../utils/format';

interface OfferCardProps {
  offer: Offer;
  canSelect?: boolean;
  onSelect?: (offer: Offer) => void;
  onChat?: (offer: Offer) => void;
}

export function OfferCard({ offer, canSelect, onSelect, onChat }: OfferCardProps) {
  const worker = useUser(offer.workerId);

  if (!worker) return null;

  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="flex items-start gap-3">
        <Avatar name={worker.name} src={worker.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <Link
              to={`/u/${worker.handle}`}
              className="text-[14px] font-semibold tracking-tight text-ink hover:underline">
              
              {worker.name}
            </Link>
            <span className="text-[12px] text-faint">@{worker.handle}</span>
            <span className="text-[12px] text-faint">· {timeAgo(offer.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-[12px] text-muted">
            {worker.stats.completed} selesai · {worker.stats.cancelled} batal ·{' '}
            {worker.stats.unpaidReports} laporan tidak dibayar
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink">{offer.note}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[16px] font-bold tabular-nums tracking-tight text-ink">
            {rupiah(offer.price)}
          </p>
          {offer.status === 'selected' ?
          <Badge tone="solid" className="mt-1.5">
              Dipilih
            </Badge> :
          offer.status === 'declined' ?
          <Badge tone="muted" className="mt-1.5">
              Tidak dipilih
            </Badge> :
          null}
        </div>
      </div>

      {canSelect && offer.status === 'pending' ?
      <div className="flex flex-wrap gap-2 sm:pl-[52px]">
          <Button size="sm" icon={<CheckIcon className="h-3.5 w-3.5" aria-hidden />} onClick={() => onSelect?.(offer)}>
            Pilih penawaran ini
          </Button>
          <Button
          size="sm"
          variant="secondary"
          icon={<MessageSquareIcon className="h-3.5 w-3.5" aria-hidden />}
          onClick={() => onChat?.(offer)}>
          
            Nego lewat chat
          </Button>
        </div> :
      null}
    </div>);

}