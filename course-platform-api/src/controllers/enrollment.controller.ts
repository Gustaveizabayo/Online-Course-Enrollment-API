import { Request, Response } from 'express';
import { EnrollmentService } from '../services/enrollment.service';

export class EnrollmentController {
  // Enroll in a course
  static async enrollInCourse(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId } = req.body;

      if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
      }

      const enrollment = await EnrollmentService.enrollInCourse(user.userId, courseId, req);

      return res.status(201).json({
        success: true,
        message: 'Successfully enrolled in course',
        enrollment
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('not published') || 
          error.message.includes('Already enrolled')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user enrollments
  static async getMyEnrollments(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const enrollments = await EnrollmentService.getUserEnrollments(user.userId);

      return res.json({
        success: true,
        count: enrollments.length,
        enrollments
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update enrollment progress
  static async updateProgress(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { progress } = req.body;

      if (progress === undefined || progress === null) {
        return res.status(400).json({ error: 'Progress is required' });
      }

      const enrollment = await EnrollmentService.updateProgress(id, progress, req);

      return res.json({
        success: true,
        message: 'Progress updated successfully',
        enrollment
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('must be between')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get course enrollments (for instructors)
  static async getCourseEnrollments(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;

      const enrollments = await EnrollmentService.getCourseEnrollments(courseId, user.userId);

      return res.json({
        success: true,
        count: enrollments.length,
        enrollments
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get enrollment statistics (for instructors)
  static async getEnrollmentStats(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;

      const stats = await EnrollmentService.getEnrollmentStats(courseId, user.userId);

      return res.json({
        success: true,
        stats
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
