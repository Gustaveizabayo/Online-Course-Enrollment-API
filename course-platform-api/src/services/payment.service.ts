import { PrismaClient, ActivityType, PaymentStatus } from '@prisma/client';
import { ActivityService } from './activity.service';
import { Request } from 'express';

const prisma = new PrismaClient();

export class PaymentService {
  // Initialize payment
  static async initiatePayment(
    userId: string, 
    courseId: string, 
    amount: number, 
    provider: string = 'paypal',
    req?: Request
  ) {
    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.status !== 'PUBLISHED') {
      throw new Error('Course is not published');
    }

    // Generate transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        courseId,
        amount,
        provider,
        transactionId,
        status: PaymentStatus.PENDING
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true,
            instructor: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.PAYMENT_INITIATED,
      userId,
      courseId,
      paymentId: payment.id,
      details: {
        amount,
        provider,
        transactionId,
        courseTitle: payment.course.title
      },
      req
    });

    console.log(`í²³ Payment initiated: ${payment.user.name} - $${amount} for "${payment.course.title}"`);
    
    // In real implementation, this would return payment gateway URL
    return {
      payment,
      paymentUrl: `/api/payments/${payment.id}/process`, // Mock URL
      transactionId
    };
  }

  // Process payment callback (simulated)
  static async processPayment(
    paymentId: string, 
    status: PaymentStatus, 
    gatewayTransactionId?: string,
    req?: Request
  ) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } }
      }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        transactionId: gatewayTransactionId || payment.transactionId,
        metadata: {
          processedAt: new Date().toISOString(),
          gatewayResponse: req?.body || {}
        }
      }
    });

    // Log activity
    const activityType = status === PaymentStatus.COMPLETED 
      ? ActivityType.PAYMENT_COMPLETED 
      : status === PaymentStatus.FAILED 
        ? ActivityType.PAYMENT_FAILED 
        : ActivityType.PAYMENT_INITIATED;

    await ActivityService.logActivity({
      type: activityType,
      userId: payment.user.id,
      courseId: payment.course.id,
      paymentId: payment.id,
      details: {
        status,
        amount: payment.amount,
        transactionId: gatewayTransactionId,
        courseTitle: payment.course.title
      },
      req
    });

    // If payment completed, create enrollment
    if (status === PaymentStatus.COMPLETED) {
      try {
        await prisma.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId
          }
        });

        console.log(`âœ… Payment completed and enrollment created for ${payment.user.name}`);
      } catch (error) {
        console.error('Failed to create enrollment after payment:', error);
      }
    }

    console.log(`í´„ Payment ${status}: ${payment.user.name} - $${payment.amount}`);
    
    return updatedPayment;
  }

  // Get user payments
  static async getUserPayments(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            title: true,
            thumbnail: true,
            instructor: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get course payments (for instructors)
  static async getCoursePayments(courseId: string, instructorId: string) {
    // Verify instructor owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId
      }
    });

    if (!course) {
      throw new Error('Course not found or access denied');
    }

    return prisma.payment.findMany({
      where: { 
        courseId,
        status: PaymentStatus.COMPLETED
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get payment statistics
  static async getPaymentStats(instructorId: string) {
    const courses = await prisma.course.findMany({
      where: { instructorId },
      select: { id: true, title: true }
    });

    const courseIds = courses.map(c => c.id);
    
    const payments = await prisma.payment.findMany({
      where: { 
        courseId: { in: courseIds },
        status: PaymentStatus.COMPLETED
      }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const monthlyRevenue = payments
      .filter(p => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return p.createdAt > monthAgo;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalCourses: courses.length,
      totalPayments: payments.length,
      totalRevenue,
      monthlyRevenue,
      averagePayment: payments.length > 0 ? totalRevenue / payments.length : 0
    };
  }
}
