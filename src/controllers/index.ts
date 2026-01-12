import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export abstract class BaseController {
  protected async execute(
    req: Request,
    res: Response,
    next: NextFunction,
    handler: () => Promise<any>
  ) {
    try {
      const result = await handler();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  protected success(res: Response, data: any, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  protected error(res: Response, message: string, statusCode = 400) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }

  protected handleError(error: any, next: NextFunction) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error instanceof Error) {
      next(new ApiError(500, error.message));
    } else {
      next(new ApiError(500, 'Internal server error'));
    }
  }
}
