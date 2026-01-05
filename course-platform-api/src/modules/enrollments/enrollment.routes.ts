import { Router } from 'express';
import { EnrollmentController } from './enrollment.controller';

const router = Router();
const enrollmentController = new EnrollmentController();

router.post('/', enrollmentController.enroll);
router.get('/my-courses', enrollmentController.getMyCourses);

export default router;