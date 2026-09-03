import type { Job, User } from '../types';

export interface Recommendation {
  job: Job;
  reason: string;
  stretch: 'sejalan' | 'sedikit-di-atas';
}

// Kata kunci per kategori proyek, dipakai mencocokkan skill yang ditulis user di profilnya.
// Sengaja daftar tetap dan bukan model: hasilnya deterministik, bisa dibaca, dan bisa
// dijelaskan ke siapa pun yang bertanya kenapa satu pekerjaan muncul.
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Desain Grafis': [
  'desain', 'design', 'grafis', 'graphic', 'poster', 'logo', 'branding', 'layout',
  'figma', 'photoshop', 'illustrator', 'canva', 'coreldraw', 'ui', 'ux'],

  'Video & Motion': [
  'video', 'motion', 'animasi', 'animation', 'editing', 'editor', 'videografi',
  'premiere', 'after effects', 'capcut', 'sinematografi'],

  'Coding & Web': [
  'coding', 'web', 'website', 'programming', 'pemrograman', 'developer', 'frontend',
  'backend', 'javascript', 'typescript', 'react', 'vue', 'python', 'java', 'php',
  'laravel', 'html', 'css', 'node', 'flutter', 'kotlin', 'swift', 'database'],

  'Data & Riset': [
  'data', 'riset', 'research', 'analisis', 'analysis', 'analitik', 'statistik',
  'statistics', 'excel', 'spreadsheet', 'spss', 'stata', 'sql', 'tableau', 'survei'],

  'Copywriting': [
  'copywriting', 'copy', 'menulis', 'penulis', 'writing', 'writer', 'artikel',
  'jurnalistik', 'editing naskah', 'naskah', 'blog', 'caption'],

  'Sosial Media': [
  'sosial media', 'social media', 'instagram', 'tiktok', 'konten', 'content',
  'marketing', 'branding', 'admin', 'kampanye']
};

/**
 * Mencari skill user yang cocok dengan satu kategori, lalu mengembalikan skill itu supaya
 * alasannya bisa menyebut nama aslinya, bukan cuma bilang "cocok".
 *
 * Kata kunci satu kata dicocokkan per kata, bukan sebagai potongan teks, supaya kata pendek
 * seperti "ui" tidak ikut cocok dengan skill seperti "building maintenance".
 */
function matchingSkill(category: string, skills: string[]): string | null {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords) return null;

  for (const skill of skills) {
    const clean = skill.toLowerCase().trim();
    if (!clean) continue;

    const words = clean.split(/[^a-z0-9+#]+/).filter(Boolean);
    const hit = keywords.some((keyword) =>
    keyword.includes(' ') ? clean.includes(keyword) : words.includes(keyword)
    );
    if (hit) return skill;
  }
  return null;
}

/**
 * Career Compass: merekomendasikan proyek yang sedikit di atas apa yang sudah dibuktikan user.
 *
 * Urutan bahan pertimbangannya, dari yang paling kuat:
 * 1. Kategori yang sudah ada di portofolio, karena itu bukti kerja yang sudah selesai.
 * 2. Kategori yang cocok dengan skill di profil, dipakai terutama oleh user baru yang
 *    portofolionya masih kosong. Tanpa ini, rekomendasi buat pendatang baru praktis cuma
 *    urutan harga.
 * 3. Nilai proyek yang lebih tinggi dari proyek terbesar yang pernah diselesaikan.
 *
 * Semuanya deterministik dan tidak memanggil model apa pun. Alasan yang tampil di kartu harus
 * selalu menggambarkan apa yang benar-benar dihitung di sini.
 */
export function recommendJobs(user: User | null, jobs: Job[], limit = 3): Recommendation[] {
  if (!user) return [];

  const doneCategories = new Set(user.portfolio.map((item) => item.category));
  const topPrice = user.portfolio.reduce((max, item) => Math.max(max, item.price), 0);
  const skills = user.skills ?? [];

  return jobs.
  filter((job) => job.type === 'proyek' && job.status === 'open' && job.posterId !== user.id).
  map((job) => {
    const familiar = doneCategories.has(job.category);
    const skillHit = familiar ? null : matchingSkill(job.category, skills);
    const higherValue = job.price > topPrice;
    const score = (familiar ? 3 : skillHit ? 2 : 0) + (higherValue ? 2 : 1);

    const reason = familiar ?
    higherValue ?
    'Kategori yang sudah kamu buktikan, nilainya di atas proyek terbesarmu' :
    `Sejalan dengan portofolio ${job.category} kamu` :
    skillHit ?
    `Cocok dengan skill ${skillHit} yang kamu tulis di profil` :
    'Kategori baru, belum ada di portofolio maupun skill kamu';

    return {
      job,
      reason,
      stretch: (familiar && higherValue ? 'sedikit-di-atas' : 'sejalan') as Recommendation['stretch'],
      score
    };
  }).
  sort((a, b) => b.score - a.score || b.job.price - a.job.price).
  slice(0, limit).
  map(({ job, reason, stretch }) => ({ job, reason, stretch }));
}
