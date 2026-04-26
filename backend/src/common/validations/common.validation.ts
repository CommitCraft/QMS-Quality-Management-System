import { param } from 'express-validator';

export const idParamValidation = [param('id').isInt({ min: 1 })];
