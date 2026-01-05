import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      error: error.name,
      statusCode: error.statusCode,
      ...(env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }

  // Handle unknown errors
  console.error('🔥 Unexpected error:', error);
  
  return res.status(500).json({
    message: 'Internal server error',
    error: 'InternalServerError',
    statusCode: 500,
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};