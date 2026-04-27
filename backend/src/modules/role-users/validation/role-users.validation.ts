import { body, param } from 'express-validator';

export const roleIdValidators = [
  param('roleId').isInt({ min: 1 }),
];

export const updateUserRoleValidators = [
  param('userId').isInt({ min: 1 }),
  body('roleId').isInt({ min: 1 }),
];

export const assignUsersToRoleValidators = [
  param('roleId').isInt({ min: 1 }),
  body('userIds').isArray(),
  body('userIds.*').isInt({ min: 1 }),
];

export const saveRoleUserMappingValidators = [
  param('roleId').isInt({ min: 1 }),
  body('assignments').isArray(),
  body('assignments.*.userId').isInt({ min: 1 }),
  body('assignments.*.roleId').isInt({ min: 1 }),
];
