import { useEffect, useState } from 'react';
import type { Job } from '../../types';
import { Modal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useStore } from '../../contexts/StoreContext';
import { useToast } from '../../contexts/ToastContext';
import { deadlineLabel, rupiah } from '../../utils/format';

interface OfferModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
}

export function OfferModal({ job, open, onClose }: OfferModalProps) {
  const { submitOffer } = useStore();
  const { toast } = useToast();
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open && job) {
      setPrice(String(job.price));
      setNote('');
      setError('');
    }
  }, [open, job]);

  if (!job) return null;

  const submit = async () => {
    const value = Number(price.replace(/\D/g, ''));
    if (!value) {
      setError('Isi harga penawaran kamu.');
      return;
    }
    setSending(true);
    try {
      await submitOffer(job.id, value, note.trim() || 'Tanpa catatan tambahan.');
      onClose();
      toast('Penawaran terkirim', 'Klien akan memilih satu penawaran sebelum kesepakatan dibuat.');
    } catch (error) {
      toast('Gagal mengirim penawaran', 'Terjadi kesalahan, coba lagi sebentar lagi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajukan penawaran"
      description="Harga dan tenggat masih bisa dinegosiasikan lewat chat sebelum kesepakatan dikunci."
      footer={
      <>
          <Button variant="tertiary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit} loading={sending}>
            Kirim Penawaran
          </Button>
        </>
      }>
      
      <div className="flex flex-col gap-5">
        <div className="border border-line bg-subtle px-3 py-2.5">
          <p className="text-[13px] font-semibold leading-snug text-ink">{job.title}</p>
          <p className="mt-1 text-[12px] text-muted">
            Anggaran klien {rupiah(job.price)} · Tenggat {deadlineLabel(job.deadline)}
          </p>
        </div>

        <Field
          label="Harga yang kamu tawarkan"
          htmlFor="offer-price"
          required
          error={error}
          hint="Boleh berbeda dari anggaran klien.">
          
          <Input
            id="offer-price"
            prefix="Rp"
            inputMode="numeric"
            value={price}
            invalid={Boolean(error)}
            onChange={(event) => {
              setPrice(event.target.value);
              setError('');
            }} />
          
        </Field>

        <Field
          label="Catatan"
          htmlFor="offer-note"
          hint="Jelaskan singkat kenapa kamu cocok atau kapan kamu bisa mulai."
          counter={`${note.length}/240`}>
          
          <Textarea
            id="offer-note"
            rows={3}
            maxLength={240}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Contoh: bisa mulai malam ini, draft pertama dalam 2 hari." />
          
        </Field>
      </div>
    </Modal>);

}