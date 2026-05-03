import { api } from '../../../services/api';
import { lmsService } from '../../../services/lmsService';
import type { LmsItem } from '../types';

type TestAttempt = {
  id?: number;
  time: string;
  score: number;
  passed: boolean;
};

export const testSeriesService = {
  list: async () => {
    const response = await lmsService.listTestSeries();
    return (response.data || []) as LmsItem[];
  },

  listByCourse: async (courseId: number | string) => {
    const response = await api.get(`/test-series?courseId=${courseId}`);
    return (response.data?.data || []) as LmsItem[];
  },

  create: async (payload: Record<string, unknown>) => {
    return lmsService.saveTestSeries(payload as never);
  },

  update: async (id: number, payload: Record<string, unknown>) => {
    return lmsService.updateTestSeries(id, payload);
  },

  remove: async (id: number) => {
    return lmsService.deleteTestSeries(id);
  },

  getById: async (id: number | string) => {
    const response = await api.get(`/test-series/${id}`);
    return response.data?.data;
  },

  listAttempts: async (id: number | string) => {
    const response = await api.get(`/test-series/${id}/attempts`);
    return (response.data?.data || []) as TestAttempt[];
  },

  createAttempt: async (id: number | string, payload: { score: number; passed: boolean }) => {
    const response = await api.post(`/test-series/${id}/attempts`, payload);
    return response.data?.data as TestAttempt | undefined;
  },

  getAttemptsReport: async (id: number | string) => {
    const response = await api.get(`/test-series/${id}/attempts/report`);
    return response.data?.data;
  },
};
