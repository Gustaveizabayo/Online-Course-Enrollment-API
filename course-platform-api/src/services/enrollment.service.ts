import { PrismaClient, ActivityType } from '@prisma/client';
import { ActivityService } from './activity.service';
import { Request } from 'express';

const prisma = new PrismaClient();

export class EnrollmentService {
  // Enroll in a course
  static async enrollInCourse(userId: string, courseId: string, req?: Request) {
    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.status !== 'PUBLISHED') {
      throw new Error('Course is not published');
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true,
            price: true
          }
        }
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.ENROLLMENT_CREATED,
      userId,
      courseId,
      enrollmentId: enrollment.id,
      details: {
        courseTitle: enrollment.course.title,
        coursePrice: enrollment.course.price
      },
      req
    });

    console.log(`í¾“ Enrollment created: ${enrollment.user.name} enrolled in "${enrollment.course.title}"`);
    
    return enrollment;
  }

  // Get user's enrollments
  static async getUserEnrollments(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
                profileImage: true
              }
            },
            _count: {
              select: {
                enrollments: true,
                reviews: true
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });
  }

  // Update enrollment progress
  static async updateProgress(enrollmentId: string, progress: number, req?: Request) {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } }
      }
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const completed = progress >= 100;
    
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        completed
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_UPDATED,
      userId: enrollment.user.id,
      courseId: enrollment.course.id,
      enrollmentId,
      details: {
        progress,
        completed,
        courseTitle: enrollment.course.title
      },
      req
    });

    if (completed) {
      console.log(`í¾‰ Course completed: ${enrollment.user.name} completed "${enrollment.course.title}"`);
    } else {
      console.log(`í³Š Progress updated: ${enrollment.user.name} - ${progress}% in "${enrollment.course.title}"`);
    }

    return updatedEnrollment;
  }

  // Get course enrollments (for instructors)
  static async getCourseEnrollments(courseId: string, instructorId: string) {
    // Verify instructor owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId
      }
    });

    if (!course) {
      throw new Error('Course not found or access denied');
    }

    return prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });
  }

  // Get enrollment statistics
  static async getEnrollmentStats(courseId: string, instructorId: string) {
    // Verify instructor owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId
      }
    });

    if (!course) {
      throw new Error('Course not found or access denied');
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId }
    });

    const total = enrollments.length;
    const completed = enrollments.filter(e => e.completed).length;
    const averageProgress = enrollments.reduce((sum, e) => sum + e.progress, 0) / total || 0;

    return {
      totalEnrollments: total,
      completedEnrollments: completed,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      averageProgress: Math.round(averageProgress * 100) / 100
    };
  }
}
