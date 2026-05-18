import { api } from './client';

export function fetchAiInsights(projectId: string) {
  return api.get<{ summary: string }>(`/projects/${projectId}/ai/insights`).then((response) => response.data);
}