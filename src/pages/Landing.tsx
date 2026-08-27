import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, LockIcon, MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { IconButton } from '../components/ui/IconButton';
import { Tabs } from '../components/ui/Tabs';
import { JobPost } from '../components/feed/JobPost';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import type { WorkType } from '../types';

const LOOP = [
{ step: '01', label: 'Temukan pekerjaan', detail: 'Feed Kerja Cepat dan Proyek dari kampus kamu.' },
{ step: '02', label: 'Ajukan & nego', detail: 'Penawaran harga, catatan, lalu chat.' },
{ step: '03', label: 'Kunci kesepakatan', detail: 'Harga dan tenggat tidak bisa berubah lagi.' },
{ step: '04', label: 'Kerjakan & buktikan', detail: 'Unggah bukti, dapat testimoni, isi portofolio.' }];


export function Landing() {
  const { jobs } = useStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState<WorkType>('kerja-cepat');

  const preview = jobs.
  filter((job) => job.type === tab && job.status === 'open').
  sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).
  slice(0, 3);

  return (
    <div className="min-h-screen w-full bg-canvas">
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <span className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-ink">
            Stepping Stone
          </span>
          <div className="ml-auto flex items-center gap-2">
            <IconButton
              label={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
              onClick={toggleTheme}>
              
              {theme === 'dark' ?
              <SunIcon className="h-[18px] w-[18px]" aria-hidden /> :

              <MoonIcon className="h-[18px] w-[18px]" aria-hidden />
              }
            </IconButton>
            <Button size="sm" variant="tertiary" onClick={() => navigate('/home')}>
              Masuk
            </Button>
            <Button size="sm" onClick={() => navigate('/home')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="grid grid-cols-1 gap-10 border-b border-line py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-20">
          <div>
            <h1 className="text-[44px] font-extrabold leading-[0.95] tracking-tightest text-ink sm:text-[64px] lg:text-[76px]">
              Get paid.
              <br />
              Get proof.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted sm:text-[16px]">
              Forum kerja antar mahasiswa. Ambil pekerjaan berbayar di sekitar kampus, kunci
              kesepakatannya, lalu ubah hasil kerjamu jadi bukti pengalaman yang bisa ditunjukkan.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate('/home')}
                icon={<ArrowRightIcon className="h-4 w-4" aria-hidden />}>
                
                Explore Jobs
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/home')}>
                Get Started
              </Button>
            </div>
            <p className="mt-6 flex items-center gap-2 text-[12.5px] text-muted">
              <LockIcon className="h-3.5 w-3.5" aria-hidden />
              Setelah kedua pihak setuju, harga dan tenggat terkunci.
            </p>
          </div>

          <div className="lg:pl-8">
            <ol className="divide-y divide-line border-y border-line">
              {LOOP.map((item) =>
              <li key={item.step} className="flex gap-4 py-4">
                  <span className="w-7 shrink-0 text-[12px] font-bold tabular-nums text-faint">
                    {item.step}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold tracking-tight text-ink">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">
                      {item.detail}
                    </span>
                  </span>
                </li>
              )}
            </ol>
          </div>
        </section>

        <section className="py-12" aria-labelledby="preview-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="preview-heading"
                className="text-[20px] font-bold tracking-tight text-ink sm:text-[24px]">
                
                Pekerjaan yang sedang dibuka
              </h2>
              <p className="mt-1 text-[13px] text-muted">
                Feed asli, tanpa perlu login. Ajukan penawaran setelah masuk.
              </p>
            </div>
            <Link
              to="/home"
              className="flex items-center gap-1.5 text-[13px] font-semibold text-ink hover:underline">
              
              Lihat semua
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <Tabs
            className="mt-6"
            layoutId="landing-tab"
            items={[
            { value: 'kerja-cepat', label: 'Kerja Cepat' },
            { value: 'proyek', label: 'Proyek' }]
            }
            value={tab}
            onChange={setTab} />
          

          <div className="divide-y divide-line border-b border-line">
            {preview.map((job) =>
            <JobPost key={job.id} job={job} onOffer={() => navigate('/home')} />
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-semibold uppercase tracking-[0.14em] text-ink">Stepping Stone</span>
          <div className="flex gap-5">
            <Link to="/syarat-ketentuan" className="hover:text-ink">
              Syarat &amp; Ketentuan
            </Link>
            <Link to="/pengaturan" className="hover:text-ink">
              Privasi
            </Link>
          </div>
        </div>
      </footer>
    </div>);

}