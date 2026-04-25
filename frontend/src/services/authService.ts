import { api } from './api';
import { ApiResponse, UserSession } from '../types';

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post<ApiResponse<{ accessToken: string; user: UserSession }>>('/auth/login', { username, password });
    return response.data;
  },
  me: async () => {
    const response = await api.get<ApiResponse<UserSession>>('/auth/me');
    return response.data;
  },
  logout: async () => {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return response.data;
  },
  updateProfile: async (payload: { name: string; email: string; mobile?: string }) => {
    const response = await api.put<ApiResponse<UserSession>>('/auth/profile', payload);
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post<ApiResponse<null>>('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};
