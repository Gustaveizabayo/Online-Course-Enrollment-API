import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/users/apply-instructor:
 *   post:
 *     summary: Apply to become an instructor
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bio, qualifications]
 *             properties:
 *               bio:
 *                 type: string
 *                 example: "I have 5 years of web development experience"
 *               qualifications:
 *                 type: string
 *                 example: "Computer Science Degree, AWS Certified"
 *               experience:
 *                 type: string
 *                 example: "5 years"
 *     responses:
 *       200:
 *         description: Instructor application submitted
 */
router.post('/apply-instructor', UserController.applyForInstructor);

/**
 * @swagger
 * /api/users/instructor-status:
 *   get:
 *     summary: Check instructor application status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor status information
 */
router.get('/instructor-status', UserController.getInstructorStatus);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', UserController.updateProfile);

export default router;
