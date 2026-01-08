import { PrismaClient, ActivityType } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

interface ActivityData {
  type: ActivityType;
  userId?: string;
  targetUserId?: string;
  courseId?: string;
  enrollmentId?: string;
  paymentId?: string;
  details?: any;
  req?: Request;
}

export class ActivityService {
  static async logActivity(data: ActivityData) {
    try {
      const ipAddress = data.req?.ip || data.req?.socket.remoteAddress;
      const userAgent = data.req?.get('User-Agent');

      const activity = await prisma.activity.create({
        data: {
          type: data.type,
          userId: data.userId,
          targetUserId: data.targetUserId,
          courseId: data.courseId,
          enrollmentId: data.enrollmentId,
          paymentId: data.paymentId,
          details: data.details || {},
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          targetUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          course: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      console.log(`í³ Activity logged: ${data.type}`);
      return activity;
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error - activity logging shouldn't break main functionality
      return null;
    }
  }

  static async getUserActivities(userId: string, limit: number = 50) {
    return prisma.activity.findMany({
      where: {
        OR: [
          { userId },
          { targetUserId: userId }
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        targetUser: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  static async getCourseActivities(courseId: string, limit: number = 50) {
    return prisma.activity.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  static async getPlatformActivities(limit: number = 100) {
    return prisma.activity.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}

// Helper function to log activities easily
export const logActivity = async (data: ActivityData) => {
  return ActivityService.logActivity(data);
};
