import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from './enrollment.service';
import { ApiResponse } from '../../types';
import { z } from 'zod';

const enrollSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

export class EnrollmentController {
  async enroll(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = enrollSchema.parse(req.body);
      const userId = (req as any).user.id;
      
      const enrollment = await enrollmentService.enrollStudent({
        ...validatedData,
        userId,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Successfully enrolled in course',
        data: enrollment,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const enrollment = await enrollmentService.getEnrollmentById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Enrollment retrieved successfully',
        data: enrollment,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const validatedQuery = paginationSchema.parse(req.query);
      
      const result = await enrollmentService.getUserEnrollments(
        userId,
        validatedQuery.page,
        validatedQuery.limit
      );

      const response: ApiResponse = {
        success: true,
        message: 'Enrollments retrieved successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourseEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const validatedQuery = paginationSchema.parse(req.query);
      
      const result = await enrollmentService.getCourseEnrollments(
        courseId,
        validatedQuery.page,
        validatedQuery.limit
      );

      const response: ApiResponse = {
        success: true,
        message: 'Course enrollments retrieved successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateStatusSchema.parse(req.body);
      
      const enrollment = await enrollmentService.updateEnrollmentStatus(
        id,
        validatedData.status
      );

      const response: ApiResponse = {
        success: true,
        message: 'Enrollment status updated successfully',
        data: enrollment,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async cancelEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await enrollmentService.cancelEnrollment(id);

      const response: ApiResponse = {
        success: true,
        message: 'Enrollment cancelled successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async checkEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.params;
      const userId = (req as any).user.id;
      
      const isEnrolled = await enrollmentService.isUserEnrolled(courseId, userId);

      const response: ApiResponse = {
        success: true,
        message: 'Enrollment check completed',
        data: { isEnrolled },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const enrollmentController = new EnrollmentController();
