import { body } from 'express-validator';

export const createSmtpValidators = [
  body('name').notEmpty(),
  body('host').notEmpty(),
  body('port').isInt({ min: 1, max: 65535 }),
  body('username').notEmpty(),
  body('password').notEmpty(),
  body('fromEmail').isEmail(),
];

export const updateSmtpValidators = [
  body('name').optional().notEmpty(),
  body('host').optional().notEmpty(),
  body('port').optional().isInt({ min: 1, max: 65535 }),
  body('username').optional().notEmpty(),
  body('password').optional().notEmpty(),
  body('fromEmail').optional().isEmail(),
  body('secure').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
];

export const createStorageValidators = [
  body('name').notEmpty(),
  body('provider').notEmpty(),
  body('basePath').optional().isString(),
  body('bucketName').optional().isString(),
  body('region').optional().isString(),
  body('endpoint').optional().isString(),
  body('accessKey').optional().isString(),
  body('secretKey').optional().isString(),
  body('isActive').optional().isBoolean(),
  body('isDefault').optional().isBoolean(),
];

export const updateStorageValidators = [
  body('name').optional().notEmpty(),
  body('provider').optional().notEmpty(),
  body('basePath').optional().isString(),
  body('bucketName').optional().isString(),
  body('region').optional().isString(),
  body('endpoint').optional().isString(),
  body('accessKey').optional().isString(),
  body('secretKey').optional().isString(),
  body('isActive').optional().isBoolean(),
  body('isDefault').optional().isBoolean(),
];
