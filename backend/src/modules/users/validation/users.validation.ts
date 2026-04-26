import { body } from 'express-validator';

export const createUserValidators = [
  body('name').notEmpty(),
  body('username').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('roleId').isInt(),
];

export const updateUserValidators = [
  body('name').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('roleId').optional().isInt(),
];
