import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { appRoutes } from '@/lib/routes';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/state/authStore';
import { useUiStore } from '@/state/uiStore';
import { logout } from '@/services/api/auth';

const primaryLinks = [
  { to: appRoutes.dashboard, label: 'Dashboard' },
  { to: '/dashboard', label: 'Workspaces' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/project/demo/board', label: 'Tasks' },
  { to: '/settings', label: 'Settings' }
];

export function SidebarNav() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  async function handleLogout() {
    try {
      await logout();
      clearSession();
      navigate('/login');
    } catch {
      clearSession();
      navigate('/login');
    }
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 w-72 shrink-0 border-r border-border bg-surface/85 px-4 py-6 backdrop-blur-xl transition-all duration-300 lg:static lg:flex lg:flex-col lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="mb-6 rounded-2xl border border-border bg-surface/50 p-5 shadow-soft premium-card">
        <div className="text-xs font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">DevCollab</div>
        <div className="mt-2 text-[0.875rem] leading-relaxed text-muted">Collaboration OS for student developer teams</div>
        <button className="w-full mt-4 flex items-center justify-center rounded-xl border border-border bg-surface/85 px-3 py-2.5 text-center text-sm font-semibold text-text hover:bg-surface/50 active:scale-[0.98] transition-all" onClick={() => navigate('/dashboard')}>
          <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
          {user ? `${user.name}` : 'Workspace overview'}
        </button>
      </div>
      <nav className="space-y-1.5 flex-1">
        {primaryLinks.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'block rounded-xl py-2.5 text-[0.925rem] font-medium transition-all duration-200 relative group active:scale-[0.99]',
                isActive ? 'bg-cyan-400/8 text-cyan-400 border-l-2 border-cyan-400 pl-3 font-semibold' : 'text-muted hover:bg-surface/50 hover:text-text pl-4'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-start rounded-xl px-4 py-2.5 text-[0.925rem] font-semibold text-rose-400 hover:bg-rose-500/10 active:scale-[0.98] transition-all"
        >
          <LogOut className="mr-2 h-4 w-4 text-rose-400" />
          Sign out
        </button>
      </div>
      <button className="mt-6 rounded-xl border border-border bg-surface/85 px-3 py-2 text-sm font-semibold text-text lg:hidden hover:bg-surface/50" onClick={() => setSidebarOpen(false)}>
        Close sidebar
      </button>
    </aside>
  );
}