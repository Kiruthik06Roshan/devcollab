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

  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/80 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" className="px-3 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </Button>
        <button className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-200 transition hover:bg-white/8" onClick={() => navigate('/dashboard')}>
          <LayoutDashboard className="h-4 w-4 text-cyan-300" />
          {user?.workspaces?.[0]?.name ?? 'Workspace'}
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
        <button className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-400">
          <Search className="h-4 w-4" />
          Search, command, or jump to...
        </button>
        <NotificationCenter />
        <button className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-200" onClick={() => navigate('/settings')}>
          {user ? user.name.split(' ')[0] : 'Profile'}
        </button>
      </div>
    </header>
  );
}