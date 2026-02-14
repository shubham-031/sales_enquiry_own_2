import { validationResult } from 'express-validator';
import { ApiError } from './errorHandler.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    return next(new ApiError(400, errorMessages.join(', ')));
  }
  next();
};
