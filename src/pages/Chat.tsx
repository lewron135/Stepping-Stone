import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, MessageSquareIcon, SendIcon } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useStore } from '../contexts/StoreContext';
import { incomingQueue } from '../data/interactions';
import { clockTime, deadlineLabel, rupiah, timeAgo } from '../utils/format';
import { cn } from '../utils/cn';

const POLL_MS = 2500;

export function Chat() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const {
    threads,
    messagesForThread,
    getJob,
    getUser,
    currentUser,
    sendMessage,
    receiveMessage,
    agreementForJob
  } = useStore();

  const [draft, setDraft] = useState('');
  const deliveredRef = useRef<Record<string, number>>({});
  const tickRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((thread) => thread.id === threadId);
  const messages = useMemo(
    () => activeThread ? messagesForThread(activeThread.id) : [],
    [activeThread, messagesForThread]
  );

  // Polling: chat refreshes every few seconds instead of a live socket.
  useEffect(() => {
    if (!activeThread) return;
    const queue = incomingQueue[activeThread.id] ?? [];
    const timer = window.setInterval(() => {
      tickRef.current += 1;
      if (tickRef.current % 3 !== 0) return;
      const delivered = deliveredRef.current[activeThread.id] ?? 0;
      if (delivered >= queue.length) return;
      deliveredRef.current[activeThread.id] = delivered + 1;
      const other = activeThread.participantIds.find((id) => id !== currentUser.id);
      if (other) receiveMessage(activeThread.id, queue[delivered], other);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [activeThread, currentUser.id, receiveMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, threadId]);

  const submit = () => {
    if (!activeThread || !draft.trim()) return;
    sendMessage(activeThread.id, draft.trim());
    setDraft('');
  };

  const list =
  <div className={cn('min-w-0 border-line lg:border-r', threadId ? 'hidden lg:block' : 'block')}>
      <div className="border-b border-line px-4 py-3">
        <h1 className="text-[16px] font-bold tracking-tight text-ink">Chat</h1>
        <p className="mt-0.5 text-[12px] text-muted">Negosiasi sebelum kesepakatan dikunci.</p>
      </div>
      <div className="divide-y divide-line">
        {threads.map((thread) => {
        const job = getJob(thread.jobId);
        const other = getUser(thread.participantIds.find((id) => id !== currentUser.id) ?? '');
        const threadMessages = messagesForThread(thread.id);
        const last = threadMessages[threadMessages.length - 1];
        return (
          <Link
            key={thread.id}
            to={`/chat/${thread.id}`}
            className={cn(
              'flex gap-3 px-4 py-3.5 transition-colors duration-150 ease-out hover:bg-subtle',
              thread.id === threadId && 'bg-subtle'
            )}>
            
              <Avatar name={other.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="truncate text-[13.5px] font-semibold tracking-tight text-ink">
                    {other.name}
                  </p>
                  {last ?
                <span className="ml-auto shrink-0 text-[11px] text-faint">
                      {timeAgo(last.createdAt)}
                    </span> :
                null}
                </div>
                <p className="truncate text-[12px] text-muted">{job?.title}</p>
                {last ?
              <p className="mt-1 truncate text-[12.5px] text-muted">
                    {last.senderId === currentUser.id ? 'Kamu: ' : ''}
                    {last.text}
                  </p> :
              null}
              </div>
            </Link>);

      })}
      </div>
    </div>;


  if (!threadId) {
    return (
      <div className="grid grid-cols-1 border-b border-line py-0 lg:grid-cols-[340px_minmax(0,1fr)]">
        {list}
        <div className="hidden items-center justify-center p-10 lg:flex">
          <EmptyState
            className="w-full border-0"
            icon={<MessageSquareIcon className="h-6 w-6" aria-hidden />}
            title="Pilih satu percakapan"
            description="Setiap percakapan selalu terikat ke satu pekerjaan, supaya negosiasi tidak melebar." />
          
        </div>
      </div>);

  }

  if (!activeThread) {
    return (
      <div className="py-10">
        <EmptyState
          icon={<MessageSquareIcon className="h-6 w-6" aria-hidden />}
          title="Percakapan tidak ditemukan"
          description="Percakapan ini sudah tidak tersedia."
          action={
          <Button variant="secondary" size="sm" onClick={() => navigate('/chat')}>
              Kembali ke daftar chat
            </Button>
          } />
        
      </div>);

  }

  const job = getJob(activeThread.jobId);
  const other = getUser(activeThread.participantIds.find((id) => id !== currentUser.id) ?? '');
  const agreement = job ? agreementForJob(job.id) : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)]">
      {list}

      <section className="flex min-w-0 flex-col" aria-label={`Percakapan dengan ${other.name}`}>
        {/* Sticky job context — the conversation always names the job it belongs to */}
        <div className="sticky top-[6.2rem] z-20 border-b border-line bg-canvas/95 backdrop-blur sm:top-14">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => navigate('/chat')}
              aria-label="Kembali ke daftar chat"
              className="-ml-1 p-1 text-muted transition-colors duration-150 ease-out hover:text-ink lg:hidden">
              
              <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            </button>
            <Avatar name={other.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold tracking-tight text-ink">
                {other.name}
              </p>
              <p className="text-[11.5px] text-faint">Diperbarui otomatis tiap 3 detik</p>
            </div>
            <Link to={`/u/${other.handle}`} className="ml-auto hidden sm:block">
              <Button variant="tertiary" size="sm">
                Profil
              </Button>
            </Link>
          </div>

          {job ?
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line bg-subtle px-4 py-2.5">
              <Badge tone="outline">{job.type === 'kerja-cepat' ? 'Kerja Cepat' : 'Proyek'}</Badge>
              <Link
              to={`/pekerjaan/${job.id}`}
              className="min-w-0 truncate text-[13px] font-semibold text-ink hover:underline">
              
                {job.title}
              </Link>
              <span className="text-[12px] tabular-nums text-muted">{rupiah(job.price)}</span>
              <span className="text-[12px] text-muted">{deadlineLabel(job.deadline)}</span>
              {agreement ?
            <Link
              to={`/kesepakatan/${agreement.id}`}
              className="ml-auto text-[12px] font-semibold text-ink hover:underline">
              
                  Buka kesepakatan
                </Link> :
            null}
            </div> :
          null}
        </div>

        <div
          ref={scrollRef}
          className="flex min-h-[52vh] flex-1 flex-col gap-3 overflow-y-auto px-4 py-5 lg:max-h-[calc(100vh-16rem)]">
          
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const mine = message.senderId === currentUser.id;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  
                  <div
                    className={cn(
                      'max-w-[80%] border px-3 py-2 sm:max-w-[70%]',
                      mine ?
                      'border-transparent bg-inverse-bg text-inverse-ink' :
                      'border-line bg-surface text-ink'
                    )}>
                    
                    <p className="text-[13.5px] leading-relaxed">{message.text}</p>
                    <p
                      className={cn(
                        'mt-1 text-[10.5px] tabular-nums',
                        mine ? 'opacity-60' : 'text-faint'
                      )}>
                      
                      {clockTime(message.createdAt)}
                    </p>
                  </div>
                </motion.div>);

            })}
          </AnimatePresence>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="sticky bottom-0 flex items-center gap-2 border-t border-line bg-canvas px-4 py-3">
          
          <label htmlFor="chat-draft" className="sr-only">
            Tulis pesan
          </label>
          <input
            id="chat-draft"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Tulis pesan tentang pekerjaan ini"
            className="h-11 min-w-0 flex-1 border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-faint transition-colors duration-150 ease-out focus:border-ink focus:outline-none" />
          
          <Button
            type="submit"
            className="h-11 px-4"
            disabled={!draft.trim()}
            icon={<SendIcon className="h-4 w-4" aria-hidden />}>
            
            <span className="hidden sm:inline">Kirim</span>
          </Button>
        </form>
      </section>
    </div>);

}