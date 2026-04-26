import { body, param } from 'express-validator';

export const updateUserRoleValidators = [
  param('userId').isInt({ min: 1 }),
  body('roleId').isInt({ min: 1 }),
];
