import { Router } from 'express';
import { paymentController } from './payment.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management endpoints
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate a new payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enrollmentId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               enrollmentId:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: USD
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment initiated successfully
 */
router.post('/', paymentController.createPayment);

/**
 * @swagger
 * /api/payments/my-payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get current user's payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 */
router.get('/my-payments', paymentController.getUserPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 */
router.get('/:id', paymentController.getPayment);

/**
 * @swagger
 * /api/payments/{id}/status:
 *   patch:
 *     tags: [Payments]
 *     summary: Update payment status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 */
router.patch('/:id/status', paymentController.updateStatus);

/**
 * @swagger
 * /api/payments/verify/{transactionId}:
 *   get:
 *     tags: [Payments]
 *     summary: Verify payment by transaction ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.get('/verify/:transactionId', paymentController.verifyPayment);

/**
 * @swagger
 * /api/payments/enrollment/{enrollmentId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment for an enrollment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment retrieved
 */
router.get('/enrollment/:enrollmentId', paymentController.getEnrollmentPayment);

export default router;
