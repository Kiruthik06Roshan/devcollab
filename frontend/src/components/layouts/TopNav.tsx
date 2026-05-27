import { Search, LayoutDashboard, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/state/authStore';
import { useUiStore } from '@/state/uiStore';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/ui/NotificationCenter';

export function TopNav() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/40 px-4 py-4 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" className="px-3 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </Button>
        <button className="flex h-11 items-center gap-2 rounded-xl border border-white/8 bg-slate-900/50 px-4 text-sm font-semibold text-slate-200 transition-all hover:bg-white/8 active:scale-[0.98]" onClick={() => navigate('/dashboard')}>
          <LayoutDashboard className="h-4 w-4 text-cyan-300" />
          {user?.workspaces?.[0]?.name ?? 'Workspace'}
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex h-11 flex-1 items-center gap-3 rounded-xl border border-white/8 bg-slate-900/30 px-4 text-sm text-slate-400 hover:bg-slate-900/50 hover:text-slate-300 transition-all duration-200"
        >
          <Search className="h-4 w-4 text-slate-500" />
          <span className="text-[0.925rem]">Search, command, or jump to...</span>
        </button>
        <NotificationCenter />
        <button className="h-11 rounded-xl border border-white/8 bg-slate-900/50 px-4 text-sm font-semibold text-slate-200 hover:bg-white/8 active:scale-[0.98] transition-all" onClick={() => navigate('/settings')}>
          {user ? user.name.split(' ')[0] : 'Profile'}
        </button>
      </div>
    </header>
  );
}