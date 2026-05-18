import { api } from './client';

export function fetchNotifications() {
  return api.get<{ notifications: Array<{ id: string; title: string }> }>('/notifications').then((response) => response.data);
}