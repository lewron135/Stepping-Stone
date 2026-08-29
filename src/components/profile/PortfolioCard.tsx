import React from 'react';
import type { PortfolioItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Rating } from '../ui/Rating';
import { useStore } from '../../contexts/StoreContext';
import { fullDate, rupiah } from '../../utils/format';

export function PortfolioCard({ item }: {item: PortfolioItem;}) {
  const { getUser } = useStore();
  const author = item.testimonial ? getUser(item.testimonial.authorId) : undefined;

  return (
    <article className="flex h-full flex-col border border-line bg-surface">
      <img
        src={item.proofImage}
        alt={`Bukti hasil kerja: ${item.title}`}
        className="aspect-[4/3] w-full object-cover" />
      
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <Badge tone="muted">{item.category}</Badge>
          <span className="text-[11.5px] text-faint">{fullDate(item.completedAt)}</span>
        </div>
        <h3 className="mt-2.5 text-[15px] font-bold leading-snug tracking-tight text-ink">
          {item.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.summary}</p>
        <p className="mt-2.5 text-[12.5px] text-muted">
          <span className="text-faint">Hasil akhir: </span>
          {item.deliverable}
        </p>

        {item.testimonial ?
        <blockquote className="mt-4 border-l-2 border-ink pl-3">
            <p className="text-[13.5px] font-medium leading-relaxed text-ink">
              “{item.testimonial.text}”
            </p>
            <footer className="mt-2 flex items-center gap-2 text-[11.5px] text-muted">
              <Rating value={item.testimonial.rating} size="sm" />
              <span>{author?.name ?? 'Klien'}</span>
            </footer>
          </blockquote> :
        null}

        <p className="mt-auto pt-4 text-[13px] font-semibold tabular-nums text-ink">
          {rupiah(item.price)}
        </p>
      </div>
    </article>);

}