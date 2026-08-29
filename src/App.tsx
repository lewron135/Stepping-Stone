import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { StoreProvider } from './contexts/StoreContext';
import { AppShell } from './components/layout/AppShell';

import { About } from './pages/About';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Feed } from './pages/Feed';
import { JobDetail } from './pages/JobDetail';
import { CreateJob } from './pages/CreateJob';
import { Chat } from './pages/Chat';
import { AgreementPage } from './pages/AgreementPage';
import { Activity } from './pages/Activity';
import { Profile } from './pages/Profile';
import { CareerCompass } from './pages/CareerCompass';
import { Settings } from './pages/Settings';
import { Terms } from './pages/Terms';

interface AppProps {
  defaultTheme?: 'light' | 'dark';
}

export function App({ defaultTheme = 'light' }: AppProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <StoreProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>

              {/* ==================== PUBLIC PAGES ==================== */}

 <Route path="/" element={<About />} />

<Route
  path="/tentang-kami"
  element={<About />}
/>
              <Route
                path="/syarat-ketentuan"
                element={<Terms />}
              />
              <Route
                path="/masuk"
                element={<Login />}
              />
              <Route
                path="/daftar"
                element={<SignUp />}
              />

              {/* ==================== APP PAGES ==================== */}

              <Route
                path="/home"
                element={
                  <AppShell>
                    <Feed />
                  </AppShell>
                }
              />

              <Route
                path="/kerja-cepat"
                element={
                  <AppShell>
                    <Feed />
                  </AppShell>
                }
              />

              <Route
                path="/proyek"
                element={
                  <AppShell>
                    <Feed />
                  </AppShell>
                }
              />

              <Route
                path="/pekerjaan/:jobId"
                element={
                  <AppShell>
                    <JobDetail />
                  </AppShell>
                }
              />

              <Route
                path="/pasang-pekerjaan"
                element={
                  <AppShell>
                    <CreateJob />
                  </AppShell>
                }
              />

              <Route
                path="/chat"
                element={
                  <AppShell>
                    <Chat />
                  </AppShell>
                }
              />

              <Route
                path="/chat/:threadId"
                element={
                  <AppShell>
                    <Chat />
                  </AppShell>
                }
              />

              <Route
                path="/kesepakatan/:agreementId"
                element={
                  <AppShell>
                    <AgreementPage />
                  </AppShell>
                }
              />

              <Route
                path="/aktivitas"
                element={
                  <AppShell>
                    <Activity />
                  </AppShell>
                }
              />

              <Route
                path="/profil"
                element={
                  <AppShell>
                    <Profile />
                  </AppShell>
                }
              />

              <Route
                path="/u/:handle"
                element={
                  <AppShell>
                    <Profile />
                  </AppShell>
                }
              />

              <Route
                path="/career-compass"
                element={
                  <AppShell>
                    <CareerCompass />
                  </AppShell>
                }
              />

              <Route
                path="/pengaturan"
                element={
                  <AppShell>
                    <Settings />
                  </AppShell>
                }
              />

              {/* ==================== FALLBACK ==================== */}

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />

            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}