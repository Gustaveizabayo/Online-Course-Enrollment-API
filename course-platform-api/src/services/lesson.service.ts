import { PrismaClient, ContentType, ContentStatus, ActivityType } from '@prisma/client';
import { ActivityService } from './activity.service';
import { Request } from 'express';

const prisma = new PrismaClient();

export class LessonService {
  // ========== MODULE MANAGEMENT ==========
  
  static async createModule(
    instructorId: string,
    courseId: string,
    title: string,
    description?: string,
    order?: number,
    req?: Request
  ) {
    // Verify instructor owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId
      }
    });

    if (!course) {
      throw new Error('Course not found or you are not the instructor');
    }

    // If order not provided, get next order number
    let moduleOrder = order;
    if (moduleOrder === undefined) {
      const lastModule = await prisma.module.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' }
      });
      moduleOrder = lastModule ? lastModule.order + 1 : 0;
    }

    const module = await prisma.module.create({
      data: {
        courseId,
        title,
        description,
        order: moduleOrder
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_UPDATED,
      userId: instructorId,
      courseId,
      details: {
        action: 'module_created',
        moduleTitle: title,
        moduleId: module.id
      },
      req
    });

    console.log(`Ì≥Å Module created: "${title}" in course "${course.title}"`);
    
    return module;
  }

  static async updateModule(
    instructorId: string,
    moduleId: string,
    data: {
      title?: string;
      description?: string;
      order?: number;
    },
    req?: Request
  ) {
    // Verify instructor owns the module's course
    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        course: {
          instructorId
        }
      },
      include: {
        course: true
      }
    });

    if (!module) {
      throw new Error('Module not found or access denied');
    }

    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_UPDATED,
      userId: instructorId,
      courseId: module.courseId,
      details: {
        action: 'module_updated',
        moduleTitle: updatedModule.title,
        moduleId: moduleId
      },
      req
    });

    return updatedModule;
  }

  static async deleteModule(instructorId: string, moduleId: string, req?: Request) {
    // Verify instructor owns the module's course
    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        course: {
          instructorId
        }
      },
      include: {
        course: true,
        lessons: {
          select: { id: true }
        }
      }
    });

    if (!module) {
      throw new Error('Module not found or access denied');
    }

    // Delete all lessons in the module first
    if (module.lessons.length > 0) {
      await prisma.lesson.deleteMany({
        where: { moduleId }
      });
    }

    // Delete the module
    await prisma.module.delete({
      where: { id: moduleId }
    });

    // Update order of remaining modules
    await prisma.module.updateMany({
      where: {
        courseId: module.courseId,
        order: { gt: module.order }
      },
      data: {
        order: { decrement: 1 }
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_UPDATED,
      userId: instructorId,
      courseId: module.courseId,
      details: {
        action: 'module_deleted',
        moduleTitle: module.title,
        moduleId: moduleId,
        lessonsDeleted: module.lessons.length
      },
      req
    });

    console.log(`Ì∑ëÔ∏è Module deleted: "${module.title}" with ${module.lessons.length} lessons`);
    
    return { success: true, message: 'Module deleted successfully' };
  }

  // ========== LESSON MANAGEMENT ==========
  
  static async createLesson(
    instructorId: string,
    moduleId: string,
    data: {
      title: string;
      description?: string;
      contentType: ContentType;
      content?: string;
      videoUrl?: string;
      duration?: number;
      order?: number;
      isFree?: boolean;
    },
    req?: Request
  ) {
    // Verify instructor owns the module's course
    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        course: {
          instructorId
        }
      },
      include: {
        course: true
      }
    });

    if (!module) {
      throw new Error('Module not found or access denied');
    }

    // If order not provided, get next order number
    let lessonOrder = data.order;
    if (lessonOrder === undefined) {
      const lastLesson = await prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: 'desc' }
      });
      lessonOrder = lastLesson ? lastLesson.order + 1 : 0;
    }

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        content: data.content,
        videoUrl: data.videoUrl,
        duration: data.duration,
        order: lessonOrder,
        isFree: data.isFree || false,
        status: ContentStatus.DRAFT
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_UPDATED,
      userId: instructorId,
      courseId: module.courseId,
      details: {
        action: 'lesson_created',
        lessonTitle: data.title,
        lessonId: lesson.id,
        contentType: data.contentType,
        moduleTitle: module.title
      },
      req
    });

    console.log(`Ì≥ù Lesson created: "${data.title}" (${data.contentType}) in module "${module.title}"`);
    
    return lesson;
  }

  static async updateLesson(
    instructorId: string,
    lessonId: string,
    data: {
      title?: string;
      description?: string;
      contentType?: ContentType;
      content?: string;
      videoUrl?: string;
      duration?: number;
      order?: number;
      isFree?: boolean;
      status?: ContentStatus;
    },
    req?: Request
  ) {
    // Verify instructor owns the lesson's course
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            instructorId
          }
        }
      },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found or access denied');
    }

    // If changing order, update other lessons' order
    if (data.order !== undefined && data.order !== lesson.order) {
      await this.reorderLessons(lesson.moduleId, lesson.order, data.order);
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_UPDATED,
      userId: instructorId,
      courseId: lesson.module.courseId,
      details: {
        action: 'lesson_updated',
        lessonTitle: updatedLesson.title,
        lessonId: lessonId,
        contentType: updatedLesson.contentType,
        status: data.status || lesson.status
      },
      req
    });

    return updatedLesson;
  }

  static async publishLesson(instructorId: string, lessonId: string, req?: Request) {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            instructorId
          }
        }
      },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found or access denied');
    }

    const publishedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: { status: ContentStatus.PUBLISHED }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_UPDATED,
      userId: instructorId,
      courseId: lesson.module.courseId,
      details: {
        action: 'lesson_published',
        lessonTitle: publishedLesson.title,
        lessonId: lessonId
      },
      req
    });

    console.log(`Ì∫Ä Lesson published: "${publishedLesson.title}"`);
    
    return publishedLesson;
  }

  private static async reorderLessons(moduleId: string, oldOrder: number, newOrder: number) {
    if (oldOrder < newOrder) {
      // Moving down
      await prisma.lesson.updateMany({
        where: {
          moduleId,
          order: {
            gt: oldOrder,
            lte: newOrder
          }
        },
        data: {
          order: { decrement: 1 }
        }
      });
    } else {
      // Moving up
      await prisma.lesson.updateMany({
        where: {
          moduleId,
          order: {
            gte: newOrder,
            lt: oldOrder
          }
        },
        data: {
          order: { increment: 1 }
        }
      });
    }
  }

  // ========== RESOURCE MANAGEMENT ==========
  
  static async addResource(
    instructorId: string,
    lessonId: string,
    data: {
      title: string;
      description?: string;
      fileUrl: string;
      fileType: string;
      fileSize?: number;
    },
    req?: Request
  ) {
    // Verify instructor owns the lesson's course
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            instructorId
          }
        }
      },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found or access denied');
    }

    const resource = await prisma.resource.create({
      data: {
        lessonId,
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_UPDATED,
      userId: instructorId,
      courseId: lesson.module.courseId,
      details: {
        action: 'resource_added',
        resourceTitle: data.title,
        lessonTitle: lesson.title,
        fileType: data.fileType
      },
      req
    });

    console.log(`Ì≥é Resource added: "${data.title}" to lesson "${lesson.title}"`);
    
    return resource;
  }

  // ========== STUDENT FUNCTIONS ==========
  
  static async getCourseContent(courseId: string, userId?: string) {
    // Check if course is published
    const course = await prisma.course.findUnique({
      where: { 
        id: courseId,
        status: 'PUBLISHED'
      },
      include: {
        instructor: {
          select: {
            name: true,
            profileImage: true
          }
        }
      }
    });

    if (!course) {
      throw new Error('Course not found or not published');
    }

    // Get all modules and lessons
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          where: { status: 'PUBLISHED' },
          orderBy: { order: 'asc' },
          include: {
            resources: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    let progress = {};
    if (userId) {
      // Get user's progress for this course
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        }
      });

      if (enrollment) {
        const lessonProgress = await prisma.lessonProgress.findMany({
          where: { enrollmentId: enrollment.id },
          select: {
            lessonId: true,
            completed: true,
            watchedDuration: true,
            lastPosition: true
          }
        });

        progress = lessonProgress.reduce((acc, p) => {
          acc[p.lessonId] = p;
          return acc;
        }, {} as any);
      }
    }

    // Calculate total duration
    const totalDuration = modules.reduce((total, module) => {
      return total + module.lessons.reduce((moduleTotal, lesson) => {
        return moduleTotal + (lesson.duration || 0);
      }, 0);
    }, 0);

    return {
      course,
      modules,
      progress,
      stats: {
        totalModules: modules.length,
        totalLessons: modules.reduce((total, module) => total + module.lessons.length, 0),
        totalDuration: totalDuration, // in minutes
        completedLessons: Object.values(progress).filter((p: any) => p.completed).length
      }
    };
  }

  static async updateLessonProgress(
    userId: string,
    lessonId: string,
    data: {
      completed?: boolean;
      watchedDuration?: number;
      lastPosition?: number;
    },
    req?: Request
  ) {
    // Check if user is enrolled in the course
    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.module.courseId
        }
      }
    });

    if (!enrollment) {
      throw new Error('You are not enrolled in this course');
    }

    // Update or create progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId
        }
      },
      update: {
        ...data,
        completedAt: data.completed ? new Date() : undefined
      },
      create: {
        userId,
        lessonId,
        enrollmentId: enrollment.id,
        ...data,
        completedAt: data.completed ? new Date() : undefined
      }
    });

    // Update overall course progress
    if (data.completed) {
      const totalLessons = await prisma.lesson.count({
        where: {
          module: {
            courseId: lesson.module.courseId
          },
          status: 'PUBLISHED'
        }
      });

      const completedLessons = await prisma.lessonProgress.count({
        where: {
          enrollmentId: enrollment.id,
          completed: true,
          lesson: {
            module: {
              courseId: lesson.module.courseId
            }
          }
        }
      });

      const newProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progress: newProgress,
          completed: newProgress >= 100
        }
      });

      // Log activity
      await ActivityService.logActivity({
        type: ActivityType.COURSE_UPDATED,
        userId,
        courseId: lesson.module.courseId,
        details: {
          action: 'lesson_completed',
          lessonTitle: lesson.title,
          lessonId: lessonId,
          courseTitle: lesson.module.course.title,
          progress: newProgress
        },
        req
      });

      console.log(`ÌæØ Lesson completed: ${userId} completed "${lesson.title}"`);
    }

    return progress;
  }

  // ========== INSTRUCTOR ANALYTICS ==========
  
  static async getCourseAnalytics(instructorId: string, courseId: string) {
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

    const [modules, enrollments, lessonProgress] = await Promise.all([
      prisma.module.findMany({
        where: { courseId },
        include: {
          lessons: {
            include: {
              _count: {
                select: {
                  resources: true
                }
              }
            }
          }
        },
        orderBy: { order: 'asc' }
      }),
      prisma.enrollment.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          lessonProgress: {
            select: {
              completed: true
            }
          }
        }
      }),
      prisma.lessonProgress.groupBy({
        by: ['lessonId'],
        where: {
          lesson: {
            module: { courseId }
          }
        },
        _count: {
          completed: true
        }
      })
    ]);

    const progressByLesson = lessonProgress.reduce((acc, item) => {
      acc[item.lessonId] = item._count.completed;
      return acc;
    }, {} as Record<string, number>);

    // Calculate completion rates
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.completed).length;
    
    const averageProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
      : 0;

    return {
      course,
      modules,
      enrollments: {
        total: totalEnrollments,
        completed: completedEnrollments,
        completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
        averageProgress: Math.round(averageProgress * 10) / 10
      },
      lessonProgress: progressByLesson,
      studentActivity: enrollments.map(enrollment => ({
        student: enrollment.user,
        progress: enrollment.progress,
        completed: enrollment.completed,
        lessonsCompleted: enrollment.lessonProgress.filter(p => p.completed).length,
        lastActivity: enrollment.updatedAt
      }))
    };
  }
}
