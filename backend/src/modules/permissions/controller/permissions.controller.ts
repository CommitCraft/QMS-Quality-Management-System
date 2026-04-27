import { Router } from 'express';
import { authenticate, requirePermission } from '../../../common/middleware';
import { createCrudModuleRouter } from '../../shared/crudModule';
import { buildPermissionTree, permissionsCrudConfig } from '../service/permissions.service';
import { createPermissionValidators, updatePermissionValidators } from '../validation/permissions.validation';

export const createPermissionsRouter = () => {
  const router = Router();

  router.get('/tree', authenticate, requirePermission('permissions.read'), async (_req, res) => {
    const data = await buildPermissionTree();
    res.json({ success: true, data });
  });

  router.use(
    createCrudModuleRouter({
      ...permissionsCrudConfig,
      createValidators: createPermissionValidators,
      updateValidators: updatePermissionValidators,
    }),
  );

  return router;
};
