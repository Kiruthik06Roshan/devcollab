import { NavLink, useNavigate } from 'react-router-dom';
import { appRoutes } from '@/lib/routes';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/state/authStore';
import { useUiStore } from '@/state/uiStore';

const primaryLinks = [
  { to: appRoutes.dashboard, label: 'Dashboard' },
  { to: '/dashboard', label: 'Workspaces' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/project/demo/board', label: 'Tasks' },
  { to: '/project/demo/board', label: 'Wiki' },
  { to: '/project/demo/board', label: 'Snippets' },
  { to: '/project/demo/board', label: 'Activity' },
  { to: '/settings', label: 'Settings' }
];

export function SidebarNav() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 w-72 shrink-0 border-r border-white/5 bg-slate-950/95 px-4 py-5 backdrop-blur transition-transform lg:static lg:flex lg:flex-col lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="mb-6 rounded-2xl border border-white/5 bg-white/5 px-4 py-4 shadow-soft">
        <div className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-300">DevCollab</div>
        <div className="mt-2 text-sm text-slate-300">Collaboration OS for student developer teams</div>
        <button className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-sm text-slate-200" onClick={() => navigate('/dashboard')}>
          {user ? `${user.name}` : 'Workspace overview'}
        </button>
      </div>
      <nav className="space-y-1">
        {primaryLinks.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'block rounded-xl px-3 py-2 text-sm transition',
                isActive ? 'bg-cyan-400/10 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button className="mt-6 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 lg:hidden" onClick={() => setSidebarOpen(false)}>
        Close sidebar
      </button>
    </aside>
  );
}