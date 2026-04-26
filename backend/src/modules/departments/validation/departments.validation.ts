import { body } from 'express-validator';

export const createDepartmentValidators = [body('name').notEmpty(), body('code').notEmpty()];
export const updateDepartmentValidators = [body('name').optional().notEmpty(), body('code').optional().notEmpty()];
