import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { ApiResponse } from '../../types';
import { z } from 'zod';

const createPaymentSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().default('USD'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
});

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
  transactionId: z.string().optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

export class PaymentController {
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createPaymentSchema.parse(req.body);
      
      const payment = await paymentService.createPayment(validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Payment initiated successfully',
        data: payment,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Payment retrieved successfully',
        data: payment,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getUserPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const validatedQuery = paginationSchema.parse(req.query);
      
      const result = await paymentService.getUserPayments(
        userId,
        validatedQuery.page,
        validatedQuery.limit
      );

      const response: ApiResponse = {
        success: true,
        message: 'Payments retrieved successfully',
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
      
      const payment = await paymentService.updatePaymentStatus(
        id,
        validatedData.status,
        validatedData.transactionId
      );

      const response: ApiResponse = {
        success: true,
        message: 'Payment status updated successfully',
        data: payment,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;
      const payment = await paymentService.verifyPayment(transactionId);

      const response: ApiResponse = {
        success: true,
        message: 'Payment verified',
        data: payment,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getEnrollmentPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { enrollmentId } = req.params;
      const payment = await paymentService.getEnrollmentPayment(enrollmentId);

      const response: ApiResponse = {
        success: true,
        message: 'Payment retrieved',
        data: payment,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
