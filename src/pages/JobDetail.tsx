import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ClockIcon,
  FileTextIcon,
  MapPinIcon,
  MessageSquareIcon,
  PackageIcon,
  UsersIcon } from
'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { OfferCard } from '../components/offer/OfferCard';
import { OfferModal } from '../components/offer/OfferModal';
import { TrackRecordStats } from '../components/profile/TrackRecordStats';
import { useStore } from '../contexts/StoreContext';
import { useUser } from '../hooks/useUser';
import { useToast } from '../contexts/ToastContext';
import { deadlineLabel, fullDate, rupiah, timeAgo } from '../utils/format';
import type { Agreement, Offer } from '../types';

export function JobDetail() {
  const { jobId = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getJob,
    currentUser,
    offersForJob,
    myOfferForJob,
    agreementForJob,
    selectOffer,
    threadForJob
  } = useStore();

  const [offerOpen, setOfferOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [agreement, setAgreement] = useState<Agreement | undefined>(undefined);
  const job = getJob(jobId);
  const poster = useUser(job?.posterId);

  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    offersForJob(job.id).then((list) => {
      if (!cancelled) setOffers(list);
    });
    agreementForJob(job.id).then((item) => {
      if (!cancelled) setAgreement(item);
    });
    return () => {
      cancelled = true;
    };
  }, [job, offersForJob, agreementForJob]);

  if (!job) {
    return (
      <div className="py-10">
        <EmptyState
          icon={<FileTextIcon className="h-6 w-6" aria-hidden />}
          title="Pekerjaan tidak ditemukan"
          description="Pekerjaan ini mungkin sudah ditutup atau dihapus oleh pemasangnya."
          action={
          <Button variant="secondary" size="sm" onClick={() => navigate('/home')}>
              Kembali ke feed
            </Button>
          } />
        
      </div>);

  }

  const myOffer = myOfferForJob(job.id);
  const isClient = job.posterId === currentUser?.id;

  if (!poster) {
    return (
      <div className="py-10">
        <p className="text-[13.5px] text-muted">Memuat...</p>
      </div>);

  }

  const openChat = async (otherUserId: string) => {
    try {
      const thread = await threadForJob(job.id, otherUserId);
      navigate(`/chat/${thread.id}`);
    } catch (error) {
      toast('Gagal membuka chat', 'Terjadi kesalahan, coba lagi sebentar lagi.');
    }
  };

  const handleSelect = async (offerId: string) => {
    try {
      const agreementId = await selectOffer(offerId);
      toast('Penawaran dipilih', 'Kesepakatan dibuat. Menunggu persetujuan kedua pihak.');
      if (agreementId) navigate(`/kesepakatan/${agreementId}`);
    } catch (error) {
      toast('Gagal memilih penawaran', 'Terjadi kesalahan, coba lagi sebentar lagi.');
    }
  };

  return (
    <div className="py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:text-ink">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
        Kembali
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[12.5px] text-muted">
            <Badge tone="outline">{job.type === 'kerja-cepat' ? 'Kerja Cepat' : 'Proyek'}</Badge>
            <Badge tone="muted">{job.category}</Badge>
            <span>Diposting {timeAgo(job.createdAt)}</span>
          </div>

          <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tightest text-ink sm:text-[32px]">
            {job.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted">
            <span className="text-[22px] font-bold tabular-nums tracking-tight text-ink">
              {rupiah(job.price)}
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden />
              Tenggat {deadlineLabel(job.deadline)}
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <UsersIcon className="h-3.5 w-3.5" aria-hidden />
              {job.slotsFilled}/{job.slotsTotal} orang
            </span>
            {job.area ?
            <span className="flex items-center gap-1.5">
                <MapPinIcon className="h-3.5 w-3.5" aria-hidden />
                {job.area}
              </span> :
            null}
          </div>

          {job.slotsTotal > 1 ?
          <p className="mt-3 border border-line bg-subtle px-3 py-2 text-[12.5px] leading-relaxed text-muted">
              Pekerjaan ini butuh {job.slotsTotal} orang. Setiap orang tetap mendapat kesepakatan
              satu-lawan-satu sendiri.
            </p> :
          null}

          <section className="mt-8" aria-labelledby="scope-heading">
            <h2
              id="scope-heading"
              className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              
              Ruang lingkup
            </h2>
            <p className="mt-2.5 whitespace-pre-line text-[14.5px] leading-relaxed text-ink">
              {job.scope}
            </p>
          </section>

          <section className="mt-7 border-y border-line py-5" aria-labelledby="deliverable-heading">
            <h2
              id="deliverable-heading"
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              
              <PackageIcon className="h-3.5 w-3.5" aria-hidden />
              Hasil akhir yang diserahkan
            </h2>
            <p className="mt-2 text-[15px] font-semibold leading-snug tracking-tight text-ink">
              {job.deliverable}
            </p>
            <p className="mt-2 text-[12.5px] text-muted">
              Tenggat penyerahan {fullDate(job.deadline)}
            </p>
          </section>

          {job.tags.length ?
          <div className="mt-5 flex flex-wrap gap-1.5">
              {job.tags.map((tag) =>
            <Badge key={tag} tone="muted">
                  {tag}
                </Badge>
            )}
            </div> :
          null}

          <section className="mt-10" aria-labelledby="offers-heading">
            <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
              <h2 id="offers-heading" className="text-[16px] font-bold tracking-tight text-ink">
                Penawaran masuk
              </h2>
              <span className="text-[12.5px] tabular-nums text-muted">{offers.length} penawaran</span>
            </div>

            {offers.length === 0 ?
            <div className="mt-4">
                <EmptyState
                icon={<FileTextIcon className="h-6 w-6" aria-hidden />}
                title="Belum ada penawaran"
                description={
                isClient ?
                'Begitu ada penawaran masuk, kamu bisa memilih satu dan membuat kesepakatan.' :
                'Jadi yang pertama mengajukan penawaran untuk pekerjaan ini.'
                } />
              
              </div> :

            <div className="divide-y divide-line">
                {offers.map((offer) =>
              <OfferCard
                key={offer.id}
                offer={offer}
                canSelect={isClient && !agreement}
                onSelect={(selected) => handleSelect(selected.id)}
                onChat={(selected) => openChat(selected.workerId)} />

              )}
              </div>
            }
          </section>
        </div>

        <aside className="lg:pt-1">
          <div className="flex flex-col gap-5 lg:sticky lg:top-20">
            <section className="border border-line bg-surface" aria-labelledby="poster-heading">
              <div className="flex items-start gap-3 p-4">
                <Avatar name={poster.name} size="lg" />
                <div className="min-w-0">
                  <h2 id="poster-heading" className="text-[15px] font-bold tracking-tight text-ink">
                    {poster.name}
                  </h2>
                  <p className="text-[12px] text-faint">@{poster.handle}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">
                    {poster.major} · {poster.year}
                  </p>
                </div>
              </div>
              <div className="px-4 pb-4">
                <TrackRecordStats stats={poster.stats} compact />
                <p className="mt-2 text-[11px] leading-relaxed text-faint">
                  Statistik aktivitas nyata, bukan skor kepercayaan buatan.
                </p>
                <div className="mt-3 flex gap-2">
                  <Link to={`/u/${poster.handle}`} className="flex-1">
                    <Button variant="secondary" size="sm" fullWidth>
                      Lihat profil
                    </Button>
                  </Link>
                  {!isClient ?
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openChat(poster.id)}
                    icon={<MessageSquareIcon className="h-3.5 w-3.5" aria-hidden />}>
                    
                      Chat
                    </Button> :
                  null}
                </div>
              </div>
            </section>

            <section className="border border-line bg-surface p-4">
              {agreement ?
              <div className="flex flex-col gap-3">
                  <StatusBadge status={agreement.status} />
                  <p className="text-[13px] leading-relaxed text-muted">
                    Pekerjaan ini sudah masuk tahap kesepakatan.
                  </p>
                  <Button fullWidth onClick={() => navigate(`/kesepakatan/${agreement.id}`)}>
                    Buka kesepakatan
                  </Button>
                </div> :
              isClient ?
              <div className="flex flex-col gap-3">
                  <p className="text-[13px] leading-relaxed text-muted">
                    Kamu pemasang pekerjaan ini. Pilih satu penawaran untuk membuat kesepakatan.
                  </p>
                  <Button variant="secondary" fullWidth onClick={() => navigate('/aktivitas')}>
                    Kelola di Aktivitas Saya
                  </Button>
                </div> :
              myOffer ?
              <div className="flex flex-col gap-3">
                  <Badge tone="outline">Penawaran terkirim</Badge>
                  <p className="text-[13px] leading-relaxed text-muted">
                    Kamu menawar {rupiah(myOffer.price)}. Lanjutkan negosiasi lewat chat sambil
                    menunggu klien memilih.
                  </p>
                  <Button variant="secondary" fullWidth onClick={() => openChat(poster.id)}>
                    Buka chat
                  </Button>
                </div> :

              <div className="flex flex-col gap-3">
                  <p className="text-[13px] leading-relaxed text-muted">
                    Ajukan harga kamu sendiri. Harga dan tenggat baru final setelah kesepakatan
                    dikunci.
                  </p>
                  <Button fullWidth onClick={() => setOfferOpen(true)}>
                    Ajukan Penawaran
                  </Button>
                </div>
              }
            </section>
          </div>
        </aside>
      </div>

      {/* Mobile action bar */}
      {!isClient && !myOffer && !agreement ?
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-canvas px-4 py-3 lg:hidden">
          <div className="min-w-0">
            <p className="text-[16px] font-bold tabular-nums tracking-tight text-ink">
              {rupiah(job.price)}
            </p>
            <p className="truncate text-[11.5px] text-muted">{deadlineLabel(job.deadline)}</p>
          </div>
          <Button className="ml-auto" onClick={() => setOfferOpen(true)}>
            Ajukan Penawaran
          </Button>
        </div> :
      null}

      <OfferModal job={job} open={offerOpen} onClose={() => setOfferOpen(false)} />
    </div>);

}