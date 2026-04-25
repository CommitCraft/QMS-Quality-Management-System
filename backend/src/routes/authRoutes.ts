import { Router } from 'express';
import { body } from 'express-validator';
import { changePassword, forgotPassword, login, loginValidators, logout, me, refresh, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.post('/login', loginValidators, validateRequest, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.put(
  '/profile',
  authenticate,
  [body('name').optional().trim().notEmpty(), body('email').optional().isEmail(), body('mobile').optional().trim()],
  validateRequest,
  updateProfile,
);
router.post(
  '/change-password',
  authenticate,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validateRequest,
  changePassword,
);
router.post('/forgot-password', [body('email').isEmail()], validateRequest, forgotPassword);

export default router;
