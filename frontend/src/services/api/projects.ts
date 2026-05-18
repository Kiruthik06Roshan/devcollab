import { api } from './client';
import type { Project, BoardResponse } from '@/types/entities';

export function fetchProjects(workspaceId: string) {
  return api.get<{ projects: Project[] }>(`/workspaces/${workspaceId}/projects`).then((response) => response.data);
}

export function createProject(payload: { workspaceId: string; name: string; description?: string; color?: string }) {
  return api.post<{ project: Project }>('/projects', payload).then((response) => response.data);
}

export function fetchProjectBoard(projectId: string) {
  return api.get<BoardResponse>(`/projects/${projectId}/board`).then((response) => response.data);
}