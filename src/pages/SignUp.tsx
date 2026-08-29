import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';

interface FormValues {
  name: string;
  email: string;
  campus: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  campus?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const INITIAL_VALUES: FormValues = {
  name: '',
  email: '',
  campus: '',
  password: '',
  confirmPassword: ''
};

export function SignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof FormValues) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!values.name.trim()) next.name = 'Nama wajib diisi.';
    if (!values.email.trim()) {
      next.email = 'Email wajib diisi.';
    } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      next.email = 'Format email belum benar.';
    }
    if (!values.campus.trim()) next.campus = 'Kampus wajib diisi.';
    if (!values.password) {
      next.password = 'Kata sandi wajib diisi.';
    } else if (values.password.length < 6) {
      next.password = 'Minimal 6 karakter.';
    }
    if (values.confirmPassword !== values.password || !values.confirmPassword) {
      next.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
    }
    if (!agreed) next.terms = 'Setujui syarat & ketentuan untuk lanjut.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      toast('Akun berhasil dibuat', `Selamat datang, ${values.name.split(' ')[0]}.`);
      navigate('/home');
    }, 550);
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[380px]">
          <Link
            to="/"
            className="block text-center text-[12px] font-extrabold uppercase leading-none tracking-[0.14em] text-ink">
            Stepping Stone
          </Link>

          <div className="mt-8 text-center">
            <h1 className="text-[22px] font-bold tracking-tightest text-ink sm:text-[26px]">
              Buat akun baru
            </h1>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
              Gabung dan mulai cari atau tawarkan pekerjaan di kampusmu.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
            <Field label="Nama lengkap" htmlFor="signup-name" required error={errors.name}>
              <Input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Nama Lengkap"
                value={values.name}
                onChange={update('name')}
                invalid={Boolean(errors.name)}
              />
            </Field>

            <Field label="Email " htmlFor="signup-email" required error={errors.email}>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="Username@gmail.com"
                value={values.email}
                onChange={update('email')}
                invalid={Boolean(errors.email)}
              />
            </Field>

            <Field label="Kampus" htmlFor="signup-campus" required error={errors.campus}>
              <Input
                id="signup-campus"
                type="text"
                autoComplete="organization"
                placeholder="Universitas Nusantara"
                value={values.campus}
                onChange={update('campus')}
                invalid={Boolean(errors.campus)}
              />
            </Field>

            <Field label="Kata sandi" htmlFor="signup-password" required error={errors.password}>
              <div className="flex items-center border bg-surface transition-colors duration-150 ease-out focus-within:border-ink border-line-strong">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Minimal 6 karakter"
                  value={values.password}
                  onChange={update('password')}
                  aria-invalid={Boolean(errors.password) || undefined}
                  className="h-10 w-full bg-transparent px-3 text-sm text-ink placeholder:text-faint focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="shrink-0 px-3 text-muted transition-colors duration-150 ease-out hover:text-ink">
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" aria-hidden />
                  ) : (
                    <EyeIcon className="h-4 w-4" aria-hidden />
                  )}
                </button>
              </div>
            </Field>

            <Field
              label="Konfirmasi kata sandi"
              htmlFor="signup-confirm"
              required
              error={errors.confirmPassword}>
              <Input
                id="signup-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Ulangi kata sandi"
                value={values.confirmPassword}
                onChange={update('confirmPassword')}
                invalid={Boolean(errors.confirmPassword)}
              />
            </Field>

            <div className="flex flex-col gap-1.5">
              <label className="flex cursor-pointer items-start gap-2.5 text-[12.5px] leading-relaxed text-muted">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 border-line-strong accent-ink"
                />
                <span>
                  Saya menyetujui{' '}
                  <Link to="/syarat-ketentuan" className="font-medium text-ink underline">
                    Syarat &amp; Ketentuan
                  </Link>{' '}
                  Stepping Stone.
                </span>
              </label>
              {errors.terms ? (
                <p className="text-[12px] font-medium text-ink">{errors.terms}</p>
              ) : null}
            </div>

            <Button type="submit" fullWidth loading={submitting}>
              Daftar
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted">
            Sudah punya akun?{' '}
            <Link to="/masuk" className="font-semibold text-ink hover:opacity-70">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
