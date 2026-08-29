import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Agreement, Job, Message, Offer, Thread, User } from '../types';
import { users as seedUsers } from '../data/users';
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
  users: User[];
  jobs: Job[];
  offers: Offer[];
  agreements: Agreement[];
  threads: Thread[];
  messages: Message[];
  getUser: (id: string) => User | undefined;
  ensureUser: (id: string) => Promise<void>;
  getJob: (id: string) => Job | undefined;
  offersForJob: (jobId: string) => Promise<Offer[]>;
  agreementForJob: (jobId: string) => Promise<Agreement | undefined>;
  myOfferForJob: (jobId: string) => Offer | undefined;
  threadForJob: (jobId: string, otherUserId: string) => Thread;
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
  sendMessage: (threadId: string, text: string, senderId?: string) => void;
  receiveMessage: (threadId: string, text: string, senderId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

let counter = 100;
const nextId = (prefix: string) => `${prefix}${++counter}`;

export function StoreProvider({ children }: {children: React.ReactNode;}) {
  const { userId } = useAuth();

  const [users, setUsers] = useState<User[]>(seedUsers);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        if (userId) {
          const [user, jobsList, offersList, agreementsList] = await Promise.all([
          api.fetchUser(userId),
          api.fetchJobs(),
          api.fetchMyOffers(userId),
          api.fetchMyAgreements(userId)]
          );
          if (cancelled) return;
          setCurrentUser(user ?? null);
          setJobs(jobsList);
          setOffers(offersList);
          setAgreements(agreementsList);
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

  const bumpStat = useCallback((userId: string, key: keyof User['stats']) => {
    setUsers((prev) =>
    prev.map((user) =>
    user.id === userId ? { ...user, stats: { ...user.stats, [key]: user.stats[key] + 1 } } : user
    )
    );
  }, []);

  const value = useMemo<StoreValue>(() => {
    const getJob = (id: string) => jobs.find((job) => job.id === id);

    return {
      currentUser,
      loading,
      users,
      jobs,
      offers,
      agreements,
      threads,
      messages,
      getUser,
      ensureUser,
      getJob,
      offersForJob: (jobId) => api.fetchOffersForJob(jobId),
      agreementForJob: (jobId) => api.fetchAgreementForJob(jobId),
      myOfferForJob: (jobId) =>
      offers.find((offer) => offer.jobId === jobId && offer.workerId === currentUser.id),
      messagesForThread: (threadId) => api.fetchMessagesForThread(threadId),

      threadForJob: (jobId, otherUserId) => {
        const existing = threads.find(
          (thread) =>
          thread.jobId === jobId &&
          thread.participantIds.includes(currentUser.id) &&
          thread.participantIds.includes(otherUserId)
        );
        if (existing) return existing;
        const thread: Thread = {
          id: nextId('t'),
          jobId,
          participantIds: [currentUser.id, otherUserId]
        };
        setThreads((prev) => [...prev, thread]);
        return thread;
      },

      createJob: async (input) => {
        try {
          const job = await api.createJob(input);
          setJobs((prev) => [job, ...prev]);
          return job;
        } catch (error) {
          throw error;
        }
      },

      submitOffer: async (jobId, price, note) => {
        try {
          const offer = await api.submitOffer(jobId, price, note);
          setOffers((prev) => [offer, ...prev]);
        } catch (error) {
          throw error;
        }
      },

      selectOffer: async (offerId) => {
        try {
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
            setJobs((prev) =>
            prev.map((item) => item.id === refreshedJob.id ? refreshedJob : item)
            );
          }
          return updated.id;
        } catch (error) {
          throw error;
        }
      },

      agree: async (agreementId) => {
        try {
          const updated = await api.agree(agreementId);
          setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
        } catch (error) {
          throw error;
        }
      },

      submitProof: async (agreementId, note, imageUrl) => {
        try {
          const updated = await api.submitProof(agreementId, note, imageUrl);
          setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
        } catch (error) {
          throw error;
        }
      },

      confirmCompletion: async (agreementId, rating, testimonial) => {
        try {
          const updated = await api.confirmCompletion(agreementId, rating, testimonial);
          setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
          bumpStat(updated.workerId, 'completed');
        } catch (error) {
          throw error;
        }
      },

      closeWithoutConfirmation: async (agreementId) => {
        try {
          const updated = await api.closeWithoutConfirmation(agreementId);
          setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
        } catch (error) {
          throw error;
        }
      },

      cancelAgreement: async (agreementId) => {
        try {
          const updated = await api.cancelAgreement(agreementId);
          setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
          if (updated.cancelledBy) bumpStat(updated.cancelledBy, 'cancelled');
        } catch (error) {
          throw error;
        }
      },

      reportUnpaid: async (agreementId) => {
        try {
          const updated = await api.reportUnpaid(agreementId);
          setAgreements((prev) => prev.map((item) => item.id === agreementId ? updated : item));
          bumpStat(updated.clientId, 'unpaidReports');
        } catch (error) {
          throw error;
        }
      },

      sendMessage: (threadId, text, senderId) => {
        setMessages((prev) => [
        ...prev,
        {
          id: nextId('m'),
          threadId,
          senderId: senderId ?? currentUser.id,
          text,
          createdAt: new Date().toISOString()
        }]
        );
      },

      receiveMessage: (threadId, text, senderId) => {
        setMessages((prev) => [
        ...prev,
        { id: nextId('m'), threadId, senderId, text, createdAt: new Date().toISOString() }]
        );
      }
    };
  }, [agreements, bumpStat, currentUser, getUser, jobs, loading, messages, offers, threads, users]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}