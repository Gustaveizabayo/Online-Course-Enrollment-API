import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/apiError';
import { Role } from '@prisma/client';

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(
        new ForbiddenError(
          `You don't have permission to access this resource`
        )
      );
    }

    next();
  };
};