import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { StoreProvider } from './contexts/StoreContext';
import { AppShell } from './components/layout/AppShell';
import { Landing } from './pages/Landing';
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
  /** Stepping Stone ships light and dark as equals; pick the default surface. */
  defaultTheme?: 'light' | 'dark';
}

export function App({ defaultTheme = 'light' }: AppProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <StoreProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="*"
                element={
                <AppShell>
                    <Routes>
                      <Route path="/home" element={<Feed />} />
                      <Route path="/kerja-cepat" element={<Feed />} />
                      <Route path="/proyek" element={<Feed />} />
                      <Route path="/pekerjaan/:jobId" element={<JobDetail />} />
                      <Route path="/pasang-pekerjaan" element={<CreateJob />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/chat/:threadId" element={<Chat />} />
                      <Route path="/kesepakatan/:agreementId" element={<AgreementPage />} />
                      <Route path="/aktivitas" element={<Activity />} />
                      <Route path="/profil" element={<Profile />} />
                      <Route path="/u/:handle" element={<Profile />} />
                      <Route path="/career-compass" element={<CareerCompass />} />
                      <Route path="/pengaturan" element={<Settings />} />
                      <Route path="/syarat-ketentuan" element={<Terms />} />
                      <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                  </AppShell>
                } />
              
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </StoreProvider>
    </ThemeProvider>);

}