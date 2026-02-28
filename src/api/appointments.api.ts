import { apiClient } from './client';
import { ApiResponse, Appointment, NotificationChannel } from '@/types';

export interface NotificationPayload {
  minutesBefore: number;
  channel: NotificationChannel;
  recipientPhone: string;
}

export interface AppointmentPayload {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  category?: string;
  memberId?: string;
  notifications?: NotificationPayload[];
}

export const appointmentsApi = {
  getAll: async (params?: { upcoming?: boolean; memberId?: string }) => {
    const res = await apiClient.get<ApiResponse<Appointment[]>>('/appointments', { params });
    return res.data.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return res.data.data;
  },

  create: async (payload: AppointmentPayload) => {
    const res = await apiClient.post<ApiResponse<Appointment>>('/appointments', payload);
    return res.data.data;
  },

  update: async (id: string, payload: AppointmentPayload) => {
    const res = await apiClient.put<ApiResponse<Appointment>>(`/appointments/${id}`, payload);
    return res.data.data;
  },

  remove: async (id: string) => {
    await apiClient.delete(`/appointments/${id}`);
  },
};
