import { apiClient } from './client';
import { ApiResponse, ExtraIncome, FamilyMember } from '@/types';

export const membersApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<FamilyMember[]>>('/members');
    return res.data.data;
  },

  getOne: async (id: string) => {
    const res = await apiClient.get<ApiResponse<FamilyMember>>(`/members/${id}`);
    return res.data.data;
  },

  create: async (data: { name: string; role?: string; salary: number }) => {
    const res = await apiClient.post<ApiResponse<FamilyMember>>('/members', data);
    return res.data.data;
  },

  update: async (id: string, data: { name?: string; role?: string; salary?: number }) => {
    const res = await apiClient.put<ApiResponse<FamilyMember>>(`/members/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/members/${id}`);
  },

  // Extra incomes
  addExtraIncome: async (memberId: string, data: { name: string; amount: number }) => {
    const res = await apiClient.post<ApiResponse<ExtraIncome>>(
      `/members/${memberId}/extra-incomes`,
      data
    );
    return res.data.data;
  },

  updateExtraIncome: async (
    memberId: string,
    incomeId: string,
    data: { name?: string; amount?: number }
  ) => {
    const res = await apiClient.put<ApiResponse<ExtraIncome>>(
      `/members/${memberId}/extra-incomes/${incomeId}`,
      data
    );
    return res.data.data;
  },

  deleteExtraIncome: async (memberId: string, incomeId: string) => {
    await apiClient.delete(`/members/${memberId}/extra-incomes/${incomeId}`);
  },
};
