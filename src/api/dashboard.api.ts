import { apiClient } from './client';
import { ApiResponse, DashboardSummary, TrendPoint } from '@/types';

export const dashboardApi = {
  getSummary: async (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const res = await apiClient.get<ApiResponse<DashboardSummary>>(
      `/dashboard/summary?${params.toString()}`
    );
    return res.data.data;
  },

  getTrend: async (from?: string, to?: string, groupBy: 'month' | 'week' = 'month') => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('groupBy', groupBy);
    const res = await apiClient.get<ApiResponse<{ trend: TrendPoint[] }>>(
      `/dashboard/trend?${params.toString()}`
    );
    return res.data.data;
  },
};
