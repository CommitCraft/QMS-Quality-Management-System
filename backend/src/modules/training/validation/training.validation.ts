import { body } from 'express-validator';

export const createCourseValidators = [
  body('code').trim().notEmpty().withMessage('Code is required').isLength({ max: 50 }).withMessage('Code must be 50 characters or less'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }).withMessage('Title must be 200 characters or less'),
  body('description').optional().trim(),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Category must be 100 characters or less'),
  body('instructor').optional().trim().isLength({ max: 150 }).withMessage('Instructor must be 150 characters or less'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
];

export const updateCourseValidators = [
  body('code').optional().trim().isLength({ max: 50 }).withMessage('Code must be 50 characters or less'),
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title must be 200 characters or less'),
  body('description').optional().trim(),
  body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a positive integer'),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Category must be 100 characters or less'),
  body('instructor').optional().trim().isLength({ max: 150 }).withMessage('Instructor must be 150 characters or less'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive'),
];

export const assignCourseValidators = [
  body('courseId').notEmpty().withMessage('Course ID is required').isInt().withMessage('Course ID must be an integer'),
  body('userIds').isArray({ min: 1 }).withMessage('User IDs must be an array with at least one ID'),
  body('userIds.*').isInt().withMessage('Each user ID must be an integer'),
];
