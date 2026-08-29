import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Agreement, Job, Message, Offer, Role, Thread, User } from '../types';
import { users as seedUsers, findUser } from '../data/users';
import { adminFeeFor } from '../utils/format';
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
  getUser: (id: string) => User;
  getJob: (id: string) => Job | undefined;
  offersForJob: (jobId: string) => Promise<Offer[]>;
  agreementForJob: (jobId: string) => Promise<Agreement | undefined>;
  myOfferForJob: (jobId: string) => Offer | undefined;
  threadForJob: (jobId: string, otherUserId: string) => Thread;
  messagesForThread: (threadId: string) => Promise<Message[]>;
  createJob: (input: NewJobInput) => Job;
  submitOffer: (jobId: string, price: number, note: string) => void;
  selectOffer: (offerId: string) => string;
  agree: (agreementId: string, role: Role) => void;
  submitProof: (agreementId: string, note: string, imageUrl?: string) => void;
  confirmCompletion: (agreementId: string, rating: number, testimonial: string) => void;
  closeWithoutConfirmation: (agreementId: string) => void;
  cancelAgreement: (agreementId: string, byUserId: string) => void;
  reportUnpaid: (agreementId: string) => void;
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
          const [user, jobsList] = await Promise.all([api.fetchUser(userId), api.fetchJobs()]);
          if (cancelled) return;
          setCurrentUser(user ?? null);
          setJobs(jobsList);
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

  const getUser = useCallback(
    (id: string) => users.find((user) => user.id === id) ?? findUser(id),
    [users]
  );

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

      createJob: (input) => {
        const job: Job = {
          id: nextId('j'),
          ...input,
          slotsFilled: 0,
          tags: [input.category.toLowerCase()],
          posterId: currentUser.id,
          createdAt: new Date().toISOString(),
          status: 'open'
        };
        setJobs((prev) => [job, ...prev]);
        return job;
      },

      submitOffer: (jobId, price, note) => {
        const offer: Offer = {
          id: nextId('o'),
          jobId,
          workerId: currentUser.id,
          price,
          note,
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        setOffers((prev) => [offer, ...prev]);
      },

      selectOffer: (offerId) => {
        const offer = offers.find((item) => item.id === offerId);
        if (!offer) return '';
        const job = getJob(offer.jobId);
        if (!job) return '';
        const agreementId = nextId('a');
        setOffers((prev) =>
        prev.map((item) =>
        item.jobId === offer.jobId ?
        { ...item, status: item.id === offerId ? 'selected' : 'declined' } :
        item
        )
        );
        setJobs((prev) =>
        prev.map((item) =>
        item.id === job.id ?
        {
          ...item,
          status: 'in-agreement',
          slotsFilled: Math.min(item.slotsTotal, item.slotsFilled + 1)
        } :
        item
        )
        );
        setAgreements((prev) => [
        {
          id: agreementId,
          jobId: job.id,
          offerId,
          clientId: job.posterId,
          workerId: offer.workerId,
          price: offer.price,
          adminFee: adminFeeFor(offer.price),
          deadline: job.deadline,
          clientAgreed: job.posterId === currentUser.id,
          workerAgreed: offer.workerId === currentUser.id,
          status: 'waiting-approval'
        },
        ...prev]
        );
        return agreementId;
      },

      agree: (agreementId, role) => {
        setAgreements((prev) =>
        prev.map((item) => {
          if (item.id !== agreementId) return item;
          const next = {
            ...item,
            clientAgreed: role === 'client' ? true : item.clientAgreed,
            workerAgreed: role === 'worker' ? true : item.workerAgreed
          };
          if (next.clientAgreed && next.workerAgreed && item.status === 'waiting-approval') {
            return { ...next, status: 'locked', lockedAt: new Date().toISOString() };
          }
          return next;
        })
        );
      },

      submitProof: (agreementId, note, imageUrl) => {
        setAgreements((prev) =>
        prev.map((item) =>
        item.id === agreementId ?
        {
          ...item,
          status: 'waiting-confirmation',
          proof: { note, imageUrl, submittedAt: new Date().toISOString() }
        } :
        item
        )
        );
      },

      confirmCompletion: (agreementId, rating, testimonial) => {
        const agreement = agreements.find((item) => item.id === agreementId);
        setAgreements((prev) =>
        prev.map((item) =>
        item.id === agreementId ?
        {
          ...item,
          status: 'completed',
          confirmation: { rating, testimonial, confirmedAt: new Date().toISOString() }
        } :
        item
        )
        );
        if (agreement) bumpStat(agreement.workerId, 'completed');
      },

      closeWithoutConfirmation: (agreementId) => {
        setAgreements((prev) =>
        prev.map((item) =>
        item.id === agreementId ? { ...item, status: 'completed-unconfirmed' } : item
        )
        );
      },

      cancelAgreement: (agreementId, byUserId) => {
        setAgreements((prev) =>
        prev.map((item) =>
        item.id === agreementId ? { ...item, status: 'cancelled', cancelledBy: byUserId } : item
        )
        );
        bumpStat(byUserId, 'cancelled');
      },

      reportUnpaid: (agreementId) => {
        const agreement = agreements.find((item) => item.id === agreementId);
        setAgreements((prev) =>
        prev.map((item) => item.id === agreementId ? { ...item, unpaidReported: true } : item)
        );
        if (agreement) bumpStat(agreement.clientId, 'unpaidReports');
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