import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, CompassIcon } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { recommendJobs } from '../../utils/compass';
import { rupiah } from '../../utils/format';

export function CareerCompassCard({ limit = 2 }: {limit?: number;}) {
  const { currentUser, jobs } = useStore();
  const recommendations = recommendJobs(currentUser, jobs, limit);

  if (recommendations.length === 0) return null;

  return (
    <section className="border border-line bg-surface" aria-labelledby="compass-heading">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <CompassIcon className="h-4 w-4 text-muted" aria-hidden />
        <h2 id="compass-heading" className="text-[13px] font-bold tracking-tight text-ink">
          Career Compass
        </h2>
      </div>
      <p className="px-4 pt-3 text-[12px] leading-relaxed text-muted">
        Proyek yang sedikit di atas level kamu sekarang.
      </p>
      <ul className="mt-1 divide-y divide-line">
        {recommendations.map(({ job, reason }) =>
        <li key={job.id}>
            <Link
            to={`/pekerjaan/${job.id}`}
            className="block px-4 py-3 transition-colors duration-150 ease-out hover:bg-subtle">
            
              <p className="text-[13px] font-semibold leading-snug text-ink">{job.title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{reason}</p>
              <p className="mt-1.5 text-[12px] font-semibold tabular-nums text-ink">
                {rupiah(job.price)}
              </p>
            </Link>
          </li>
        )}
      </ul>
      <Link
        to="/career-compass"
        className="flex items-center gap-1.5 border-t border-line px-4 py-3 text-[12px] font-semibold text-ink transition-colors duration-150 ease-out hover:bg-subtle">
        
        Buka Career Compass
        <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </section>);

}