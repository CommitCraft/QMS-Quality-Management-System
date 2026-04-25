import { Router } from 'express';
import { body } from 'express-validator';
import { createCrudController } from '../controllers/crudController';
import { validateRequest } from '../middleware/validate';
import { requirePermission, authenticate } from '../middleware/auth';

interface CrudRouteOptions {
  path: string;
  entityName: string;
  model: any;
  permissionBase: string;
  searchFields: string[];
  transformCreate?: (payload: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>;
  transformUpdate?: (payload: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>;
  createValidators?: Array<ReturnType<typeof body>>;
  updateValidators?: Array<ReturnType<typeof body>>;
  include?: unknown[];
}

export const buildCrudRouter = (options: CrudRouteOptions) => {
  const router = Router();
  const controller = createCrudController({
    model: options.model,
    entityName: options.entityName,
    searchFields: options.searchFields,
    permissionBase: options.permissionBase,
    transformCreate: async (payload, req) => (options.transformCreate ? options.transformCreate(payload) : payload),
    transformUpdate: async (payload, req) => (options.transformUpdate ? options.transformUpdate(payload) : payload),
    include: options.include,
  });

  router.use(authenticate);
  router.get('/', requirePermission(`${options.permissionBase}.read`), controller.list);
  router.get('/:id', requirePermission(`${options.permissionBase}.read`), controller.getOne);
  router.post('/', options.createValidators || [], validateRequest, requirePermission(`${options.permissionBase}.write`), controller.create);
  router.put('/:id', options.updateValidators || [], validateRequest, requirePermission(`${options.permissionBase}.write`), controller.update);
  router.delete('/:id', requirePermission(`${options.permissionBase}.delete`), controller.remove);
  return router;
};
