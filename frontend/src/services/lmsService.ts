import { api } from './api';
import type { ApiResponse, PaginationMeta } from '../types';

export type LmsCourse = {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  autoAssignNewEmployee?: boolean;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  completionPercentage?: number;
  assignedEmployeeCount?: number;
  contentCount?: number;
};

export type LmsSummary = {
  totalCourses: number;
  activeCourses: number;
  assignedEmployees: number;
  completionPercentage: number;
  topCourses: Array<{ id: number; title: string; enrollmentCount: number }>;
};

export type LmsCourseContent = {
  id: number;
  courseId: number;
  module?: string | null;
  title: string;
  description?: string | null;
  contentSourceType?: 'file' | 'url';
  contentType?: 'video' | 'pdf' | 'doc' | 'image' | 'link' | 'ppt' | 'other';
  fileUrl?: string | null;
  externalUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  displayOrder?: number;
  isRequired?: boolean;
  status?: string;
};

export type LmsAssignment = {
  id: number;
  courseId: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  maxMarks?: number;
  passingMarks?: number;
  attachmentSourceType?: 'file' | 'url';
  attachmentType?: 'video' | 'pdf' | 'doc' | 'image' | 'link' | 'ppt' | 'other';
  attachmentUrl?: string | null;
  attachmentFileName?: string | null;
  attachmentFileSize?: number | null;
  attachmentMimeType?: string | null;
  status?: string;
  course?: { id: number; title: string };
  submittedCount?: number;
  checkedCount?: number;
  pendingCount?: number;
  assignedEmployeeCount?: number;
};

export type LmsSubmission = {
  id: number;
  assignmentId: number;
  employeeId: number;
  submissionType?: 'file' | 'text' | 'url';
  submissionText?: string | null;
  submissionUrl?: string | null;
  uploadedFileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  submittedAt?: string;
  status?: string;
  marksObtained?: number | null;
  feedback?: string | null;
  assignment?: { id: number; title: string; course?: { id: number; title: string } };
};

export type LmsTestSeries = {
  id: number;
  courseId: number;
  title: string;
  description?: string | null;
  totalQuestions?: number;
  totalMarks?: number;
  passingMarks?: number;
  durationMinutes?: number;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  course?: { id: number; title: string };
  questions?: Array<Record<string, unknown>>;
};

export const lmsService = {
  listCourses: async (params?: Record<string, string | number | undefined>) => {
    const response = await api.get<ApiResponse<LmsCourse[]>>('/courses', { params });
    return response.data;
  },
  getCourse: async (id: number) => {
    const response = await api.get<ApiResponse<LmsCourse>>(`/courses/${id}`);
    return response.data;
  },
  saveCourse: async (payload: Partial<LmsCourse> & { title: string }) => {
    const response = await api.post<ApiResponse<LmsCourse>>('/courses', payload);
    return response.data;
  },
  updateCourse: async (id: number, payload: Partial<LmsCourse>) => {
    const response = await api.put<ApiResponse<LmsCourse>>(`/courses/${id}`, payload);
    return response.data;
  },
  deleteCourse: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/courses/${id}`);
    return response.data;
  },
  duplicateCourse: async (id: number) => {
    const response = await api.post<ApiResponse<LmsCourse>>(`/courses/${id}/duplicate`);
    return response.data;
  },
  courseSummary: async () => {
    const response = await api.get<ApiResponse<LmsSummary>>('/courses/summary');
    return response.data;
  },
  listContent: async (courseId: number) => {
    const response = await api.get<ApiResponse<LmsCourseContent[]>>(`/courses/${courseId}/content`);
    return response.data;
  },
  saveContent: async (courseId: number, payload: Partial<LmsCourseContent> & { title: string }) => {
    const response = await api.post<ApiResponse<LmsCourseContent>>(`/courses/${courseId}/content`, payload);
    return response.data;
  },
  uploadContent: async (courseId: number, formData: FormData) => {
    const response = await api.post<ApiResponse<LmsCourseContent>>(`/courses/${courseId}/content`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  updateContent: async (id: number, payload: Partial<LmsCourseContent>) => {
    const response = await api.put<ApiResponse<LmsCourseContent>>(`/course-content/${id}`, payload);
    return response.data;
  },
  updateContentWithFile: async (id: number, formData: FormData) => {
    const response = await api.put<ApiResponse<LmsCourseContent>>(`/course-content/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  deleteContent: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/course-content/${id}`);
    return response.data;
  },
  reorderContent: async (items: Array<{ id: number; displayOrder: number }>) => {
    const response = await api.patch<ApiResponse<null>>('/course-content/reorder', { items });
    return response.data;
  },
  uploadCourseContent: async (courseId: number, formData: FormData) => {
    const response = await api.post<ApiResponse<any>>(`/courses/${courseId}/content`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  listAssignments: async () => {
    const response = await api.get<ApiResponse<LmsAssignment[]>>('/assignments');
    return response.data;
  },
  saveAssignment: async (payload: Partial<LmsAssignment> & { courseId: number; title: string }) => {
    const response = await api.post<ApiResponse<LmsAssignment>>('/assignments', payload);
    return response.data;
  },
  updateAssignment: async (id: number, payload: Partial<LmsAssignment>) => {
    const response = await api.put<ApiResponse<LmsAssignment>>(`/assignments/${id}`, payload);
    return response.data;
  },
  uploadAssignmentAttachment: async (id: number, formData: FormData) => {
    const response = await api.post<ApiResponse<LmsAssignment>>(`/assignments/${id}/upload-attachment`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },
  deleteAssignment: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/assignments/${id}`);
    return response.data;
  },
  checkSubmission: async (id: number, payload: Partial<LmsSubmission>) => {
    const response = await api.put<ApiResponse<LmsSubmission>>(`/assignment-submissions/${id}/check`, payload);
    return response.data;
  },
  listTestSeries: async () => {
    const response = await api.get<ApiResponse<LmsTestSeries[]>>('/test-series');
    return response.data;
  },
  saveTestSeries: async (payload: Partial<LmsTestSeries> & { courseId: number; title: string }) => {
    const response = await api.post<ApiResponse<LmsTestSeries>>('/test-series', payload);
    return response.data;
  },
  updateTestSeries: async (id: number, payload: Partial<LmsTestSeries>) => {
    const response = await api.put<ApiResponse<LmsTestSeries>>(`/test-series/${id}`, payload);
    return response.data;
  },
  deleteTestSeries: async (id: number) => {
    const response = await api.delete<ApiResponse<null>>(`/test-series/${id}`);
    return response.data;
  },
  updateTestSeriesStatus: async (id: number, status: string) => {
    const response = await api.patch<ApiResponse<LmsTestSeries>>(`/test-series/${id}/status`, { status });
    return response.data;
  },
  listSubmissions: async () => {
    const response = await api.get<ApiResponse<LmsSubmission[]>>('/assignment-submissions');
    return response.data;
  },
  updateSubmission: async (id: number, payload: Partial<LmsSubmission>) => {
    const response = await api.patch<ApiResponse<LmsSubmission>>(`/assignment-submissions/${id}/status`, payload);
    return response.data;
  },
};
