export type WorkType = 'kerja-cepat' | 'proyek';

export type JobStatus = 'open' | 'offer-selected' | 'in-agreement' | 'closed';

export type AgreementStatus =
'waiting-approval' |
'locked' |
'in-progress' |
'waiting-confirmation' |
'completed' |
'completed-unconfirmed' |
'cancelled';

export interface UserStats {
  completed: number;
  cancelled: number;
  unpaidReports: number;
}

export interface Testimonial {
  authorId: string;
  rating: number;
  text: string;
  date: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  workType: WorkType;
  summary: string;
  deliverable: string;
  proofImage: string;
  price: number;
  completedAt: string;
  testimonial?: Testimonial;
}

export interface User {
  id: string;
  handle: string;
  name: string;
  campus: string;
  faculty: string;
  major: string;
  year: string;
  bio: string;
  skills: string[];
  stats: UserStats;
  portfolio: PortfolioItem[];
}

export interface Job {
  id: string;
  type: WorkType;
  category: string;
  title: string;
  scope: string;
  deliverable: string;
  deadline: string;
  price: number;
  slotsTotal: number;
  slotsFilled: number;
  area?: string;
  tags: string[];
  posterId: string;
  createdAt: string;
  status: JobStatus;
}

export interface Offer {
  id: string;
  jobId: string;
  workerId: string;
  price: number;
  note: string;
  createdAt: string;
  status: 'pending' | 'selected' | 'declined';
}

export interface Proof {
  imageUrl?: string;
  note: string;
  submittedAt: string;
}

export interface Agreement {
  id: string;
  jobId: string;
  offerId: string;
  clientId: string;
  workerId: string;
  price: number;
  adminFee: number;
  deadline: string;
  clientAgreed: boolean;
  workerAgreed: boolean;
  status: AgreementStatus;
  lockedAt?: string;
  proof?: Proof;
  confirmation?: {rating: number;testimonial: string;confirmedAt: string;};
  cancelledBy?: string;
  unpaidReported?: boolean;
}

export interface JobComment {
  id: string;
  jobId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Thread {
  id: string;
  jobId: string;
  participantIds: string[];
}

export type Role = 'worker' | 'client';

export type NotificationType =
'offer_received' |
'offer_selected' |
'agreement_locked' |
'proof_submitted' |
'completion_confirmed' |
'agreement_cancelled' |
'unpaid_reported' |
'completion_timeout';

// Dinamai AppNotification, bukan Notification, supaya tidak bentrok dengan tipe Notification
// bawaan DOM yang ikut terbaca lewat lib "DOM" di tsconfig.
export interface AppNotification {
  id: string;
  type: NotificationType;
  text: string;
  href: string;
  readAt?: string;
  createdAt: string;
}
