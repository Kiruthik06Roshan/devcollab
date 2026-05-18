import { api } from './client';
import type { Task } from '@/types/entities';

export function fetchProjectTasks(projectId: string) {
  return api.get<{ tasks: Task[] }>(`/projects/${projectId}/tasks`).then((response) => response.data);
}

export function createTask(projectId: string, payload: Record<string, unknown>) {
  return api.post<{ task: Task }>(`/projects/${projectId}/tasks`, payload).then((response) => response.data);
}

export function updateTask(taskId: string, payload: Record<string, unknown>) {
  return api.patch<{ task: Task }>(`/tasks/${taskId}`, payload).then((response) => response.data);
}

export function deleteTask(taskId: string) {
  return api.delete(`/tasks/${taskId}`).then((response) => response.data);
}

export function moveTask(taskId: string, payload: { status: string; order: number }) {
  return api.patch<{ task: Task }>(`/tasks/${taskId}/move`, payload).then((response) => response.data);
}