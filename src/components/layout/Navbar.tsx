import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { MenuIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';
import { SearchInput } from '../ui/SearchInput';
import { Dropdown } from '../ui/Dropdown';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

const TABS = [
{ to: '/kerja-cepat', label: 'Kerja Cepat' },
{ to: '/proyek', label: 'Proyek' }];


export function Navbar({ onOpenMenu }: {onOpenMenu: () => void;}) {
  const { currentUser } = useStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState(false);

  const submitSearch = (value: string) => {
    const base = location.pathname.startsWith('/proyek') ? '/proyek' : '/kerja-cepat';
    navigate(value ? `${base}?q=${encodeURIComponent(value)}` : base);
  };

  const tabClass = ({ isActive }: {isActive: boolean;}) =>
  cn(
    'relative flex items-center px-1 py-1 text-sm font-semibold tracking-tight transition-colors duration-150 ease-out',
    isActive ? 'text-ink' : 'text-muted hover:text-ink'
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          to="/home"
          className="shrink-0 whitespace-nowrap text-[12px] font-extrabold uppercase leading-none tracking-[0.12em] text-ink sm:text-[13px] sm:tracking-[0.14em]">
          
          Stepping Stone
        </Link>

        <nav aria-label="Jenis pekerjaan" className="ml-2 hidden items-center gap-6 sm:flex">
          {TABS.map((tab) =>
          <NavLink key={tab.to} to={tab.to} className={tabClass}>
              {({ isActive }) =>
            <>
                  {tab.label}
                  <span
                className={cn(
                  'absolute -bottom-[17px] left-0 right-0 h-0.5 transition-opacity duration-150 ease-out',
                  isActive ? 'bg-ink opacity-100' : 'opacity-0'
                )} />
              
                </>
            }
            </NavLink>
          )}
        </nav>

        <div className="ml-auto hidden w-64 lg:block">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch(query);
            }}>
            
            <SearchInput value={query} onChange={setQuery} placeholder="Cari pekerjaan" />
          </form>
        </div>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <IconButton
            label="Cari"
            className="lg:hidden"
            onClick={() => setMobileSearch((prev) => !prev)}>
            
            <SearchIcon className="h-[18px] w-[18px]" aria-hidden />
          </IconButton>
          <IconButton label="Pasang pekerjaan" onClick={() => navigate('/pasang-pekerjaan')}>
            <PlusIcon className="h-[18px] w-[18px]" aria-hidden />
          </IconButton>
          <IconButton
            label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
            onClick={toggleTheme}
            className="hidden sm:inline-flex">
            
            {theme === 'dark' ?
            <SunIcon className="h-[18px] w-[18px]" aria-hidden /> :

            <MoonIcon className="h-[18px] w-[18px]" aria-hidden />
            }
          </IconButton>
          <div className="hidden sm:block">
            <Dropdown
              label="Menu profil"
              trigger={<Avatar name={currentUser.name} size="sm" />}
              items={[
              { label: 'Profil saya', onSelect: () => navigate('/profil') },
              { label: 'Aktivitas Saya', onSelect: () => navigate('/aktivitas') },
              { label: 'Settings', onSelect: () => navigate('/pengaturan') },
              { label: 'Logout', onSelect: () => navigate('/') }]
              } />
            
          </div>
          <IconButton label="Buka menu" onClick={onOpenMenu}>
            <MenuIcon className="h-[18px] w-[18px]" aria-hidden />
          </IconButton>
        </div>
      </div>

      {/* Mobile: work tabs stay visible at all times */}
      <div className="flex items-center gap-6 border-t border-line px-4 sm:hidden">
        {TABS.map((tab) =>
        <NavLink key={tab.to} to={tab.to} className="relative py-2.5">
            {({ isActive }) =>
          <>
                <span
              className={cn(
                'text-sm font-semibold tracking-tight',
                isActive ? 'text-ink' : 'text-muted'
              )}>
              
                  {tab.label}
                </span>
                <span
              className={cn(
                'absolute inset-x-0 bottom-0 h-0.5 transition-opacity duration-150 ease-out',
                isActive ? 'bg-ink opacity-100' : 'opacity-0'
              )} />
            
              </>
          }
          </NavLink>
        )}
      </div>

      {mobileSearch ?
      <div className="border-t border-line px-4 py-2.5 lg:hidden">
          <form
          onSubmit={(event) => {
            event.preventDefault();
            setMobileSearch(false);
            submitSearch(query);
          }}>
          
            <SearchInput value={query} onChange={setQuery} placeholder="Cari pekerjaan" />
          </form>
        </div> :
      null}
    </header>);

}