import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { BadRequestError } from '../../utils/ApiError';
import { ApiResponse } from '../../types';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

const resendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const applyInstructorSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  qualifications: z.string().min(5, 'Qualifications must be at least 5 characters'),
  experience: z.string().min(5, 'Experience must be at least 5 characters'),
});

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(
        validatedData.email,
        validatedData.password,
        validatedData.name
      );

      const response: ApiResponse = {
        success: true,
        message: result.message,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = verifyOtpSchema.parse(req.body);
      const result = await authService.verifyOtp(
        validatedData.email,
        validatedData.code
      );

      const response: ApiResponse = {
        success: true,
        message: 'Account verified successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = resendOtpSchema.parse(req.body);
      const result = await authService.resendOtp(validatedData.email);

      const response: ApiResponse = {
        success: true,
        message: result.message,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async applyToBeInstructor(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const validatedData = applyInstructorSchema.parse(req.body);
      const result = await authService.applyToBeInstructor(userId, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Application submitted successfully',
        data: result,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.getApplications();

      const response: ApiResponse = {
        success: true,
        message: 'Applications retrieved successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async reviewApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        throw new BadRequestError('Invalid status. Must be APPROVED or REJECTED');
      }

      const result = await authService.reviewApplication(id, status);

      const response: ApiResponse = {
        success: true,
        message: `Application ${status.toLowerCase()} successfully`,
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();