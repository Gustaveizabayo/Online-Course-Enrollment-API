import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { config } from '../config/env';

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(config.env === 'development' && { stack: err.stack }),
    });
  }

  console.error('Unexpected error:', err);
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.env === 'development' && { stack: err.stack }),
  });
};
