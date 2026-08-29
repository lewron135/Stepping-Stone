import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, MapPinIcon, PackageIcon, UsersIcon } from 'lucide-react';
import type { Job } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useStore } from '../../contexts/StoreContext';
import { useUser } from '../../hooks/useUser';
import { deadlineLabel, rupiah, timeAgo } from '../../utils/format';
import { cn } from '../../utils/cn';

interface JobPostProps {
  job: Job;
  onOffer?: (job: Job) => void;
  compact?: boolean;
}

export function JobPost({ job, onOffer, compact }: JobPostProps) {
  const { offersForJob, myOfferForJob, currentUser } = useStore();
  const poster = useUser(job.posterId);
  const [offerCount, setOfferCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    offersForJob(job.id).then((list) => {
      if (!cancelled) setOfferCount(list.length);
    });
    return () => {
      cancelled = true;
    };
  }, [job.id, offersForJob]);

  const myOffer = myOfferForJob(job.id);
  const isMine = job.posterId === currentUser?.id;
  const multiSlot = job.slotsTotal > 1;

  if (!poster) return null;

  return (
    <article className="group px-4 py-5 transition-colors duration-150 ease-out hover:bg-subtle/60 sm:px-5">
      <div className="flex items-center gap-2 text-[12.5px] text-muted">
        <Avatar name={poster.name} size="sm" />
        <Link
          to={`/u/${poster.handle}`}
          className="font-semibold text-ink transition-opacity duration-150 ease-out hover:opacity-70">
          
          {poster.name}
        </Link>
        <span className="truncate text-faint">@{poster.handle}</span>
        <span aria-hidden className="text-faint">
          ·
        </span>
        <time dateTime={job.createdAt}>{timeAgo(job.createdAt)}</time>
        {isMine ?
        <span className="ml-auto text-[11px] font-semibold text-muted">Pekerjaan kamu</span> :
        null}
      </div>

      <div className="mt-2.5 sm:pl-9">
        <h3 className={cn('font-bold tracking-tight text-ink', compact ? 'text-[15px]' : 'text-[17px] leading-snug sm:text-[19px]')}>
          <Link to={`/pekerjaan/${job.id}`} className="hover:underline">
            {job.title}
          </Link>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{job.scope}</p>

        <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-ink">
          <PackageIcon className="mt-[3px] h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
          <span>
            <span className="text-muted">Hasil akhir: </span>
            {job.deliverable}
          </span>
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5" aria-hidden />
            {deadlineLabel(job.deadline)}
          </span>
          {multiSlot ?
          <span className="flex items-center gap-1.5 tabular-nums">
              <UsersIcon className="h-3.5 w-3.5" aria-hidden />
              {job.slotsFilled}/{job.slotsTotal} orang
            </span> :
          null}
          {job.area ?
          <span className="flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5" aria-hidden />
              {job.area}
            </span> :
          null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
          <p className="text-[17px] font-bold tracking-tight text-ink">{rupiah(job.price)}</p>
          <Link
            to={`/pekerjaan/${job.id}`}
            className="text-[12.5px] text-muted transition-colors duration-150 ease-out hover:text-ink">
            
            {offerCount} penawaran
          </Link>
          {job.tags.slice(0, 2).map((tag) =>
          <Badge key={tag} tone="muted" className="hidden sm:inline-flex">
              {tag}
            </Badge>
          )}
          <div className="ml-auto w-full sm:w-auto">
            {isMine ?
            <Button variant="secondary" size="sm" fullWidth className="sm:w-auto" disabled>
                Menunggu penawaran
              </Button> :
            myOffer ?
            <Button variant="secondary" size="sm" fullWidth className="sm:w-auto" disabled>
                Penawaran terkirim
              </Button> :

            <Button
              size="sm"
              fullWidth
              className="sm:w-auto"
              onClick={() => onOffer?.(job)}>
              
                Ajukan Penawaran
              </Button>
            }
          </div>
        </div>
      </div>
    </article>);

}