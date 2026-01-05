import { prisma } from '../../database/prisma';
import { NotFoundError, BadRequestError } from '../../utils/apiError';
import { Role } from '@prisma/client';

export class EnrollmentService {
  async enrollStudent(userId: string, courseId: string) {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestError('You are already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return enrollment;
  }

  async getStudentEnrollments(userId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return enrollments;
  }

  async getCourseEnrollments(courseId: string, userId: string, userRole: Role) {
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Check permission
    if (userRole !== Role.ADMIN && course.instructorId !== userId) {
      throw new BadRequestError(
        'You do not have permission to view enrollments for this course'
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    return enrollments;
  }
}