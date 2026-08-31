import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import * as api from '../lib/api';
import type { AppNotification, Message } from '../types';

const POLL_MS = 20000;
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

// Kesepakatan yang batas 2 harinya sudah kita coba tutup di sesi ini. Disimpan di level modul,
// bukan di dalam hook, karena useNotifications dipakai bersamaan oleh SidebarRail, halaman
// Chat, dan halaman Notifikasi. Tanpa ini, satu kesepakatan yang lewat tenggat akan memicu
// tiga panggilan RPC sekaligus.
const timeoutRequested = new Set<string>();

function readMap(key: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMap(key: string, value: Record<string, string>) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (private mode / storage blocked), badge just won't persist across reloads
  }
}

export function useNotifications() {
  const { currentUser, threads, agreements, closeWithoutConfirmation } = useStore();
  const userId = currentUser?.id;

  // Notifikasi kesepakatan datang dari tabel notifications, diisi oleh trigger Postgres
  // (lihat supabase/migrations/0003). Polling, bukan WebSocket, sesuai masterplan 11.1.
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    let cancelled = false;
    const tick = async () => {
      try {
        const list = await api.fetchNotifications(userId);
        if (!cancelled) setItems(list);
      } catch (error) {
        // Tidak ditampilkan sebagai toast karena ini polling latar belakang, tapi harus tetap
        // kelihatan di console. Tanpa ini, tabel yang belum ada atau RLS yang menolak akan
        // terlihat persis sama dengan "memang belum ada notifikasi".
        console.error('Gagal memuat notifikasi:', error);
      }
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [userId]);

  const unreadCount = useMemo(() => items.filter((item) => !item.readAt).length, [items]);

  const markNotificationsSeen = useCallback(async () => {
    if (!userId) return;
    const seenAt = new Date().toISOString();
    setItems((prev) => prev.map((item) => item.readAt ? item : { ...item, readAt: seenAt }));
    try {
      await api.markNotificationsRead(userId);
    } catch (error) {
      console.error('Gagal menandai notifikasi terbaca:', error);
    }
  }, [userId]);

  const dismiss = useCallback(async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await api.dismissNotification(id);
    } catch (error) {
      console.error('Gagal menghapus notifikasi:', error);
    }
  }, []);

  // Batas 2 hari konfirmasi klien. Sesuai masterplan 11.2 ini dihitung saat halaman dibuka,
  // bukan lewat cron job. Pengecekan sengaja cuma dari sisi klien karena ini konsekuensi dari
  // inaksi klien. Syaratnya divalidasi ulang di server lewat trigger agreement_timeout_guard,
  // jadi jam browser yang meleset tidak bisa mempercepat penutupan.
  useEffect(() => {
    if (!userId) return;
    agreements.forEach((agreement) => {
      if (agreement.status !== 'waiting-confirmation') return;
      if (agreement.clientId !== userId) return;
      if (!agreement.proof) return;
      if (timeoutRequested.has(agreement.id)) return;
      const elapsed = Date.now() - new Date(agreement.proof.submittedAt).getTime();
      if (elapsed <= TWO_DAYS_MS) return;

      // Ditandai sebelum panggilan dikirim, dan sengaja tidak dilepas kalau gagal, supaya
      // kegagalan permanen (misal server menolak karena selisih jam) tidak jadi loop.
      // Percobaan berikutnya terjadi setelah halaman di-refresh.
      timeoutRequested.add(agreement.id);
      closeWithoutConfirmation(agreement.id).catch(() => {
        // tidak ada yang perlu ditampilkan ke user, ini pekerjaan latar belakang
      });
    });
  }, [userId, agreements, closeWithoutConfirmation]);

  // ---------------------------------------------------------------------------------------
  // Badge chat. Sistem terpisah dari notifikasi di atas: statusnya "sudah dibuka sampai kapan"
  // per percakapan, disimpan di localStorage karena murni kenyamanan per-browser.
  // ---------------------------------------------------------------------------------------

  const [inboundMessages, setInboundMessages] = useState<Message[]>([]);
  const threadIdsKey = threads.map((thread) => thread.id).join(',');

  useEffect(() => {
    if (!userId) {
      setInboundMessages([]);
      return;
    }
    let cancelled = false;
    const threadIds = threadIdsKey ? threadIdsKey.split(',') : [];
    const tick = async () => {
      try {
        const list = await api.fetchInboundMessages(userId, threadIds);
        if (!cancelled) setInboundMessages(list);
      } catch (error) {
        console.error('Gagal memuat pesan masuk:', error);
      }
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [userId, threadIdsKey]);

  const chatLastSeenKey = userId ? `ss:chat:lastSeenByThread:${userId}` : '';
  const [chatLastSeenByThread, setChatLastSeenByThread] = useState<Record<string, string>>(() =>
    readMap(chatLastSeenKey)
  );

  // re-read from storage when the logged-in user changes (key changes)
  useEffect(() => {
    setChatLastSeenByThread(readMap(chatLastSeenKey));
  }, [chatLastSeenKey]);

  // Jumlah pesan masuk yang belum dibaca per percakapan, dipakai untuk badge di daftar chat
  // ("berapa chat baru dari orang ini").
  const unreadByThread = useMemo(() => {
    const map: Record<string, number> = {};
    inboundMessages.forEach((message) => {
      const seenAt = chatLastSeenByThread[message.threadId] ?? '';
      if (message.createdAt > seenAt) {
        map[message.threadId] = (map[message.threadId] ?? 0) + 1;
      }
    });
    return map;
  }, [inboundMessages, chatLastSeenByThread]);

  const chatUnreadCount = useMemo(
    () => Object.values(unreadByThread).reduce((sum, count) => sum + count, 0),
    [unreadByThread]
  );

  const markThreadSeen = useCallback(
    (threadId: string) => {
      if (!chatLastSeenKey) return;
      const now = new Date().toISOString();
      setChatLastSeenByThread((prev) => {
        const next = { ...prev, [threadId]: now };
        writeMap(chatLastSeenKey, next);
        return next;
      });
    },
    [chatLastSeenKey]
  );

  return {
    items,
    unreadCount,
    chatUnreadCount,
    unreadByThread,
    markNotificationsSeen,
    markThreadSeen,
    dismiss
  };
}
