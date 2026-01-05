import { Request, Response } from 'express';

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

export class CourseController {
  /**
   * @swagger
   * /api/courses:
   *   get:
   *     summary: Get all courses
   *     tags: [Courses]
   *     responses:
   *       200:
   *         description: List of courses
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 courses:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       title:
   *                         type: string
   *                       description:
   *                         type: string
   *                       price:
   *                         type: number
   */
  async getCourses(req: Request, res: Response) {
    try {
      // Demo courses
      const courses = [
        {
          id: '1',
          title: 'Introduction to Web Development',
          description: 'Learn HTML, CSS, and JavaScript',
          price: 49.99,
          instructor: 'John Doe'
        },
        {
          id: '2',
          title: 'Advanced React Patterns',
          description: 'Master React concepts',
          price: 79.99,
          instructor: 'Jane Smith'
        }
      ];
      
      res.json({ courses });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
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
  async getCourseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Demo course
      const course = {
        id,
        title: 'Sample Course',
        description: 'This is a sample course',
        price: 49.99,
        instructor: 'Test Instructor',
        enrolledStudents: 25
      };
      
      res.json({ course });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

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
   *         description: Course created
   *       401:
   *         description: Unauthorized
   */
  async createCourse(req: Request, res: Response) {
    try {
      const { title, description, price } = req.body;
      
      if (!title || !price) {
        return res.status(400).json({ error: 'Title and price are required' });
      }
      
      res.status(201).json({
        message: 'Course created successfully',
        course: {
          id: 'new-id',
          title,
          description: description || '',
          price,
          instructor: 'Current User'
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}