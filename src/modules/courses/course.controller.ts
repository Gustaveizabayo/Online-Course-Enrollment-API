import { Request, Response, NextFunction } from 'express';
import { courseService } from './course.service';
import { ApiResponse } from '../../types';
import { z } from 'zod';

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  category: z.string().min(1, 'Category is required'),
});

const updateCourseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  duration: z.number().min(1).optional(),
  category: z.string().optional(),
  isPublished: z.boolean().optional(),
});

const moduleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  order: z.number().int().min(0),
});

const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['VIDEO', 'ARTICLE', 'QUIZ', 'ASSIGNMENT', 'RESOURCE']),
  content: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().min(0),
  duration: z.number().int().min(0),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  category: z.string().optional(),
  published: z.enum(['true', 'false']).optional(),
});

export class CourseController {
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createCourseSchema.parse(req.body);
      const instructorId = (req as any).user.id; // From auth middleware

      const course = await courseService.createCourse({
        ...validatedData,
        instructorId,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Course created successfully',
        data: course,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await courseService.getCourseById(id);

      const response: ApiResponse = {
        success: true,
        message: 'Course retrieved successfully',
        data: course,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedQuery = paginationSchema.parse(req.query);

      const result = await courseService.getAllCourses(
        validatedQuery.page,
        validatedQuery.limit,
        validatedQuery.category,
        validatedQuery.published !== 'false'
      );

      const response: ApiResponse = {
        success: true,
        message: 'Courses retrieved successfully',
        data: result,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateCourseSchema.parse(req.body);

      const course = await courseService.updateCourse(id, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Course updated successfully',
        data: course,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await courseService.deleteCourse(id);

      const response: ApiResponse = {
        success: true,
        message: 'Course deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async publishCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await courseService.publishCourse(id);

      const response: ApiResponse = {
        success: true,
        message: 'Course published successfully',
        data: course,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async unpublishCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const course = await courseService.unpublishCourse(id);

      const response: ApiResponse = {
        success: true,
        message: 'Course unpublished successfully',
        data: course,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Module Handlers
  async addModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: courseId } = req.params;
      const validatedData = moduleSchema.parse(req.body);
      const module = await courseService.addModule(courseId, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Module added successfully',
        data: module,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleId } = req.params;
      const validatedData = moduleSchema.partial().parse(req.body);
      const module = await courseService.updateModule(moduleId, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Module updated successfully',
        data: module,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteModule(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleId } = req.params;
      await courseService.deleteModule(moduleId);

      const response: ApiResponse = {
        success: true,
        message: 'Module deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Lesson Handlers
  async addLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { moduleId } = req.params;
      const validatedData = lessonSchema.parse(req.body);
      const lesson = await courseService.addLesson(moduleId, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Lesson added successfully',
        data: lesson,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      const validatedData = lessonSchema.partial().parse(req.body);
      const lesson = await courseService.updateLesson(lessonId, validatedData);

      const response: ApiResponse = {
        success: true,
        message: 'Lesson updated successfully',
        data: lesson,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteLesson(req: Request, res: Response, next: NextFunction) {
    try {
      const { lessonId } = req.params;
      await courseService.deleteLesson(lessonId);

      const response: ApiResponse = {
        success: true,
        message: 'Lesson deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Review Handlers
  async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: courseId } = req.params;
      const userId = (req as any).user.id;
      const validatedData = reviewSchema.parse(req.body);
      const review = await courseService.addReview(courseId, userId, validatedData.rating, validatedData.comment);

      const response: ApiResponse = {
        success: true,
        message: 'Review added successfully',
        data: review,
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const courseController = new CourseController();
