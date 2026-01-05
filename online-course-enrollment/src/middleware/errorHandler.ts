import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, public details?: any) {
        super(400, message);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(401, message);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(403, message);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(404, message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(409, message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof AppError) {
        logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

        const response: any = {
            error: err.message,
        };

        if (err instanceof ValidationError && err.details) {
            response.details = err.details;
        }

        res.status(err.statusCode).json(response);
        return;
    }

    // Unhandled errors
    logger.error('Unhandled error:', err);

    const statusCode = 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({ error: message });
};

export const notFoundHandler = (req: Request, res: Response): void => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
};
