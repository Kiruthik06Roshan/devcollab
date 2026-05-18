import { api } from './client';

export function fetchSnippets(projectId: string) {
  return api.get<{ snippets: Array<{ id: string; title: string }> }>(`/projects/${projectId}/snippets`).then((response) => response.data);
}