import { Router } from 'express';
import { body } from 'express-validator';
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  updateProfile,
} from '../controller/auth.controller';
import { loginValidators } from '../validation/auth.validation';
import { authenticate, validateRequest } from '../../../common/middleware';

const authRoutes = Router();

authRoutes.post('/login', loginValidators, validateRequest, login);
authRoutes.post('/refresh', refresh);
authRoutes.post('/logout', logout);
authRoutes.get('/me', authenticate, me);
authRoutes.put(
  '/profile',
  authenticate,
  [body('name').optional().trim().notEmpty(), body('email').optional().isEmail(), body('mobile').optional().trim()],
  validateRequest,
  updateProfile,
);
authRoutes.post(
  '/change-password',
  authenticate,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validateRequest,
  changePassword,
);
authRoutes.post('/forgot-password', [body('email').isEmail()], validateRequest, forgotPassword);

export default authRoutes;
