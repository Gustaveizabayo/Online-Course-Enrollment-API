import { EnrollmentStatus } from '@prisma/client';
import prisma from '../../database/prisma';
import { CreateEnrollmentDto } from './enrollment.types';
import { NotFoundError, ConflictError } from '../../utils/ApiError';

export class EnrollmentService {
  async enrollStudent(data: CreateEnrollmentDto) {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: data.courseId,
        userId: data.userId,
      },
    });

    if (existingEnrollment) {
      throw new ConflictError('User is already enrolled in this course');
    }

    // Create enrollment
    return await prisma.enrollment.create({
      data: {
        courseId: data.courseId,
        userId: data.userId,
        status: 'ACTIVE',
      },
    });
  }

  async getEnrollmentById(id: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    return enrollment;
  }

  async getUserEnrollments(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: true,
        },
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
      }),
      prisma.enrollment.count({ where: { userId } }),
    ]);

    return {
      enrollments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCourseEnrollments(courseId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
      }),
      prisma.enrollment.count({ where: { courseId } }),
    ]);

    return {
      enrollments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateEnrollmentStatus(id: string, status: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    return await prisma.enrollment.update({
      where: { id },
      data: {
        status: status as EnrollmentStatus,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });
  }

  async cancelEnrollment(id: string): Promise<void> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    await prisma.enrollment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async isUserEnrolled(courseId: string, userId: string): Promise<boolean> {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId,
        userId,
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
    });

    return !!enrollment;
  }
}

export const enrollmentService = new EnrollmentService();
