import { body } from 'express-validator';

export const createCompanyProfileValidators = [
  body('companyTitle').notEmpty(),
  body('logoUrl').optional().isString(),
  body('faviconUrl').optional().isString(),
  body('bannerUrl').optional().isString(),
  body('isActive').optional().isBoolean(),
  body('isDefault').optional().isBoolean(),
];

export const updateCompanyProfileValidators = [
  body('companyTitle').optional().notEmpty(),
  body('logoUrl').optional().isString(),
  body('faviconUrl').optional().isString(),
  body('bannerUrl').optional().isString(),
  body('isActive').optional().isBoolean(),
  body('isDefault').optional().isBoolean(),
];
