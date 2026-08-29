import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface FormErrors {
  email?: string;
  password?: string;
}

export function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!email.trim()) {
      next.email = 'Email wajib diisi.';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = 'Format email belum benar.';
    }
    if (!password) {
      next.password = 'Kata sandi wajib diisi.';
    } else if (password.length < 6) {
      next.password = 'Minimal 6 karakter.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
      toast('Berhasil masuk', `Selamat datang kembali, ${email.split('@')[0]}.`);
      navigate('/home');
    } catch (err: any) {
      setErrors({ password: 'Email atau kata sandi salah.' });
    } finally {
      setSubmitting(false);
    }
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
              Masuk ke akunmu
            </h1>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
              Lanjutkan mengelola pekerjaan dan kesepakatanmu di kampus.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
            <Field label="Email" htmlFor="login-email" required error={errors.email}>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                invalid={Boolean(errors.email)}
              />
            </Field>

            <Field label="Kata sandi" htmlFor="login-password" required error={errors.password}>
              <div className="flex items-center border bg-surface transition-colors duration-150 ease-out focus-within:border-ink border-line-strong">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
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

            <div className="-mt-1 flex justify-end">
              <Link
                to="/lupa-kata-sandi"
                className="text-[12.5px] font-medium text-muted transition-colors duration-150 ease-out hover:text-ink">
                Lupa kata sandi?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={submitting}>
              Masuk
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted">
            Belum punya akun?{' '}
            <Link to="/daftar" className="font-semibold text-ink hover:opacity-70">
              Daftar
            </Link>
          </p>
        </div>
      </div>

      <p className="pb-8 text-center text-[11.5px] leading-relaxed text-faint">
        Dengan masuk, kamu menyetujui{' '}
        <Link to="/syarat-ketentuan" className="underline hover:text-muted">
          Syarat &amp; Ketentuan
        </Link>{' '}
        Stepping Stone.
      </p>
    </div>
  );
}
