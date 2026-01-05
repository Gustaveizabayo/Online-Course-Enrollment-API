import { prisma } from '../../database/prisma';
import { CreateCourseInput, UpdateCourseInput } from './course.schema';
import { NotFoundError, ForbiddenError } from '../../utils/apiError';
import { Role } from '@prisma/client';

export class CourseService {
  async createCourse(userId: string, data: CreateCourseInput) {
    const course = await prisma.course.create({
      data: {
        ...data,
        instructorId: userId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return course;
  }

  async getCourses(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.course.count(),
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCourseById(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    return course;
  }

  async updateCourse(
    courseId: string,
    userId: string,
    userRole: Role,
    data: UpdateCourseInput
  ) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check permission
    if (userRole !== Role.ADMIN && course.instructorId !== userId) {
      throw new ForbiddenError(
        'You do not have permission to update this course'
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return updatedCourse;
  }

  async deleteCourse(courseId: string, userId: string, userRole: Role) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check permission
    if (userRole !== Role.ADMIN && course.instructorId !== userId) {
      throw new ForbiddenError(
        'You do not have permission to delete this course'
      );
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return { message: 'Course deleted successfully' };
  }

  async getInstructorCourses(userId: string) {
    const courses = await prisma.course.findMany({
      where: { instructorId: userId },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses;
  }
}