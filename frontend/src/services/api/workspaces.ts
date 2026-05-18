import { api } from './client';
import type { Workspace } from '@/types/entities';

export function fetchWorkspaces() {
  return api.get<{ workspaces: Workspace[] }>('/workspaces').then((response) => response.data);
}

export function fetchWorkspace(workspaceId: string) {
  return api.get<{ workspace: Workspace }>(`/workspaces/${workspaceId}`).then((response) => response.data);
}

export function createWorkspace(payload: { name: string; description?: string }) {
  return api.post<{ workspace: Workspace }>('/workspaces', payload).then((response) => response.data);
}