import { body } from 'express-validator';

export const createRoleValidators = [body('name').notEmpty()];
export const updateRoleValidators = [body('name').optional().notEmpty()];
export const createRoleWithPermissionsValidators = [body('name').notEmpty(), body('permissionIds').isArray()];
export const updateRolePermissionsValidators = [body('permissionIds').isArray()];
