import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircleIcon, ArrowLeftIcon, SparklesIcon } from 'lucide-react';
import type { Job, WorkType } from '../types';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { JobPost } from '../components/feed/JobPost';
import { useStore } from '../contexts/StoreContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useToast } from '../contexts/ToastContext';
import { KERJA_CEPAT_CATEGORIES, PROYEK_CATEGORIES } from '../data/reference';
import { AI_MAX_CHARS, draftBrief } from '../lib/api';
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
  workersCustom: string;
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
  workersCustom: '',
  area: ''
};

export function CreateJob() {
  const navigate = useNavigate();
  const { createJob } = useStore();
  const currentUser = useCurrentUser();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  // Kotak asisten sengaja hidup di luar FormState dan di luar validasi. Form harus tetap bisa
  // diisi tangan persis seperti sebelum fitur ini ada, termasuk saat asisten mati.
  const [intent, setIntent] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [assistError, setAssistError] = useState('');
  const [drafted, setDrafted] = useState<Array<keyof FormState>>([]);

  // Dibaca setelah await, supaya draf tidak menimpa kolom yang baru diketik user selama
  // asisten masih berpikir. Nilai dari closure sudah basi saat balasan datang.
  const formRef = useRef(form);
  formRef.current = form;

  const set = <K extends keyof FormState,>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    // Begitu user menyentuh kolomnya, itu bukan draf asisten lagi.
    setDrafted((prev) => prev.filter((field) => field !== key));
  };

  // Penanda draf menumpang slot counter milik Field, jadi tidak ada komponen yang perlu diubah.
  const draftMark = (field: keyof FormState) =>
  drafted.includes(field) ? 'draf dari asisten' : undefined;

  const runAssistant = async () => {
    const text = intent.trim();
    if (!text || drafting) return;

    setDrafting(true);
    setAssistError('');
    try {
      const draft = await draftBrief(text);
      const prev = formRef.current;
      const next = { ...prev };
      const marks: Array<keyof FormState> = [];

      // Jenis pekerjaan cuma ikut berubah bersama kategori, karena jenis itu yang menentukan
      // isi dropdown kategori. Mengubahnya sendirian bisa membuat kategori pilihan user
      // hilang dari daftar.
      if (!prev.category && draft.category) {
        if (draft.type) next.type = draft.type;
        next.category = draft.category;
        marks.push('category');
      }
      if (!prev.title.trim() && draft.title) {
        next.title = draft.title;
        marks.push('title');
      }
      if (!prev.scope.trim() && draft.scope) {
        next.scope = draft.scope;
        marks.push('scope');
      }
      if (!prev.deliverable.trim() && draft.deliverable) {
        next.deliverable = draft.deliverable;
        marks.push('deliverable');
      }
      if (!prev.deadline && draft.deadline) {
        next.deadline = draft.deadline;
        marks.push('deadline');
      }

      setForm(next);
      setDrafted(marks);
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };
        marks.forEach((field) => delete nextErrors[field]);
        return nextErrors;
      });
      if (marks.length === 0) {
        setAssistError('Kolom brief kamu sudah terisi, jadi draf ini tidak mengubah apa pun.');
      }
    } catch (error) {
      setAssistError(
        error instanceof Error ? error.message : 'Asisten sedang tidak bisa dihubungi.'
      );
    } finally {
      setDrafting(false);
    }
  };

  const categories = form.type === 'kerja-cepat' ? KERJA_CEPAT_CATEGORIES : PROYEK_CATEGORIES;
  const slotsTotalValue = Number(form.workers === 'custom' ? form.workersCustom : form.workers);

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
      slotsTotal: Number.isInteger(slotsTotalValue) && slotsTotalValue > 0 ? slotsTotalValue : 1,
      slotsFilled: 0,
      area: form.type === 'kerja-cepat' ? form.area.trim() || undefined : undefined,
      tags: form.category ? [form.category.toLowerCase()] : [],
      posterId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'open'
    }),
    [currentUser.id, form]
  );

  const submit = async () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.category) next.category = 'Pilih kategori pekerjaan.';
    if (form.title.trim().length < 8) next.title = 'Judul minimal 8 karakter agar jelas di feed.';
    if (form.scope.trim().length < 20) next.scope = 'Ruang lingkup wajib dan minimal 20 karakter.';
    if (!form.deliverable.trim()) next.deliverable = 'Hasil akhir wajib diisi.';
    if (!form.deadline) next.deadline = 'Tenggat wajib diisi.';
    if (!Number(form.price.replace(/\D/g, ''))) next.price = 'Isi estimasi harga.';
    if (!Number.isInteger(slotsTotalValue) || slotsTotalValue < 1) {
      next.workers = 'Isi jumlah pekerja, minimal 1 orang.';
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      const job = await createJob({
        type: form.type,
        category: form.category,
        title: form.title.trim(),
        scope: form.scope.trim(),
        deliverable: form.deliverable.trim(),
        deadline: new Date(form.deadline).toISOString(),
        price: Number(form.price.replace(/\D/g, '')),
        slotsTotal: slotsTotalValue,
        area: form.type === 'kerja-cepat' && form.area.trim() ? form.area.trim() : undefined
      });
      toast('Pekerjaan dipasang', 'Pekerjaan kamu sudah tampil di feed.');
      navigate(`/pekerjaan/${job.id}`);
    } catch (error) {
      toast('Gagal memasang pekerjaan', 'Terjadi kesalahan, coba lagi sebentar lagi.');
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
            
            <div className="border border-line-strong bg-subtle p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold tracking-tight text-ink">
                  <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
                  Bantu isi brief
                </span>
                <span className="text-[11px] tabular-nums text-faint">
                  {intent.length}/{AI_MAX_CHARS}
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted">
                Ceritakan singkat apa yang kamu butuhkan, asisten menyusun draf brief-nya. Kamu yang
                menyetujui atau membetulkannya sebelum diposting. Opsional, form ini tetap bisa
                diisi tangan.
              </p>
              <Textarea
                id="brief-intent"
                className="mt-3"
                rows={2}
                maxLength={AI_MAX_CHARS}
                value={intent}
                placeholder="Contoh: butuh poster buat acara himpunan minggu depan, ukuran feed Instagram sama cetak A3"
                onChange={(event) => setIntent(event.target.value)} />
              
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  loading={drafting}
                  disabled={!intent.trim()}
                  onClick={runAssistant}>
                  
                  {drafting ? 'Menyusun draf' : 'Buatkan draf brief'}
                </Button>
                <span className="text-[12px] text-muted">Kolom yang sudah kamu isi tidak diubah.</span>
              </div>
              {assistError ?
              <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-medium text-danger">
                  <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {assistError}
                </p> :
              null}
            </div>

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

            <Field
              label="Kategori"
              htmlFor="category"
              required
              error={errors.category}
              counter={draftMark('category')}>
              
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
              counter={`${drafted.includes('title') ? 'draf dari asisten · ' : ''}${form.title.length}/80`}
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
              counter={`${drafted.includes('scope') ? 'draf dari asisten · ' : ''}${form.scope.length}/600`}
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
              counter={draftMark('deliverable')}
              hint="Bentuk konkret yang diserahkan, misalnya 3 poster PNG + PDF cetak.">
              
              <Input
                id="deliverable"
                value={form.deliverable}
                invalid={Boolean(errors.deliverable)}
                placeholder="Contoh: 1 poster A3 (PDF) + 3 feed Instagram (PNG)"
                onChange={(event) => set('deliverable', event.target.value)} />
              
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Tenggat"
                htmlFor="deadline"
                required
                error={errors.deadline}
                counter={draftMark('deadline')}>
                
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
                error={errors.workers}
                hint="Lebih dari satu orang tetap dapat kesepakatan masing-masing.">

                <Select
                  id="workers"
                  value={form.workers}
                  invalid={Boolean(errors.workers)}
                  options={[
                  ...[1, 2, 3, 4, 5].map((value) => ({ value: String(value), label: `${value} orang` })),
                  { value: 'custom', label: 'Lainnya (isi sendiri)' }]
                  }
                  onChange={(event) => set('workers', event.target.value)} />

                {form.workers === 'custom' ?
                <div className="mt-2">
                    <Input
                    id="workers-custom"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={form.workersCustom}
                    invalid={Boolean(errors.workers)}
                    placeholder="Contoh: 8"
                    onChange={(event) => set('workersCustom', event.target.value)} />
                  </div> :
                null}
              </Field>

              {form.type === 'kerja-cepat' ?
              <Field
                label="Area"
                htmlFor="area"
                error={errors.area}
                hint="Penanda area umum, bukan lokasi presisi.">

                  <Input
                  id="area"
                  value={form.area}
                  invalid={Boolean(errors.area)}
                  placeholder="Contoh: Sekitar Kampus, Dekat Stasiun, dll"
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