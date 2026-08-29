import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
      <AuthProvider>
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
                  <ProtectedRoute>
                    <AppShell>
                      <CreateJob />
                    </AppShell>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <Chat />
                    </AppShell>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/chat/:threadId"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <Chat />
                    </AppShell>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/kesepakatan/:agreementId"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <AgreementPage />
                    </AppShell>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/aktivitas"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <Activity />
                    </AppShell>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profil"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <Profile />
                    </AppShell>
                  </ProtectedRoute>
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
                  <ProtectedRoute>
                    <AppShell>
                      <CareerCompass />
                    </AppShell>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/pengaturan"
                element={
                  <ProtectedRoute>
                    <AppShell>
                      <Settings />
                    </AppShell>
                  </ProtectedRoute>
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
      </AuthProvider>
    </ThemeProvider>
  );
}