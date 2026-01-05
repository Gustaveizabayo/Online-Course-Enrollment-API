import { Router } from 'express';
import { CourseController } from './course.controller';

const router = Router();
const courseController = new CourseController();

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);
router.post('/', courseController.createCourse);

export default router;