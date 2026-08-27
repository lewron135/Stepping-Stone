import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InboxIcon } from 'lucide-react';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { AgreementListCard } from '../components/agreement/AgreementListCard';
import { useStore } from '../contexts/StoreContext';
import { deadlineLabel, rupiah, timeAgo } from '../utils/format';
import { useScreenInit } from '../useScreenInit.js';

type Perspective = 'worker' | 'client';

function Section({
  title,
  hint,
  children




}: {title: string;hint?: string;children: React.ReactNode;}) {
  return (
    <section className="mt-8 first:mt-6">
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2.5">
        <h2 className="text-[14px] font-bold tracking-tight text-ink">{title}</h2>
        {hint ? <span className="text-[12px] text-faint">{hint}</span> : null}
      </div>
      <div className="mt-3.5">{children}</div>
    </section>);

}

export function Activity() {
  const navigate = useNavigate();
  const { agreements, offers, jobs, currentUser, getJob, offersForJob } = useStore();
  const screenInit = useScreenInit();
  const [perspective, setPerspective] = useState<Perspective>(
    screenInit.perspective as Perspective ?? 'worker'
  );

  const mine = agreements.filter((item) =>
  perspective === 'worker' ? item.workerId === currentUser.id : item.clientId === currentUser.id
  );
  const waiting = mine.filter((item) => item.status === 'waiting-approval');
  const running = mine.filter((item) =>
  ['locked', 'in-progress', 'waiting-confirmation'].includes(item.status)
  );
  const done = mine.filter((item) =>
  ['completed', 'completed-unconfirmed', 'cancelled'].includes(item.status)
  );

  const myOffers = offers.filter(
    (offer) => offer.workerId === currentUser.id && offer.status === 'pending'
  );
  const myPostedJobs = jobs.filter(
    (job) => job.posterId === currentUser.id && job.status === 'open'
  );

  const empty = (title: string, description: string) =>
  <EmptyState icon={<InboxIcon className="h-5 w-5" aria-hidden />} title={title} description={description} />;


  return (
    <div className="py-6">
      <h1 className="text-[24px] font-bold tracking-tightest text-ink sm:text-[30px]">
        Aktivitas Saya
      </h1>
      <p className="mt-1.5 text-[13.5px] text-muted">
        Semua pekerjaan kamu, dipisah antara peran pekerja dan klien.
      </p>

      <Tabs
        className="mt-6"
        size="lg"
        layoutId="activity-tab"
        items={[
        { value: 'worker', label: 'Sebagai Pekerja', count: agreements.filter((a) => a.workerId === currentUser.id).length },
        { value: 'client', label: 'Sebagai Klien', count: agreements.filter((a) => a.clientId === currentUser.id).length }]
        }
        value={perspective}
        onChange={(value) => setPerspective(value as Perspective)} />
      

      {perspective === 'worker' ?
      <>
          <Section title="Menunggu persetujuan" hint={`${waiting.length} kesepakatan`}>
            {waiting.length === 0 ?
          empty('Tidak ada yang menunggu', 'Kesepakatan baru muncul di sini setelah penawaran kamu dipilih.') :

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {waiting.map((item) =>
            <AgreementListCard key={item.id} agreement={item} perspective="worker" />
            )}
                </div>
          }
          </Section>

          <Section title="Sedang berjalan" hint={`${running.length} pekerjaan`}>
            {running.length === 0 ?
          empty('Belum ada pekerjaan aktif', 'Kesepakatan yang sudah terkunci akan tampil di sini.') :

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {running.map((item) =>
            <AgreementListCard key={item.id} agreement={item} perspective="worker" />
            )}
                </div>
          }
          </Section>

          <Section title="Penawaran terkirim" hint={`${myOffers.length} penawaran`}>
            {myOffers.length === 0 ?
          empty('Belum ada penawaran aktif', 'Ajukan penawaran dari feed untuk mulai bekerja.') :

          <ul className="divide-y divide-line border border-line bg-surface">
                {myOffers.map((offer) => {
              const job = getJob(offer.jobId);
              if (!job) return null;
              return (
                <li key={offer.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
                      <div className="min-w-0 flex-1">
                        <Link
                      to={`/pekerjaan/${job.id}`}
                      className="text-[14px] font-semibold tracking-tight text-ink hover:underline">
                      
                          {job.title}
                        </Link>
                        <p className="mt-1 text-[12px] text-muted">
                          Kamu menawar {rupiah(offer.price)} · dikirim {timeAgo(offer.createdAt)} lalu
                        </p>
                      </div>
                      <Badge tone="dashed">Menunggu dipilih</Badge>
                    </li>);

            })}
              </ul>
          }
          </Section>

          <Section title="Riwayat" hint={`${done.length} pekerjaan`}>
            {done.length === 0 ?
          empty('Belum ada riwayat', 'Pekerjaan yang selesai atau batal tercatat di sini.') :

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {done.map((item) =>
            <AgreementListCard key={item.id} agreement={item} perspective="worker" />
            )}
                </div>
          }
          </Section>
        </> :

      <>
          <Section title="Pekerjaan yang saya pasang" hint={`${myPostedJobs.length} terbuka`}>
            {myPostedJobs.length === 0 ?
          <EmptyState
            icon={<InboxIcon className="h-5 w-5" aria-hidden />}
            title="Belum memasang pekerjaan"
            description="Pasang pekerjaan untuk mulai menerima penawaran dari mahasiswa lain."
            action={
            <Button size="sm" variant="secondary" onClick={() => navigate('/pasang-pekerjaan')}>
                    Pasang pekerjaan
                  </Button>
            } /> :


          <ul className="divide-y divide-line border border-line bg-surface">
                {myPostedJobs.map((job) =>
            <li key={job.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <Link
                  to={`/pekerjaan/${job.id}`}
                  className="text-[14px] font-semibold tracking-tight text-ink hover:underline">
                  
                        {job.title}
                      </Link>
                      <p className="mt-1 text-[12px] text-muted">
                        {rupiah(job.price)} · tenggat {deadlineLabel(job.deadline)}
                      </p>
                    </div>
                    <Link to={`/pekerjaan/${job.id}`}>
                      <Button size="sm" variant="secondary">
                        {offersForJob(job.id).length} penawaran
                      </Button>
                    </Link>
                  </li>
            )}
              </ul>
          }
          </Section>

          <Section title="Menunggu persetujuan" hint={`${waiting.length} kesepakatan`}>
            {waiting.length === 0 ?
          empty('Tidak ada yang menunggu', 'Setelah kamu memilih penawaran, kesepakatan muncul di sini.') :

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {waiting.map((item) =>
            <AgreementListCard key={item.id} agreement={item} perspective="client" />
            )}
                </div>
          }
          </Section>

          <Section title="Kesepakatan berjalan" hint={`${running.length} pekerjaan`}>
            {running.length === 0 ?
          empty('Belum ada yang berjalan', 'Pekerjaan yang sudah terkunci akan tampil di sini.') :

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {running.map((item) =>
            <AgreementListCard key={item.id} agreement={item} perspective="client" />
            )}
                </div>
          }
          </Section>

          <Section title="Selesai" hint={`${done.length} pekerjaan`}>
            {done.length === 0 ?
          empty('Belum ada yang selesai', 'Riwayat pekerjaan yang kamu pasang tercatat di sini.') :

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {done.map((item) =>
            <AgreementListCard key={item.id} agreement={item} perspective="client" />
            )}
                </div>
          }
          </Section>
        </>
      }
    </div>);

}