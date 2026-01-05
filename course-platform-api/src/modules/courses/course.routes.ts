import { Router } from 'express';
import { CourseController } from './course.controller';

const router = Router();
const courseController = new CourseController();

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourses);
router.post('/', courseController.createCourse);

export default router;