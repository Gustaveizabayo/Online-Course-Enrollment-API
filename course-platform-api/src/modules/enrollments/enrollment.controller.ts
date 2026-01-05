import { Request, Response } from 'express';

/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Student enrollment endpoints
 */

export class EnrollmentController {
  /**
   * @swagger
   * /api/enrollments:
   *   post:
   *     summary: Enroll in a course
   *     tags: [Enrollments]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - courseId
   *             properties:
   *               courseId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Successfully enrolled
   *       400:
   *         description: Already enrolled
   */
  async enroll(req: Request, res: Response) {
    try {
      const { courseId } = req.body;
      
      if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
      }
      
      res.status(201).json({
        message: 'Successfully enrolled in course',
        enrollment: {
          id: 'enrollment-id',
          userId: 'user-id',
          courseId,
          enrolledAt: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /api/enrollments/my-courses:
   *   get:
   *     summary: Get user's enrolled courses
   *     tags: [Enrollments]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of enrolled courses
   */
  async getMyCourses(req: Request, res: Response) {
    try {
      // Demo enrolled courses
      const enrollments = [
        {
          id: '1',
          courseId: '1',
          courseTitle: 'Introduction to Web Development',
          enrolledAt: '2024-01-15T10:30:00Z',
          progress: 75
        }
      ];
      
      res.json({ enrollments });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}