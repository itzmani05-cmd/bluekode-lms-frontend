import api from '../axios';

export interface Notification {
  notification_id: number;
  user_id:         number;
  title:           string;
  message:         string;
  is_read:         boolean;
  created_at:      string | null;
}

export const fetchNotificationsApi = () =>
  api
    .get<{ success: boolean; data: Notification[]; unreadCount: number }>('/notifications')
    .then((r) => r.data);

export const markNotificationReadApi = (id: number) =>
  api.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllNotificationsReadApi = () =>
  api.patch('/notifications/read-all').then((r) => r.data);
