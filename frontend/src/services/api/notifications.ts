import { api } from './client';

export function fetchNotifications() {
  return api.get<{ notifications: Array<{ id: string; title: string }> }>('/notifications').then((response) => response.data);
}

export function markNotificationRead(notificationId: string) {
  return api.patch(`/notifications/${notificationId}/read`).then((res) => res.data);
}

export function markAllNotifications() {
  return api.patch('/notifications/mark-all').then((res) => res.data);
}