import { Router } from 'express';
import { enrollmentController } from './enrollment.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Course enrollment management
 */

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     tags: [Enrollments]
 *     summary: Enroll in a course
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
 *                 example: "course_123"
 *     responses:
 *       201:
 *         description: Successfully enrolled
 *       404:
 *         description: Course not found
 *       409:
 *         description: Already enrolled
 */
router.post('/', enrollmentController.enroll);

/**
 * @swagger
 * /api/enrollments/user:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get user's enrollments
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
 *         description: Enrollments retrieved
 */
router.get('/user', enrollmentController.getUserEnrollments);

/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get enrollment by ID
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
 *         description: Enrollment retrieved
 *       404:
 *         description: Enrollment not found
 */
router.get('/:id', enrollmentController.getEnrollment);

/**
 * @swagger
 * /api/enrollments/course/{courseId}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Get enrollments for a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Course enrollments retrieved
 */
router.get('/course/:courseId', enrollmentController.getCourseEnrollments);

/**
 * @swagger
 * /api/enrollments/{id}/status:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Update enrollment status
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
 *                 enum: [ACTIVE, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Enrollment not found
 */
router.patch('/:id/status', enrollmentController.updateStatus);

/**
 * @swagger
 * /api/enrollments/{id}/cancel:
 *   patch:
 *     tags: [Enrollments]
 *     summary: Cancel enrollment
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
 *         description: Enrollment cancelled
 *       404:
 *         description: Enrollment not found
 */
router.patch('/:id/cancel', enrollmentController.cancelEnrollment);

/**
 * @swagger
 * /api/enrollments/check/{courseId}:
 *   get:
 *     tags: [Enrollments]
 *     summary: Check if user is enrolled in a course
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
 *         description: Enrollment check completed
 */
router.get('/check/:courseId', enrollmentController.checkEnrollment);

export default router;
