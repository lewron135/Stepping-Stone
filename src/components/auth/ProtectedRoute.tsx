import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { PageLoader } from '../ui/PageLoader';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const { loading: storeLoading, currentUser } = useStore();

  if (loading || storeLoading) return <PageLoader />;

  if (!session) return <Navigate to="/masuk" replace />;

  // Sesi ada tapi baris profil tidak ketemu. Memaksa login ulang lebih jujur daripada
  // merender halaman setengah jadi yang isinya error null di mana-mana.
  if (!currentUser) return <Navigate to="/masuk" replace />;

  return <>{children}</>;
}
