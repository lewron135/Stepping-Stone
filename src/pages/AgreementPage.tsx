import { useEffect, useState } from 'react';
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
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Rating } from '../components/ui/Rating';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AgreementTimeline } from '../components/agreement/AgreementTimeline';
import { TransactionBreakdown } from '../components/agreement/TransactionBreakdown';
import { CompletionModal } from '../components/agreement/CompletionModal';
import { ConfirmationModal } from '../components/agreement/ConfirmationModal';
import { useStore } from '../contexts/StoreContext';
import { useUser } from '../hooks/useUser';
import { useToast } from '../contexts/ToastContext';
import { fullDate, deadlineLabel, rupiah, timeAgo } from '../utils/format';

// Orang menulis nomor Indonesia dengan tiga cara: 08xx, +628xx, dan 628xx. Ketiganya
// dinormalkan ke bentuk internasional supaya tautan wa.me yang ikut terkirim selalu benar.
function normalizeWhatsApp(raw: string): {intl: string;display: string;} | null {
  let intl = raw.replace(/\D/g, '');
  if (intl.startsWith('0')) {
    intl = `62${intl.slice(1)}`;
  } else if (intl.startsWith('8')) {
    intl = `62${intl}`;
  }
  if (!intl.startsWith('62')) return null;

  const local = intl.slice(2);
  if (local.length < 8 || local.length > 13) return null;
  return { intl, display: `+${intl}` };
}

export function AgreementPage() {
  const { agreementId = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    agreements,
    getJob,
    currentUser,
    agree,
    cancelAgreement,
    reportUnpaid,
    threadForJob,
    sendMessage,
    ensureAgreement
  } = useStore();

  const agreement = agreements.find((item) => item.id === agreementId);

  // Selalu tarik ulang dari server saat halaman dibuka. Dua alasan: kesepakatan yang baru
  // dibuat pihak lain belum ada di store (semua notifikasi kesepakatan mengarah ke sini),
  // dan salinan yang sudah ada bisa ketinggalan status setelah pihak lain bertindak.
  const [lookupDone, setLookupDone] = useState(false);
  useEffect(() => {
    if (!agreementId) return;
    let cancelled = false;
    setLookupDone(false);
    ensureAgreement(agreementId).catch(() => {
      // biarkan, di bawah akan tampil sebagai tidak ditemukan
    }).finally(() => {
      if (!cancelled) setLookupDone(true);
    });
    return () => {
      cancelled = true;
    };
  }, [agreementId, ensureAgreement]);

  const [completionOpen, setCompletionOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [waNumber, setWaNumber] = useState('');
  const [waSending, setWaSending] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const client = useUser(agreement?.clientId);
  const worker = useUser(agreement?.workerId);

  if (!agreement) {
    if (!lookupDone) {
      return (
        <div className="py-10">
          <p className="text-[13.5px] text-muted">Memuat...</p>
        </div>);

    }
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
  const isClient = currentUser?.id === agreement.clientId;
  const isWorker = currentUser?.id === agreement.workerId;
  const agreedByMe = isClient ? agreement.clientAgreed : isWorker ? agreement.workerAgreed : false;
  const locked = ['locked', 'in-progress', 'waiting-confirmation', 'completed', 'completed-unconfirmed'].includes(
    agreement.status
  );
  const workable = agreement.status === 'locked' || agreement.status === 'in-progress';

  if (!client || !worker) {
    return (
      <div className="py-10">
        <p className="text-[13.5px] text-muted">Memuat...</p>
      </div>);

  }

  const handleAgree = async () => {
    const otherAgreed = isClient ? agreement.workerAgreed : agreement.clientAgreed;
    try {
      await agree(agreement.id);
      if (otherAgreed) {
        toast('Agreement Locked', 'Harga dan tenggat tidak bisa diubah lagi.', 'lock');
      } else {
        toast('Persetujuan kamu tercatat', 'Menunggu pihak lain menyetujui.');
      }
    } catch (error) {
      toast('Gagal menyetujui kesepakatan', 'Terjadi kesalahan, coba lagi sebentar lagi.');
    }
  };

  const openChat = async () => {
    if (!job) return;
    const other = isClient ? agreement.workerId : agreement.clientId;
    try {
      const thread = await threadForJob(job.id, other);
      navigate(`/chat/${thread.id}`);
    } catch (error) {
      toast('Gagal membuka chat', 'Terjadi kesalahan, coba lagi sebentar lagi.');
    }
  };

  const shareWhatsApp = async () => {
    if (!job || waSending) return;

    const parsed = normalizeWhatsApp(waNumber);
    if (!parsed) {
      toast('Nomor belum benar', 'Tulis nomor WhatsApp Indonesia, misalnya 081234567890.');
      return;
    }

    setWaSending(true);
    try {
      const other = isClient ? agreement.workerId : agreement.clientId;
      const thread = await threadForJob(job.id, other);
      await sendMessage(
        thread.id,
        `Nomor WhatsApp aku ${parsed.display}, boleh dihubungi di luar aplikasi kalau perlu. ` +
        `https://wa.me/${parsed.intl}`
      );
      setWaOpen(false);
      setWaNumber('');
      toast('Nomor terkirim', 'Nomormu masuk ke chat pekerjaan ini.');
      navigate(`/chat/${thread.id}`);
    } catch (error) {
      toast('Gagal mengirim nomor', 'Terjadi kesalahan, coba lagi sebentar lagi.');
    } finally {
      setWaSending(false);
    }
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
                <p className="text-[15px] font-bold tracking-tight">Agreement Locked</p>
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
            {partyRow('Klien', client.name, client.handle, agreement.clientAgreed, isClient)}
            {partyRow('Pekerja', worker.name, worker.handle, agreement.workerAgreed, isWorker)}
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

            {isClient || isWorker ?
            <section className="flex flex-col gap-3 border border-line bg-surface p-4">
                {agreement.status === 'waiting-approval' ?
              agreedByMe ?
              <p className="text-[13px] leading-relaxed text-muted">
                      Kamu sudah setuju. Menunggu {isClient ? worker.name : client.name}{' '}
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
              isWorker ?
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
              isClient ?
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
                onClick={() => setWaOpen(true)}>

                    Bagikan WhatsApp (opsional)
                  </Button> :
              null}

                {workable || agreement.status === 'waiting-approval' ?
              <Button variant="tertiary" fullWidth onClick={() => setCancelOpen(true)}>
                    Batalkan kesepakatan
                  </Button> :
              null}

                {isWorker &&
              !agreement.unpaidReported &&
              ['completed', 'completed-unconfirmed'].includes(agreement.status) ?
              <Button variant="tertiary" fullWidth onClick={() => setReportOpen(true)}>
                    Laporkan tidak dibayar
                  </Button> :
              null}
              </section> :

            <section className="border border-dashed border-line-strong bg-surface p-4">
                <p className="text-[13px] leading-relaxed text-muted">
                  Kamu tidak terlibat langsung di kesepakatan ini, jadi halaman ini ditampilkan
                  sebagai tampilan baca saja.
                </p>
              </section>
            }
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
            onClick={async () => {
              try {
                await cancelAgreement(agreement.id);
                setCancelOpen(false);
                toast('Kesepakatan dibatalkan', 'Jejak pembatalan tercatat di track record.');
              } catch (error) {
                toast('Gagal membatalkan kesepakatan', 'Terjadi kesalahan, coba lagi sebentar lagi.');
              }
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
            onClick={async () => {
              try {
                await reportUnpaid(agreement.id);
                setReportOpen(false);
                toast('Laporan tercatat', 'Laporan tampil di track record klien secara permanen.');
              } catch (error) {
                toast('Gagal mengirim laporan', 'Terjadi kesalahan, coba lagi sebentar lagi.');
              }
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

      <Modal
        open={waOpen}
        onClose={() => setWaOpen(false)}
        title="Bagikan nomor WhatsApp"
        description="Nomormu dikirim sebagai pesan di chat pekerjaan ini, bukan disimpan di profil."
        footer={
        <>
            <Button variant="tertiary" onClick={() => setWaOpen(false)}>
              Batal
            </Button>
            <Button loading={waSending} onClick={shareWhatsApp}>
              Kirim nomor
            </Button>
          </>
        }>
        
        <div className="flex flex-col gap-3">
          <Input
            id="wa-number"
            inputMode="tel"
            value={waNumber}
            placeholder="081234567890"
            onChange={(event) => setWaNumber(event.target.value)} />
          
          <p className="text-[12.5px] leading-relaxed text-muted">
            Chat aplikasi tetap jadi jalur utama kerja, karena isinya jadi catatan kalau nanti ada
            yang perlu ditengok ulang. WhatsApp cuma jalur tambahan setelah kesepakatan terkunci.
          </p>
        </div>
      </Modal>
    </div>);

}