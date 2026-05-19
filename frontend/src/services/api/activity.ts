import { api } from './client';

export async function fetchActivities(workspaceId: string) {
  const res = await api.get('/activity', { params: { workspaceId } });
  return res.data as { activities: any[] };
}
