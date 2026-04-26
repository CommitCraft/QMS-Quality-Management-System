import { Router } from 'express';
import { asyncHandler } from '../../../common/utils';
import { authenticate, requirePermission, validateRequest } from '../../../common/middleware';
import { getRoleUsers, updateUserRole } from '../controller/role-users.controller';
import { updateUserRoleValidators } from '../validation/role-users.validation';

const roleUsersRoutes = Router();

roleUsersRoutes.use(authenticate);
roleUsersRoutes.get('/', requirePermission('users.read'), asyncHandler(getRoleUsers));
roleUsersRoutes.put(
  '/:userId/role',
  requirePermission('users.write'),
  updateUserRoleValidators,
  validateRequest,
  asyncHandler(updateUserRole),
);

export default roleUsersRoutes;
