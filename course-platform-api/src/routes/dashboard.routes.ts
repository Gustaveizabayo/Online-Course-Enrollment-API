import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/dashboard/platform-stats:
 *   get:
 *     summary: Get platform statistics (public)
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Platform statistics
 */
router.get('/platform-stats', DashboardController.getPlatformStats);

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/student:
 *   get:
 *     summary: Get student dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard data
 */
router.get('/student', DashboardController.getStudentDashboard);

/**
 * @swagger
 * /api/dashboard/instructor:
 *   get:
 *     summary: Get instructor dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor dashboard data
 */
router.get('/instructor', DashboardController.getInstructorDashboard);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 */
router.get('/admin', DashboardController.getAdminDashboard);

export default router;
