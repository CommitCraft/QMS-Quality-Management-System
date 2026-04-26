import { Router } from 'express';
import { asyncHandler } from '../../../common/utils';
import { authenticate, requirePermission, validateRequest } from '../../../common/middleware';
import {
  createRoleWithPermissions,
  createRolesCrudRouter,
  getRolePermissions,
  rolesCustomValidators,
  updateRolePermissions,
} from '../controller/roles.controller';

const rolesRoutes = Router();

rolesRoutes.post(
  '/with-permissions',
  authenticate,
  requirePermission('roles.write'),
  rolesCustomValidators.createRoleWithPermissionsValidators,
  validateRequest,
  asyncHandler(createRoleWithPermissions),
);

rolesRoutes.get(
  '/:id/permissions',
  authenticate,
  requirePermission('roles.read'),
  asyncHandler(getRolePermissions),
);

rolesRoutes.put(
  '/:id/permissions',
  authenticate,
  requirePermission('roles.write'),
  rolesCustomValidators.updateRolePermissionsValidators,
  validateRequest,
  asyncHandler(updateRolePermissions),
);

rolesRoutes.use('/', createRolesCrudRouter());

export default rolesRoutes;
