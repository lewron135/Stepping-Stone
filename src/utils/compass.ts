import type { Job, User } from '../types';

export interface Recommendation {
  job: Job;
  reason: string;
  stretch: 'sejalan' | 'sedikit-di-atas';
}

/**
 * Career Compass logic: recommend projects one step above what the student has
 * already proven. Familiar category + higher value = a stretch worth taking.
 */
export function recommendJobs(user: User | null, jobs: Job[], limit = 3): Recommendation[] {
  if (!user) return [];

  const doneCategories = new Set(user.portfolio.map((item) => item.category));
  const topPrice = user.portfolio.reduce((max, item) => Math.max(max, item.price), 0);

  return jobs.
  filter((job) => job.type === 'proyek' && job.status === 'open' && job.posterId !== user.id).
  map((job) => {
    const familiar = doneCategories.has(job.category);
    const higherValue = job.price > topPrice;
    const score = (familiar ? 2 : 0) + (higherValue ? 2 : 1);
    const reason = familiar ?
    higherValue ?
    `Kategori yang sudah kamu buktikan, nilainya di atas proyek terbesarmu` :
    `Sejalan dengan portofolio ${job.category} kamu` :
    `Kategori baru yang dekat dengan skill kamu`;
    return {
      job,
      reason,
      stretch: (familiar && higherValue ? 'sedikit-di-atas' : 'sejalan') as Recommendation['stretch'],
      score
    };
  }).
  sort((a, b) => b.score - a.score || b.job.price - a.job.price).
  slice(0, limit).
  map(({ job, reason, stretch }) => ({ job, reason, stretch }));
}