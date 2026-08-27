import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import type { Job, WorkType } from '../types';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { JobPost } from '../components/feed/JobPost';
import { useStore } from '../contexts/StoreContext';
import { useToast } from '../contexts/ToastContext';
import { AREAS, KERJA_CEPAT_CATEGORIES, PROYEK_CATEGORIES } from '../data/reference';
import { cn } from '../utils/cn';

interface FormState {
  type: WorkType;
  category: string;
  title: string;
  scope: string;
  deliverable: string;
  deadline: string;
  price: string;
  workers: string;
  area: string;
}

const EMPTY: FormState = {
  type: 'kerja-cepat',
  category: '',
  title: '',
  scope: '',
  deliverable: '',
  deadline: '',
  price: '',
  workers: '1',
  area: ''
};

export function CreateJob() {
  const navigate = useNavigate();
  const { createJob, currentUser } = useStore();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState,>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const categories = form.type === 'kerja-cepat' ? KERJA_CEPAT_CATEGORIES : PROYEK_CATEGORIES;

  const previewJob: Job = useMemo(
    () => ({
      id: 'preview',
      type: form.type,
      category: form.category || (form.type === 'kerja-cepat' ? 'Kerja Cepat' : 'Proyek'),
      title: form.title || 'Judul pekerjaan kamu muncul di sini',
      scope: form.scope || 'Ruang lingkup menjelaskan apa yang harus dikerjakan, sejelas mungkin.',
      deliverable: form.deliverable || 'Hasil akhir yang harus diserahkan',
      deadline: form.deadline ? new Date(form.deadline).toISOString() : new Date().toISOString(),
      price: Number(form.price.replace(/\D/g, '')) || 0,
      slotsTotal: Number(form.workers) || 1,
      slotsFilled: 0,
      area: form.type === 'kerja-cepat' ? form.area || undefined : undefined,
      tags: form.category ? [form.category.toLowerCase()] : [],
      posterId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'open'
    }),
    [currentUser.id, form]
  );

  const submit = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.category) next.category = 'Pilih kategori pekerjaan.';
    if (form.title.trim().length < 8) next.title = 'Judul minimal 8 karakter agar jelas di feed.';
    if (form.scope.trim().length < 20) next.scope = 'Ruang lingkup wajib dan minimal 20 karakter.';
    if (!form.deliverable.trim()) next.deliverable = 'Hasil akhir wajib diisi.';
    if (!form.deadline) next.deadline = 'Tenggat wajib diisi.';
    if (!Number(form.price.replace(/\D/g, ''))) next.price = 'Isi estimasi harga.';
    if (form.type === 'kerja-cepat' && !form.area) next.area = 'Pilih area kampus.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const job = createJob({
      type: form.type,
      category: form.category,
      title: form.title.trim(),
      scope: form.scope.trim(),
      deliverable: form.deliverable.trim(),
      deadline: new Date(form.deadline).toISOString(),
      price: Number(form.price.replace(/\D/g, '')),
      slotsTotal: Number(form.workers) || 1,
      area: form.type === 'kerja-cepat' ? form.area : undefined
    });
    toast('Pekerjaan dipasang', 'Pekerjaan kamu sudah tampil di feed.');
    navigate(`/pekerjaan/${job.id}`);
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="min-w-0">
          <h1 className="text-[24px] font-bold tracking-tightest text-ink sm:text-[30px]">
            Pasang pekerjaan
          </h1>
          <p className="mt-1.5 max-w-lg text-[13.5px] leading-relaxed text-muted">
            Satu halaman saja. Ruang lingkup, hasil akhir, dan tenggat wajib diisi supaya kesepakatan
            nanti tidak abu-abu.
          </p>

          <form
            className="mt-8 flex flex-col gap-7"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}>
            
            <fieldset>
              <legend className="mb-2.5 text-[13px] font-semibold tracking-tight text-ink">
                Jenis pekerjaan
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(
                [
                {
                  value: 'kerja-cepat' as WorkType,
                  label: 'Kerja Cepat',
                  detail: 'Tugas kecil di sekitar kampus, Rp5.000–Rp15.000.'
                },
                {
                  value: 'proyek' as WorkType,
                  label: 'Proyek',
                  detail: 'Desain, video, coding, data. Puluhan sampai ratusan ribu.'
                }] as
                const).
                map((option) =>
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    set('type', option.value);
                    set('category', '');
                  }}
                  className={cn(
                    'border p-3.5 text-left transition-colors duration-150 ease-out',
                    form.type === option.value ?
                    'border-ink bg-subtle' :
                    'border-line-strong hover:bg-subtle'
                  )}>
                  
                    <span className="block text-[14px] font-semibold tracking-tight text-ink">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-[12px] leading-relaxed text-muted">
                      {option.detail}
                    </span>
                  </button>
                )}
              </div>
            </fieldset>

            <Field label="Kategori" htmlFor="category" required error={errors.category}>
              <Select
                id="category"
                value={form.category}
                invalid={Boolean(errors.category)}
                placeholder="Pilih kategori"
                options={categories.map((item) => ({ value: item, label: item }))}
                onChange={(event) => set('category', event.target.value)} />
              
            </Field>

            <Field
              label="Judul"
              htmlFor="title"
              required
              error={errors.title}
              counter={`${form.title.length}/80`}
              hint="Tulis apa yang dibutuhkan, bukan ajakan. Hindari tugas akademik.">
              
              <Input
                id="title"
                maxLength={80}
                value={form.title}
                invalid={Boolean(errors.title)}
                placeholder="Contoh: Poster & feed untuk Pekan Wirausaha"
                onChange={(event) => set('title', event.target.value)} />
              
            </Field>

            <Field
              label="Ruang lingkup"
              htmlFor="scope"
              required
              error={errors.scope}
              counter={`${form.scope.length}/600`}
              hint="Jelaskan pekerjaannya, batasan, dan materi yang kamu sediakan.">
              
              <Textarea
                id="scope"
                rows={5}
                maxLength={600}
                value={form.scope}
                invalid={Boolean(errors.scope)}
                onChange={(event) => set('scope', event.target.value)} />
              
            </Field>

            <Field
              label="Hasil akhir"
              htmlFor="deliverable"
              required
              error={errors.deliverable}
              hint="Bentuk konkret yang diserahkan, misalnya 3 poster PNG + PDF cetak.">
              
              <Input
                id="deliverable"
                value={form.deliverable}
                invalid={Boolean(errors.deliverable)}
                placeholder="Contoh: 1 poster A3 (PDF) + 3 feed Instagram (PNG)"
                onChange={(event) => set('deliverable', event.target.value)} />
              
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Tenggat" htmlFor="deadline" required error={errors.deadline}>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={form.deadline}
                  invalid={Boolean(errors.deadline)}
                  onChange={(event) => set('deadline', event.target.value)} />
                
              </Field>

              <Field label="Estimasi harga" htmlFor="price" required error={errors.price}>
                <Input
                  id="price"
                  prefix="Rp"
                  inputMode="numeric"
                  value={form.price}
                  invalid={Boolean(errors.price)}
                  placeholder="250000"
                  onChange={(event) => set('price', event.target.value)} />
                
              </Field>

              <Field
                label="Jumlah pekerja"
                htmlFor="workers"
                hint="Lebih dari satu orang tetap dapat kesepakatan masing-masing.">
                
                <Select
                  id="workers"
                  value={form.workers}
                  options={[1, 2, 3, 4, 5].map((value) => ({
                    value: String(value),
                    label: `${value} orang`
                  }))}
                  onChange={(event) => set('workers', event.target.value)} />
                
              </Field>

              {form.type === 'kerja-cepat' ?
              <Field
                label="Area kampus"
                htmlFor="area"
                required
                error={errors.area}
                hint="Penanda area umum, bukan lokasi presisi.">
                
                  <Select
                  id="area"
                  value={form.area}
                  invalid={Boolean(errors.area)}
                  placeholder="Pilih area"
                  options={AREAS.map((item) => ({ value: item, label: item }))}
                  onChange={(event) => set('area', event.target.value)} />
                
                </Field> :
              null}
            </div>

            <div className="flex flex-col gap-2 border-t border-line pt-6 sm:flex-row sm:justify-end">
              <Button type="button" variant="tertiary" onClick={() => navigate(-1)}>
                Batal
              </Button>
              <Button type="submit">Pasang pekerjaan</Button>
            </div>
          </form>
        </div>

        <aside>
          <div className="lg:sticky lg:top-20">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              Pratinjau di feed
            </p>
            <div className="border border-line bg-surface">
              <JobPost job={previewJob} />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-faint">
              Ini tampilan pekerjaan kamu di feed. Judul dan harga paling menentukan apakah orang
              menawar.
            </p>
          </div>
        </aside>
      </div>
    </div>);

}