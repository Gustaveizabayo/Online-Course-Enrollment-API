import { Payment, Prisma } from '@prisma/client';
import prisma from '../../database/prisma';
import { CreatePaymentDto } from './payment.types';
import { NotFoundError, ConflictError } from '../../utils/ApiError';

export class PaymentService {
  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: data.enrollmentId },
      include: { course: true },
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    // Check if payment already exists for this enrollment
    const existingPayment = await prisma.payment.findFirst({
      where: { enrollmentId: data.enrollmentId },
    });

    if (existingPayment) {
      throw new ConflictError('Payment already exists for this enrollment');
    }

    // Verify amount matches course price
    if (data.amount !== enrollment.course.price) {
      throw new Error('Payment amount does not match course price');
    }

    // Generate transaction ID (in real app, this would come from payment gateway)
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    return await prisma.payment.create({
      data: {
        enrollmentId: data.enrollmentId,
        userId: enrollment.userId,
        amount: data.amount,
        currency: data.currency || 'USD',
        paymentMethod: data.paymentMethod,
        transactionId,
        status: 'PENDING',
      },
    });
  }

  async getPaymentById(id: string): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            course: true,
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  async getUserPayments(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          enrollment: {
            userId: userId,
          },
        },
        include: {
          enrollment: {
            include: {
              course: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({
        where: {
          enrollment: {
            userId: userId,
          },
        },
      }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updatePaymentStatus(id: string, status: string, transactionId?: string): Promise<Payment> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    const updateData: any = { status };
    if (status === 'COMPLETED') {
      updateData.paidAt = new Date();
      updateData.transactionId = transactionId || payment.transactionId;
    }

    return await prisma.payment.update({
      where: { id },
      data: updateData,
    });
  }

  async verifyPayment(transactionId: string): Promise<Payment> {
    const payment = await prisma.payment.findFirst({
      where: { transactionId },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  async getEnrollmentPayment(enrollmentId: string): Promise<Payment | null> {
    return await prisma.payment.findFirst({
      where: { enrollmentId },
    });
  }
}

export const paymentService = new PaymentService();
