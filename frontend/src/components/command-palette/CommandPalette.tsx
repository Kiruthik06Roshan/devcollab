import { useUiStore } from '@/state/uiStore';

export function CommandPalette() {
  const isOpen = useUiStore((state) => state.commandPaletteOpen);
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);

  if (!isOpen) {
    return (
      <button
        className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-slate-900/95 px-4 py-2 text-sm text-slate-300 shadow-soft backdrop-blur"
        onClick={() => setCommandPaletteOpen(true)}
      >
        Command palette placeholder
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 px-4 pt-24">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
          <span>Quick actions</span>
          <button onClick={() => setCommandPaletteOpen(false)}>Close</button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-500">
          Search projects, create tasks, open wiki pages, and trigger AI actions here.
        </div>
      </div>
    </div>
  );
}