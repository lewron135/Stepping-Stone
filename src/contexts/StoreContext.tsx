import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Agreement, Job, Message, Offer, Thread, User } from '../types';
import { useAuth } from './AuthContext';
import * as api from '../lib/api';

export interface NewJobInput {
  type: Job['type'];
  category: string;
  title: string;
  scope: string;
  deliverable: string;
  deadline: string;
  price: number;
  slotsTotal: number;
  area?: string;
}

interface StoreValue {
  currentUser: User | null;
  loading: boolean;
  jobs: Job[];
  offers: Offer[];
  agreements: Agreement[];
  threads: Thread[];
  getUser: (id: string) => User | undefined;
  ensureUser: (id: string) => Promise<void>;
  getJob: (id: string) => Job | undefined;
  offersForJob: (jobId: string) => Promise<Offer[]>;
  agreementForJob: (jobId: string) => Promise<Agreement | undefined>;
  ensureAgreement: (agreementId: string) => Promise<void>;
  myOfferForJob: (jobId: string) => Offer | undefined;
  threadForJob: (jobId: string, otherUserId: string) => Promise<Thread>;
  messagesForThread: (threadId: string) => Promise<Message[]>;
  createJob: (input: NewJobInput) => Promise<Job>;
  submitOffer: (jobId: string, price: number, note: string) => Promise<void>;
  selectOffer: (offerId: string) => Promise<string>;
  agree: (agreementId: string) => Promise<void>;
  submitProof: (agreementId: string, note: string, imageUrl?: string) => Promise<void>;
  confirmCompletion: (agreementId: string, rating: number, testimonial: string) => Promise<void>;
  closeWithoutConfirmation: (agreementId: string) => Promise<void>;
  cancelAgreement: (agreementId: string) => Promise<void>;
  reportUnpaid: (agreementId: string) => Promise<void>;
  sendMessage: (threadId: string, text: string) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: {children: React.ReactNode;}) {
  const { userId } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        if (userId) {
          const [user, jobsList, offersList, agreementsList, threadsList] = await Promise.all([
          api.fetchUser(userId),
          api.fetchJobs(),
          api.fetchMyOffers(userId),
          api.fetchMyAgreements(userId),
          api.fetchMyThreads(userId)]
          );
          if (cancelled) return;
          setCurrentUser(user ?? null);
          setJobs(jobsList);
          setOffers(offersList);
          setAgreements(agreementsList);
          setThreads(threadsList);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const userCacheRef = useRef<Record<string, User>>({});
  const pendingUserFetches = useRef<Map<string, Promise<void>>>(new Map());

  useEffect(() => {
    userCacheRef.current = userCache;
  }, [userCache]);

  const ensureUser = useCallback(async (id: string) => {
    if (userCacheRef.current[id]) return;
    let pending = pendingUserFetches.current.get(id);
    if (!pending) {
      pending = api.fetchUser(id).then((user) => {
        if (user) setUserCache((prev) => ({ ...prev, [id]: user }));
      }).finally(() => {
        pendingUserFetches.current.delete(id);
      });
      pendingUserFetches.current.set(id, pending);
    }
    await pending;
  }, []);

  const getUser = useCallback((id: string) => userCache[id], [userCache]);

  // Store cuma memuat daftar kesepakatan sekali saat login, jadi kesepakatan yang dibuat atau
  // diubah pihak lain setelah itu tidak pernah ikut masuk. Padahal semua notifikasi kesepakatan
  // mengarah ke /kesepakatan/<id>. Ini menarik satu baris terbaru dari server dan menimpa
  // salinan lama di state. Sengaja useCallback tanpa dependency supaya identitasnya stabil dan
  // aman dipakai sebagai dependency useEffect di halaman.
  const ensureAgreement = useCallback(async (agreementId: string) => {
    const found = await api.fetchAgreement(agreementId);
    if (!found) return;
    setAgreements((prev) => [found, ...prev.filter((item) => item.id !== found.id)]);
  }, []);

  const value = useMemo<StoreValue>(() => {
    const getJob = (id: string) => jobs.find((job) => job.id === id);

    return {
      currentUser,
      loading,
      jobs,
      offers,
      agreements,
      threads,
      getUser,
      ensureUser,
      getJob,
      offersForJob: (jobId) => api.fetchOffersForJob(jobId),
      agreementForJob: (jobId) => api.fetchAgreementForJob(jobId),
      ensureAgreement,
      myOfferForJob: (jobId) =>
      offers.find((offer) => offer.jobId === jobId && offer.workerId === currentUser?.id),
      messagesForThread: (threadId) => api.fetchMessagesForThread(threadId),

      threadForJob: async (jobId, otherUserId) => {
        const thread = await api.getOrCreateThread(jobId, otherUserId);
        setThreads((prev) => [thread, ...prev.filter((item) => item.id !== thread.id)]);
        return thread;
      },

      createJob: async (input) => {
        const job = await api.createJob(input);
        setJobs((prev) => [job, ...prev]);
        return job;
      },

      submitOffer: async (jobId, price, note) => {
        const offer = await api.submitOffer(jobId, price, note);
        setOffers((prev) => [offer, ...prev]);
      },

      selectOffer: async (offerId) => {
        const updated = await api.selectOffer(offerId);
        setAgreements((prev) => [updated, ...prev.filter((item) => item.id !== updated.id)]);
        const [refreshedOffers, refreshedJob] = await Promise.all([
        api.fetchOffersForJob(updated.jobId),
        api.fetchJob(updated.jobId)]
        );
        setOffers((prev) => [
        ...refreshedOffers,
        ...prev.filter((item) => item.jobId !== updated.jobId)]
        );
        if (refreshedJob) {
          setJobs((prev) => prev.map((item) => item.id === refreshedJob.id ? refreshedJob : item));
        }
        return updated.id;
      },

      agree: async (agreementId) => {
        const updated = await api.agree(agreementId);
        setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
      },

      submitProof: async (agreementId, note, imageUrl) => {
        const updated = await api.submitProof(agreementId, note, imageUrl);
        setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
      },

      confirmCompletion: async (agreementId, rating, testimonial) => {
        const updated = await api.confirmCompletion(agreementId, rating, testimonial);
        setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
      },

      closeWithoutConfirmation: async (agreementId) => {
        const updated = await api.closeWithoutConfirmation(agreementId);
        setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
      },

      cancelAgreement: async (agreementId) => {
        const updated = await api.cancelAgreement(agreementId);
        setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
      },

      reportUnpaid: async (agreementId) => {
        const updated = await api.reportUnpaid(agreementId);
        setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
      },

      sendMessage: async (threadId, text) => {
        await api.sendMessage(threadId, text);
      }
    };
  }, [agreements, currentUser, ensureAgreement, ensureUser, getUser, jobs, loading, offers, threads]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
