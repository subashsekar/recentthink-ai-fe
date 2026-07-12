import { API_ENDPOINTS } from '@/constants';
import type { NotificationsQuery, NotificationsResponse } from '@/types/notification';
import { apiClient } from './client';

export const notificationsApi = {
  list: async (params?: NotificationsQuery) => {
    const res = await apiClient.get<NotificationsResponse>(API_ENDPOINTS.NOTIFICATIONS.LIST, {
      params,
    });
    return res.data;
  },

  markRead: async (id: string) => {
    const res = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    return res.data;
  },

  markAllRead: async () => {
    const res = await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
    return res.data;
  },
};
