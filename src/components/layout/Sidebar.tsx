import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BellIcon,
  CompassIcon,
  FileTextIcon,
  HomeIcon,
  LayersIcon,
  LogOutIcon,
  MessageSquareIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
  XIcon } from
'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import { cn } from '../../utils/cn';

const LINKS = [
{ to: '/home', label: 'Home', icon: HomeIcon },
{ to: '/notifikasi', label: 'Notifikasi', icon: BellIcon, badge: 'notif' as const },
{ to: '/chat', label: 'Chat', icon: MessageSquareIcon, badge: 'chat' as const },
{ to: '/aktivitas', label: 'Aktivitas Saya', icon: LayersIcon },
{ to: '/profil', label: 'Profil', icon: UserIcon },
{ to: '/career-compass', label: 'Career Compass', icon: CompassIcon },
{ to: '/pengaturan', label: 'Settings', icon: SettingsIcon },
{ to: '/syarat-ketentuan', label: 'Syarat & Ketentuan', icon: FileTextIcon }];


interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, chatUnreadCount } = useNotifications();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-[65]">
          <motion.button
          type="button"
          aria-label="Tutup menu"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 cursor-default bg-black/50" />
        
          <motion.aside
          aria-label="Menu"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
          className="absolute right-0 top-0 flex h-full w-[86%] max-w-xs flex-col border-l border-line bg-surface">
          
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                Menu
              </span>
              <button
              type="button"
              onClick={onClose}
              aria-label="Tutup menu"
              className="p-1 text-muted transition-colors duration-150 ease-out hover:text-ink">
              
                <XIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              {LINKS.map(({ to, label, icon: Icon, badge }) => {
              const count = badge === 'notif' ? unreadCount : badge === 'chat' ? chatUnreadCount : 0;
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-5 py-3 text-sm transition-colors duration-150 ease-out',
                    isActive ?
                    'bg-subtle font-semibold text-ink' :
                    'text-muted hover:bg-subtle hover:text-ink'
                  )
                  }>

                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {label}
                    {count > 0 ?
                  <span className="ml-auto flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
                        {count > 9 ? '9+' : count}
                      </span> :
                  null}
                  </NavLink>);

            })}
            </nav>

            <div className="border-t border-line px-3 py-3">
              <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 px-2 py-2.5 text-sm text-muted transition-colors duration-150 ease-out hover:text-ink">
              
                {theme === 'dark' ?
              <SunIcon className="h-4 w-4" aria-hidden /> :

              <MoonIcon className="h-4 w-4" aria-hidden />
              }
                {theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
              </button>
              <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/');
              }}
              className="flex w-full items-center gap-3 px-2 py-2.5 text-sm text-muted transition-colors duration-150 ease-out hover:text-ink">
              
                <LogOutIcon className="h-4 w-4" aria-hidden />
                Logout
              </button>
            </div>
          </motion.aside>
        </div> :
      null}
    </AnimatePresence>);

}