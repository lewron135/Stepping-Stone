import type { User } from '../types';
import { useStore } from '../contexts/StoreContext';

// currentUser di StoreContext bertipe User | null karena halaman publik (feed, detail
// pekerjaan, profil orang lain) boleh dibuka tanpa login. Di dalam ProtectedRoute kondisinya
// sudah dipastikan tidak null sebelum children dirender, jadi halaman-halaman terlindungi
// bisa memakai hook ini dan berhenti menaburkan optional chaining di mana-mana.
export function useCurrentUser(): User {
  const { currentUser } = useStore();
  if (!currentUser) {
    throw new Error('useCurrentUser hanya boleh dipakai di dalam ProtectedRoute');
  }
  return currentUser;
}
