import { Course, CourseEnrollment, CourseProgress, User } from '../../../models';
import { Op } from 'sequelize';
import { sequelize } from '../../../config/database';

export const trainingCrudConfig = {
  path: '/training',
  entityName: 'course',
  model: Course,
  permissionBase: 'training',
  searchFields: ['code', 'title', 'category', 'instructor'],
};

export const getCourseEnrollmentStats = async (courseId: number) => {
  const enrollment = await CourseEnrollment.count({ where: { courseId } });
  const completed = await CourseEnrollment.count({
    where: { courseId, status: 'Completed' },
  });
  return { enrollment, completed };
};

export const getUserCourses = async (userId: number, searchQuery?: string) => {
  const where: any = { userId };

  const courses = await CourseEnrollment.findAll({
    where,
    include: [
      {
        model: Course,
        as: 'course',
        where: searchQuery
          ? {
              [Op.or]: [
                { code: { [Op.like]: `%${searchQuery}%` } },
                { title: { [Op.like]: `%${searchQuery}%` } },
              ],
            }
          : undefined,
      },
      {
        model: CourseProgress,
        as: 'progress',
      },
    ],
    order: [['enrolledDate', 'DESC']],
  });

  return courses.map((enrollment: any) => ({
    id: enrollment.id,
    courseId: enrollment.courseId,
    code: enrollment.course?.code,
    title: enrollment.course?.title,
    description: enrollment.course?.description,
    duration: enrollment.course?.duration,
    status: enrollment.status,
    progressPercentage: enrollment.progress?.progressPercentage || 0,
    completedDate: enrollment.progress?.completedDate,
    enrolledDate: enrollment.enrolledDate,
  }));
};

export const getTrainingSummary = async () => {
  const totalCourses = await Course.count({ where: { status: 'Active' } });
  const activeCourses = totalCourses;

  const enrollments = await CourseEnrollment.count();

  const completedEnrollments = await CourseEnrollment.count({
    where: { status: 'Completed' },
  });

  const completionRate = enrollments > 0 ? Math.round((completedEnrollments / enrollments) * 100) : 0;

  // Get top courses by enrollment
  const topCourses = await Course.findAll({
    attributes: { include: [[sequelize.literal('(SELECT COUNT(*) FROM course_enrollments WHERE course_enrollments.course_id = Course.id)'), 'enrollmentCount']] },
    order: [[sequelize.literal('enrollmentCount'), 'DESC']],
    limit: 5,
    subQuery: false,
  });

  return {
    totalCourses,
    activeCourses,
    totalEnrollments: enrollments,
    completionRate,
    topCourses: topCourses.map((course: any) => ({
      id: course.id,
      code: course.code,
      title: course.title,
      enrollmentCount: course.dataValues.enrollmentCount || 0,
    })),
  };
};

