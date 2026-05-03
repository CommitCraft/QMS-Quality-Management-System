import { api } from '../../../services/api';
import { lmsService } from '../../../services/lmsService';
import type { CourseResponse } from '../types';

type CourseDetailResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

type MyCoursesResponse<T = unknown> = {
  success: boolean;
  data?: T[];
};

type TrainingSummaryResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

export const courseService = {
  summary: async () => {
    return lmsService.courseSummary();
  },

  listTrainingCourses: async (params?: Record<string, string | number | undefined>) => {
    const response = await api.get<CourseResponse>('/training', { params });
    return response.data;
  },

  createTrainingCourse: async (payload: Record<string, unknown>) => {
    const response = await api.post('/training', payload);
    return response.data;
  },

  updateTrainingCourse: async (id: number | string, payload: Record<string, unknown>) => {
    const response = await api.put(`/training/${id}`, payload);
    return response.data;
  },

  deleteTrainingCourse: async (id: number | string) => {
    const response = await api.delete(`/training/${id}`);
    return response.data;
  },

  getTrainingSummary: async <T = unknown>() => {
    const response = await api.get<TrainingSummaryResponse<T>>('/training/summary');
    return response.data;
  },

  getTrainingCourseById: async <T = unknown>(id: number | string) => {
    const response = await api.get<CourseDetailResponse<T>>(`/training/${id}`);
    return response.data;
  },

  listMyCourses: async <T = unknown>(params?: Record<string, string | number | undefined>) => {
    const response = await api.get<MyCoursesResponse<T>>('/training/my-courses', { params });
    return response.data;
  },

  listUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  listEnrollments: async (courseId: number | string) => {
    const response = await api.get(`/training/${courseId}/enrollments`);
    return response.data;
  },

  assignUsers: async (courseId: number | string, userIds: number[]) => {
    const response = await api.post('/training/assign', {
      courseId,
      userIds,
    });
    return response.data;
  },
};
