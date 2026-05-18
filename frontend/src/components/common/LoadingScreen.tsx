export function LoadingScreen({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg text-slate-300">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm shadow-soft">{label}...</div>
    </div>
  );
}