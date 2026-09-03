import { SparklesIcon } from 'lucide-react';
import type { WorkType } from '../../types';
import { Input } from '../ui/Input';
import { SearchInput } from '../ui/SearchInput';
import { KERJA_CEPAT_CATEGORIES, PROYEK_CATEGORIES } from '../../data/reference';
import { cn } from '../../utils/cn';

export type FilterScope = WorkType | 'home';

interface FeedFiltersProps {
  scope: FilterScope;
  query: string;
  onQueryChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  area: string;
  onAreaChange: (value: string) => void;
  areaOptions: string[];
  showSearch?: boolean;
  priceMax: number | null;
  onPriceMaxChange: (value: number | null) => void;
  // Dipanggil saat user menekan Enter di kotak pencarian. Feed yang memutuskan apakah kalimatnya
  // layak dikirim ke asisten.
  onAssistantSubmit?: () => void;
  assistantBusy?: boolean;
}

export function FeedFilters({
  scope,
  query,
  onQueryChange,
  category,
  onCategoryChange,
  area,
  onAreaChange,
  areaOptions,
  showSearch = true,
  priceMax,
  onPriceMaxChange,
  onAssistantSubmit,
  assistantBusy
}: FeedFiltersProps) {
  const categories =
  scope === 'kerja-cepat' ?
  KERJA_CEPAT_CATEGORIES :
  scope === 'proyek' ?
  PROYEK_CATEGORIES :
  [...KERJA_CEPAT_CATEGORIES, ...PROYEK_CATEGORIES];
  const showArea = scope !== 'proyek' && areaOptions.length > 0;

  const chip = (active: boolean) =>
  cn(
    'border px-2.5 py-1 text-left text-[12px] font-medium transition-colors duration-150 ease-out',
    active ?
    'border-transparent bg-inverse-bg text-inverse-ink' :
    'border-line-strong text-muted hover:border-ink hover:text-ink'
  );

  return (
    <div className="flex flex-col gap-6">
      {showSearch ?
      <div>
          <label
          htmlFor="feed-search"
          className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          
            <SparklesIcon className="h-3 w-3" aria-hidden />
            Asisten pencarian
          </label>
          <SearchInput
          id="feed-search"
          size="lg"
          busy={assistantBusy}
          value={query}
          onChange={onQueryChange}
          onSubmit={onAssistantSubmit}
          placeholder="Tulis kalimat, lalu Enter" />
        
          <p className="mt-2 text-[11px] leading-relaxed text-faint">
            Mengetik langsung menyaring dari kata. Tulis kalimat utuh lalu tekan Enter, misalnya
            "desain poster deket kampus di bawah 50 ribu", dan asisten yang memasangkan filternya.
          </p>
        </div> :
      null}

      <fieldset>
        <legend className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Kategori
        </legend>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => onCategoryChange('')} className={chip(!category)}>
            Semua
          </button>
          {categories.map((item) =>
          <button
            key={item}
            type="button"
            onClick={() => onCategoryChange(category === item ? '' : item)}
            className={chip(category === item)}>
            
              {item}
            </button>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
          Harga maksimal
        </legend>
        <Input
          id="feed-price-max"
          prefix="Rp"
          inputMode="numeric"
          value={priceMax === null ? '' : String(priceMax)}
          placeholder="Tanpa batas"
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '');
            onPriceMaxChange(digits ? Number(digits) : null);
          }} />
        
      </fieldset>

      {showArea ?
      <fieldset>
          <legend className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
            Area
          </legend>
          <div className="flex flex-col items-start gap-1.5">
            <button type="button" onClick={() => onAreaChange('')} className={chip(!area)}>
              Semua area
            </button>
            {areaOptions.map((item) =>
          <button
            key={item}
            type="button"
            onClick={() => onAreaChange(area === item ? '' : item)}
            className={chip(area === item)}>
            
                {item}
              </button>
          )}
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-faint">
            Area berupa penanda umum di kampus, bukan lokasi presisi.
          </p>
        </fieldset> :
      null}
    </div>);

}