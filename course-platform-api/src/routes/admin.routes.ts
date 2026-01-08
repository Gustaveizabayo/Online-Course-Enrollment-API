import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// ALL admin routes require: 1. Authentication + 2. ADMIN role
router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Admin access required
 */
router.get('/users', AdminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/pending:
 *   get:
 *     summary: Get pending users needing approval
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending users
 */
router.get('/users/pending', AdminController.getPendingUsers);

/**
 * @swagger
 * /api/admin/users/{userId}/approve:
 *   post:
 *     summary: Approve a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to approve
 *     responses:
 *       200:
 *         description: User approved successfully
 *       403:
 *         description: Admin access required
 */
router.post('/users/:userId/approve', AdminController.approveUser);

/**
 * @swagger
 * /api/admin/users/{userId}/reject:
 *   post:
 *     summary: Reject a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to reject
 *     responses:
 *       200:
 *         description: User rejected successfully
 */
router.post('/users/:userId/reject', AdminController.rejectUser);

export default router;
