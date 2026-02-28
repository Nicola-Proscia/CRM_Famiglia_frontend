import { apiClient } from './client';
import { ApiResponse, User } from '@/types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    return res.data.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
  },

  me: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};
