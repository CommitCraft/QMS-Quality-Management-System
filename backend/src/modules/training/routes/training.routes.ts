import { Router, Request, Response } from 'express';
import { authenticate, requirePermission, validateRequest } from '../../../common/middleware';
import { asyncHandler } from '../../../common/utils';
import { createTrainingRouter } from '../controller/training.controller';
import { getUserCourses, getTrainingSummary } from '../service/training.service';
import { CourseEnrollment, CourseProgress, Course, User } from '../../../models';
import { assignCourseValidators } from '../validation/training.validation';

const trainingRoutes = Router();

// Get user's enrolled courses
trainingRoutes.get(
  '/my-courses',
  authenticate,
  asyncHandler(async (req: any, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const search = req.query.search as string | undefined;
    const courses = await getUserCourses(userId, search);

    res.json({
      success: true,
      data: courses,
      total: courses.length,
    });
  })
);

  // Get course enrollments (users assigned to a course)
  trainingRoutes.get(
    '/:courseId/enrollments',
    authenticate,
    asyncHandler(async (req: any, res: Response) => {
      const { courseId } = req.params;
    
      if (!Number.isInteger(Number(courseId)) || Number(courseId) <= 0) {
        res.status(400).json({ error: 'Invalid course ID' });
        return;
      }

      const course = await Course.findByPk(courseId);
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const enrollments = await CourseEnrollment.findAll({
        where: { courseId: Number(courseId) },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'username', 'email', 'departmentId'],
            include: [
              {
                model: require('../../../models').Department,
                as: 'department',
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      });

      const users = enrollments.map((enrollment: any) => ({
        id: enrollment.user.id,
        name: enrollment.user.name,
        username: enrollment.user.username,
        email: enrollment.user.email,
        departmentName: enrollment.user.department?.name,
      }));

      res.json({
        success: true,
        data: users,
      });
    })
  );

// Basic CRUD routes (GET /training, POST /training, PUT /training/:id, DELETE /training/:id)
trainingRoutes.use('', createTrainingRouter());

// Assign courses to users (bulk)
trainingRoutes.post(
  '/assign',
  authenticate,
  requirePermission('MANAGE_TRAINING_ASSIGN_COURSE'),
  assignCourseValidators,
  validateRequest,
  asyncHandler(async (req: any, res: Response) => {
    const { courseId, userIds } = req.body;

    // Validate course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Validate users exist
    const users = await User.findAll({ where: { id: userIds } });
    if (users.length !== userIds.length) {
      res.status(404).json({ error: 'Some users not found' });
      return;
    }

    // Create enrollments for each user
    const enrollments = [];
    for (const userId of userIds) {
      // Check if enrollment already exists
      const existing = await CourseEnrollment.findOne({
        where: { courseId, userId },
      });

      if (!existing) {
        const enrollment = await CourseEnrollment.create({
          courseId,
          userId,
          status: 'Not Started',
          enrolledDate: new Date(),
        });

        // Create progress record
        await CourseProgress.create({
          enrollmentId: enrollment.id,
          progressPercentage: 0,
        });

        enrollments.push(enrollment);
      }
    }

    res.json({
      success: true,
      message: `${enrollments.length} course(s) assigned successfully`,
      data: enrollments,
    });
  })
);

// Get training summary/dashboard stats
trainingRoutes.get(
  '/summary',
  authenticate,
  requirePermission('VIEW_COURSE_SUMMARY'),
  asyncHandler(async (req: any, res: Response) => {
    const summary = await getTrainingSummary();
    res.json({
      success: true,
      data: summary,
    });
  })
);

export default trainingRoutes;

