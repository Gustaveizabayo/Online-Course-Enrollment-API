import { Router } from 'express';
import { body, query } from 'express-validator';
import { processPayment, getMyPayments, getPaymentById } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process a payment for an enrollment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Enrollment not found
 */
router.post(
    '/',
    authenticate,
    validate([
        body('enrollmentId').notEmpty().withMessage('Enrollment ID is required'),
        body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
        body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    ]),
    processPayment as any
);

/**
 * @swagger
 * /api/payments/my:
 *   get:
 *     summary: Get current user's payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *     responses:
 *       200:
 *         description: List of user's payments
 */
router.get(
    '/my',
    authenticate,
    validate([query('status').optional().isIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])]),
    getMyPayments as any
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment details by ID
 *     tags: [Payments]
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
 *         description: Payment details
 *       404:
 *         description: Payment not found
 *       403:
 *         description: Insufficient permissions
 */
router.get('/:id', authenticate as any, getPaymentById as any);

export default router;
