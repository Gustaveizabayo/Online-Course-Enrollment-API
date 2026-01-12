import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import courseRoutes from '../modules/courses/course.routes';
import enrollmentRoutes from '../modules/enrollments/enrollment.routes';
import paymentRoutes from '../modules/payments/payment.routes';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes (require authentication)
router.use('/courses', authenticate, courseRoutes);
router.use('/enrollments', authenticate, enrollmentRoutes);
router.use('/payments', authenticate, paymentRoutes);

export default router;
