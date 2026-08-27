import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRightIcon, FileUpIcon, ShieldCheckIcon, Trash2Icon } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useStore } from '../contexts/StoreContext';
import { useToast } from '../contexts/ToastContext';
import { recommendJobs } from '../utils/compass';
import { deadlineLabel, rupiah } from '../utils/format';

const EXTRACTED_SKILLS = ['Adobe Illustrator', 'Manajemen proyek kecil', 'Copywriting singkat'];

export function CareerCompass() {
  const { currentUser, jobs } = useStore();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [extracted, setExtracted] = useState<string[]>([]);

  const recommendations = recommendJobs(currentUser, jobs, 4);

  const handleFile = (file?: File) => {
    if (!file) return;
    setParsing(true);
    window.setTimeout(() => {
      setParsing(false);
      setExtracted(EXTRACTED_SKILLS);
      toast('Skill diambil, file CV dihapus', 'Hanya daftar skill yang kami simpan.');
    }, 1100);
  };

  return (
    <div className="py-6">
      <h1 className="text-[24px] font-bold tracking-tightest text-ink sm:text-[30px]">
        Career Compass
      </h1>
      <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-muted">
        Fitur pendukung, bukan pusat aplikasi. Tugasnya satu: menyarankan proyek yang sedikit di atas
        kemampuan kamu sekarang, supaya portofolio naik bertahap.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <section aria-labelledby="recommendation-heading">
          <h2
            id="recommendation-heading"
            className="border-b border-line pb-2.5 text-[14px] font-bold tracking-tight text-ink">
            
            Rekomendasi untuk kamu
          </h2>
          <ul className="divide-y divide-line border-b border-line">
            {recommendations.map(({ job, reason, stretch }) =>
            <li key={job.id} className="py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="muted">{job.category}</Badge>
                  <Badge tone={stretch === 'sedikit-di-atas' ? 'outline' : 'dashed'}>
                    {stretch === 'sedikit-di-atas' ? 'Sedikit di atas level kamu' : 'Sejalan'}
                  </Badge>
                </div>
                <h3 className="mt-2 text-[15.5px] font-bold leading-snug tracking-tight text-ink">
                  <Link to={`/pekerjaan/${job.id}`} className="hover:underline">
                    {job.title}
                  </Link>
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{reason}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted">
                  <span className="font-semibold tabular-nums text-ink">{rupiah(job.price)}</span>
                  <span>Tenggat {deadlineLabel(job.deadline)}</span>
                  <Link
                  to={`/pekerjaan/${job.id}`}
                  className="ml-auto flex items-center gap-1 font-semibold text-ink hover:underline">
                  
                    Lihat pekerjaan
                    <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </li>
            )}
          </ul>
        </section>

        <aside className="flex flex-col gap-5">
          <section className="border border-line bg-surface p-4" aria-labelledby="skills-heading">
            <h2 id="skills-heading" className="text-[13px] font-bold tracking-tight text-ink">
              Skill kamu sekarang
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[...currentUser.skills, ...extracted].map((skill) =>
              <Badge key={skill} tone="muted">
                  {skill}
                </Badge>
              )}
            </div>
          </section>

          <section className="border border-line bg-surface p-4" aria-labelledby="cv-heading">
            <h2 id="cv-heading" className="text-[13px] font-bold tracking-tight text-ink">
              Unggah CV (opsional)
            </h2>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              Kami hanya mengambil daftar skill dari CV kamu. Setelah itu file aslinya langsung
              dihapus, tidak disimpan dan tidak dibagikan.
            </p>
            <Button
              className="mt-3"
              variant="secondary"
              size="sm"
              fullWidth
              loading={parsing}
              icon={<FileUpIcon className="h-3.5 w-3.5" aria-hidden />}
              onClick={() => inputRef.current?.click()}>
              
              {parsing ? 'Mengambil skill' : 'Pilih file CV'}
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])} />
            
            {extracted.length > 0 ?
            <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-ink">
                <Trash2Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {extracted.length} skill ditambahkan. File CV sudah dihapus dari server.
              </p> :

            <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-relaxed text-faint">
                <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Tanpa CV pun rekomendasi tetap jalan, memakai portofolio kamu di aplikasi.
              </p>
            }
          </section>
        </aside>
      </div>
    </div>);

}