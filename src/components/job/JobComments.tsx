import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircleIcon } from 'lucide-react';
import type { JobComment } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { Textarea } from '../ui/Textarea';
import { useStore } from '../../contexts/StoreContext';
import { useToast } from '../../contexts/ToastContext';
import { COMMENT_MAX_CHARS } from '../../lib/api';
import { timeAgo } from '../../utils/format';

interface JobCommentsProps {
  jobId: string;
  posterId: string;
}

/**
 * Tanya jawab terbuka di satu postingan pekerjaan.
 *
 * Sengaja bukan chat. Chat itu ruang berdua setelah ada minat, komentar itu ruang terbuka
 * sebelum ada komitmen, sehingga satu pertanyaan tidak perlu dijawab berulang kali ke orang
 * yang berbeda.
 */
export function JobComments({ jobId, posterId }: JobCommentsProps) {
  const { commentsForJob, addComment, currentUser, getUser, ensureUser } = useStore();
  const { toast } = useToast();

  const [comments, setComments] = useState<JobComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    commentsForJob(jobId).
    then((list) => {
      if (!cancelled) setComments(list);
    }).
    catch(() => {
      if (!cancelled) setComments([]);
    }).
    finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [commentsForJob, jobId]);

  // Baris komentar cuma membawa id penulisnya, jadi profilnya ditarik terpisah, sekali per
  // orang dan bukan sekali per komentar. `ensureUser` sendiri sudah menyaring yang sudah ada
  // di cache, jadi aman dipanggil berulang.
  useEffect(() => {
    const ids = Array.from(new Set(comments.map((item) => item.authorId)));
    ids.forEach((id) => {
      ensureUser(id).catch(() => {
        // nama yang gagal dimuat tampil sebagai "Pengguna", komentarnya tetap terbaca
      });
    });
  }, [comments, ensureUser]);

  const submit = async () => {
    const clean = text.trim();
    if (!clean || sending) return;

    setSending(true);
    try {
      const created = await addComment(jobId, clean);
      setComments((prev) => [...prev, created]);
      setText('');
    } catch (error) {
      toast('Komentar gagal dikirim', 'Terjadi kesalahan, coba lagi sebentar lagi.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mt-10" aria-labelledby="comments-heading">
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
        <h2 id="comments-heading" className="text-[16px] font-bold tracking-tight text-ink">
          Tanya jawab
        </h2>
        <span className="text-[12.5px] tabular-nums text-muted">
          {comments.length} komentar
        </span>
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
        Tanyakan yang belum jelas dari brief sebelum mengajukan penawaran. Pertanyaan dan
        jawabannya terbuka, jadi ikut menolong orang lain yang bertanya-tanya hal yang sama.
      </p>

      {loading ?
      <p className="mt-4 text-[13px] text-muted">Memuat komentar...</p> :
      comments.length === 0 ?
      <div className="mt-4">
          <EmptyState
          icon={<MessageCircleIcon className="h-6 w-6" aria-hidden />}
          title="Belum ada pertanyaan"
          description="Jadi yang pertama bertanya soal pekerjaan ini." />
        
        </div> :

      <ul className="mt-4 flex flex-col divide-y divide-line">
          {comments.map((comment) => {
          const author = getUser(comment.authorId);
          return (
            <li key={comment.id} className="flex gap-3 py-4">
                <Avatar name={author?.name ?? 'Pengguna'} src={author?.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    {author ?
                  <Link
                    to={`/u/${author.handle}`}
                    className="text-[13.5px] font-semibold tracking-tight text-ink transition-colors duration-150 ease-out hover:text-muted">
                    
                        {author.name}
                      </Link> :

                  <span className="text-[13.5px] font-semibold tracking-tight text-ink">
                        Pengguna
                      </span>
                  }
                    {comment.authorId === posterId ?
                  <Badge tone="outline">Pemasang</Badge> :
                  null}
                    <span className="text-[11.5px] text-faint">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-ink">
                    {comment.text}
                  </p>
                </div>
              </li>);

        })}
        </ul>
      }

      {currentUser ?
      <div className="mt-5">
          <label htmlFor="job-comment" className="sr-only">
            Tulis komentar
          </label>
          <Textarea
          id="job-comment"
          rows={3}
          maxLength={COMMENT_MAX_CHARS}
          value={text}
          placeholder="Tanya soal ruang lingkup, materi yang disediakan, atau tenggatnya."
          onChange={(event) => setText(event.target.value)} />
        
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <span className="text-[11px] tabular-nums text-faint">
              {text.length}/{COMMENT_MAX_CHARS}
            </span>
            <Button size="sm" loading={sending} disabled={!text.trim()} onClick={submit}>
              Kirim komentar
            </Button>
          </div>
        </div> :

      <p className="mt-5 border border-line-strong px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">
          Masuk dulu untuk ikut bertanya di postingan ini.
        </p>
      }
    </section>);

}
