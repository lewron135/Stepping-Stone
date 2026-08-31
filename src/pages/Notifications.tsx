import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, XIcon } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { useNotifications } from '../hooks/useNotifications';
import { timeAgo } from '../utils/format';

export function Notifications() {
  const { items, markNotificationsSeen, dismiss } = useNotifications();

  // Menandai dibaca sekarang menulis ke server, bukan ke localStorage. Identitas fungsinya
  // cuma berubah kalau user yang login berganti, jadi aman jadi dependency dan tidak perlu
  // lagi mematikan aturan exhaustive-deps.
  useEffect(() => {
    markNotificationsSeen();
  }, [markNotificationsSeen]);

  return (
    <div className="py-6">
      <h1 className="text-[24px] font-bold tracking-tightest text-ink sm:text-[30px]">
        Notifikasi
      </h1>
      <p className="mt-1.5 max-w-lg text-[13.5px] leading-relaxed text-muted">
        Aktivitas terbaru dari kerjaan, kesepakatan, dan chat kamu.
      </p>

      <div className="mt-6 border-t border-line">
        {items.length === 0 ?
        <EmptyState
          className="mt-6"
          icon={<BellIcon className="h-6 w-6" aria-hidden />}
          title="Belum ada notifikasi"
          description="Aktivitas baru soal kerjaan dan kesepakatan kamu akan muncul di sini." /> :


        items.map((item) =>
        <div
          key={item.id}
          className="flex items-start gap-4 border-b border-line py-4 transition-colors duration-150 ease-out hover:bg-subtle/60">

              <Link to={item.href} className="min-w-0 flex-1">
                <p className="text-[13.5px] leading-relaxed text-ink">{item.text}</p>
                <p className="mt-1 text-[11.5px] text-faint">{timeAgo(item.createdAt)}</p>
              </Link>
              <button
            type="button"
            aria-label="Hapus notifikasi ini"
            onClick={() => dismiss(item.id)}
            className="shrink-0 p-1 text-faint transition-colors duration-150 ease-out hover:text-ink">

                <XIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
        )
        }
      </div>
    </div>);

}
