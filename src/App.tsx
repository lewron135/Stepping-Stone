import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

import { About } from './pages/About';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Feed } from './pages/Feed';
import { JobDetail } from './pages/JobDetail';
import { CreateJob } from './pages/CreateJob';
import { Chat } from './pages/Chat';
import { Notifications } from './pages/Notifications';
import { AgreementPage } from './pages/AgreementPage';
import { Activity } from './pages/Activity';
import { Profile } from './pages/Profile';
import { CareerCompass } from './pages/CareerCompass';
import { Settings } from './pages/Settings';
import { Terms } from './pages/Terms';

interface AppProps {
  defaultTheme?: 'light' | 'dark';
}

// Dua layout route dipakai supaya pembungkus tidak diulang di setiap halaman: satu untuk
// halaman aplikasi yang boleh dibuka tanpa login, satu lagi yang menambah ProtectedRoute
// di atasnya. Halaman publik di paling atas tidak memakai shell sama sekali.
function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>);

}

function ProtectedShellLayout() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedRoute>);

}

export function App({ defaultTheme = 'light' }: AppProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <AuthProvider>
        <StoreProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>

                {/* ==================== HALAMAN PUBLIK ==================== */}

                <Route path="/" element={<About />} />
                <Route path="/tentang-kami" element={<About />} />
                <Route path="/syarat-ketentuan" element={<Terms />} />
                <Route path="/masuk" element={<Login />} />
                <Route path="/daftar" element={<SignUp />} />

                {/* ============ HALAMAN APLIKASI, TANPA WAJIB LOGIN ============ */}

                <Route element={<ShellLayout />}>
                  <Route path="/home" element={<Feed />} />
                  <Route path="/kerja-cepat" element={<Feed />} />
                  <Route path="/proyek" element={<Feed />} />
                  <Route path="/pekerjaan/:jobId" element={<JobDetail />} />
                  <Route path="/u/:handle" element={<Profile />} />
                </Route>

                {/* ================ HALAMAN YANG BUTUH LOGIN ================ */}

                <Route element={<ProtectedShellLayout />}>
                  <Route path="/pasang-pekerjaan" element={<CreateJob />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:threadId" element={<Chat />} />
                  <Route path="/notifikasi" element={<Notifications />} />
                  <Route path="/kesepakatan/:agreementId" element={<AgreementPage />} />
                  <Route path="/aktivitas" element={<Activity />} />
                  <Route path="/profil" element={<Profile />} />
                  <Route path="/career-compass" element={<CareerCompass />} />
                  <Route path="/pengaturan" element={<Settings />} />
                </Route>

                {/* ==================== FALLBACK ==================== */}

                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </BrowserRouter>
          </ToastProvider>
        </StoreProvider>
      </AuthProvider>
    </ThemeProvider>);

}
