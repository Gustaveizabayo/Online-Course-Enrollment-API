import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { rateLimit } from '../../middlewares/rateLimit';
import { config } from '../../config/env';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user in PENDING state and sends OTP verification email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Verification code sent
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists and is active
 *       500:
 *         description: Internal server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify OTP and activate account
 *     description: Validates OTP code and activates user account, returns JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: clxyz...
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         name:
 *                           type: string
 *                           example: John Doe
 *       400:
 *         description: Invalid OTP or OTP expired
 *       401:
 *         description: Invalid verification code
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify-otp', authController.verifyOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Resend OTP code
 *     description: Resends a new OTP code to user's email with rate limiting
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: New verification code sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: New verification code sent
 *       400:
 *         description: User is already active
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many requests. Please wait before requesting another OTP.
 *       500:
 *         description: Internal server error
 */
router.post(
  '/resend-otp',
  rateLimit(config.otp.resendCooldownSeconds),
  authController.resendOtp
);

/**
 * @swagger
 * /api/auth/apply-instructor:
 *   post:
 *     tags: [Auth]
 *     summary: Apply to become an instructor
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bio
 *               - qualifications
 *               - experience
 *             properties:
 *               bio:
 *                 type: string
 *               qualifications:
 *                 type: string
 *               experience:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted
 */
router.post('/apply-instructor', authenticate, authController.applyToBeInstructor);

/**
 * @swagger
 * /api/auth/admin/applications:
 *   get:
 *     tags: [Auth]
 *     summary: Get all instructor applications (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications retrieved
 */
router.get('/admin/applications', authenticate, authorize('ADMIN'), authController.getApplications);

/**
 * @swagger
 * /api/auth/admin/applications/{id}/review:
 *   patch:
 *     tags: [Auth]
 *     summary: Review an instructor application (Admin only)
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
 *                 enum: [APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Application reviewed
 */
router.patch('/admin/applications/:id/review', authenticate, authorize('ADMIN'), authController.reviewApplication);

/**
 * @swagger
 * /api/auth/users/{id}/role:
 *   patch:
 *     tags: [Auth]
 *     summary: Update user role (Admin only)
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
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [STUDENT, INSTRUCTOR, ADMIN]
 *     responses:
 *       200:
 *         description: User role updated
 */
router.patch('/users/:id/role', authenticate, authorize('ADMIN'), authController.updateUserRole);

export default router;
