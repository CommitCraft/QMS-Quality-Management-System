import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(new AppError('Validation failed', 422, result.array()));
    return;
  }
  next();
};