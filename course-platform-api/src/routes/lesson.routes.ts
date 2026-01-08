import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { authenticate, requireInstructor } from '../middlewares/auth.middleware';

const router = Router();

// ========== PUBLIC: GET COURSE CONTENT ==========
/**
 * @swagger
 * /api/lessons/course/{courseId}/content:
 *   get:
 *     summary: Get course content (public, but shows progress if authenticated)
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course content with modules and lessons
 */
router.get('/course/:courseId/content', LessonController.getCourseContent);

router.use(authenticate);

// ========== MODULE MANAGEMENT (Instructor only) ==========
/**
 * @swagger
 * /api/lessons/modules:
 *   post:
 *     summary: Create a new module (Instructor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, title]
 *             properties:
 *               courseId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Module created successfully
 */
router.post('/modules', requireInstructor, LessonController.createModule);

/**
 * @swagger
 * /api/lessons/modules/{id}:
 *   put:
 *     summary: Update a module (Instructor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
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
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Module updated successfully
 */
router.put('/modules/:id', requireInstructor, LessonController.updateModule);

/**
 * @swagger
 * /api/lessons/modules/{id}:
 *   delete:
 *     summary: Delete a module (Instructor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Module deleted successfully
 */
router.delete('/modules/:id', requireInstructor, LessonController.deleteModule);

// ========== LESSON MANAGEMENT (Instructor only) ==========
/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Create a new lesson (Instructor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [moduleId, title, contentType]
 *             properties:
 *               moduleId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               contentType:
 *                 type: string
 *                 enum: [VIDEO, ARTICLE, QUIZ, ASSIGNMENT, RESOURCE]
 *               content:
 *                 type: string
 *                 description: For articles/quizzes
 *               videoUrl:
 *                 type: string
 *                 description: For video lessons
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               order:
 *                 type: integer
 *               isFree:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Lesson created successfully
 */
router.post('/', requireInstructor, LessonController.createLesson);

/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Update a lesson (Instructor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
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
 *               contentType:
 *                 type: string
 *                 enum: [VIDEO, ARTICLE, QUIZ, ASSIGNMENT, RESOURCE]
 *               content:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               duration:
 *                 type: integer
 *               order:
 *                 type: integer
 *               isFree:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 */
router.put('/:id', requireInstructor, LessonController.updateLesson);

/**
 * @swagger
 * /api/lessons/{id}/publish:
 *   post:
 *     summary: Publish a lesson (Instructor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson published successfully
 */
router.post('/:id/publish', requireInstructor, LessonController.publishLesson);

// ========== RESOURCE MANAGEMENT (Instructor only) ==========
/**
 * @swagger
 * /api/lessons/resources:
 *   post:
 *     summary: Add a resource to a lesson (Instructor only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lessonId, title, fileUrl, fileType]
 *             properties:
 *               lessonId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               fileUrl:
 *                 type: string
 *               fileType:
 *                 type: string
 *                 example: "pdf"
 *               fileSize:
 *                 type: integer
 *                 description: Size in bytes
 *     responses:
 *       201:
 *         description: Resource added successfully
 */
router.post('/resources', requireInstructor, LessonController.addResource);

// ========== STUDENT PROGRESS ==========
/**
 * @swagger
 * /api/lessons/{lessonId}/progress:
 *   post:
 *     summary: Update lesson progress (Student only)
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *               watchedDuration:
 *                 type: integer
 *                 description: For videos - seconds watched
 *               lastPosition:
 *                 type: number
 *                 description: For videos - last playback position (0-1)
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
router.post('/:lessonId/progress', LessonController.updateLessonProgress);

// ========== INSTRUCTOR ANALYTICS ==========
/**
 * @swagger
 * /api/lessons/course/{courseId}/analytics:
 *   get:
 *     summary: Get course analytics (Instructor only)
 *     tags: [Lessons]
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
 *         description: Course analytics data
 */
router.get('/course/:courseId/analytics', requireInstructor, LessonController.getCourseAnalytics);

export default router;
