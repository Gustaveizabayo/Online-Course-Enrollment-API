import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [STUDENT, INSTRUCTOR]
 *                 description: "For INSTRUCTOR: you'll need admin approval"
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify account using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account verified successfully
 */
router.post('/verify-otp', AuthController.verifyOTP);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/profile', authenticate, AuthController.getProfile);

// ========== ADMIN ROUTES ==========

/**
 * @swagger
 * /api/auth/admin/pending-instructors:
 *   get:
 *     summary: Get pending instructor applications (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending instructors
 */
router.get('/admin/pending-instructors', authenticate, requireAdmin, AuthController.getPendingInstructors);

/**
 * @swagger
 * /api/auth/admin/approve-instructor/{id}:
 *   post:
 *     summary: Approve an instructor application (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Instructor approved
 */
router.post('/admin/approve-instructor/:id', authenticate, requireAdmin, AuthController.approveInstructor);

/**
 * @swagger
 * /api/auth/admin/reject-instructor/{id}:
 *   post:
 *     summary: Reject an instructor application (Admin only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Insufficient teaching experience"
 *     responses:
 *       200:
 *         description: Instructor rejected
 */
router.post('/admin/reject-instructor/:id', authenticate, requireAdmin, AuthController.rejectInstructor);

export default router;
