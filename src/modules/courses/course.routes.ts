import { Router } from 'express';
import { courseController } from './course.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags: [Courses]
 *     summary: Create a new course
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - duration
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "JavaScript Fundamentals"
 *               description:
 *                 type: string
 *                 example: "Learn JavaScript from scratch"
 *               price:
 *                 type: number
 *                 example: 99.99
 *               duration:
 *                 type: number
 *                 example: 30
 *               category:
 *                 type: string
 *                 example: "Programming"
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', courseController.createCourse);

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all courses
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
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: published
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 */
router.get('/', courseController.getAllCourses);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get course by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *       404:
 *         description: Course not found
 */
router.get('/:id', courseController.getCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     tags: [Courses]
 *     summary: Update a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *               category:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       404:
 *         description: Course not found
 */
router.put('/:id', courseController.updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: Delete a course
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
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 */
router.delete('/:id', courseController.deleteCourse);

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   patch:
 *     tags: [Courses]
 *     summary: Publish a course
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
 *         description: Course published successfully
 *       404:
 *         description: Course not found
 */
router.patch('/:id/publish', courseController.publishCourse);

/**
 * @swagger
 * /api/courses/{id}/unpublish:
 *   patch:
 *     tags: [Courses]
 *     summary: Unpublish a course
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
 *         description: Course unpublished successfully
 *       404:
 *         description: Course not found
 */
router.patch('/:id/unpublish', authenticate, authorize('INSTRUCTOR', 'ADMIN'), courseController.unpublishCourse);

/**
 * @swagger
 * /api/courses/{id}/modules:
 *   post:
 *     tags: [Courses]
 *     summary: Add a module to a course
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
 *               - title
 *               - order
 *             properties:
 *               title:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Module added
 */
router.post('/:id/modules', authenticate, authorize('INSTRUCTOR', 'ADMIN'), courseController.addModule);

/**
 * @swagger
 * /api/courses/modules/{moduleId}:
 *   put:
 *     tags: [Courses]
 *     summary: Update a module
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *     responses:
 *       200:
 *         description: Module updated
 */
router.put('/modules/:moduleId', authenticate, authorize('INSTRUCTOR', 'ADMIN'), courseController.updateModule);

/**
 * @swagger
 * /api/courses/modules/{moduleId}:
 *   delete:
 *     tags: [Courses]
 *     summary: Delete a module
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *     responses:
 *       200:
 *         description: Module deleted
 */
router.delete('/modules/:moduleId', authenticate, authorize('INSTRUCTOR', 'ADMIN'), courseController.deleteModule);

/**
 * @swagger
 * /api/courses/modules/{moduleId}/lessons:
 *   post:
 *     tags: [Courses]
 *     summary: Add a lesson to a module
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *     responses:
 *       201:
 *         description: Lesson added
 */
router.post('/modules/:moduleId/lessons', authenticate, authorize('INSTRUCTOR', 'ADMIN'), courseController.addLesson);

/**
 * @swagger
 * /api/courses/lessons/{lessonId}:
 *   put:
 *     tags: [Courses]
 *     summary: Update a lesson
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 */
router.put('/lessons/:lessonId', authenticate, authorize('INSTRUCTOR', 'ADMIN'), courseController.updateLesson);

/**
 * @swagger
 * /api/courses/lessons/{lessonId}:
 *   delete:
 *     tags: [Courses]
 *     summary: Delete a lesson
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 */
router.delete('/lessons/:lessonId', authenticate, authorize('INSTRUCTOR', 'ADMIN'), courseController.deleteLesson);

/**
 * @swagger
 * /api/courses/{id}/reviews:
 *   post:
 *     tags: [Courses]
 *     summary: Add a review to a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       201:
 *         description: Review added
 */
router.post('/:id/reviews', authenticate, courseController.addReview);

export default router;
