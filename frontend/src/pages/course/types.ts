// Course types
export type CourseRow = {
  id: number;
  code?: string;
  title?: string;
  description?: string;
  duration?: number;
  category?: string;
  instructor?: string;
  status?: string;
  createdAt?: string;
  autoAssignToNewEmployee?: boolean;
  autoAssign?: boolean;
};

export type CourseResponse = {
  success: boolean;
  data?: CourseRow[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CourseFormState = {
  code: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  instructor: string;
  status: 'Active' | 'Inactive';
  autoAssignToNewEmployee: boolean;
};

// Tab navigation
export type TabKey = 'Courses' | 'Content' | 'Assignments' | 'Checking' | 'Test Series';

// LMS data item
export type LmsItem = Record<string, any> & { id: number };

// LMS modal modes
export type LmsModalMode = 'content' | 'assignment' | 'submission' | 'testSeries';

// LMS form state
export type LmsFormState = {
  courseId: number;
  module: string;
  title: string;
  description: string;
  contentSourceType: 'file' | 'url';
  contentType: 'video' | 'pdf' | 'doc' | 'image' | 'link' | 'ppt' | 'other';
  fileUrl: string;
  externalUrl: string;
  fileName: string;
  contentFile: File | null;
  displayOrder: string;
  isRequired: boolean;
  status: string;
  dueDate: string;
  maxMarks: string;
  passingMarks: string;
  attachmentSourceType: 'file' | 'url';
  attachmentType: 'video' | 'pdf' | 'doc' | 'image' | 'link' | 'ppt' | 'other';
  attachmentUrl: string;
  attachmentFileName: string;
  assignmentFile: File | null;
  totalQuestions: string;
  totalMarks: string;
  durationMinutes: string;
  startDate: string;
  endDate: string;
  submissionStatus: string;
  marksObtained: string;
  feedback: string;
};

// Constants
export const COURSE_TABS: TabKey[] = ['Courses', 'Content', 'Assignments', 'Checking', 'Test Series'];

export const DEFAULT_LMS_FORM: LmsFormState = {
  courseId: 0,
  module: '',
  title: '',
  description: '',
  contentSourceType: 'url',
  contentType: 'pdf',
  fileUrl: '',
  externalUrl: '',
  fileName: '',
  contentFile: null,
  displayOrder: '1',
  isRequired: false,
  status: 'Draft',
  dueDate: '',
  maxMarks: '100',
  passingMarks: '40',
  attachmentSourceType: 'url',
  attachmentType: 'pdf',
  attachmentUrl: '',
  attachmentFileName: '',
  assignmentFile: null,
  totalQuestions: '0',
  totalMarks: '0',
  durationMinutes: '0',
  startDate: '',
  endDate: '',
  submissionStatus: 'submitted',
  marksObtained: '',
  feedback: '',
};

export const DEFAULT_COURSE_FORM: CourseFormState = {
  code: '',
  title: '',
  description: '',
  duration: '',
  category: '',
  instructor: '',
  status: 'Active',
  autoAssignToNewEmployee: true,
};

// Utility function
export const formatDate = (value?: string): string => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};
