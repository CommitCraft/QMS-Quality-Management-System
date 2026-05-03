import { lmsService } from '../../../services/lmsService';
import { api } from '../../../services/api';
import type { LmsItem } from '../types';

export const contentService = {
  list: async (courseId: number) => {
    const response = await lmsService.listContent(courseId);
    return (response.data || []) as LmsItem[];
  },

  create: async (courseId: number, payload: Record<string, unknown> & { title: string }) => {
    return lmsService.saveContent(courseId, payload);
  },

  createWithFile: async (courseId: number, formData: FormData) => {
    return lmsService.uploadContent(courseId, formData);
  },

  update: async (id: number, payload: Record<string, unknown>) => {
    return lmsService.updateContent(id, payload);
  },

  updateWithFile: async (id: number, formData: FormData) => {
    return lmsService.updateContentWithFile(id, formData);
  },

  remove: async (id: number) => {
    return lmsService.deleteContent(id);
  },

  listProgress: async (courseId: number | string) => {
    const response = await api.get(`/courses/${courseId}/content-progress`);
    return response.data?.data || [];
  },

  updateProgress: async (courseId: number | string, contentId: number | string, status: 'not_started' | 'opened' | 'completed') => {
    const response = await api.patch(`/courses/${courseId}/content/${contentId}/progress`, { status });
    return response.data;
  },
};
