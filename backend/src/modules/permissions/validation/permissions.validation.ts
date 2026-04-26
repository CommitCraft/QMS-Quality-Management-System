import { body } from 'express-validator';

export const createPermissionValidators = [
  body('module').notEmpty(),
  body('action').notEmpty(),
  body('name').notEmpty(),
];

export const updatePermissionValidators = [
  body('module').optional().notEmpty(),
  body('action').optional().notEmpty(),
  body('name').optional().notEmpty(),
];
