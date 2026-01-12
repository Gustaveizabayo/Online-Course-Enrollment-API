import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseHandler {
  static success(res: Response, data: any, message = 'Success', statusCode = 200) {
    const response: ApiResponse = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode = 400, errors?: string[]) {
    const response: ApiResponse = {
      success: false,
      message,
    };
    
    if (errors && errors.length > 0) {
      (response as any).errors = errors;
    }
    
    return res.status(statusCode).json(response);
  }

  static created(res: Response, data: any, message = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  static notFound(res: Response, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static conflict(res: Response, message = 'Conflict') {
    return this.error(res, message, 409);
  }
}
