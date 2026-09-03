import React, { useRef, useState } from 'react';
import { FileUpIcon, PlusIcon, ShieldCheckIcon, XIcon } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { AVATAR_PRESETS, presetValue } from '../ui/avatarPresets';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { AVATAR_MAX_BYTES, extractCvProfile, uploadAvatarImage } from '../../lib/api';
import { useStore } from '../../contexts/StoreContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useToast } from '../../contexts/ToastContext';
import { cn } from '../../utils/cn';

const BIO_MAX = 300;
const SKILL_MAX = 30;

interface Errors {
  name?: string;
  campus?: string;
  bio?: string;
}

// Batas panjang dan pembersihan daftar skill juga ditegakkan di RPC update_profile. Yang di
// sini cuma supaya user tidak perlu menunggu perjalanan ke server untuk tahu isiannya salah.
export function ProfileForm({ email }: {email: string;}) {
  const currentUser = useCurrentUser();
  const { updateProfile } = useStore();
  const { toast } = useToast();

  const [name, setName] = useState(currentUser.name);
  const [campus, setCampus] = useState(currentUser.campus);
  const [faculty, setFaculty] = useState(currentUser.faculty);
  const [major, setMajor] = useState(currentUser.major);
  const [year, setYear] = useState(currentUser.year);
  const [bio, setBio] = useState(currentUser.bio);
  const [skills, setSkills] = useState<string[]>(currentUser.skills);
  const [skillDraft, setSkillDraft] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [reading, setReading] = useState(false);
  const [filled, setFilled] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  // Hasil pembacaan CV cuma mengisi kolom yang masih kosong dan menambah skill yang belum
  // ada. Isian yang sudah pernah diketik sendiri tidak pernah ditimpa. Tidak ada yang masuk
  // database di tahap ini, penyimpanan tetap lewat tombol Simpan di bawah.
  const handleCv = async (file?: File) => {
    if (!file) return;
    setReading(true);
    try {
      const draft = await extractCvProfile(file);
      const terisi: string[] = [];

      if (!campus && draft.campus) {
        setCampus(draft.campus);
        terisi.push('kampus');
      }
      if (!faculty && draft.faculty) {
        setFaculty(draft.faculty);
        terisi.push('fakultas');
      }
      if (!major && draft.major) {
        setMajor(draft.major);
        terisi.push('jurusan');
      }
      if (!year && draft.year) {
        setYear(draft.year);
        terisi.push('angkatan');
      }

      let skillBaru = 0;
      if (draft.skills.length) {
        setSkills((prev) => {
          const seen = new Set(prev.map((item) => item.toLowerCase()));
          const tambahan = draft.skills.filter((item) => !seen.has(item.toLowerCase()));
          skillBaru = tambahan.length;
          return [...prev, ...tambahan].slice(0, SKILL_MAX);
        });
      }
      if (skillBaru) terisi.push(`${skillBaru} skill`);

      setFilled(terisi);
      if (!terisi.length) {
        toast('Tidak ada yang bisa diisi', 'Kolomnya sudah terisi semua, atau CV-nya tidak terbaca.');
        return;
      }
      toast('CV terbaca', 'Periksa dulu isinya, lalu tekan Simpan.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Coba lagi sebentar lagi.';
      toast('CV gagal dibaca', message);
    } finally {
      setReading(false);
      if (cvInputRef.current) cvInputRef.current.value = '';
    }
  };

  const addSkill = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    if (skills.length >= SKILL_MAX) {
      toast('Skill sudah penuh', `Maksimal ${SKILL_MAX} skill.`);
      return;
    }
    if (skills.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setSkillDraft('');
      return;
    }
    setSkills((prev) => [...prev, value]);
    setSkillDraft('');
  };

  const handleSkillKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill(skillDraft);
    } else if (event.key === 'Backspace' && !skillDraft && skills.length) {
      setSkills((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: Errors = {};
    if (!name.trim()) next.name = 'Nama wajib diisi.';
    if (!campus.trim()) next.campus = 'Kampus wajib diisi.';
    if (bio.trim().length > BIO_MAX) next.bio = `Maksimal ${BIO_MAX} karakter.`;
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      // Skill yang masih tertinggal di kotak ketik ikut disimpan, supaya isian tidak diam-diam
      // hilang cuma karena user menekan Simpan tanpa menekan Enter lebih dulu.
      const pending = skillDraft.trim();
      const finalSkills =
      pending && !skills.some((item) => item.toLowerCase() === pending.toLowerCase()) ?
      [...skills, pending] :
      skills;

      await updateProfile({
        name: name.trim(),
        campus: campus.trim(),
        faculty: faculty.trim(),
        major: major.trim(),
        year: year.trim(),
        bio: bio.trim(),
        skills: finalSkills,
        avatarUrl
      });
      setSkills(finalSkills);
      setSkillDraft('');
      toast('Profil disimpan', 'Perubahan langsung terlihat di profil publik kamu.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Coba lagi sebentar lagi.';
      toast('Profil gagal disimpan', message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFile = async (file?: File) => {
    if (!file) return;
    if (file.size > AVATAR_MAX_BYTES) {
      toast('Foto terlalu besar', `Ukuran maksimal ${Math.round(AVATAR_MAX_BYTES / 1024 / 1024)} MB.`);
      return;
    }

    setUploadingAvatar(true);
    try {
      // Fotonya naik ke Storage sekarang, tapi profilnya baru berubah setelah tombol Simpan
      // ditekan, sama seperti perlakuan hasil pembacaan CV di atas.
      setAvatarUrl(await uploadAvatarImage(file));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Coba lagi sebentar lagi.';
      toast('Foto gagal diunggah', message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const tile = (active: boolean) =>
  cn(
    'flex items-center justify-center border p-1 transition-colors duration-150 ease-out',
    active ? 'border-ink bg-subtle' : 'border-line-strong hover:border-ink'
  );

  return (
    <form className="flex flex-col gap-5 px-4 py-4" onSubmit={handleSubmit}>
      <div className="border border-line-strong p-3.5">
        <div className="flex flex-wrap items-center gap-3.5">
          <Avatar name={name || currentUser.name} src={avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold tracking-tight text-ink">Foto profil</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Pilih salah satu di bawah, atau unggah fotomu sendiri.
            </p>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              handleAvatarFile(event.target.files?.[0]);
              event.target.value = '';
            }} />
          
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={uploadingAvatar}
            onClick={() => avatarInputRef.current?.click()}>
            
            Unggah foto
          </Button>
        </div>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            aria-label="Pakai inisial nama"
            aria-pressed={!avatarUrl}
            onClick={() => setAvatarUrl('')}
            className={tile(!avatarUrl)}>
            
            <Avatar name={name || currentUser.name} size="md" className="border-0" />
          </button>

          {AVATAR_PRESETS.map((preset) => {
            const value = presetValue(preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                aria-label={`Pakai avatar ${preset.id}`}
                aria-pressed={avatarUrl === value}
                onClick={() => setAvatarUrl(value)}
                className={tile(avatarUrl === value)}>
                
                <Avatar name={name} src={value} size="md" className="border-0" />
              </button>);

          })}
        </div>
      </div>
      <div className="border border-dashed border-line-strong p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-tight text-ink">
              Isi otomatis dari CV
            </p>
            <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted">
              Opsional. Kampus, jurusan, angkatan, dan skill diambil dari CV kamu, lalu kamu
              yang menentukan mana yang benar sebelum disimpan.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="shrink-0"
            loading={reading}
            icon={<FileUpIcon className="h-3.5 w-3.5" aria-hidden />}
            onClick={() => cvInputRef.current?.click()}>
            
            {reading ? 'Membaca CV' : 'Pilih file CV'}
          </Button>
        </div>
        <input
          ref={cvInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => handleCv(event.target.files?.[0])} />
        
        {filled.length ?
        <p className="mt-2.5 text-[12px] leading-relaxed text-ink">
            Terisi dari CV: {filled.join(', ')}. Belum tersimpan sampai kamu menekan Simpan.
          </p> :

        <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-faint">
            <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            File dibaca sekali lalu dibuang. Yang tersimpan hanya isian yang kamu setujui.
          </p>
        }
      </div>

      <Field label="Nama" htmlFor="profile-name" required error={errors.name}>
        <Input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          invalid={Boolean(errors.name)}
          maxLength={80} />
        
      </Field>

      <Field
        label="Email"
        htmlFor="profile-email"
        hint="Dipakai untuk masuk, tidak pernah tampil di profil publik. Ubahnya lewat Supabase Auth, bukan dari sini.">
        
        <Input id="profile-email" type="email" value={email} readOnly disabled />
      </Field>

      <Field label="Kampus" htmlFor="profile-campus" required error={errors.campus}>
        <Input
          id="profile-campus"
          value={campus}
          onChange={(event) => setCampus(event.target.value)}
          invalid={Boolean(errors.campus)}
          maxLength={80} />
        
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label="Fakultas" htmlFor="profile-faculty">
          <Input
            id="profile-faculty"
            value={faculty}
            onChange={(event) => setFaculty(event.target.value)}
            placeholder="Contoh: Ilmu Komputer"
            maxLength={80} />
          
        </Field>
        <Field label="Jurusan" htmlFor="profile-major">
          <Input
            id="profile-major"
            value={major}
            onChange={(event) => setMajor(event.target.value)}
            placeholder="Contoh: Teknik Informatika"
            maxLength={80} />
          
        </Field>
        <Field label="Angkatan" htmlFor="profile-year">
          <Input
            id="profile-year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="Contoh: 2024"
            maxLength={20} />
          
        </Field>
      </div>

      <Field
        label="Bio"
        htmlFor="profile-bio"
        hint="Satu atau dua kalimat tentang kamu."
        counter={`${bio.trim().length}/${BIO_MAX}`}
        error={errors.bio}>
        
        <Textarea
          id="profile-bio"
          rows={3}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          invalid={Boolean(errors.bio)}
          placeholder="Contoh: Mahasiswa desain yang sering bantu bikin poster acara kampus." />
        
      </Field>

      <Field
        label="Skill"
        htmlFor="profile-skill"
        hint="Tekan Enter untuk menambah. Ditampilkan sebagai daftar datar, tanpa level, karena yang memberi bobot adalah portofolio kamu.">
        
        <div className="flex flex-col gap-2.5">
          {skills.length ?
          <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) =>
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 bg-subtle px-2 py-0.5 text-[11px] font-semibold leading-5 text-muted">
              
                  {skill}
                  <button
                type="button"
                onClick={() => setSkills((prev) => prev.filter((item) => item !== skill))}
                className="text-faint transition-colors duration-150 ease-out hover:text-ink"
                aria-label={`Hapus skill ${skill}`}>
                
                    <XIcon className="h-3 w-3" aria-hidden />
                  </button>
                </span>
            )}
            </div> :
          null}
          <div className="flex gap-2">
            <Input
              id="profile-skill"
              value={skillDraft}
              onChange={(event) => setSkillDraft(event.target.value)}
              onKeyDown={handleSkillKeyDown}
              placeholder="Contoh: Adobe Illustrator"
              maxLength={40} />
            
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              icon={<PlusIcon className="h-3.5 w-3.5" aria-hidden />}
              onClick={() => addSkill(skillDraft)}>
              
              Tambah
            </Button>
          </div>
        </div>
      </Field>

      <div className="flex justify-end">
        <Button type="submit" size="sm" loading={saving}>
          Simpan perubahan
        </Button>
      </div>
    </form>);

}
