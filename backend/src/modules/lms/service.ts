import { Op } from 'sequelize';
import { Course, CourseEnrollment, CourseProgress, User } from '../../models';
import { Assignment, AssignmentSubmission, CourseContent, CourseContentProgress, TestQuestion, TestSeries } from './models';

export const getCourseSummary = async () => {
  const totalCourses = await Course.count();
  const activeCourses = await Course.count({ where: { status: 'Active' } });
  const totalEnrollments = await CourseEnrollment.count();
  const assignedEmployees = totalEnrollments;
  const completedEnrollments = await CourseEnrollment.count({ where: { status: 'Completed' } });
  const completionPercentage = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

  const topCourses = await Course.findAll({
    limit: 5,
    order: [['updatedAt', 'DESC']],
    include: [{ model: CourseEnrollment, as: 'enrollments', attributes: ['id'] }],
  });

  return {
    totalCourses,
    activeCourses,
    assignedEmployees,
    completionPercentage,
    topCourses: topCourses.map((course: any) => ({
      id: course.id,
      title: course.title,
      enrollmentCount: course.enrollments?.length || 0,
    })),
  };
};

export const getCourseDetail = async (id: number) => {
  return Course.findByPk(id, {
    include: [
      { model: Assignment, as: 'assignments', include: [{ model: AssignmentSubmission, as: 'submissions' }] },
      { model: TestSeries, as: 'testSeries', include: [{ model: TestQuestion, as: 'questions' }] },
      { model: CourseContent, as: 'contents' },
    ],
  });
};

export const getEmployeeAssignmentStatus = async (employeeId: number) => {
  const submissions = await AssignmentSubmission.findAll({ where: { employeeId }, include: [{ model: Assignment, as: 'assignment', include: [{ model: Course, as: 'course' }] }] });
  const enrollments = await CourseEnrollment.findAll({ where: { userId: employeeId }, include: [{ model: Course, as: 'course' }, { model: CourseProgress, as: 'progress' }] });
  return { submissions, enrollments };
};

export const listCourseContent = async (courseId: number) => CourseContent.findAll({ where: { courseId }, order: [['module', 'ASC'], ['displayOrder', 'ASC'], ['createdAt', 'ASC']] });

export const listAssignments = async (search?: string) => Assignment.findAll({
  where: search ? { title: { [Op.like]: `%${search}%` } } : undefined,
  include: [{ model: Course, as: 'course' }, { model: AssignmentSubmission, as: 'submissions' }],
  order: [['createdAt', 'DESC']],
});

export const listTestSeries = async (where?: any) => TestSeries.findAll({ where, include: [{ model: Course, as: 'course' }, { model: TestQuestion, as: 'questions' }], order: [['createdAt', 'DESC']] });
