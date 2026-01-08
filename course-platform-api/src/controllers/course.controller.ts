import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';

export class CourseController {
  // PUBLIC: Get all published courses
  static async getPublishedCourses(req: Request, res: Response) {
    try {
      const { category, level, minPrice, maxPrice, search } = req.query;
      
      const courses = await CourseService.getPublishedCourses({
        category: category as string,
        level: level as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        search: search as string
      });

      return res.json({
        success: true,
        count: courses.length,
        courses
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // PUBLIC: Get course details
  static async getCourseDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const course = await CourseService.getCourseDetails(id);

      return res.json({
        success: true,
        course
      });
    } catch (error: any) {
      if (error.message === 'Course not found') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // INSTRUCTOR: Create course
  static async createCourse(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const course = await CourseService.createCourse(user.userId, req.body);

      return res.status(201).json({
        success: true,
        message: 'Course created successfully (draft)',
        course,
        nextSteps: 'Submit the course for admin review when ready'
      });
    } catch (error: any) {
      if (error.message.includes('Only approved instructors')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // INSTRUCTOR: Submit course for review
  static async submitCourseForReview(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const course = await CourseService.submitCourseForReview(user.userId, id);

      return res.json({
        success: true,
        message: 'Course submitted for admin review',
        course
      });
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('only be submitted')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // INSTRUCTOR: Get my courses
  static async getMyCourses(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const courses = await CourseService.getInstructorCourses(user.userId);

      return res.json({
        success: true,
        count: courses.length,
        courses
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ADMIN: Get pending courses for review
  static async getPendingCourses(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const courses = await CourseService.getPendingCourses(user.userId);

      return res.json({
        success: true,
        count: courses.length,
        courses
      });
    } catch (error: any) {
      if (error.message === 'Admin access required') {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ADMIN: Approve course
  static async approveCourse(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const course = await CourseService.approveCourse(user.userId, id);

      return res.json({
        success: true,
        message: 'Course approved successfully',
        course,
        note: 'Instructor can now publish the course'
      });
    } catch (error: any) {
      if (error.message === 'Admin access required') {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // INSTRUCTOR: Publish approved course
  static async publishCourse(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const course = await CourseService.publishCourse(user.userId, id);

      return res.json({
        success: true,
        message: 'Course published successfully!',
        course,
        note: 'Course is now live and visible to all students'
      });
    } catch (error: any) {
      if (error.message.includes('not approved')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ADMIN: Reject course
  static async rejectCourse(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const course = await CourseService.rejectCourse(user.userId, id, reason);

      return res.json({
        success: true,
        message: 'Course rejected',
        course,
        reason
      });
    } catch (error: any) {
      if (error.message === 'Admin access required') {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
