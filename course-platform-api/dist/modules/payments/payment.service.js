"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const checkout_server_sdk_1 = __importDefault(require("@paypal/checkout-server-sdk"));
const env_1 = require("../../config/env");
const prisma_1 = require("../../database/prisma");
const apiError_1 = require("../../utils/apiError");
const client_1 = require("@prisma/client");
// PayPal client setup
const environment = env_1.env.PAYPAL_ENVIRONMENT === 'production'
    ? new checkout_server_sdk_1.default.core.LiveEnvironment(env_1.env.PAYPAL_CLIENT_ID, env_1.env.PAYPAL_CLIENT_SECRET)
    : new checkout_server_sdk_1.default.core.SandboxEnvironment(env_1.env.PAYPAL_CLIENT_ID, env_1.env.PAYPAL_CLIENT_SECRET);
const client = new checkout_server_sdk_1.default.core.PayPalHttpClient(environment);
class PaymentService {
    async createPayment(userId, courseId) {
        // Check if course exists
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new apiError_1.NotFoundError('Course not found');
        }
        // Check if user is already enrolled
        const existingEnrollment = await prisma_1.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
        if (existingEnrollment) {
            throw new apiError_1.BadRequestError('You are already enrolled in this course');
        }
        // Create PayPal order
        const request = new checkout_server_sdk_1.default.orders.OrdersCreateRequest();
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
                return_url: `${env_1.env.BASE_URL}/api/payments/success`,
                cancel_url: `${env_1.env.BASE_URL}/api/payments/cancel`,
            },
        });
        try {
            const order = await client.execute(request);
            // Store payment record
            const payment = await prisma_1.prisma.payment.create({
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
                approvalUrl: order.result.links.find((link) => link.rel === 'approve')?.href,
                amount: course.price,
                courseTitle: course.title,
            };
        }
        catch (error) {
            console.error('PayPal create order error:', error);
            throw new apiError_1.BadRequestError('Failed to create payment');
        }
    }
    async capturePayment(orderId, userId) {
        // Find payment record
        const payment = await prisma_1.prisma.payment.findUnique({
            where: { transactionId: orderId },
            include: { course: true },
        });
        if (!payment) {
            throw new apiError_1.NotFoundError('Payment not found');
        }
        if (payment.userId !== userId) {
            throw new apiError_1.BadRequestError('Payment does not belong to user');
        }
        if (payment.status === 'completed') {
            throw new apiError_1.BadRequestError('Payment already completed');
        }
        // Capture PayPal order
        const request = new checkout_server_sdk_1.default.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});
        try {
            const capture = await client.execute(request);
            if (capture.result.status === 'COMPLETED') {
                // Update payment status
                await prisma_1.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'completed' },
                });
                // Create enrollment
                const enrollment = await prisma_1.prisma.enrollment.create({
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
            }
            else {
                throw new apiError_1.BadRequestError('Payment not completed');
            }
        }
        catch (error) {
            console.error('PayPal capture error:', error);
            throw new apiError_1.BadRequestError('Failed to capture payment');
        }
    }
    async getUserPayments(userId) {
        const payments = await prisma_1.prisma.payment.findMany({
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
    async getCoursePayments(courseId, userId, userRole) {
        // Check if course exists
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new apiError_1.NotFoundError('Course not found');
        }
        // Check permission
        if (userRole !== client_1.Role.ADMIN && course.instructorId !== userId) {
            throw new apiError_1.BadRequestError('You do not have permission to view payments for this course');
        }
        const payments = await prisma_1.prisma.payment.findMany({
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
exports.PaymentService = PaymentService;
