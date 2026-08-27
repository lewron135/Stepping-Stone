import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Switch } from '../components/ui/Switch';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { cn } from '../utils/cn';

function Row({
  title,
  description,
  children




}: {title: string;description: string;children?: React.ReactNode;}) {
  return (
    <div className="flex items-start justify-between gap-6 px-4 py-4">
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold tracking-tight text-ink">{title}</p>
        <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-muted">{description}</p>
      </div>
      {children}
    </div>);

}

function SettingsSection({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <section className="mt-8">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{title}</h2>
      <div className="mt-2.5 divide-y divide-line border border-line bg-surface">{children}</div>
    </section>);

}

export function Settings() {
  const navigate = useNavigate();
  const { currentUser } = useStore();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [publicProfile, setPublicProfile] = useState(true);
  const [showAcademic, setShowAcademic] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="max-w-3xl py-6">
      <h1 className="text-[24px] font-bold tracking-tightest text-ink sm:text-[30px]">Settings</h1>
      <p className="mt-1.5 text-[13.5px] text-muted">
        Tema, akun, privasi, dan kontrol data kamu.
      </p>

      <SettingsSection title="Tampilan">
        <Row title="Tema" description="Mode gelap memakai hitam pekat, cocok dipakai malam.">
          <div className="flex shrink-0 gap-1.5">
            {(['light', 'dark'] as const).map((option) =>
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={cn(
                'border px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out',
                theme === option ?
                'border-transparent bg-inverse-bg text-inverse-ink' :
                'border-line-strong text-muted hover:text-ink'
              )}>
              
                {option === 'light' ? 'Terang' : 'Gelap'}
              </button>
            )}
          </div>
        </Row>
      </SettingsSection>

      <SettingsSection title="Akun">
        <div className="flex flex-col gap-5 px-4 py-4">
          <Field label="Nama" htmlFor="name">
            <Input id="name" defaultValue={currentUser.name} />
          </Field>
          <Field label="Email kampus" htmlFor="email" hint="Dipakai untuk masuk, tidak tampil publik.">
            <Input id="email" type="email" defaultValue={`${currentUser.handle}@kampus.ac.id`} />
          </Field>
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast('Perubahan disimpan')}>
              Simpan perubahan
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Privasi & visibilitas">
        <Row
          title="Profil publik"
          description="Nama, informasi akademik, portofolio, dan track record bisa dilihat mahasiswa lain.">
          
          <Switch checked={publicProfile} onChange={setPublicProfile} label="Profil publik" />
        </Row>
        <Row
          title="Tampilkan informasi akademik"
          description="Fakultas, program studi, dan angkatan. Nomor telepon dan lokasi presisi tidak pernah ditampilkan.">
          
          <Switch
            checked={showAcademic}
            onChange={setShowAcademic}
            label="Tampilkan informasi akademik" />
          
        </Row>
        <Row
          title="File CV"
          description="Stepping Stone hanya menyimpan daftar skill hasil ekstraksi. File CV dihapus segera setelah diproses." />
        
      </SettingsSection>

      <SettingsSection title="Data">
        <Row
          title="Unduh data saya"
          description="Berisi pekerjaan, kesepakatan, dan testimoni yang terkait akun kamu.">
          
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0"
            onClick={() => toast('Permintaan data dikirim', 'Data dikirim ke email kampus kamu.')}>
            
            Minta data
          </Button>
        </Row>
        <Row
          title="Hapus akun"
          description="Portofolio dan track record akan hilang permanen. Catatan kesepakatan yang sudah terkunci tetap tercatat pada pihak lain.">
          
          <Button size="sm" variant="secondary" className="shrink-0" onClick={() => setDeleteOpen(true)}>
            Hapus akun
          </Button>
        </Row>
      </SettingsSection>

      <SettingsSection title="Lain-lain">
        <Row title="Syarat & Ketentuan" description="Aturan pemakaian, pembayaran, dan pelaporan.">
          <Link to="/syarat-ketentuan" className="shrink-0">
            <Button size="sm" variant="tertiary">
              Baca
            </Button>
          </Link>
        </Row>
        <Row title="Logout" description="Keluar dari akun di perangkat ini.">
          <Button size="sm" variant="secondary" className="shrink-0" onClick={() => navigate('/')}>
            Logout
          </Button>
        </Row>
      </SettingsSection>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Hapus akun?"
        description="Tindakan ini tidak bisa dibatalkan."
        footer={
        <>
            <Button variant="tertiary" onClick={() => setDeleteOpen(false)}>
              Batal
            </Button>
            <Button
            onClick={() => {
              setDeleteOpen(false);
              toast('Permintaan penghapusan dikirim', 'Akun dihapus dalam 24 jam.');
            }}>
            
              Ya, hapus akun
            </Button>
          </>
        }>
        
        <p className="text-[13.5px] leading-relaxed text-muted">
          Portofolio, testimoni, dan track record kamu akan dihapus. Pekerjaan yang sudah selesai
          tetap tercatat pada pihak lain sebagai riwayat kesepakatan mereka.
        </p>
      </Modal>
    </div>);

}