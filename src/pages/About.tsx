import { ArrowRightIcon, CheckIcon, LockIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';
import { Typewriter } from '../components/ui/Typewriter';

const PROCESS = [
  {
    number: '01',
    title: 'Temukan',
    description:
      'Cari Kerja Cepat atau Proyek yang sesuai dengan waktu, lokasi, dan kemampuanmu.',
  },
  {
    number: '02',
    title: 'Sepakati',
    description:
      'Ajukan penawaran, diskusikan detail pekerjaan, lalu sepakati harga dan deadline.',
  },
  {
    number: '03',
    title: 'Kerjakan',
    description:
      'Selesaikan pekerjaan sesuai scope dan kesepakatan yang sudah dikunci bersama.',
  },
  {
    number: '04',
    title: 'Buktikan',
    description:
      'Unggah hasil pekerjaan, dapatkan konfirmasi dan testimonial dari client.',
  },
  {
    number: '05',
    title: 'Bangun',
    description:
      'Jadikan pekerjaan yang sudah selesai sebagai bagian dari portfolio dan track record.',
  },
];

const VALUES = [
  {
    number: '01',
    title: 'Start Small',
    description:
      'Kesempatan pertama tidak harus besar. Pekerjaan kecil tetap bisa menjadi langkah pertama.',
  },
  {
    number: '02',
    title: 'Make It Clear',
    description:
      'Harga, scope, dan deadline yang jelas membuat kedua pihak tahu apa yang mereka sepakati.',
  },
  {
    number: '03',
    title: 'Show Your Work',
    description:
      'Pekerjaan yang selesai layak memiliki bukti yang bisa dilihat dan ditunjukkan.',
  },
  {
    number: '04',
    title: 'Grow Together',
    description:
      'Mahasiswa tumbuh lebih cepat ketika punya kesempatan untuk saling membantu.',
  },
];

const QUICK_JOBS = [
  'Titip beli',
  'Antar barang',
  'Pickup',
  'Bantu pindahan',
  'Urusan sekitar kampus',
];

const PROJECTS = [
  'Graphic design',
  'Video editing',
  'Programming',
  'Data analysis',
  'Photography',
  'Writing',
];

export function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-canvas text-ink">
      {/* HEADER */}
      <header className="border-b border-line">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Link
            to="/"
            className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-ink sm:text-[13px]"
          >
            Stepping Stone
          </Link>

          <nav className="ml-auto flex items-center gap-5 text-[13px] font-semibold">
            <Link
              to="/"
              className="hidden text-muted transition-colors hover:text-ink sm:block"
            >
              Home
            </Link>

            <span className="text-ink">Tentang Kami</span>

            <Link
              to="/masuk"
              className="hidden text-muted transition-colors hover:text-ink sm:block"
            >
              Masuk
            </Link>

            <Button
              size="sm"
              onClick={() => navigate('/daftar')}
              icon={<ArrowRightIcon className="h-3.5 w-3.5" />}
            >
              Daftar
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* =========================================
            HERO
        ========================================= */}
        <Reveal>
          <section className="relative overflow-hidden border-b border-line">
            <img
              src="/hero-campus.jpg"
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/55" />

            <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
              <div className="max-w-5xl">
                <p className="mb-7 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                  About Stepping Stone
                </p>

                <h1 className="max-w-5xl text-[48px] font-extrabold leading-[0.92] tracking-tightest text-white sm:text-[72px] lg:text-[104px]">
                  <Typewriter text={'Kerja kecil.\nBukti yang besar.'} speed={45} startDelay={300} />
                </h1>

                <div className="mt-10 flex max-w-2xl flex-col gap-7">
                  <p className="text-[17px] leading-relaxed text-white/80 sm:text-[19px]">
                    Stepping Stone membantu mahasiswa menemukan pekerjaan
                    berbayar di sekitar mereka, menyelesaikannya dengan
                    kesepakatan yang jelas, lalu mengubah setiap pekerjaan
                    menjadi pengalaman yang bisa dibuktikan.
                  </p>

                  <div className="mt-10 flex max-w-2xl flex-col gap-7">
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      onClick={() => navigate('/home')}
                      icon={<ArrowRightIcon className="h-4 w-4" />}
                    >
                      Mulai cari pekerjaan
                    </Button>

                    <Button
                      size="lg"
                      variant="secondary"
                      className="!border-white/50 !text-white hover:!bg-white/10"
                      onClick={() =>
                        document
                          .getElementById('cara-kerja')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }
                    >
                      Lihat cara kerja
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* =========================================
            PROBLEM
        ========================================= */}
        <Reveal>
          <section className="border-b border-line">
            <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:gap-24">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  The Problem
                </p>

                <h2 className="mt-5 text-[34px] font-bold leading-[1.02] tracking-tight sm:text-[48px]">
                  Mahasiswa punya kemampuan.
                  <br />
                  Tapi pengalaman sering tidak punya tempat untuk dibuktikan.
                </h2>
              </div>

              <div className="space-y-6 text-[15px] leading-relaxed text-muted sm:text-[16px]">
                <p>
                  Mahasiswa sebenarnya sudah melakukan banyak hal yang bernilai.
                  Membuat desain, mengedit video, membantu acara kampus,
                  membuat website, mengantar barang, sampai membantu teman
                  menyelesaikan pekerjaan.
                </p>

                <p>
                  Tapi ketika pekerjaan selesai, sering kali hanya uang yang
                  berpindah tangan. Pengalamannya ikut hilang begitu saja.
                </p>

                <p className="font-semibold text-ink">
                  Stepping Stone dibuat untuk mengubah hal tersebut.
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* =========================================
            IDEA
        ========================================= */}
        <Reveal>
          <section id="cara-kerja" className="border-b border-line">
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
              <div className="max-w-3xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  Our Idea
                </p>

                <h2 className="mt-5 text-[38px] font-bold leading-[1] tracking-tight sm:text-[58px]">
                  Stepping Stone menghubungkan keduanya.
                </h2>

                <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[16px]">
                  Satu pekerjaan bisa menjadi lebih dari sekadar transaksi.
                  Dengan proses yang jelas, pekerjaan yang selesai bisa berubah
                  menjadi bukti pengalaman.
                </p>
              </div>

              <div className="mt-14 border-y border-line">
                {PROCESS.map((item) => (
                  <div
                    key={item.number}
                    className="grid grid-cols-[48px_1fr] gap-4 border-b border-line py-7 last:border-b-0 sm:grid-cols-[72px_220px_1fr] sm:gap-6"
                  >
                    <span className="text-[12px] font-bold tabular-nums text-faint">
                      {item.number}
                    </span>

                    <h3 className="text-[18px] font-bold tracking-tight sm:text-[20px]">
                      {item.title}
                    </h3>

                    <p className="col-span-2 text-[14px] leading-relaxed text-muted sm:col-span-1">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* =========================================
            TWO WAYS TO WORK
        ========================================= */}
        <Reveal>
          <section className="border-b border-line">
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
              <div className="max-w-3xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  Two Ways To Work
                </p>

                <h2 className="mt-5 text-[38px] font-bold leading-[1] tracking-tight sm:text-[58px]">
                  Dua cara untuk mulai.
                </h2>
              </div>

              <div className="mt-14 grid gap-0 border-y border-line lg:grid-cols-2">
                {/* QUICK JOB */}
                <article className="border-b border-line py-10 lg:border-b-0 lg:border-r lg:pr-12">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                    01 / Kerja Cepat
                  </span>

                  <h3 className="mt-5 text-[32px] font-bold tracking-tight">
                    Untuk hal-hal kecil yang perlu selesai hari ini.
                  </h3>

                  <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                    Pekerjaan sederhana di sekitar kampus yang bisa diselesaikan
                    dengan cepat.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {QUICK_JOBS.map((job) => (
                      <span
                        key={job}
                        className="border border-line px-3 py-1.5 text-[12px] font-medium"
                      >
                        {job}
                      </span>
                    ))}
                  </div>

                  <p className="mt-10 text-[13px] font-semibold text-ink">
                    Cocok untuk pekerjaan kecil dan cepat.
                  </p>
                </article>

                {/* PROJECT */}
                <article className="py-10 lg:pl-12">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                    02 / Proyek
                  </span>

                  <h3 className="mt-5 text-[32px] font-bold tracking-tight">
                    Untuk pekerjaan yang membutuhkan skill.
                  </h3>

                  <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                    Gunakan kemampuan yang kamu punya untuk menghasilkan karya
                    yang bisa masuk ke portfolio.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-2">
                    {PROJECTS.map((project) => (
                      <span
                        key={project}
                        className="border border-line px-3 py-1.5 text-[12px] font-medium"
                      >
                        {project}
                      </span>
                    ))}
                  </div>

                  <p className="mt-10 text-[13px] font-semibold text-ink">
                    Cocok untuk membangun skill dan pengalaman.
                  </p>
                </article>
              </div>
            </div>
          </section>
        </Reveal>

        {/* =========================================
            WHY STEPPING STONE
        ========================================= */}
        <Reveal>
          <section className="border-b border-line">
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
              <div className="max-w-3xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  Why Stepping Stone
                </p>

                <h2 className="mt-5 text-[38px] font-bold leading-[1] tracking-tight sm:text-[58px]">
                  Bukan cuma tempat mencari kerja.
                </h2>
              </div>

              <div className="mt-14 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: 'EARN',
                    text: 'Dapatkan uang dari kemampuan dan waktu yang kamu punya.',
                  },
                  {
                    title: 'PROVE',
                    text: 'Setiap pekerjaan selesai bisa meninggalkan bukti.',
                  },
                  {
                    title: 'BUILD',
                    text: 'Bangun portfolio dan track record dari pekerjaan nyata.',
                  },
                  {
                    title: 'TRUST',
                    text: 'Kesepakatan yang jelas membuat kedua pihak tahu apa yang mereka setujui.',
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className={`border-b border-line py-8 sm:px-6 ${
                      index % 2 === 0 ? 'sm:border-r' : ''
                    } lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0`}
                  >
                    <span className="text-[12px] font-bold tracking-[0.15em] text-muted">
                      {item.title}
                    </span>

                    <p className="mt-5 text-[15px] leading-relaxed text-muted">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* =========================================
            AGREEMENT
        ========================================= */}
        <Reveal>
          <section className="border-b border-line">
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
              <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center border border-line">
                    <LockIcon className="h-4 w-4" />
                  </div>

                  <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                    The Agreement
                  </p>

                  <h2 className="mt-5 text-[38px] font-bold leading-[1] tracking-tight sm:text-[58px]">
                    Kesepakatan dulu.
                    <br />
                    Baru kerja.
                  </h2>
                </div>

                <div>
                  <p className="text-[16px] leading-relaxed text-muted">
                    Sebelum pekerjaan dimulai, kedua pihak menyepakati harga,
                    scope, dan deadline. Setelah keduanya setuju, kesepakatan
                    dikunci.
                  </p>

                  <div className="mt-12 border-y border-line">
                    {[
                      'OFFER',
                      'NEGOTIATE',
                      'AGREE',
                      'LOCK',
                      'WORK',
                      'PROOF',
                    ].map((step, index) => (
                      <div
                        key={step}
                        className="flex items-center gap-4 border-b border-line py-4 last:border-b-0"
                      >
                        <span className="w-5 text-[11px] font-bold text-faint">
                          0{index + 1}
                        </span>

                        <span className="text-[13px] font-bold tracking-[0.12em]">
                          {step}
                        </span>

                        {index === 3 && (
                          <span className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                            <CheckIcon className="h-3 w-3" />
                            LOCKED
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* =========================================
            FROM WORK TO PROOF
        ========================================= */}
        <Reveal>
          <section className="border-b border-line">
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
              <div className="max-w-3xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  From Work To Proof
                </p>

                <h2 className="mt-5 text-[38px] font-bold leading-[1] tracking-tight sm:text-[58px]">
                  Setiap pekerjaan bisa menjadi cerita.
                </h2>

                <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[16px]">
                  Pekerjaan kecil hari ini bisa menjadi bagian dari pengalaman
                  profesionalmu besok.
                </p>
              </div>

              <div className="mt-14 border border-line">
                <div className="border-b border-line p-6 sm:p-8">
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                    Example
                  </span>

                  <h3 className="mt-4 text-[24px] font-bold tracking-tight sm:text-[30px]">
                    Designed event poster for campus organization
                  </h3>
                </div>

                <div className="grid sm:grid-cols-3">
                  {[
                    'WORK COMPLETED',
                    'TESTIMONIAL',
                    'PORTFOLIO',
                  ].map((item, index) => (
                    <div
                      key={item}
                      className={`flex items-center gap-3 p-6 sm:p-8 ${
                        index !== 2 ? 'border-b sm:border-b-0 sm:border-r' : ''
                      } border-line`}
                    >
                      <div className="flex h-6 w-6 items-center justify-center border border-line">
                        <CheckIcon className="h-3 w-3" />
                      </div>

                      <span className="text-[11px] font-bold tracking-[0.12em]">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* =========================================
            MISSION
        ========================================= */}
        <Reveal>
          <section className="border-b border-line">
            <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-36">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                Our Mission
              </p>

              <h2 className="mt-7 max-w-5xl text-[42px] font-extrabold leading-[0.98] tracking-tight sm:text-[64px] lg:text-[82px]">
                Membuat pengalaman pertama terasa lebih dekat.
              </h2>

              <p className="mt-10 max-w-2xl text-[16px] leading-relaxed text-muted sm:text-[18px]">
                Karena pengalaman tidak harus dimulai dari perusahaan besar.
                Kadang dimulai dari pekerjaan kecil, orang di sebelahmu, dan
                kesempatan pertama untuk membuktikan apa yang bisa kamu lakukan.
              </p>
            </div>
          </section>
        </Reveal>

        {/* =========================================
            VALUES
        ========================================= */}
        <Reveal>
          <section className="border-b border-line">
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
              <div className="max-w-3xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  Our Values
                </p>

                <h2 className="mt-5 text-[38px] font-bold leading-[1] tracking-tight sm:text-[58px]">
                  Prinsip yang membentuk cara kami bekerja.
                </h2>
              </div>

              <div className="mt-14 grid border-t border-line sm:grid-cols-2">
                {VALUES.map((value, index) => (
                  <article
                    key={value.number}
                    className={`border-b border-line py-9 sm:p-9 ${
                      index % 2 === 0 ? 'sm:border-r sm:pl-0' : 'sm:pr-0'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-faint">
                      {value.number}
                    </span>

                    <h3 className="mt-4 text-[24px] font-bold tracking-tight">
                      {value.title}
                    </h3>

                    <p className="mt-4 max-w-md text-[14px] leading-relaxed text-muted">
                      {value.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        {/* =========================================
            COMMUNITY
        ========================================= */}
        <Reveal>
          <section className="border-b border-line">
            <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1fr_1fr] lg:gap-24">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                  The Community
                </p>

                <h2 className="mt-5 text-[38px] font-bold leading-[1] tracking-tight sm:text-[58px]">
                  Semua dimulai dari mahasiswa.
                </h2>
              </div>

              <div className="space-y-6 text-[15px] leading-relaxed text-muted sm:text-[16px]">
                <p>
                  Stepping Stone dibuat untuk kehidupan mahasiswa yang nyata:
                  di antara kelas, organisasi, tugas, perjalanan pulang, dan
                  waktu luang yang tidak selalu panjang.
                </p>

                <p>
                  Kami percaya kesempatan untuk mendapatkan pengalaman tidak
                  harus menunggu sampai lulus.
                </p>

                <p className="font-semibold text-ink">
                  Pengalaman pertama bisa dimulai dari kampusmu sendiri.
                </p>
              </div>
            </div>
          </section>
        </Reveal>

        {/* =========================================
            FINAL CTA
        ========================================= */}
        <Reveal>
          <section>
            <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-36">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
                Your Next Step
              </p>

              <h2 className="mx-auto mt-6 max-w-4xl text-[46px] font-extrabold leading-[0.95] tracking-tightest sm:text-[72px]">
                Your next step
                <br />
                starts small.
              </h2>

              <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-muted sm:text-[17px]">
                Temukan pekerjaan pertamamu. Kerjakan. Buktikan. Bangun dari
                sana.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => navigate('/home')}
                  icon={<ArrowRightIcon className="h-4 w-4" />}
                >
                  Explore Jobs
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/home')}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </section>
        </Reveal>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-semibold uppercase tracking-[0.14em] text-ink">
            Stepping Stone
          </span>

          <div className="flex gap-5">
            <Link to="/tentang-kami" className="text-ink hover:underline">
              Tentang Kami
            </Link>

            <Link to="/syarat-ketentuan" className="hover:text-ink">
              Syarat &amp; Ketentuan
            </Link>

            <Link to="/pengaturan" className="hover:text-ink">
              Privasi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}