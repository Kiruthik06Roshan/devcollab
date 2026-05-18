import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { TopNav } from './TopNav';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { useUiStore } from '@/state/uiStore';

export function AppShell() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 1024);
  }, [setSidebarOpen]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="flex min-h-screen">
        <SidebarNav />
        {sidebarOpen ? <button aria-label="Close sidebar backdrop" className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} /> : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav />
          <main className="min-w-0 flex-1 px-4 py-4 lg:px-6 lg:py-6">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette />
    </div>
  );
}