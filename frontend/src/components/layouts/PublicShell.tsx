import { Outlet, Link } from 'react-router-dom';
import { publicRoutes } from '@/lib/routes';

export function PublicShell() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_30%),linear-gradient(180deg,#090d14_0%,#0b0f17_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="mb-10 flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-5 py-4 backdrop-blur">
          <Link to={publicRoutes.home} className="text-sm font-semibold tracking-[0.24em] text-cyan-300 uppercase">
            DevCollab
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link to={publicRoutes.pricing}>Pricing</Link>
            <Link to={publicRoutes.login}>Login</Link>
          </nav>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}