import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from './errorHandler';

export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            next();
            return;
        }

        const extractedErrors = errors.array().map((err) => ({
            field: err.type === 'field' ? err.path : undefined,
            message: err.msg,
        }));

        throw new ValidationError('Validation failed', extractedErrors);
    };
};
