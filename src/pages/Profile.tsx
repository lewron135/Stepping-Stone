import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BriefcaseIcon, ShieldIcon, UserXIcon } from 'lucide-react';
import type { PortfolioItem } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Tabs } from '../components/ui/Tabs';
import { PortfolioCard } from '../components/profile/PortfolioCard';
import { TrackRecordStats } from '../components/profile/TrackRecordStats';
import { useStore } from '../contexts/StoreContext';
import { fullDate } from '../utils/format';
import { useScreenInit } from '../useScreenInit.js';

type ProfileTab = 'portfolio' | 'track-record';

export function Profile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { users, currentUser, agreements, getJob } = useStore();
  const screenInit = useScreenInit();
  const [tab, setTab] = useState<ProfileTab>(screenInit.tab as ProfileTab ?? 'portfolio');

  const user = handle ? users.find((item) => item.handle === handle) : currentUser;
  const isMe = user?.id === currentUser?.id;

  if (!user) {
    return (
      <div className="py-10">
        <EmptyState
          icon={<UserXIcon className="h-6 w-6" aria-hidden />}
          title="Profil tidak ditemukan"
          description="Akun ini tidak tersedia atau sudah dihapus."
          action={
          <Button variant="secondary" size="sm" onClick={() => navigate('/home')}>
              Kembali ke feed
            </Button>
          } />
        
      </div>);

  }

  const myAgreements = agreements.filter((item) => item.workerId === user.id);

  // Portfolio grows from real completed work with a testimonial.
  const portfolio: PortfolioItem[] = useMemo(() => {
    const earned = myAgreements.
    filter((item) => item.status === 'completed' && item.confirmation).
    map((item) => {
      const job = getJob(item.jobId);
      if (!job) return null;
      return {
        id: item.id,
        title: job.title,
        category: job.category,
        workType: job.type,
        summary: job.scope,
        deliverable: job.deliverable,
        proofImage: item.proof?.imageUrl ?? '',
        price: item.price,
        completedAt: item.confirmation?.confirmedAt ?? job.deadline,
        testimonial: item.confirmation ?
        {
          authorId: item.clientId,
          rating: item.confirmation.rating,
          text: item.confirmation.testimonial,
          date: item.confirmation.confirmedAt
        } :
        undefined
      } as PortfolioItem;
    }).
    filter((item): item is PortfolioItem => Boolean(item && item.proofImage));

    const seededIds = new Set(user.portfolio.map((item) => item.title));
    return [...earned.filter((item) => !seededIds.has(item.title)), ...user.portfolio];
  }, [getJob, myAgreements, user.portfolio]);

  const records = myAgreements.
  filter((item) =>
  ['completed', 'completed-unconfirmed', 'cancelled'].includes(item.status)
  ).
  sort(
    (a, b) =>
    new Date(b.confirmation?.confirmedAt ?? b.deadline).getTime() -
    new Date(a.confirmation?.confirmedAt ?? a.deadline).getTime()
  );

  return (
    <div className="py-6">
      <header className="border-b border-line pb-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={user.name} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] font-bold leading-tight tracking-tightest text-ink sm:text-[32px]">
              {user.name}
            </h1>
            <p className="mt-1 text-[13px] text-faint">@{user.handle}</p>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink">
              {user.major} · {user.faculty}
            </p>
            <p className="text-[13px] text-muted">
              {user.campus} · {user.year}
            </p>
            <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">{user.bio}</p>
            {user.skills.length ?
            <div className="mt-4 flex flex-wrap gap-1.5">
                {user.skills.map((skill) =>
              <Badge key={skill} tone="muted">
                    {skill}
                  </Badge>
              )}
              </div> :
            null}
          </div>
          <div className="flex gap-2 sm:flex-col">
            {isMe ?
            <>
                <Button variant="secondary" size="sm" onClick={() => navigate('/pengaturan')}>
                  Pengaturan profil
                </Button>
                <Button variant="tertiary" size="sm" onClick={() => navigate('/aktivitas')}>
                  Aktivitas Saya
                </Button>
              </> :

            <Button variant="secondary" size="sm" onClick={() => navigate('/home')}>
                Lihat feed
              </Button>
            }
          </div>
        </div>
        <p className="mt-5 text-[11.5px] leading-relaxed text-faint">
          Profil publik hanya menampilkan nama, informasi akademik, portofolio, dan track record.
          Nomor telepon dan lokasi presisi tidak pernah ditampilkan.
        </p>
      </header>

      <Tabs
        className="mt-6"
        size="lg"
        layoutId="profile-tab"
        items={[
        { value: 'portfolio', label: 'Portfolio', count: portfolio.length },
        { value: 'track-record', label: 'Track Record', count: records.length }]
        }
        value={tab}
        onChange={(value) => setTab(value as ProfileTab)} />
      

      {tab === 'portfolio' ?
      <section className="mt-6" aria-label="Portfolio">
          <p className="max-w-xl text-[13.5px] leading-relaxed text-muted">
            <strong className="font-semibold text-ink">Apa yang bisa dikerjakan orang ini?</strong>{' '}
            Kumpulan pekerjaan selesai beserta bukti dan testimoni kliennya.
          </p>
          {portfolio.length === 0 ?
        <div className="mt-5">
              <EmptyState
            icon={<BriefcaseIcon className="h-6 w-6" aria-hidden />}
            title="Portofolio masih kosong"
            description={
            isMe ?
            'Selesaikan satu proyek, unggah bukti, dan testimoni klien akan mengisi halaman ini.' :
            'Mahasiswa ini belum menyelesaikan proyek dengan bukti.'
            }
            action={
            isMe ?
            <Button size="sm" variant="secondary" onClick={() => navigate('/proyek')}>
                      Cari proyek
                    </Button> :
            undefined
            } />
          
            </div> :

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {portfolio.map((item) =>
          <PortfolioCard key={item.id} item={item} />
          )}
            </div>
        }
        </section> :

      <section className="mt-6" aria-label="Track Record">
          <p className="max-w-xl text-[13.5px] leading-relaxed text-muted">
            <strong className="font-semibold text-ink">Bisa diandalkan atau tidak?</strong> Statistik
            apa adanya. Catatan negatif tidak disembunyikan dan tidak diringkas jadi skor.
          </p>

          <div className="mt-5">
            <TrackRecordStats stats={user.stats} />
          </div>

          <div className="mt-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Catatan pekerjaan
            </h3>
            {records.length === 0 ?
          <div className="mt-3">
                <EmptyState
              icon={<ShieldIcon className="h-6 w-6" aria-hidden />}
              title="Belum ada catatan"
              description="Setiap pekerjaan yang selesai, batal, atau dilaporkan akan tercatat di sini." />
            
              </div> :

          <ul className="mt-3 divide-y divide-line border border-line bg-surface">
                {records.map((item) => {
              const job = getJob(item.jobId);
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
                  
                      <div className="min-w-0 flex-1">
                        <Link
                      to={`/kesepakatan/${item.id}`}
                      className="text-[13.5px] font-semibold tracking-tight text-ink hover:underline">
                      
                          {job?.title ?? 'Pekerjaan'}
                        </Link>
                        <p className="mt-0.5 text-[12px] text-muted">
                          {fullDate(item.confirmation?.confirmedAt ?? item.deadline)}
                          {item.unpaidReported ? ' · dilaporkan tidak dibayar' : ''}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </li>);

            })}
              </ul>
          }
          </div>
        </section>
      }
    </div>);

}