import { apiClient } from './client';
import { ApiResponse, Expense, ExpenseFrequency } from '@/types';

export interface HistoryMonth {
  month: number;
  year: number;
  count: number;
  total: number;
}

export const expensesApi = {
  getAll: async () => {
    const res = await apiClient.get<ApiResponse<Expense[]>>('/expenses');
    return res.data.data;
  },

  getOne: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return res.data.data;
  },

  getHistoryMonths: async (): Promise<HistoryMonth[]> => {
    const res = await apiClient.get<ApiResponse<HistoryMonth[]>>('/expenses/history');
    return res.data.data;
  },

  getHistoryExpenses: async (month: number, year: number): Promise<Expense[]> => {
    const res = await apiClient.get<ApiResponse<Expense[]>>(
      `/expenses/history?month=${month}&year=${year}`
    );
    return res.data.data;
  },

  create: async (data: {
    name: string;
    amount: number;
    frequency: ExpenseFrequency;
    category: string;
    dayOfMonth?: number;
    date?: string;
    isActive?: boolean;
  }) => {
    const res = await apiClient.post<ApiResponse<Expense>>('/expenses', data);
    return res.data.data;
  },

  update: async (
    id: string,
    data: {
      name?: string;
      amount?: number;
      frequency?: ExpenseFrequency;
      category?: string;
      dayOfMonth?: number;
      date?: string;
      isActive?: boolean;
    }
  ) => {
    const res = await apiClient.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/expenses/${id}`);
  },
};
