import { api } from './api';
import { ApiResponse, DashboardCharts, DashboardSummary } from '../types';

export const dashboardService = {
  summary: async () => (await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary')).data,
  charts: async () => (await api.get<ApiResponse<DashboardCharts>>('/dashboard/charts')).data,
};
