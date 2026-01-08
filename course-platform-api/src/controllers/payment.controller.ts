import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

export class PaymentController {
  // Initiate payment
  static async initiatePayment(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, amount, provider = 'paypal' } = req.body;

      if (!courseId || !amount) {
        return res.status(400).json({ 
          error: 'Course ID and amount are required' 
        });
      }

      if (amount <= 0) {
        return res.status(400).json({ 
          error: 'Amount must be greater than 0' 
        });
      }

      const result = await PaymentService.initiatePayment(
        user.userId, 
        courseId, 
        amount, 
        provider,
        req
      );

      return res.status(201).json({
        success: true,
        message: 'Payment initiated successfully',
        ...result
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('not published')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Process payment callback (simulated)
  static async processPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, transactionId } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const payment = await PaymentService.processPayment(
        id, 
        status, 
        transactionId,
        req
      );

      return res.json({
        success: true,
        message: `Payment ${status.toLowerCase()} successfully`,
        payment
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user payments
  static async getMyPayments(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const payments = await PaymentService.getUserPayments(user.userId);

      return res.json({
        success: true,
        count: payments.length,
        payments
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get course payments (for instructors)
  static async getCoursePayments(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;

      const payments = await PaymentService.getCoursePayments(courseId, user.userId);

      return res.json({
        success: true,
        count: payments.length,
        payments
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get payment statistics (for instructors)
  static async getPaymentStats(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const stats = await PaymentService.getPaymentStats(user.userId);

      return res.json({
        success: true,
        stats
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
