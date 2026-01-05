import { Router } from 'express';
import { body, query } from 'express-validator';
import {
    enrollInCourse,
    getMyEnrollments,
    getCourseEnrollments,
    cancelEnrollment,
} from '../controllers/enrollment.controller';
import { authenticate, requireInstructor } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnrollRequest'
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Course not found
 *       409:
 *         description: Already enrolled
 */
router.post(
    '/',
    authenticate,
    validate([body('courseId').notEmpty().withMessage('Course ID is required')]),
    enrollInCourse as any
);

/**
 * @swagger
 * /api/enrollments/my:
 *   get:
 *     summary: Get current user's enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: List of user's enrollments
 */
router.get(
    '/my',
    authenticate,
    validate([query('status').optional().isIn(['ACTIVE', 'COMPLETED', 'CANCELLED'])]),
    getMyEnrollments as any
);

/**
 * @swagger
 * /api/enrollments/course/{courseId}:
 *   get:
 *     summary: Get enrollments for a specific course (Instructor/Admin only)
 *     tags: [Enrollments]
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
 *         description: List of course enrollments
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Course not found
 */
router.get('/course/:courseId', authenticate as any, requireInstructor as any, getCourseEnrollments as any);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     summary: Cancel an enrollment
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Enrollment cancelled successfully
 *       404:
 *         description: Enrollment not found
 *       403:
 *         description: Insufficient permissions
 */
router.delete('/:id', authenticate as any, cancelEnrollment as any);

export default router;
