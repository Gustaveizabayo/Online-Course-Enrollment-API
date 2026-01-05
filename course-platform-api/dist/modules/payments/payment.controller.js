"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const apiError_1 = require("../../utils/apiError");
const paymentService = new payment_service_1.PaymentService();
class PaymentController {
    /**
     * @swagger
     * /api/payments/create:
     *   post:
     *     summary: Create a payment for a course
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - courseId
     *             properties:
     *               courseId:
     *                 type: string
     *                 format: uuid
     *     responses:
     *       200:
     *         description: Payment created
     *       400:
     *         description: Invalid request
     */
    async createPayment(req, res, next) {
        try {
            if (!req.user) {
                throw new apiError_1.BadRequestError('User not authenticated');
            }
            const { courseId } = req.body;
            if (!courseId) {
                throw new apiError_1.BadRequestError('Course ID is required');
            }
            const payment = await paymentService.createPayment(req.user.id, courseId);
            res.json(payment);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/payments/capture:
     *   post:
     *     summary: Capture a PayPal payment
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - orderId
     *             properties:
     *               orderId:
     *                 type: string
     *     responses:
     *       200:
     *         description: Payment captured successfully
     *       400:
     *         description: Payment failed
     */
    async capturePayment(req, res, next) {
        try {
            if (!req.user) {
                throw new apiError_1.BadRequestError('User not authenticated');
            }
            const { orderId } = req.body;
            if (!orderId) {
                throw new apiError_1.BadRequestError('Order ID is required');
            }
            const result = await paymentService.capturePayment(orderId, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/payments/success:
     *   get:
     *     summary: PayPal success callback
     *     tags: [Payments]
     *     parameters:
     *       - in: query
     *         name: token
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Payment successful
     */
    async paymentSuccess(req, res, next) {
        try {
            const { token } = req.query;
            res.send(`
        <html>
          <body>
            <h1>Payment Successful!</h1>
            <p>Your payment has been processed successfully.</p>
            <p>Order ID: ${token}</p>
            <script>
              // Close window after 3 seconds
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/payments/cancel:
     *   get:
     *     summary: PayPal cancel callback
     *     tags: [Payments]
     *     responses:
     *       200:
     *         description: Payment cancelled
     */
    async paymentCancel(req, res, next) {
        res.send(`
      <html>
        <body>
          <h1>Payment Cancelled</h1>
          <p>Your payment has been cancelled.</p>
          <script>
            // Close window after 3 seconds
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
    }
    /**
     * @swagger
     * /api/payments/my-payments:
     *   get:
     *     summary: Get user's payment history
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Payment history
     */
    async getUserPayments(req, res, next) {
        try {
            if (!req.user) {
                throw new apiError_1.BadRequestError('User not authenticated');
            }
            const payments = await paymentService.getUserPayments(req.user.id);
            res.json(payments);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/payments/course/{courseId}:
     *   get:
     *     summary: Get payments for a course (instructor/admin only)
     *     tags: [Payments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: courseId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Course payments
     *       403:
     *         description: Forbidden
     */
    async getCoursePayments(req, res, next) {
        try {
            if (!req.user) {
                throw new apiError_1.BadRequestError('User not authenticated');
            }
            const { courseId } = req.params;
            const payments = await paymentService.getCoursePayments(courseId, req.user.id, req.user.role);
            res.json(payments);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
