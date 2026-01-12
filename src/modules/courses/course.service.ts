import { Prisma, LessonType } from '@prisma/client';
import prisma from '../../database/prisma';
import { CreateCourseDto, UpdateCourseDto, CreateModuleDto, CreateLessonDto } from './course.types';
import { NotFoundError } from '../../utils/ApiError';

export class CourseService {
  async createCourse(data: CreateCourseDto) {
    return await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        duration: data.duration,
        category: data.category,
        instructorId: data.instructorId,
      },
    });
  }

  async getCourseById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return course;
  }

  async getAllCourses(
    page: number = 1,
    limit: number = 10,
    category?: string,
    isPublished: boolean = true
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = { isPublished };
    if (category) {
      where.category = category;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.course.count({ where }),
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateCourse(id: string, data: UpdateCourseDto) {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return await prisma.course.update({
      where: { id },
      data,
    });
  }

  async deleteCourse(id: string): Promise<void> {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    await prisma.course.delete({
      where: { id },
    });
  }

  async publishCourse(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return await prisma.course.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublishCourse(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return await prisma.course.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  // Module Management
  async addModule(courseId: string, data: CreateModuleDto) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundError('Course not found');

    return await prisma.module.create({
      data: {
        ...data,
        courseId,
      },
    });
  }

  async updateModule(moduleId: string, data: Partial<CreateModuleDto>) {
    return await prisma.module.update({
      where: { id: moduleId },
      data,
    });
  }

  async deleteModule(moduleId: string) {
    await prisma.module.delete({ where: { id: moduleId } });
  }

  // Lesson Management
  async addLesson(moduleId: string, data: CreateLessonDto) {
    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) throw new NotFoundError('Module not found');

    return await prisma.lesson.create({
      data: {
        title: data.title,
        type: data.type as LessonType,
        content: data.content,
        videoUrl: data.videoUrl,
        order: data.order,
        duration: data.duration,
        moduleId,
      },
    });
  }

  async updateLesson(lessonId: string, data: Partial<CreateLessonDto>) {
    return await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...data,
        type: data.type ? (data.type as LessonType) : undefined,
      },
    });
  }

  async deleteLesson(lessonId: string) {
    await prisma.lesson.delete({ where: { id: lessonId } });
  }

  // Reviews
  async addReview(courseId: string, userId: string, rating: number, comment?: string) {
    return await prisma.review.create({
      data: {
        courseId,
        userId,
        rating,
        comment,
      },
    });
  }
}

export const courseService = new CourseService();
