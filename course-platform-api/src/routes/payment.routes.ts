import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, requireInstructor } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/payments/initiate:
 *   post:
 *     summary: Initiate a payment for a course
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, amount]
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: Course ID to purchase
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 example: 79.99
 *               provider:
 *                 type: string
 *                 default: "paypal"
 *                 enum: [paypal, stripe, bank_transfer]
 *     responses:
 *       201:
 *         description: Payment initiated successfully
 */
router.post('/initiate', PaymentController.initiatePayment);

/**
 * @swagger
 * /api/payments/{id}/process:
 *   post:
 *     summary: Process payment callback (simulated)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, FAILED, REFUNDED]
 *               transactionId:
 *                 type: string
 *                 description: Gateway transaction ID
 *     responses:
 *       200:
 *         description: Payment processed
 */
router.post('/:id/process', PaymentController.processPayment);

/**
 * @swagger
 * /api/payments/my:
 *   get:
 *     summary: Get my payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's payments
 */
router.get('/my', PaymentController.getMyPayments);

/**
 * @swagger
 * /api/payments/course/{courseId}:
 *   get:
 *     summary: Get course payments (Instructor only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: List of course payments
 */
router.get('/course/:courseId', requireInstructor, PaymentController.getCoursePayments);

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Get payment statistics (Instructor only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics
 */
router.get('/stats', requireInstructor, PaymentController.getPaymentStats);

export default router;
