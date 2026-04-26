import { body } from 'express-validator';

export const createAuditValidators = [body('title').notEmpty()];
export const updateAuditValidators = [body('title').optional().notEmpty()];
