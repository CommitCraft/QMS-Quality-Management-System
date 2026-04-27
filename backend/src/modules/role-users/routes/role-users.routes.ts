import { Router } from 'express';
import { asyncHandler } from '../../../common/utils';
import { authenticate, requirePermission, validateRequest } from '../../../common/middleware';
import {
  assignRoleUsers,
  getRoleUsers,
  getRoleUsersList,
  getRoleUsersRoles,
  getUsersByRole,
  saveRoleUserAssignments,
  updateUserRole,
} from '../controller/role-users.controller';
import {
  assignUsersToRoleValidators,
  roleIdValidators,
  saveRoleUserMappingValidators,
  updateUserRoleValidators,
} from '../validation/role-users.validation';

const roleUsersRoutes = Router();

roleUsersRoutes.use(authenticate);
roleUsersRoutes.get('/', requirePermission('VIEW_ROLE_USER'), asyncHandler(getRoleUsers));
roleUsersRoutes.get('/roles', requirePermission('VIEW_ROLE_USER'), asyncHandler(getRoleUsersRoles));
roleUsersRoutes.get('/users', requirePermission('VIEW_ROLE_USER'), asyncHandler(getRoleUsersList));
roleUsersRoutes.get(
  '/:roleId/users',
  requirePermission('VIEW_ROLE_USER'),
  roleIdValidators,
  validateRequest,
  asyncHandler(getUsersByRole),
);
roleUsersRoutes.put(
  '/:roleId/users',
  requirePermission('MANAGE_ROLE_USER'),
  assignUsersToRoleValidators,
  validateRequest,
  asyncHandler(assignRoleUsers),
);
roleUsersRoutes.put(
  '/:roleId/mapping',
  requirePermission('MANAGE_ROLE_USER'),
  saveRoleUserMappingValidators,
  validateRequest,
  asyncHandler(saveRoleUserAssignments),
);
roleUsersRoutes.put(
  '/:userId/role',
  requirePermission('MANAGE_ROLE_USER'),
  updateUserRoleValidators,
  validateRequest,
  asyncHandler(updateUserRole),
);

export default roleUsersRoutes;
