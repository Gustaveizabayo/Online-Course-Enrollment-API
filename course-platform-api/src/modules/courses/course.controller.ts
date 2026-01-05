import { Request, Response, NextFunction } from 'express';
import { CourseService } from './course.service';
import { createCourseSchema, updateCourseSchema } from './course.schema';
import { BadRequestError } from '../../utils/apiError';

const courseService = new CourseService();

export class CourseController {
  /**
   * @swagger
   * /api/courses:
   *   post:
   *     summary: Create a new course
   *     tags: [Courses]
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
   *               - price
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *     responses:
   *       201:
   *         description: Course created successfully
   *       401:
   *         description: Unauthorized
   */
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }
      const validatedData = createCourseSchema.parse(req.body);
      const course = await courseService.createCourse(
        req.user.id,
        validatedData
      );
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/courses:
   *   get:
   *     summary: Get all courses
   *     tags: [Courses]
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
   *     responses:
   *       200:
   *         description: List of courses
   */
  async getCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await courseService.getCourses(page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/courses/{id}:
   *   get:
   *     summary: Get course by ID
   *     tags: [Courses]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Course details
   *       404:
   *         description: Course not found
   */
  async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await courseService.getCourseById(id);
      res.json(course);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/courses/{id}:
   *   put:
   *     summary: Update course
   *     tags: [Courses]
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
   *             $ref: '#/components/schemas/Course'
   *     responses:
   *       200:
   *         description: Course updated
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Course not found
   */
  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }
      const { id } = req.params;
      const validatedData = updateCourseSchema.parse(req.body);
      const course = await courseService.updateCourse(
        id,
        req.user.id,
        req.user.role as any,
        validatedData
      );
      res.json(course);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/courses/{id}:
   *   delete:
   *     summary: Delete course
   *     tags: [Courses]
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
   *         description: Course deleted
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Course not found
   */
  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }
      const { id } = req.params;
      const result = await courseService.deleteCourse(
        id,
        req.user.id,
        req.user.role as any
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/courses/instructor/my-courses:
   *   get:
   *     summary: Get instructor's courses
   *     tags: [Courses]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of instructor's courses
   */
  async getInstructorCourses(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new BadRequestError('User not authenticated');
      }
      const courses = await courseService.getInstructorCourses(req.user.id);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  }
}