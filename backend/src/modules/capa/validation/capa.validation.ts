import { body } from 'express-validator';

export const createCapaValidators = [body('title').notEmpty(), body('issue').notEmpty()];
export const updateCapaValidators = [body('title').optional().notEmpty(), body('issue').optional().notEmpty()];
