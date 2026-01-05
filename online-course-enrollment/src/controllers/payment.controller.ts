import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError, ValidationError, AuthorizationError } from '../middleware/errorHandler';
import logger from '../config/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         enrollmentId:
 *           type: string
 *         amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *         paymentMethod:
 *           type: string
 *         transactionId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - enrollmentId
 *         - amount
 *         - paymentMethod
 *       properties:
 *         enrollmentId:
 *           type: string
 *         amount:
 *           type: number
 *           minimum: 0
 *         paymentMethod:
 *           type: string
 */

const generateTransactionId = (): string => {
    return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
};

export const processPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }

        const { enrollmentId, amount, paymentMethod } = req.body;

        // Verify enrollment exists and belongs to user
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            include: { course: true },
        });

        if (!enrollment) {
            throw new NotFoundError('Enrollment not found');
        }

        if (enrollment.userId !== req.user.id) {
            throw new AuthorizationError('You can only make payments for your own enrollments');
        }

        if (enrollment.status === 'CANCELLED') {
            throw new ValidationError('Cannot make payment for cancelled enrollment');
        }

        // Verify amount matches course price
        if (parseFloat(amount) !== enrollment.course.price) {
            throw new ValidationError('Payment amount does not match course price');
        }

        // Create payment
        const payment = await prisma.payment.create({
            data: {
                enrollmentId,
                userId: req.user.id,
                amount: parseFloat(amount),
                paymentMethod,
                transactionId: generateTransactionId(),
                status: 'COMPLETED', // In a real app, this would be PENDING until payment gateway confirms
            },
            include: {
                enrollment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
        });

        logger.info(`Payment processed: ${payment.id} for enrollment ${enrollmentId}`);
        res.status(201).json(payment);
    } catch (error) {
        next(error);
    }
};

export const getMyPayments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }

        const { status } = req.query;
        const where: any = { userId: req.user.id };

        if (status) {
            where.status = status;
        }

        const payments = await prisma.payment.findMany({
            where,
            include: {
                enrollment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(payments);
    } catch (error) {
        next(error);
    }
};

export const getPaymentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }

        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                enrollment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                price: true,
                            },
                        },
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundError('Payment not found');
        }

        // Only the user who made the payment or admin can view it
        if (payment.userId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new AuthorizationError('You can only view your own payments');
        }

        res.json(payment);
    } catch (error) {
        next(error);
    }
};
