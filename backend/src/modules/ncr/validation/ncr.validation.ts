import { body } from 'express-validator';

export const createNcrValidators = [
  body('title').notEmpty(),
  body('product').notEmpty(),
  body('lotNo').notEmpty(),
  body('issue').notEmpty(),
];

export const updateNcrValidators = [
  body('title').optional().notEmpty(),
  body('product').optional().notEmpty(),
  body('lotNo').optional().notEmpty(),
];
