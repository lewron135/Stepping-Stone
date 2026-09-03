import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { InboxIcon, PlusIcon, SlidersHorizontalIcon, SparklesIcon } from 'lucide-react';
import type { Job } from '../types';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal } from '../components/ui/Modal';
import { JobPost } from '../components/feed/JobPost';
import { FeedSkeleton } from '../components/feed/JobPostSkeleton';
import { FeedFilters, type FilterScope } from '../components/feed/FeedFilters';
import { CareerCompassCard } from '../components/feed/CareerCompassCard';
import { OfferModal } from '../components/offer/OfferModal';
import { useStore } from '../contexts/StoreContext';
import { parseSearch, type SearchFilters } from '../lib/api';
import { rupiah } from '../utils/format';

const COPY: Record<FilterScope, {title: string;subtitle: string;}> = {
  home: {
    title: 'Beranda',
    subtitle: 'Semua pekerjaan terbaru dari mahasiswa di kampus kamu.'
  },
  'kerja-cepat': {
    title: 'Kerja Cepat',
    subtitle: 'Tugas kecil di sekitar kampus, selesai hari ini.'
  },
  proyek: {
    title: 'Proyek',
    subtitle: 'Pekerjaan yang hasilnya bisa jadi bukti pengalaman.'
  }
};

const TAB_PATH: Record<FilterScope, string> = {
  home: '/home',
  'kerja-cepat': '/kerja-cepat',
  proyek: '/proyek'
};

export function Feed() {
  const { jobs } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const scope: FilterScope = location.pathname.startsWith('/proyek') ?
  'proyek' :
  location.pathname.startsWith('/kerja-cepat') ?
  'kerja-cepat' :
  'home';
  const forcedError = searchParams.get('demo') === 'error';

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [offerJob, setOfferJob] = useState<Job | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [assisting, setAssisting] = useState(false);
  const [assistNote, setAssistNote] = useState('');
  const [assistError, setAssistError] = useState('');
  const [assistUndo, setAssistUndo] = useState<
    {category: string;area: string;priceMax: number | null;} | null>(
    null);

  // Filter hasil asisten ditahan di sini kalau tabnya ikut berpindah. Efek di bawah
  // mengosongkan filter setiap kali tab berganti, jadi memasangnya sebelum pindah tab berarti
  // menghapusnya sendiri.
  const pendingFilters = useRef<SearchFilters | null>(null);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    setState('loading');
    setCategory('');
    setArea('');
    setPriceMax(null);
    const timer = window.setTimeout(() => setState(forcedError ? 'error' : 'ready'), 650);
    return () => window.clearTimeout(timer);
  }, [scope, forcedError]);

  // Urutannya penting: efek ini dideklarasikan setelah efek pembersih di atas, jadi ikut
  // berjalan setelahnya saat tab berganti.
  useEffect(() => {
    const pending = pendingFilters.current;
    if (!pending) return;
    pendingFilters.current = null;
    applyAssistantFilters(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const scopedJobs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return jobs.
    filter((job) => scope === 'home' ? true : job.type === scope).
    filter((job) => job.status === 'open').
    filter((job) => category ? job.category === category : true).
    filter((job) =>
    needle ?
    [job.title, job.scope, job.deliverable, ...job.tags].
    join(' ').
    toLowerCase().
    includes(needle) :
    true
    );
  }, [category, jobs, query, scope]);

  const areaOptions = useMemo(() => {
    const set = new Set<string>();
    scopedJobs.forEach((job) => {
      if (job.area) set.add(job.area);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [scopedJobs]);

  const visible = useMemo(() => {
    return scopedJobs.
    filter((job) => area ? job.area === area : true).
    filter((job) => priceMax === null ? true : job.price <= priceMax).
    sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [area, priceMax, scopedJobs]);

  const activeFilterCount = (category ? 1 : 0) + (area ? 1 : 0) + (priceMax !== null ? 1 : 0);

  const applyAssistantFilters = (filters: SearchFilters) => {
    setCategory(filters.kategori);
    setArea(filters.area);
    setPriceMax(filters.hargaMaks);

    const parts = [
    filters.kategori,
    filters.area,
    filters.hargaMaks === null ? '' : `maks ${rupiah(filters.hargaMaks)}`].
    filter(Boolean);
    setAssistNote(
      parts.length > 0 ?
      parts.join(' \u00b7 ') :
      'Tidak ada filter yang jelas dari kalimatmu, jadi pencarian kata biasa yang dipakai.'
    );
  };

  const undoAssistant = () => {
    if (assistUndo) {
      setCategory(assistUndo.category);
      setArea(assistUndo.area);
      setPriceMax(assistUndo.priceMax);
    }
    setAssistUndo(null);
    setAssistNote('');
  };

  const runAssistant = async () => {
    const text = query.trim();
    // Dua kata atau kurang tidak perlu diterjemahkan. Pencocokan kata sudah menanganinya, dan
    // panggilan yang tidak perlu itu tetap ada biayanya.
    if (assisting || text.split(/\s+/).length <= 2) return;

    setAssisting(true);
    setAssistError('');
    try {
      const filters = await parseSearch(text, areaOptions);

      if (filters.tab && filters.tab !== 'semua' && filters.tab !== scope) {
        // Pindah tab mengosongkan filter, jadi keadaan yang dikembalikan tombol Batalkan adalah
        // filter kosong. Mengembalikan filter tab lama ke tab baru cuma menghasilkan daftar
        // kosong, misalnya kategori Desain Grafis dipasang di tab Kerja Cepat.
        setAssistUndo({ category: '', area: '', priceMax: null });
        // Kalimatnya ikut dibawa di URL supaya tidak hilang saat pindah tab, karena query
        // memang dibaca ulang dari parameter q setiap kali parameternya berubah.
        pendingFilters.current = filters;
        navigate(`${TAB_PATH[filters.tab]}?q=${encodeURIComponent(text)}`);
      } else {
        setAssistUndo({ category, area, priceMax });
        applyAssistantFilters(filters);
      }
    } catch (error) {
      // Fallback wajib: kalimat yang diketik tetap berlaku sebagai pencarian kata biasa, jadi
      // pencarian tidak pernah ikut mati bersama asistennya.
      setAssistError(
        error instanceof Error ? error.message : 'Asisten sedang tidak bisa dihubungi.'
      );
    } finally {
      setAssisting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
      <div className="min-w-0">
        <div className="mb-1 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold tracking-tightest text-ink sm:text-[26px]">
              {COPY[scope].title}
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{COPY[scope].subtitle}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="hidden sm:inline-flex"
            icon={<PlusIcon className="h-3.5 w-3.5" aria-hidden />}
            onClick={() => navigate('/pasang-pekerjaan')}>
            
            Pasang pekerjaan
          </Button>
        </div>

        <Tabs
          className="mt-5"
          size="lg"
          layoutId="feed-tab"
          items={[
          { value: 'home', label: 'Semua' },
          { value: 'kerja-cepat', label: 'Kerja Cepat' },
          { value: 'proyek', label: 'Proyek' }]
          }
          value={scope}
          onChange={(value) => navigate(TAB_PATH[value as FilterScope])} />
        

        <div className="flex items-center justify-between gap-3 border-b border-line py-3 lg:hidden">
          <p className="text-[12.5px] text-muted">
            {state === 'ready' ? `${visible.length} pekerjaan terbuka` : 'Memuat pekerjaan'}
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={<SlidersHorizontalIcon className="h-3.5 w-3.5" aria-hidden />}
            onClick={() => setFiltersOpen(true)}>
            
            Filter{activeFilterCount ? ` (${activeFilterCount})` : ''}
          </Button>
        </div>

        {assistNote ?
        <div className="mt-4 flex items-start justify-between gap-3 border border-line-strong bg-subtle px-3.5 py-3">
            <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink">
              <SparklesIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
              <span>
                <span className="text-muted">Filter dari kalimatmu: </span>
                {assistNote}
              </span>
            </p>
            <button
            type="button"
            onClick={undoAssistant}
            className="shrink-0 text-[12.5px] font-medium text-muted underline underline-offset-2 transition-colors duration-150 ease-out hover:text-ink">
            
              Batalkan
            </button>
          </div> :
        null}

        {assistError ?
        <p className="mt-4 border border-line-strong px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">
            {assistError} Pencarian kata biasa tetap berjalan.
          </p> :
        null}

        {state === 'loading' ?
        <FeedSkeleton /> :
        state === 'error' ?
        <div className="mt-4">
            <ErrorState onRetry={() => setState('ready')} />
          </div> :
        visible.length === 0 ?
        <div className="mt-4">
            <EmptyState
            icon={<InboxIcon className="h-6 w-6" aria-hidden />}
            title="Belum ada pekerjaan yang cocok"
            description="Coba hapus filter atau ubah kata pencarian. Kamu juga bisa memasang pekerjaan sendiri."
            action={
            <Button variant="secondary" size="sm" onClick={() => navigate('/pasang-pekerjaan')}>
                  Pasang pekerjaan
                </Button>
            } />
          
          </div> :

        <div className="divide-y divide-line border-b border-line">
            {visible.map((job) =>
          <JobPost key={job.id} job={job} onOffer={setOfferJob} />
          )}
          </div>
        }
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20 flex flex-col gap-7">
          <FeedFilters
            scope={scope}
            query={query}
            onQueryChange={setQuery}
            category={category}
            onCategoryChange={setCategory}
            area={area}
            onAreaChange={setArea}
            areaOptions={areaOptions}
            priceMax={priceMax}
            onPriceMaxChange={setPriceMax}
            onAssistantSubmit={runAssistant}
            assistantBusy={assisting} />

          <CareerCompassCard />
        </div>
      </aside>

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter pekerjaan"
        footer={
        <>
            <Button
            variant="tertiary"
            onClick={() => {
              setCategory('');
              setArea('');
              setPriceMax(null);
            }}>
            
              Reset
            </Button>
            <Button onClick={() => setFiltersOpen(false)}>Terapkan</Button>
          </>
        }>
        
        <FeedFilters
          scope={scope}
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
          area={area}
          onAreaChange={setArea}
          areaOptions={areaOptions}
          priceMax={priceMax}
          onPriceMaxChange={setPriceMax}
          showSearch={false} />
        
      </Modal>

      <OfferModal job={offerJob} open={Boolean(offerJob)} onClose={() => setOfferJob(null)} />
    </div>);

}