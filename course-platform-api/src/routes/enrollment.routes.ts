import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authenticate, requireInstructor } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

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
 *             type: object
 *             required: [courseId]
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: Course ID to enroll in
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
 */
router.post('/', EnrollmentController.enrollInCourse);

/**
 * @swagger
 * /api/enrollments/my:
 *   get:
 *     summary: Get my enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's enrollments
 */
router.get('/my', EnrollmentController.getMyEnrollments);

/**
 * @swagger
 * /api/enrollments/{id}/progress:
 *   put:
 *     summary: Update enrollment progress
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [progress]
 *             properties:
 *               progress:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 75
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.put('/:id/progress', EnrollmentController.updateProgress);

/**
 * @swagger
 * /api/enrollments/course/{courseId}:
 *   get:
 *     summary: Get course enrollments (Instructor only)
 *     tags: [Enrollments]
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
 *         description: List of course enrollments
 */
router.get('/course/:courseId', requireInstructor, EnrollmentController.getCourseEnrollments);

/**
 * @swagger
 * /api/enrollments/course/{courseId}/stats:
 *   get:
 *     summary: Get enrollment statistics (Instructor only)
 *     tags: [Enrollments]
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
 *         description: Enrollment statistics
 */
router.get('/course/:courseId/stats', requireInstructor, EnrollmentController.getEnrollmentStats);

export default router;
