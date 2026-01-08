import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/activities/my:
 *   get:
 *     summary: Get my activities
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of user's activities
 */
router.get('/my', ActivityController.getUserActivities);

/**
 * @swagger
 * /api/activities/course/{courseId}:
 *   get:
 *     summary: Get course activities
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of course activities
 */
router.get('/course/:courseId', ActivityController.getCourseActivities);

/**
 * @swagger
 * /api/activities/platform:
 *   get:
 *     summary: Get platform activities (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: List of platform activities
 */
router.get('/platform', authenticate, (req, res, next) => {
  const user = (req as any).user;
  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}, ActivityController.getPlatformActivities);

export default router;
