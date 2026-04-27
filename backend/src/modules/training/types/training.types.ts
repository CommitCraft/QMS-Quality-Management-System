export interface Course {
  id: number;
  code: string;
  title: string;
  description?: string;
  duration: number;
  category?: string;
  instructor?: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseEnrollment {
  id: number;
  courseId: number;
  userId: number;
  enrolledDate: Date;
  status: 'Not Started' | 'In Progress' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseProgress {
  id: number;
  enrollmentId: number;
  progressPercentage: number;
  lastAccessedDate?: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseDTO {
  code: string;
  title: string;
  description?: string;
  duration: number;
  category?: string;
  instructor?: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdateCourseDTO {
  code?: string;
  title?: string;
  description?: string;
  duration?: number;
  category?: string;
  instructor?: string;
  status?: 'Active' | 'Inactive';
}

export interface AssignCourseDTO {
  courseId: number;
  userIds: number[];
}

export interface UserCourseDTO {
  id: number;
  courseId: number;
  code: string;
  title: string;
  description?: string;
  duration: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progressPercentage: number;
  completedDate?: Date;
  enrolledDate: Date;
}

export interface TrainingSummaryDTO {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  completionRate: number;
  topCourses: Array<{
    id: number;
    code: string;
    title: string;
    enrollmentCount: number;
  }>;
}
