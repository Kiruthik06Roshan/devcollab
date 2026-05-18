import { api } from './client';

export function fetchWikiPages(projectId: string) {
  return api.get<{ pages: Array<{ id: string; title: string }> }>(`/projects/${projectId}/wiki`).then((response) => response.data);
}