import { lmsService } from '../../../services/lmsService';
import { api } from '../../../services/api';
import type { LmsItem } from '../types';

export const assignmentService = {
  list: async () => {
    const response = await lmsService.listAssignments();
    return (response.data || []) as LmsItem[];
  },

  create: async (payload: Record<string, unknown>) => {
    return lmsService.saveAssignment(payload as never);
  },

  update: async (id: number, payload: Record<string, unknown>) => {
    return lmsService.updateAssignment(id, payload);
  },

  uploadAttachment: async (id: number, formData: FormData) => {
    return lmsService.uploadAssignmentAttachment(id, formData);
  },

  remove: async (id: number) => {
    return lmsService.deleteAssignment(id);
  },

  listSubmissions: async () => {
    const response = await lmsService.listSubmissions();
    return (response.data || []) as LmsItem[];
  },

  checkSubmission: async (id: number, payload: Record<string, unknown>) => {
    return lmsService.checkSubmission(id, payload);
  },

  listByCourse: async (courseId: number | string) => {
    const response = await api.get(`/assignments?courseId=${courseId}`);
    return (response.data?.data || []) as LmsItem[];
  },

  listSubmissionsByCourse: async (courseId: number | string) => {
    const response = await api.get(`/assignment-submissions?courseId=${courseId}`);
    return (response.data?.data || []) as LmsItem[];
  },

  submitAssignment: async (assignmentId: number | string, payload: { submissionType: 'url' | 'text'; submissionText?: string; submissionUrl?: string }) => {
    const response = await api.post(`/assignment-submissions/assignments/${assignmentId}/submit`, payload);
    return response.data;
  },

  submitAssignmentWithFile: async (assignmentId: number | string, formData: FormData) => {
    const response = await api.post(`/assignment-submissions/assignments/${assignmentId}/submit-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
