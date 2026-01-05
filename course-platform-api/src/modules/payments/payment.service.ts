import paypal from '@paypal/checkout-server-sdk';
import { env } from '../../config/env';
import { prisma } from '../../database/prisma';
import { NotFoundError, BadRequestError } from '../../utils/apiError';
import { Role } from '@prisma/client';

// PayPal client setup
const environment =
  env.PAYPAL_ENVIRONMENT === 'production'
    ? new paypal.core.LiveEnvironment(
        env.PAYPAL_CLIENT_ID,
        env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        env.PAYPAL_CLIENT_ID,
        env.PAYPAL_CLIENT_SECRET
      );

const client = new paypal.core.PayPalHttpClient(environment);

export class PaymentService {
  async createPayment(userId: string, courseId: string) {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestError('You are already enrolled in this course');
    }

    // Create PayPal order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: course.price.toString(),
          },
          description: course.title,
        },
      ],
      application_context: {
        return_url: `${env.BASE_URL}/api/payments/success`,
        cancel_url: `${env.BASE_URL}/api/payments/cancel`,
      },
    });

    try {
      const order = await client.execute(request);
      
      // Store payment record
      const payment = await prisma.payment.create({
        data: {
          userId,
          courseId,
          amount: course.price,
          provider: 'paypal',
          status: 'pending',
          transactionId: order.result.id,
        },
      });

      return {
        paymentId: payment.id,
        orderId: order.result.id,
        approvalUrl: order.result.links.find((link: any) => link.rel === 'approve')?.href,
        amount: course.price,
        courseTitle: course.title,
      };
    } catch (error) {
      console.error('PayPal create order error:', error);
      throw new BadRequestError('Failed to create payment');
    }
  }

  async capturePayment(orderId: string, userId: string) {
    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { transactionId: orderId },
      include: { course: true },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.userId !== userId) {
      throw new BadRequestError('Payment does not belong to user');
    }

    if (payment.status === 'completed') {
      throw new BadRequestError('Payment already completed');
    }

    // Capture PayPal order
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const capture = await client.execute(request);

      if (capture.result.status === 'COMPLETED') {
        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'completed' },
        });

        // Create enrollment
        const enrollment = await prisma.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId,
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                description: true,
                instructor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        return {
          success: true,
          enrollment,
          payment: {
            id: payment.id,
            amount: payment.amount,
            status: 'completed',
            transactionId: payment.transactionId,
          },
        };
      } else {
        throw new BadRequestError('Payment not completed');
      }
    } catch (error) {
      console.error('PayPal capture error:', error);
      throw new BadRequestError('Failed to capture payment');
    }
  }

  async getUserPayments(userId: string) {
    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments;
  }

  async getCoursePayments(courseId: string, userId: string, userRole: Role) {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check permission
    if (userRole !== Role.ADMIN && course.instructorId !== userId) {
      throw new BadRequestError(
        'You do not have permission to view payments for this course'
      );
    }

    const payments = await prisma.payment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments;
  }
}
