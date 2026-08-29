import { supabase } from './supabaseClient';
import type {
  Agreement, Job, Message, Offer, Thread, User, PortfolioItem } from
'../types';
import type { NewJobInput } from '../contexts/StoreContext';

function mapJob(row: any): Job {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    title: row.title,
    scope: row.scope,
    deliverable: row.deliverable,
    deadline: row.deadline,
    price: row.price,
    slotsTotal: row.slots_total,
    slotsFilled: row.slots_filled,
    area: row.area ?? undefined,
    tags: row.tags ?? [],
    posterId: row.poster_id,
    createdAt: row.created_at,
    status: row.status
  };
}

function mapOffer(row: any): Offer {
  return {
    id: row.id,
    jobId: row.job_id,
    workerId: row.worker_id,
    price: row.price,
    note: row.note,
    createdAt: row.created_at,
    status: row.status
  };
}

function mapAgreement(row: any): Agreement {
  return {
    id: row.id,
    jobId: row.job_id,
    offerId: row.offer_id,
    clientId: row.client_id,
    workerId: row.worker_id,
    price: row.price,
    adminFee: row.admin_fee,
    deadline: row.deadline,
    clientAgreed: row.client_agreed,
    workerAgreed: row.worker_agreed,
    status: row.status,
    lockedAt: row.locked_at ?? undefined,
    proof: row.proof ?? undefined,
    confirmation: row.confirmation ?? undefined,
    cancelledBy: row.cancelled_by ?? undefined,
    unpaidReported: row.unpaid_reported
  };
}

function mapMessage(row: any): Message {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    text: row.text,
    createdAt: row.created_at
  };
}

function mapThread(row: any): Thread {
  return { id: row.id, jobId: row.job_id, participantIds: row.participant_ids };
}

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapJob);
}

export async function fetchJob(id: string): Promise<Job | undefined> {
  const { data, error } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapJob(data) : undefined;
}

export async function fetchOffersForJob(jobId: string): Promise<Offer[]> {
  const { data, error } = await supabase.from('offers').select('*').eq('job_id', jobId);
  if (error) throw error;
  return (data ?? []).map(mapOffer);
}

export async function fetchAgreementForJob(jobId: string): Promise<Agreement | undefined> {
  const { data, error } = await supabase
    .from('agreements')
    .select('*')
    .eq('job_id', jobId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAgreement(data) : undefined;
}

export async function fetchMyOffers(userId: string): Promise<Offer[]> {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('worker_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapOffer);
}

export async function fetchMyAgreements(userId: string): Promise<Agreement[]> {
  const { data, error } = await supabase
    .from('agreements')
    .select('*')
    .or(`client_id.eq.${userId},worker_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAgreement);
}

export async function fetchMyThreads(userId: string): Promise<Thread[]> {
  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .contains('participant_ids', [userId])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapThread);
}

export async function fetchMessagesForThread(threadId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapMessage);
}

async function buildUserFromProfile(profile: any): Promise<User> {
  const { data: statsRow } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', profile.id)
    .maybeSingle();

  const { data: portfolioRows } = await supabase
    .from('user_portfolio')
    .select('*')
    .eq('user_id', profile.id);

  const portfolio: PortfolioItem[] = (portfolioRows ?? []).map((p: any) => ({
    id: p.agreement_id,
    title: p.title,
    category: p.category,
    workType: p.work_type,
    summary: p.summary,
    deliverable: p.deliverable,
    proofImage: p.proof_image,
    price: p.price,
    completedAt: p.completed_at,
    testimonial: p.testimonial ?
    {
      authorId: '',
      rating: p.testimonial.rating,
      text: p.testimonial.testimonial,
      date: p.testimonial.confirmedAt
    } :
    undefined
  }));

  return {
    id: profile.id,
    handle: profile.handle,
    name: profile.name,
    campus: profile.campus,
    faculty: profile.faculty,
    major: profile.major,
    year: profile.year,
    bio: profile.bio,
    skills: profile.skills ?? [],
    stats: {
      completed: statsRow?.completed ?? 0,
      cancelled: statsRow?.cancelled ?? 0,
      unpaidReports: statsRow?.unpaid_reports ?? 0
    },
    portfolio
  };
}

export async function fetchUser(id: string): Promise<User | undefined> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return undefined;
  return buildUserFromProfile(profile);
}

export async function fetchUserByHandle(handle: string): Promise<User | undefined> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return undefined;
  return buildUserFromProfile(profile);
}

export async function createJob(input: NewJobInput): Promise<Job> {
  const { data, error } = await supabase.rpc('create_job', {
    p_type: input.type,
    p_category: input.category,
    p_title: input.title,
    p_scope: input.scope,
    p_deliverable: input.deliverable,
    p_deadline: input.deadline,
    p_price: input.price,
    p_slots_total: input.slotsTotal,
    p_area: input.area ?? null
  });
  if (error) throw error;
  return mapJob(data);
}

export async function submitOffer(jobId: string, price: number, note: string): Promise<Offer> {
  const { data, error } = await supabase.rpc('submit_offer', {
    p_job_id: jobId,
    p_price: price,
    p_note: note
  });
  if (error) throw error;
  return mapOffer(data);
}

export async function selectOffer(offerId: string): Promise<Agreement> {
  const { data, error } = await supabase.rpc('select_offer', { p_offer_id: offerId });
  if (error) throw error;
  return mapAgreement(data);
}

export async function agree(agreementId: string): Promise<Agreement> {
  const { data, error } = await supabase.rpc('agree_to_agreement', {
    p_agreement_id: agreementId
  });
  if (error) throw error;
  return mapAgreement(data);
}

export async function submitProof(
  agreementId: string,
  note: string,
  imageUrl?: string
): Promise<Agreement> {
  const { data, error } = await supabase.rpc('submit_proof', {
    p_agreement_id: agreementId,
    p_note: note,
    p_image_url: imageUrl ?? null
  });
  if (error) throw error;
  return mapAgreement(data);
}

export async function confirmCompletion(
  agreementId: string,
  rating: number,
  testimonial: string
): Promise<Agreement> {
  const { data, error } = await supabase.rpc('confirm_completion', {
    p_agreement_id: agreementId,
    p_rating: rating,
    p_testimonial: testimonial
  });
  if (error) throw error;
  return mapAgreement(data);
}

export async function closeWithoutConfirmation(agreementId: string): Promise<Agreement> {
  const { data, error } = await supabase.rpc('close_without_confirmation', {
    p_agreement_id: agreementId
  });
  if (error) throw error;
  return mapAgreement(data);
}

export async function cancelAgreement(agreementId: string): Promise<Agreement> {
  const { data, error } = await supabase.rpc('cancel_agreement', {
    p_agreement_id: agreementId
  });
  if (error) throw error;
  return mapAgreement(data);
}

export async function reportUnpaid(agreementId: string): Promise<Agreement> {
  const { data, error } = await supabase.rpc('report_unpaid', {
    p_agreement_id: agreementId
  });
  if (error) throw error;
  return mapAgreement(data);
}

export async function getOrCreateThread(jobId: string, otherUserId: string): Promise<Thread> {
  const { data, error } = await supabase.rpc('get_or_create_thread', {
    p_job_id: jobId,
    p_other_user_id: otherUserId
  });
  if (error) throw error;
  return mapThread(data);
}

export async function sendMessage(threadId: string, text: string): Promise<Message> {
  const { data, error } = await supabase.rpc('send_message', {
    p_thread_id: threadId,
    p_text: text
  });
  if (error) throw error;
  return mapMessage(data);
}

export function pollMessages(
  threadId: string,
  onMessages: (messages: Message[]) => void,
  intervalMs = 2500
): () => void {
  let stopped = false;
  const tick = async () => {
    if (stopped) return;
    try {
      onMessages(await fetchMessagesForThread(threadId));
    } catch (e) {
      console.error('Polling gagal:', e);
    }
  };
  tick();
  const id = setInterval(tick, intervalMs);
  return () => {
    stopped = true;
    clearInterval(id);
  };
}
