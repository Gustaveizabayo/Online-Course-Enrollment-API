import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate, authorize, requireAdmin, requireInstructor } from '../middlewares/auth.middleware';

const router = Router();

// ========== PUBLIC ROUTES ==========
/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all published courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Filter by level (BEGINNER, INTERMEDIATE, ADVANCED)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of published courses with pagination
 */
router.get('/', CourseController.getPublishedCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course details
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
router.get('/:id', CourseController.getCourseDetails);

// ========== INSTRUCTOR ROUTES ==========
router.use(authenticate);

/**
 * @swagger
 * /api/courses/my:
 *   get:
 *     summary: Get instructor's courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of instructor's courses
 */
router.get('/my', requireInstructor, CourseController.getMyCourses);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course (Instructors only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, price]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "React Advanced Patterns"
 *               description:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 79.99
 *               category:
 *                 type: string
 *                 example: "Web Development"
 *               level:
 *                 type: string
 *                 enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *               duration:
 *                 type: number
 *                 example: 15
 *               thumbnail:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Course created (draft)
 *       403:
 *         description: Only approved instructors can create courses
 */
router.post('/', requireInstructor, CourseController.createCourse);

/**
 * @swagger
 * /api/courses/{id}/submit:
 *   post:
 *     summary: Submit course for admin review
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course submitted for review
 */
router.post('/:id/submit', requireInstructor, CourseController.submitCourseForReview);

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   post:
 *     summary: Publish an approved course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course published successfully
 */
router.post('/:id/publish', requireInstructor, CourseController.publishCourse);

// ========== ADMIN ROUTES ==========
/**
 * @swagger
 * /api/courses/admin/pending:
 *   get:
 *     summary: Get pending courses for review (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending courses
 *       403:
 *         description: Admin access required
 */
router.get('/admin/pending', requireAdmin, CourseController.getPendingCourses);

/**
 * @swagger
 * /api/courses/admin/{id}/approve:
 *   post:
 *     summary: Approve a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course approved
 *       403:
 *         description: Admin access required
 */
router.post('/admin/:id/approve', requireAdmin, CourseController.approveCourse);

/**
 * @swagger
 * /api/courses/admin/{id}/reject:
 *   post:
 *     summary: Reject a course (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
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
 *                 example: "Course content needs more depth and practical examples"
 *     responses:
 *       200:
 *         description: Course rejected
 *       403:
 *         description: Admin access required
 */
router.post('/admin/:id/reject', requireAdmin, CourseController.rejectCourse);

export default router;
