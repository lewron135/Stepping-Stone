import type { WorkType } from '../../types';
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
  showSearch = true
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
          <label htmlFor="feed-search" className="sr-only">
            Cari pekerjaan
          </label>
          <SearchInput
          id="feed-search"
          value={query}
          onChange={onQueryChange}
          placeholder={scope === 'kerja-cepat' ? 'Cari kerja cepat' : 'Cari pekerjaan'} />
        
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