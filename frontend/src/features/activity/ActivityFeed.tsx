import { useEffect, useState } from 'react';
import { fetchActivities } from '@/services/api/activity';
import { useSocket } from '@/hooks/useSocket';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ActivityFeed({ workspaceId }: { workspaceId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const socket = useSocket();

  useEffect(() => {
    let mounted = true;
    void fetchActivities(workspaceId)
      .then((res) => {
        if (!mounted) return;
        setItems(res.activities || []);
      })
      .catch(() => {});

    try {
      socket.connect();
      const handler = (payload: { workspaceId: string }) => {
        if (payload.workspaceId !== workspaceId) return;
        void fetchActivities(workspaceId).then((res) => setItems(res.activities || [])).catch(() => {});
      };
      socket.on('activity:new', handler);
      return () => {
        mounted = false;
        socket.off('activity:new', handler);
      };
    } catch (err) {
      return () => {
        mounted = false;
      };
    }
  }, [workspaceId, socket]);

  return (
    <div className="space-y-4">
      <Card className="border-white/10 bg-white/5">
        <CardHeader className="border-white/5">Activity</CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.length ? (
              items.map((item) => (
                <div key={item._id} className="flex items-start gap-3 rounded-lg border border-white/5 p-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-800" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-slate-200">{item.summary}</div>
                    <div className="mt-1 text-xs text-slate-500">{formatDistanceToNow(new Date(item.createdAt))} ago</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
