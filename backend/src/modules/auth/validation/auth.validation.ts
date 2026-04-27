import { body } from 'express-validator';

export const loginValidators = [
	body('username').trim().notEmpty(),
	body('password').trim().notEmpty(),
];
