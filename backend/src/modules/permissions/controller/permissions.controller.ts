import { createCrudModuleRouter } from '../../shared/crudModule';
import { permissionsCrudConfig } from '../service/permissions.service';
import { createPermissionValidators, updatePermissionValidators } from '../validation/permissions.validation';

export const createPermissionsRouter = () =>
  createCrudModuleRouter({
    ...permissionsCrudConfig,
    createValidators: createPermissionValidators,
    updateValidators: updatePermissionValidators,
  });
