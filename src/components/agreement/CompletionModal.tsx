import React, { useState } from 'react';
import type { Agreement, WorkType } from '../../types';
import { Modal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { useStore } from '../../contexts/StoreContext';
import { useToast } from '../../contexts/ToastContext';

interface CompletionModalProps {
  agreement: Agreement;
  workType: WorkType;
  open: boolean;
  onClose: () => void;
}

export function CompletionModal({ agreement, workType, open, onClose }: CompletionModalProps) {
  const { submitProof } = useStore();
  const { toast } = useToast();
  const [note, setNote] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [error, setError] = useState('');

  const proofRequired = workType === 'proyek';

  const submit = async () => {
    if (proofRequired && !image) {
      setError('Proyek wajib menyertakan foto bukti hasil kerja.');
      return;
    }
    try {
      await submitProof(agreement.id, note.trim() || 'Pekerjaan selesai.', image);
      onClose();
      toast('Bukti terkirim', 'Klien punya 2 hari untuk mengonfirmasi dan memberi testimoni.');
    } catch (error) {
      toast('Gagal mengirim bukti', 'Terjadi kesalahan, coba lagi sebentar lagi.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tandai selesai"
      description="Bukti ini yang nanti tampil di portofolio kamu."
      footer={
      <>
          <Button variant="tertiary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={submit}>Kirim bukti</Button>
        </>
      }>
      
      <div className="flex flex-col gap-5">
        <Field
          label="Foto bukti"
          required={proofRequired}
          error={error}
          hint={
          proofRequired ?
          'Wajib untuk Proyek. Contoh: hasil desain, tangkapan layar, atau file akhir.' :
          'Opsional untuk Kerja Cepat, tapi membantu klien mengonfirmasi lebih cepat.'
          }>
          
          <FileUpload
            value={image}
            onChange={(url) => {
              setImage(url);
              setError('');
            }}
            invalid={Boolean(error)} />
          
        </Field>

        <Field label="Catatan penyerahan" htmlFor="proof-note" counter={`${note.length}/200`}>
          <Textarea
            id="proof-note"
            rows={3}
            maxLength={200}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Contoh: file final dan versi cetak sudah dikirim lewat chat." />
          
        </Field>
      </div>
    </Modal>);

}