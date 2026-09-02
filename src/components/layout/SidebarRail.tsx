import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BellIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CompassIcon,
  FileTextIcon,
  HomeIcon,
  LayersIcon,
  LogOutIcon,
  MessageSquareIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserIcon } from
'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLogout } from '../../hooks/useLogout';
import { useNotifications } from '../../hooks/useNotifications';
import { cn } from '../../utils/cn';

const NAV_LINKS = [
{ to: '/home', label: 'Home', icon: HomeIcon },
{ to: '/notifikasi', label: 'Notifikasi', icon: BellIcon, badge: 'notif' as const },
{ to: '/chat', label: 'Chat', icon: MessageSquareIcon, badge: 'chat' as const },
{ to: '/aktivitas', label: 'Aktivitas Saya', icon: LayersIcon },
{ to: '/profil', label: 'Profil', icon: UserIcon },
{ to: '/career-compass', label: 'Career Compass', icon: CompassIcon }];


const FOOTER_LINKS = [
{ to: '/pengaturan', label: 'Settings', icon: SettingsIcon },
{ to: '/syarat-ketentuan', label: 'Syarat & Ketentuan', icon: FileTextIcon }];


const EXPANDED_KEY = 'ss:sidebar:expanded';

function CountDot({ count }: {count: number;}) {
  return (
    <span
      aria-hidden
      className="absolute -right-1 -top-1 flex h-3 min-w-[12px] items-center justify-center rounded-full bg-danger px-0.5 text-[8px] font-bold leading-none text-white">

      {count > 9 ? '9+' : count}
    </span>);

}

const itemClass = (active: boolean) =>
cn(
  'relative flex w-full items-center gap-3 px-[18px] py-3 text-sm transition-colors duration-150 ease-out',
  active ? 'bg-subtle font-semibold text-ink' : 'text-muted hover:bg-subtle hover:text-ink'
);

export function SidebarRail() {
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, chatUnreadCount } = useNotifications();

  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem(EXPANDED_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(EXPANDED_KEY, expanded ? '1' : '0');
    } catch {
      // per-browser convenience only, safe to skip if storage is blocked
    }
  }, [expanded]);

  return (
    <aside
      className={cn(
        'sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 ease-out lg:flex',
        expanded ? 'w-60' : 'w-16'
      )}>

      <div className="flex items-center justify-end border-b border-line px-3 py-3">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? 'Ciutkan menu' : 'Lebarkan menu'}
          className="p-1.5 text-muted transition-colors duration-150 ease-out hover:bg-subtle hover:text-ink">

          {expanded ?
          <ChevronsLeftIcon className="h-4 w-4" aria-hidden /> :

          <ChevronsRightIcon className="h-4 w-4" aria-hidden />
          }
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_LINKS.map(({ to, label, icon: Icon, badge }) => {
          const count = badge === 'notif' ? unreadCount : badge === 'chat' ? chatUnreadCount : 0;
          return (
            <NavLink key={to} to={to} className={({ isActive }) => itemClass(isActive)}>
              <span className="relative shrink-0">
                <Icon className="h-4 w-4" aria-hidden />
                {count > 0 ? <CountDot count={count} /> : null}
              </span>
              {expanded ? <span className="truncate">{label}</span> : null}
            </NavLink>);

        })}
      </nav>

      <div className="border-t border-line py-2">
        {FOOTER_LINKS.map(({ to, label, icon: Icon }) =>
        <NavLink key={to} to={to} className={({ isActive }) => itemClass(isActive)}>
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {expanded ? <span className="truncate">{label}</span> : null}
          </NavLink>
        )}
        <button type="button" onClick={toggleTheme} className={itemClass(false)}>
          {theme === 'dark' ?
          <SunIcon className="h-4 w-4 shrink-0" aria-hidden /> :

          <MoonIcon className="h-4 w-4 shrink-0" aria-hidden />
          }
          {expanded ? <span className="truncate">{theme === 'dark' ? 'Mode terang' : 'Mode gelap'}</span> : null}
        </button>
        <button type="button" onClick={() => void logout()} className={itemClass(false)}>
          <LogOutIcon className="h-4 w-4 shrink-0" aria-hidden />
          {expanded ? <span className="truncate">Logout</span> : null}
        </button>
      </div>
    </aside>);

}
