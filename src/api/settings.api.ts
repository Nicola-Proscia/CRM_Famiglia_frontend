import { apiClient } from './client';
import { ApiResponse, NotificationSettings, NotificationChannel } from '@/types';

export const settingsApi = {
  getNotifications: async () => {
    const res = await apiClient.get<ApiResponse<NotificationSettings>>('/settings/notifications');
    return res.data.data;
  },

  updateNotifications: async (data: {
    defaultPhone?: string;
    defaultChannel?: NotificationChannel;
    defaultMinutes?: number;
    timezone?: string;
  }) => {
    const res = await apiClient.put<ApiResponse<NotificationSettings>>(
      '/settings/notifications',
      data
    );
    return res.data.data;
  },

  sendTest: async (phone: string, channel: NotificationChannel) => {
    const res = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      '/settings/test',
      { phone, channel }
    );
    return res.data.data;
  },
};
