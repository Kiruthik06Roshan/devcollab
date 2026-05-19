import { PageFrame } from '@/components/common/PageFrame';
import { ActivityFeed } from '@/features/activity/ActivityFeed';
import { useAuth } from '@/hooks/useAuth';

export default function ProjectActivityPage() {
  const auth = useAuth();
  const workspaceId = auth.user?.workspaces?.[0]?.id ?? '';

  return (
    <PageFrame
      eyebrow="Feed"
      title="Activity feed"
      description="A centralized timeline for task changes, comments, AI insights, and collaboration events."
    >
      {workspaceId ? <ActivityFeed workspaceId={workspaceId} /> : null}
    </PageFrame>
  );
}