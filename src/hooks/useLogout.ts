import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Sebelumnya keempat tombol Logout cuma memanggil navigate('/'), jadi sesinya tetap hidup
// dan user langsung masuk lagi begitu membuka halaman terlindungi. Dijadikan satu hook
// supaya tidak ada lagi tempat yang lupa mengakhiri sesinya.
export function useLogout(): () => Promise<void> {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return async () => {
    try {
      await signOut();
    } finally {
      navigate('/', { replace: true });
    }
  };
}
