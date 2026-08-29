import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useStore } from '../../contexts/StoreContext';

export function AppShell({ children }: {children: React.ReactNode;}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loading } = useStore();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-canvas">
        <p className="text-sm text-muted">Memuat...</p>
      </div>);

  }

  return (
    <div className="min-h-screen w-full bg-canvas">
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">{children}</main>
    </div>);

}