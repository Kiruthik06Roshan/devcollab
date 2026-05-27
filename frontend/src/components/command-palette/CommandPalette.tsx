import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, X, Command, Sparkles, Folder, Bell, LayoutGrid, Settings, LogOut } from 'lucide-react';
import { useUiStore } from '@/state/uiStore';
import { useAuthStore } from '@/state/authStore';
import { logout } from '@/services/api/auth';

type CommandItem = {
  icon: any;
  label: string;
  category: string;
  action: () => void;
  shortcut?: string;
};

export function CommandPalette() {
  const isOpen = useUiStore((state) => state.commandPaletteOpen);
  const setCommandPaletteOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const clearSession = useAuthStore((state) => state.clearSession);

  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Close on Escape key press or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
      // Support keyboard shortcut CMD/CTRL + K to toggle palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isOpen);
      }
    }
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 flex items-center gap-2 rounded-full border border-border bg-slate-950/85 hover:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-text shadow-soft backdrop-blur transition-all duration-200 active:scale-[0.97]"
        onClick={() => setCommandPaletteOpen(true)}
      >
        <Command className="h-4 w-4 text-cyan-400" />
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-xs text-muted ml-1">Ctrl+K</kbd> for actions</span>
      </button>
    );
  }

  // Logout handler
  async function handleLogout() {
    try {
      setCommandPaletteOpen(false);
      await logout();
      clearSession();
      navigate('/login');
      toast.success('Signed out successfully');
    } catch {
      clearSession();
      navigate('/login');
    }
  }

  // Toggle Theme handler
  function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    toast.success(`Switched to ${nextTheme} mode`);
    setCommandPaletteOpen(false);
  }

  const commands: CommandItem[] = [
    {
      icon: LayoutGrid,
      label: 'Go to Dashboard',
      category: 'Navigation',
      action: () => {
        navigate('/dashboard');
        setCommandPaletteOpen(false);
      },
      shortcut: 'G D'
    },
    {
      icon: Folder,
      label: 'Go to Workspaces Overview',
      category: 'Navigation',
      action: () => {
        navigate('/dashboard');
        setCommandPaletteOpen(false);
      },
      shortcut: 'G W'
    },
    {
      icon: Bell,
      label: 'Go to Notifications Feed',
      category: 'Navigation',
      action: () => {
        navigate('/notifications');
        setCommandPaletteOpen(false);
      },
      shortcut: 'G N'
    },
    {
      icon: Command,
      label: 'Go to Tasks Board',
      category: 'Navigation',
      action: () => {
        navigate('/project/demo/board');
        setCommandPaletteOpen(false);
      },
      shortcut: 'G T'
    },
    {
      icon: Settings,
      label: 'Go to Settings',
      category: 'Navigation',
      action: () => {
        navigate('/settings');
        setCommandPaletteOpen(false);
      },
      shortcut: 'G S'
    },
    {
      icon: Sparkles,
      label: 'Toggle Appearance Theme (Dark/Light)',
      category: 'Preferences',
      action: toggleTheme,
      shortcut: 'T T'
    },
    {
      icon: LogOut,
      label: 'Sign Out Session',
      category: 'Session',
      action: handleLogout,
      shortcut: 'S O'
    }
  ];

  // Filter commands based on search
  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-24 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) setCommandPaletteOpen(false);
      }}
    >
      <div
        ref={containerRef}
        className="w-full max-w-2xl rounded-2xl border border-border bg-slate-950/90 shadow-soft backdrop-blur-md overflow-hidden premium-card flex flex-col max-h-[32rem]"
      >
        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3.5 shrink-0 bg-slate-950">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or navigate..."
            className="w-full bg-transparent text-[1rem] text-text outline-none placeholder:text-slate-500"
          />
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="p-1 rounded hover:bg-white/5 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] text-muted tracking-widest shrink-0">ESC</kbd>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted">
              No matching commands or actions found. Try searching for "Settings" or "Theme".
            </div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  onClick={item.action}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-text hover:bg-surface/50 hover:text-white cursor-pointer transition active:scale-[0.99] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-surface border border-border/50 text-muted group-hover:text-cyan-400 group-hover:border-cyan-400/20 transition-all">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-[11px] text-muted ml-2.5 px-2 py-0.5 rounded-full border border-border/30 bg-surface/30">{item.category}</span>
                    </div>
                  </div>
                  {item.shortcut ? (
                    <div className="flex gap-1 shrink-0">
                      {item.shortcut.split(' ').map((key, i) => (
                        <kbd
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-surface border border-border/80 text-[10px] text-muted font-bold"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-border/50 px-4 py-2.5 text-[11px] text-muted shrink-0 bg-slate-950 flex items-center justify-between">
          <span>Use <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border">↑↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border">ENTER</kbd> to select</span>
          <button onClick={() => setCommandPaletteOpen(false)} className="hover:text-text transition-colors">Close Palette</button>
        </div>
      </div>
    </div>
  );
}