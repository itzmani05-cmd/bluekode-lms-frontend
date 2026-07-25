import { create } from 'zustand';
import {
  fetchNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '../lib/api/notifications';
import type { Notification } from '../lib/api/notifications';

interface NotificationsState {
  notifications: Notification[];
  unreadCount:   number;
  loading:       boolean;

  fetch:        () => Promise<void>;
  markRead:     (id: number) => Promise<void>;
  markAllRead:  () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount:   0,
  loading:       false,

  fetch: async () => {
    set({ loading: true });
    try {
      const { data, unreadCount } = await fetchNotificationsApi();
      set({ notifications: data, unreadCount, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  markRead: async (id) => {
    await markNotificationReadApi(id);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.notification_id === id ? { ...n, is_read: true } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await markAllNotificationsReadApi();
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },
}));
