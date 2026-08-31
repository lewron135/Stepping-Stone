import { useState } from 'react';
import type { Agreement } from '../../types';
import { Modal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Rating } from '../ui/Rating';
import { useStore } from '../../contexts/StoreContext';
import { useToast } from '../../contexts/ToastContext';

interface ConfirmationModalProps {
  agreement: Agreement;
  workerName: string;
  open: boolean;
  onClose: () => void;
}

export function ConfirmationModal({
  agreement,
  workerName,
  open,
  onClose
}: ConfirmationModalProps) {
  const { confirmCompletion } = useStore();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    if (!text.trim()) {
      setError('Tulis satu kalimat testimoni untuk pekerja.');
      return;
    }
    try {
      await confirmCompletion(agreement.id, rating, text.trim());
      onClose();
      toast('Pekerjaan dikonfirmasi', 'Testimoni kamu kini menempel di portofolio pekerja.');
    } catch (error) {
      toast('Gagal mengonfirmasi', 'Terjadi kesalahan, coba lagi sebentar lagi.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Konfirmasi & beri testimoni"
      description={`Konfirmasi bahwa pekerjaan ${workerName} sudah sesuai kesepakatan.`}
      footer={
      <>
          <Button variant="tertiary" onClick={onClose}>
            Nanti
          </Button>
          <Button onClick={submit}>Konfirmasi selesai</Button>
        </>
      }>
      
      <div className="flex flex-col gap-6">
        <Field label="Rating" required>
          <Rating value={rating} onChange={setRating} size="lg" />
        </Field>

        <Field
          label="Testimoni satu kalimat"
          htmlFor="testimonial"
          required
          error={error}
          hint="Testimoni ini tampil besar di portofolio pekerja."
          counter={`${text.length}/140`}>
          
          <Textarea
            id="testimonial"
            rows={3}
            maxLength={140}
            value={text}
            invalid={Boolean(error)}
            onChange={(event) => {
              setText(event.target.value);
              setError('');
            }}
            placeholder="Contoh: hasilnya rapi, revisi cepat, dan selesai sebelum tenggat." />
          
        </Field>
      </div>
    </Modal>);

}