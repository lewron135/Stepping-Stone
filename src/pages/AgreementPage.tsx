import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  FileTextIcon,
  LockIcon,
  MessageSquareIcon,
  PhoneIcon } from
'lucide-react';
import type { Role } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Rating } from '../components/ui/Rating';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AgreementTimeline } from '../components/agreement/AgreementTimeline';
import { TransactionBreakdown } from '../components/agreement/TransactionBreakdown';
import { CompletionModal } from '../components/agreement/CompletionModal';
import { ConfirmationModal } from '../components/agreement/ConfirmationModal';
import { useStore } from '../contexts/StoreContext';
import { useToast } from '../contexts/ToastContext';
import { fullDate, deadlineLabel, rupiah, timeAgo } from '../utils/format';
import { cn } from '../utils/cn';

export function AgreementPage() {
  const { agreementId = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    agreements,
    getJob,
    getUser,
    currentUser,
    agree,
    cancelAgreement,
    closeWithoutConfirmation,
    reportUnpaid,
    threadForJob
  } = useStore();

  const agreement = agreements.find((item) => item.id === agreementId);
  const [viewAs, setViewAs] = useState<Role | null>(null);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (!agreement) {
    return (
      <div className="py-10">
        <EmptyState
          icon={<FileTextIcon className="h-6 w-6" aria-hidden />}
          title="Kesepakatan tidak ditemukan"
          description="Kesepakatan ini sudah tidak tersedia."
          action={
          <Button variant="secondary" size="sm" onClick={() => navigate('/aktivitas')}>
              Buka Aktivitas Saya
            </Button>
          } />
        
      </div>);

  }

  const job = getJob(agreement.jobId);
  const client = getUser(agreement.clientId);
  const worker = getUser(agreement.workerId);
  const defaultRole: Role = agreement.clientId === currentUser.id ? 'client' : 'worker';
  const role: Role = viewAs ?? defaultRole;
  const isBothParties = agreement.clientId === currentUser.id && agreement.workerId === currentUser.id;
  const agreedByMe = role === 'client' ? agreement.clientAgreed : agreement.workerAgreed;
  const locked = ['locked', 'in-progress', 'waiting-confirmation', 'completed', 'completed-unconfirmed'].includes(
    agreement.status
  );
  const workable = agreement.status === 'locked' || agreement.status === 'in-progress';

  const handleAgree = () => {
    const otherAgreed = role === 'client' ? agreement.workerAgreed : agreement.clientAgreed;
    agree(agreement.id, role);
    if (otherAgreed) {
      toast('Agreement Locked', 'Harga dan tenggat tidak bisa diubah lagi.', 'lock');
    } else {
      toast('Persetujuan kamu tercatat', 'Menunggu pihak lain menyetujui.');
    }
  };

  const openChat = () => {
    if (!job) return;
    const other = role === 'client' ? agreement.workerId : agreement.clientId;
    const thread = threadForJob(job.id, other);
    navigate(`/chat/${thread.id}`);
  };

  const partyRow = (
  label: string,
  name: string,
  handle: string,
  agreed: boolean,
  isMe: boolean) =>

  <div className="flex items-center gap-3 p-4">
      <Avatar name={name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
        <p className="mt-0.5 truncate text-[14px] font-semibold tracking-tight text-ink">
          {name}
          {isMe ? <span className="ml-1.5 text-[12px] font-normal text-faint">(kamu)</span> : null}
        </p>
        <Link to={`/u/${handle}`} className="text-[12px] text-faint hover:text-ink">
          @{handle}
        </Link>
      </div>
      <Badge tone={agreed ? 'solid' : 'dashed'} icon={agreed ? <CheckIcon className="h-3 w-3" aria-hidden /> : undefined}>
        {agreed ? 'Setuju' : 'Belum setuju'}
      </Badge>
    </div>;


  return (
    <div className="py-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors duration-150 ease-out hover:text-ink">
        
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
        Kembali
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="outline">Kesepakatan</Badge>
            <StatusBadge status={agreement.status} />
            <span className="text-[12px] text-faint">
              {agreement.lockedAt ? `Dikunci ${timeAgo(agreement.lockedAt)} lalu` : 'Belum dikunci'}
            </span>
          </div>

          <h1 className="mt-3 text-[24px] font-bold leading-tight tracking-tightest text-ink sm:text-[30px]">
            {job ?
            <Link to={`/pekerjaan/${job.id}`} className="hover:underline">
                {job.title}
              </Link> :

            'Pekerjaan'
            }
          </h1>

          <div className="mt-6">
            <AgreementTimeline status={agreement.status} />
          </div>

          {locked ?
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className="mt-6 flex items-start gap-3 border border-ink bg-inverse-bg px-4 py-4 text-inverse-ink">
            
              <LockIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p className="text-[15px] font-bold tracking-tight">🔒 Agreement Locked</p>
                <p className="mt-1 text-[13px] leading-relaxed opacity-80">
                  Harga {rupiah(agreement.price)} dan tenggat {fullDate(agreement.deadline)} tidak
                  bisa diubah lagi. Klien dan pekerja tercatat, dan pembatalan akan meninggalkan
                  jejak di track record.
                </p>
              </div>
            </motion.div> :

          <div className="mt-6 flex items-start gap-3 border border-dashed border-line-strong px-4 py-4">
              <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
              <p className="text-[13px] leading-relaxed text-muted">
                Kesepakatan terkunci hanya setelah kedua pihak menekan Setuju. Sebelum itu, harga dan
                tenggat masih bisa dinegosiasikan lewat chat.
              </p>
            </div>
          }

          <section className="mt-7 divide-y divide-line border border-line bg-surface" aria-label="Pihak yang terlibat">
            {partyRow('Klien', client.name, client.handle, agreement.clientAgreed, client.id === currentUser.id)}
            {partyRow('Pekerja', worker.name, worker.handle, agreement.workerAgreed, worker.id === currentUser.id)}
          </section>

          {agreement.proof ?
          <section className="mt-8" aria-labelledby="proof-heading">
              <h2 id="proof-heading" className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
                Bukti pekerjaan
              </h2>
              <div className="mt-2.5 border border-line bg-surface">
                {agreement.proof.imageUrl ?
              <img
                src={agreement.proof.imageUrl}
                alt="Bukti hasil pekerjaan"
                className="max-h-80 w-full object-cover" /> :

              null}
                <div className="px-4 py-3">
                  <p className="text-[13.5px] leading-relaxed text-ink">{agreement.proof.note}</p>
                  <p className="mt-1 text-[11.5px] text-faint">
                    Dikirim {timeAgo(agreement.proof.submittedAt)} lalu
                  </p>
                </div>
              </div>
            </section> :
          null}

          {agreement.confirmation ?
          <section className="mt-8" aria-labelledby="testimonial-heading">
              <h2
              id="testimonial-heading"
              className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              
                Testimoni klien
              </h2>
              <blockquote className="mt-2.5 border-l-2 border-ink pl-4 sm:pl-6">
                <Rating value={agreement.confirmation.rating} />
                <p className="mt-3 text-[18px] font-semibold leading-snug tracking-tight text-ink sm:text-[22px]">
                  “{agreement.confirmation.testimonial}”
                </p>
                <footer className="mt-3 text-[12.5px] text-muted">
                  {client.name} · {fullDate(agreement.confirmation.confirmedAt)}
                </footer>
              </blockquote>
              <Link
              to="/profil"
              className="mt-4 inline-block text-[13px] font-semibold text-ink hover:underline">
              
                Lihat di portofolio kamu
              </Link>
            </section> :
          null}

          {agreement.status === 'completed-unconfirmed' ?
          <p className="mt-8 border border-dashed border-line-strong px-4 py-3 text-[13px] leading-relaxed text-muted">
              Klien tidak merespons dalam 2 hari. Pekerjaan ditandai{' '}
              <strong className="font-semibold text-ink">Selesai (Belum Dikonfirmasi)</strong> dan
              tetap masuk track record, tanpa rating maupun testimoni.
            </p> :
          null}

          {agreement.unpaidReported ?
          <p className="mt-4 border border-line bg-subtle px-4 py-3 text-[13px] leading-relaxed text-ink">
              Laporan tidak dibayar tercatat permanen di track record {client.name}.
            </p> :
          null}
        </div>

        <aside>
          <div className="flex flex-col gap-5 lg:sticky lg:top-20">
            <section className="border border-line bg-surface">
              <div className="border-b border-line px-4 py-3">
                <h2 className="text-[13px] font-bold tracking-tight text-ink">Isi kesepakatan</h2>
              </div>
              <dl className="divide-y divide-line">
                <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <dt className="text-[13px] text-muted">Harga final</dt>
                  <dd className="text-[15px] font-bold tabular-nums tracking-tight text-ink">
                    {rupiah(agreement.price)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <dt className="flex items-center gap-1.5 text-[13px] text-muted">
                    <CalendarIcon className="h-3.5 w-3.5" aria-hidden />
                    Tenggat
                  </dt>
                  <dd className="text-right text-[13px] font-semibold text-ink">
                    {deadlineLabel(agreement.deadline)}
                  </dd>
                </div>
              </dl>
            </section>

            <TransactionBreakdown price={agreement.price} adminFee={agreement.adminFee} />

            <section className="flex flex-col gap-3 border border-line bg-surface p-4">
              {agreement.status === 'waiting-approval' ?
              agreedByMe ?
              <p className="text-[13px] leading-relaxed text-muted">
                    Kamu sudah setuju. Menunggu {role === 'client' ? worker.name : client.name}{' '}
                    menekan Setuju untuk mengunci kesepakatan.
                  </p> :

              <>
                    <p className="text-[13px] leading-relaxed text-muted">
                      Dengan menekan Setuju, kamu mengikat harga dan tenggat di atas.
                    </p>
                    <Button fullWidth onClick={handleAgree}>
                      Setuju
                    </Button>
                  </> :

              null}

              {workable ?
              role === 'worker' ?
              <>
                    <p className="text-[13px] leading-relaxed text-muted">
                      Sudah selesai? Unggah bukti supaya klien bisa mengonfirmasi.
                    </p>
                    <Button fullWidth onClick={() => setCompletionOpen(true)}>
                      Tandai Selesai
                    </Button>
                  </> :

              <p className="text-[13px] leading-relaxed text-muted">
                    Menunggu {worker.name} menyerahkan hasil kerja dan bukti.
                  </p> :

              null}

              {agreement.status === 'waiting-confirmation' ?
              role === 'client' ?
              <>
                    <p className="text-[13px] leading-relaxed text-muted">
                      Kamu punya 2 hari untuk mengonfirmasi, memberi rating, dan menulis testimoni.
                    </p>
                    <Button fullWidth onClick={() => setConfirmOpen(true)}>
                      Konfirmasi &amp; beri testimoni
                    </Button>
                  </> :

              <p className="text-[13px] leading-relaxed text-muted">
                    Bukti sudah terkirim. Menunggu konfirmasi {client.name} dalam 2 hari.
                  </p> :

              null}

              <Button
                variant="secondary"
                fullWidth
                onClick={openChat}
                icon={<MessageSquareIcon className="h-3.5 w-3.5" aria-hidden />}>
                
                Buka chat pekerjaan
              </Button>

              {locked ?
              <Button
                variant="tertiary"
                fullWidth
                icon={<PhoneIcon className="h-3.5 w-3.5" aria-hidden />}
                onClick={() =>
                toast('Nomor WhatsApp dibagikan', 'Chat aplikasi tetap jadi jalur utama kerja.')
                }>
                
                  Bagikan WhatsApp (opsional)
                </Button> :
              null}

              {workable || agreement.status === 'waiting-approval' ?
              <Button variant="tertiary" fullWidth onClick={() => setCancelOpen(true)}>
                  Batalkan kesepakatan
                </Button> :
              null}

              {role === 'worker' &&
              !agreement.unpaidReported &&
              ['completed', 'completed-unconfirmed'].includes(agreement.status) ?
              <Button variant="tertiary" fullWidth onClick={() => setReportOpen(true)}>
                  Laporkan tidak dibayar
                </Button> :
              null}
            </section>

            {/* Demo aid: this screen has two sides, so the demo can switch perspective. */}
            {!isBothParties ?
            <div className="border border-dashed border-line-strong p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-faint">
                  Mode demo
                </p>
                <div className="mt-2 flex gap-1.5">
                  {(['worker', 'client'] as Role[]).map((option) =>
                <button
                  key={option}
                  type="button"
                  onClick={() => setViewAs(option)}
                  className={cn(
                    'border px-2.5 py-1 text-[12px] font-medium transition-colors duration-150 ease-out',
                    role === option ?
                    'border-transparent bg-inverse-bg text-inverse-ink' :
                    'border-line-strong text-muted hover:text-ink'
                  )}>
                  
                      Sisi {option === 'worker' ? 'pekerja' : 'klien'}
                    </button>
                )}
                </div>
                {agreement.status === 'waiting-confirmation' ?
              <button
                type="button"
                onClick={() => {
                  closeWithoutConfirmation(agreement.id);
                  toast('Selesai (Belum Dikonfirmasi)', 'Tanpa rating dan testimoni.');
                }}
                className="mt-2.5 text-left text-[11.5px] text-muted underline transition-colors duration-150 ease-out hover:text-ink">
                
                    Lewati 2 hari tanpa respons klien
                  </button> :
              null}
              </div> :
            null}
          </div>
        </aside>
      </div>

      {job ?
      <CompletionModal
        agreement={agreement}
        workType={job.type}
        open={completionOpen}
        onClose={() => setCompletionOpen(false)} /> :

      null}

      <ConfirmationModal
        agreement={agreement}
        workerName={worker.name}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)} />
      

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Batalkan kesepakatan?"
        description="Pembatalan meninggalkan jejak permanen di track record kamu."
        footer={
        <>
            <Button variant="tertiary" onClick={() => setCancelOpen(false)}>
              Tidak, lanjutkan
            </Button>
            <Button
            onClick={() => {
              cancelAgreement(agreement.id, role === 'client' ? client.id : worker.id);
              setCancelOpen(false);
              toast('Kesepakatan dibatalkan', 'Jejak pembatalan tercatat di track record.');
            }}>
            
              Ya, batalkan
            </Button>
          </>
        }>
        
        <p className="text-[13.5px] leading-relaxed text-muted">
          Pekerjaan ini akan berstatus Batal. Statistik pembatalan terlihat publik di profil, dan
          tidak bisa disembunyikan.
        </p>
      </Modal>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Laporkan tidak dibayar"
        description="Laporan ini tampil permanen di track record klien."
        footer={
        <>
            <Button variant="tertiary" onClick={() => setReportOpen(false)}>
              Batal
            </Button>
            <Button
            onClick={() => {
              reportUnpaid(agreement.id);
              setReportOpen(false);
              toast('Laporan tercatat', 'Laporan tampil di track record klien secara permanen.');
            }}>
            
              Kirim laporan
            </Button>
          </>
        }>
        
        <p className="text-[13.5px] leading-relaxed text-muted">
          Gunakan hanya jika pekerjaan sudah selesai tetapi pembayaran tidak diterima. Laporan tidak
          dinilai otomatis oleh sistem, tetapi tercatat sebagai fakta pada track record klien.
        </p>
      </Modal>
    </div>);

}