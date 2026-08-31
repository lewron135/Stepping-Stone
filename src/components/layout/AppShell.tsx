import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { SidebarRail } from './SidebarRail';
import { useStore } from '../../contexts/StoreContext';
import { PageLoader } from '../ui/PageLoader';

export function AppShell({ children }: {children: React.ReactNode;}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loading } = useStore();

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen w-full bg-canvas">
      <Navbar onOpenMenu={() => setMenuOpen(true)} />
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex">
        <SidebarRail />
        <main className="mx-auto w-full max-w-6xl min-w-0 px-4 pb-20 sm:px-6">{children}</main>
      </div>
    </div>);

}