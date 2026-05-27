import { useEffect, useRef, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { fetchNotifications, markNotificationRead, markAllNotifications } from '@/services/api/notifications';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const socket = useSocket();
  const auth = useAuth();
  const ref = useRef<HTMLDivElement | null>(null);

  const unreadCount = items.filter((i) => !i.readAt).length;

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchNotifications();
        if (!mounted) return;
        setItems(res.notifications ?? []);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    load();

    const handler = (payload: any) => {
      // If notification is for current user, refresh and pulse
      if (!auth.user) return;
      if (payload.userId && payload.userId !== auth.user.id) return;
      void fetchNotifications().then((res) => setItems(res.notifications ?? []));
      setHighlight(true);
      setTimeout(() => setHighlight(false), 1200);
      toast('New notification');
    };

    try {
      socket.connect();
      socket.on('notification:new', handler);
    } catch (err) {
      // ignore
    }

    return () => {
      mounted = false;
      try {
        socket.off('notification:new', handler);
      } catch (err) {
        // ignore
      }
    };
  }, [socket, auth.user]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  async function handleOpen() {
    setOpen((v) => !v);
    // if opening, clear highlight
    setHighlight(false);
  }

  async function handleMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      setItems((cur) => cur.map((it) => (it._id === id || it.id === id ? { ...it, readAt: new Date().toISOString() } : it)));
    } catch (err) {
      toast.error('Failed to mark read');
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotifications();
      setItems((cur) => cur.map((it) => ({ ...it, readAt: new Date().toISOString() })));
    } catch (err) {
      toast.error('Failed to mark all');
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        aria-label="Notifications"
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/8 ${highlight ? 'animate-pulse-slow' : ''}`}>
        <Bell className="h-4 w-4" />
        {unreadCount ? (
          <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px]">{unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/8 bg-slate-950/85 shadow-soft backdrop-blur-xl transition-all duration-200">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div className="text-[1.05rem] font-bold text-white tracking-wide">Notifications</div>
            <div className="flex items-center gap-3">
              <button className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors" onClick={handleMarkAll} disabled={!items.length}>Mark all read</button>
              <button className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition" onClick={() => setOpen(false)} aria-label="Close"><X className="h-4.5 w-4.5" /></button>
            </div>
          </div>
          <div className="max-h-96 overflow-auto p-3">
            {loading ? <div className="text-sm text-slate-500">Loading...</div> : null}
            {!loading && items.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">You're all caught up — no notifications</div>
            ) : null}
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item._id ?? item.id} className={`flex items-start gap-3 rounded-lg p-3 transition hover:bg-white/3 ${!item.readAt ? 'bg-white/3' : 'bg-transparent'}`}>
                  <div className="h-9 w-9 rounded-full bg-slate-800" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-slate-200">{item.title || item.summary}</div>
                      <div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                    {item.body ? <div className="mt-1 text-xs text-slate-400">{item.body}</div> : null}
                    <div className="mt-2 flex items-center gap-2">
                      {!item.readAt ? (
                        <button className="text-xs text-cyan-300" onClick={() => handleMarkRead(item._id ?? item.id)}>Mark read</button>
                      ) : (
                        <span className="text-xs text-slate-500">Read</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Tailwind custom animation class (in global CSS) `animate-pulse-slow` should be defined; fallback uses default pulse.
