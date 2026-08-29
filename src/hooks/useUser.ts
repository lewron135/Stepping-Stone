import { useEffect } from 'react';
import type { User } from '../types';
import { useStore } from '../contexts/StoreContext';

export function useUser(id: string | undefined): User | undefined {
  const { getUser, ensureUser } = useStore();

  useEffect(() => {
    if (id) ensureUser(id);
  }, [id, ensureUser]);

  return id ? getUser(id) : undefined;
}
