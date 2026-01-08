import { Request, Response } from 'express';
import { LessonService } from '../services/lesson.service';
import { ContentType, ContentStatus } from '@prisma/client';

export class LessonController {
  // ========== MODULE ENDPOINTS ==========
  
  static async createModule(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId, title, description, order } = req.body;

      if (!courseId || !title) {
        return res.status(400).json({ 
          error: 'Course ID and title are required' 
        });
      }

      const module = await LessonService.createModule(
        user.userId,
        courseId,
        title,
        description,
        order,
        req
      );

      return res.status(201).json({
        success: true,
        message: 'Module created successfully',
        module
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateModule(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { title, description, order } = req.body;

      if (!title && !description && order === undefined) {
        return res.status(400).json({ 
          error: 'At least one field to update is required' 
        });
      }

      const module = await LessonService.updateModule(
        user.userId,
        id,
        { title, description, order },
        req
      );

      return res.json({
        success: true,
        message: 'Module updated successfully',
        module
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async deleteModule(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const result = await LessonService.deleteModule(user.userId, id, req);

      return res.json(result);
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ========== LESSON ENDPOINTS ==========
  
  static async createLesson(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { moduleId, title, description, contentType, content, videoUrl, duration, order, isFree } = req.body;

      if (!moduleId || !title || !contentType) {
        return res.status(400).json({ 
          error: 'Module ID, title, and content type are required' 
        });
      }

      // Validate contentType
      if (!Object.values(ContentType).includes(contentType)) {
        return res.status(400).json({ 
          error: 'Invalid content type. Must be VIDEO, ARTICLE, QUIZ, ASSIGNMENT, or RESOURCE' 
        });
      }

      const lesson = await LessonService.createLesson(
        user.userId,
        moduleId,
        {
          title,
          description,
          contentType,
          content,
          videoUrl,
          duration,
          order,
          isFree
        },
        req
      );

      return res.status(201).json({
        success: true,
        message: 'Lesson created successfully',
        lesson
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateLesson(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { title, description, contentType, content, videoUrl, duration, order, isFree, status } = req.body;

      if (!title && !description && !contentType && !content && !videoUrl && 
          duration === undefined && order === undefined && isFree === undefined && !status) {
        return res.status(400).json({ 
          error: 'At least one field to update is required' 
        });
      }

      // Validate contentType if provided
      if (contentType && !Object.values(ContentType).includes(contentType)) {
        return res.status(400).json({ 
          error: 'Invalid content type' 
        });
      }

      // Validate status if provided
      if (status && !Object.values(ContentStatus).includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status' 
        });
      }

      const lesson = await LessonService.updateLesson(
        user.userId,
        id,
        {
          title,
          description,
          contentType,
          content,
          videoUrl,
          duration,
          order,
          isFree,
          status: status as ContentStatus
        },
        req
      );

      return res.json({
        success: true,
        message: 'Lesson updated successfully',
        lesson
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async publishLesson(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const lesson = await LessonService.publishLesson(user.userId, id, req);

      return res.json({
        success: true,
        message: 'Lesson published successfully',
        lesson
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ========== RESOURCE ENDPOINTS ==========
  
  static async addResource(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { lessonId, title, description, fileUrl, fileType, fileSize } = req.body;

      if (!lessonId || !title || !fileUrl || !fileType) {
        return res.status(400).json({ 
          error: 'Lesson ID, title, file URL, and file type are required' 
        });
      }

      const resource = await LessonService.addResource(
        user.userId,
        lessonId,
        {
          title,
          description,
          fileUrl,
          fileType,
          fileSize
        },
        req
      );

      return res.status(201).json({
        success: true,
        message: 'Resource added successfully',
        resource
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('access denied')) {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ========== STUDENT ENDPOINTS ==========
  
  static async getCourseContent(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const user = (req as any).user;
      const userId = user ? user.userId : undefined;

      const content = await LessonService.getCourseContent(courseId, userId);

      return res.json({
        success: true,
        content
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('not published')) {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateLessonProgress(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { lessonId } = req.params;
      const { completed, watchedDuration, lastPosition } = req.body;

      if (completed === undefined && watchedDuration === undefined && lastPosition === undefined) {
        return res.status(400).json({ 
          error: 'At least one progress field is required' 
        });
      }

      const progress = await LessonService.updateLessonProgress(
        user.userId,
        lessonId,
        {
          completed,
          watchedDuration,
          lastPosition
        },
        req
      );

      return res.json({
        success: true,
        message: 'Progress updated successfully',
        progress
      });
    } catch (error: any) {
      if (error.message.includes('not found') || 
          error.message.includes('not enrolled')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ========== INSTRUCTOR ANALYTICS ==========
  
  static async getCourseAnalytics(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { courseId } = req.params;

      const analytics = await LessonService.getCourseAnalytics(user.userId, courseId);

      return res.json({
        success: true,
        analytics
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
