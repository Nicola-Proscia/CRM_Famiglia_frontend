import { apiClient } from './client';
import { ApiResponse, RenovationItem, RenovationProject, RenovationStatus, RenovationSummary } from '@/types';

export const renovationApi = {
  getAllProjects: async () => {
    const res = await apiClient.get<ApiResponse<RenovationProject[]>>('/renovation/projects');
    return res.data.data;
  },

  getProject: async (id: string) => {
    const res = await apiClient.get<ApiResponse<RenovationProject>>(`/renovation/projects/${id}`);
    return res.data.data;
  },

  createProject: async (data: {
    name: string;
    company?: string;
    status?: RenovationStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<RenovationProject>>('/renovation/projects', data);
    return res.data.data;
  },

  updateProject: async (
    id: string,
    data: {
      name?: string;
      company?: string;
      status?: RenovationStatus;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const res = await apiClient.put<ApiResponse<RenovationProject>>(`/renovation/projects/${id}`, data);
    return res.data.data;
  },

  deleteProject: async (id: string) => {
    await apiClient.delete(`/renovation/projects/${id}`);
  },

  // Items
  createItem: async (
    projectId: string,
    data: { name: string; company?: string; totalPrice: number; paidAmount?: number }
  ) => {
    const res = await apiClient.post<ApiResponse<RenovationItem>>(
      `/renovation/projects/${projectId}/items`,
      data
    );
    return res.data.data;
  },

  updateItem: async (
    projectId: string,
    itemId: string,
    data: { name?: string; company?: string; totalPrice?: number; paidAmount?: number }
  ) => {
    const res = await apiClient.put<ApiResponse<RenovationItem>>(
      `/renovation/projects/${projectId}/items/${itemId}`,
      data
    );
    return res.data.data;
  },

  deleteItem: async (projectId: string, itemId: string) => {
    await apiClient.delete(`/renovation/projects/${projectId}/items/${itemId}`);
  },

  getSummary: async () => {
    const res = await apiClient.get<ApiResponse<RenovationSummary>>('/renovation/summary');
    return res.data.data;
  },
};
