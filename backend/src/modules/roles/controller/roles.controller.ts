import { Response } from 'express';
import { createCrudModuleRouter } from '../../shared/crudModule';
import { AuthenticatedRequest, AppError } from '../../../common/middleware';
import {
  createRoleWithPermissionsValidators,
  createRoleValidators,
  updateRolePermissionsValidators,
  updateRoleValidators,
} from '../validation/roles.validation';
import {
  getRolePermissionMatrix,
  rolesCrudConfig,
  saveRoleWithPermissions,
  updateRolePermissionMatrix,
} from '../service/roles.service';

export const createRolesCrudRouter = () =>
  createCrudModuleRouter({
    ...rolesCrudConfig,
    createValidators: createRoleValidators,
    updateValidators: updateRoleValidators,
  });

export const rolesCustomValidators = {
  createRoleWithPermissionsValidators,
  updateRolePermissionsValidators,
};

export const createRoleWithPermissions = async (req: AuthenticatedRequest, res: Response) => {
  const payload = req.body as { name: string; description?: string; permissionIds: number[] };
  const updatedRole = await saveRoleWithPermissions(payload);
  res.status(201).json({ success: true, data: updatedRole, message: 'Role and permissions saved successfully' });
};

export const getRolePermissions = async (req: AuthenticatedRequest, res: Response) => {
  const roleId = Number(req.params.id);
  if (!Number.isFinite(roleId)) {
    throw new AppError('Invalid role id', 400);
  }

  const matrix = await getRolePermissionMatrix(roleId);
  res.json({ success: true, data: matrix });
};

export const updateRolePermissions = async (req: AuthenticatedRequest, res: Response) => {
  const roleId = Number(req.params.id);
  if (!Number.isFinite(roleId)) {
    throw new AppError('Invalid role id', 400);
  }

  const { permissionIds } = req.body as { permissionIds: number[] };
  await updateRolePermissionMatrix(roleId, permissionIds);
  res.json({ success: true, message: 'Role permissions updated successfully' });
};
