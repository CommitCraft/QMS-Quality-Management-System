import { api } from './api';
import { ApiResponse, PaginationMeta } from '../types';

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export const entityService = {
  list: async <T>(endpoint: string, params?: Record<string, string | number | undefined>) =>
    (await api.get<ListResponse<T>>(`${endpoint}`, { params })).data,
  create: async <T>(endpoint: string, payload: Record<string, unknown>) =>
    (await api.post<ApiResponse<T>>(`${endpoint}`, payload)).data,
  update: async <T>(endpoint: string, id: number, payload: Record<string, unknown>) =>
    (await api.put<ApiResponse<T>>(`${endpoint}/${id}`, payload)).data,
  remove: async (endpoint: string, id: number) => (await api.delete<ApiResponse<null>>(`${endpoint}/${id}`)).data,
  options: async <T>(endpoint: string) => (await api.get<ApiResponse<T[]>>(endpoint)).data,
};
