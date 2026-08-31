import { Link } from 'react-router-dom';
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import type { Agreement } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Avatar } from '../ui/Avatar';
import { useStore } from '../../contexts/StoreContext';
import { useUser } from '../../hooks/useUser';
import { deadlineLabel, rupiah } from '../../utils/format';

interface AgreementListCardProps {
  agreement: Agreement;
  perspective: 'worker' | 'client';
}

export function AgreementListCard({ agreement, perspective }: AgreementListCardProps) {
  const { getJob } = useStore();
  const job = getJob(agreement.jobId);
  const counterpart = useUser(perspective === 'worker' ? agreement.clientId : agreement.workerId);

  if (!job || !counterpart) return null;

  return (
    <Link
      to={`/kesepakatan/${agreement.id}`}
      className="block border border-line bg-surface px-4 py-4 transition-colors duration-150 ease-out hover:bg-subtle">
      
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14.5px] font-bold leading-snug tracking-tight text-ink">{job.title}</p>
          <p className="mt-1.5 flex items-center gap-2 text-[12px] text-muted">
            <Avatar name={counterpart.name} size="sm" className="h-5 w-5 text-[9px]" />
            {perspective === 'worker' ? 'Klien' : 'Pekerja'} · {counterpart.name}
          </p>
        </div>
        <StatusBadge status={agreement.status} />
      </div>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted">
        <span className="font-semibold tabular-nums text-ink">{rupiah(agreement.price)}</span>
        <span className="flex items-center gap-1.5">
          <ClockIcon className="h-3.5 w-3.5" aria-hidden />
          {deadlineLabel(agreement.deadline)}
        </span>
        <span className="ml-auto flex items-center gap-1 text-[12px] font-medium text-ink">
          Buka
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </Link>);

}