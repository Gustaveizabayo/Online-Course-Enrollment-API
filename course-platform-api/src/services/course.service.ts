import { PrismaClient, CourseStatus, Role, ActivityType } from '@prisma/client';
import { ActivityService } from './activity.service';
import { Request } from 'express';

const prisma = new PrismaClient();

export class CourseService {
  // ========== PUBLIC: ANYONE CAN BROWSE PUBLISHED COURSES ==========
  
  static async getPublishedCourses(filters?: {
    category?: string;
    level?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: CourseStatus.PUBLISHED
    };

    // Apply filters
    if (filters?.category) {
      where.category = filters.category;
    }
    
    if (filters?.level) {
      where.level = filters.level;
    }
    
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { shortDescription: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              bio: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true
            }
          },
          reviews: {
            select: {
              rating: true
            },
            take: 50
          }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.course.count({ where })
    ]);

    // Calculate average rating for each course
    const coursesWithRating = courses.map(course => {
      const avgRating = course.reviews.length > 0
        ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
        : 0;
      
      const { reviews, ...courseWithoutReviews } = course;
      
      return {
        ...courseWithoutReviews,
        averageRating: Math.round(avgRating * 10) / 10
      };
    });

    return {
      courses: coursesWithRating,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    };
  }

  static async getCourseDetails(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            bio: true,
            experience: true,
            qualifications: true,
            _count: {
              select: {
                courses: {
                  where: {
                    status: CourseStatus.PUBLISHED
                  }
                }
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                profileImage: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Calculate average rating
    const avgRating = course.reviews.length > 0
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length
      : 0;

    // Only return published courses to non-owners
    return {
      ...course,
      averageRating: Math.round(avgRating * 10) / 10
    };
  }

  // ========== INSTRUCTORS: CREATE & MANAGE COURSES ==========
  
  static async createCourse(
    instructorId: string,
    data: {
      title: string;
      description?: string;
      shortDescription?: string;
      price: number;
      category?: string;
      level?: string;
      duration?: number;
      thumbnail?: string;
    },
    req?: Request
  ) {
    // Verify user is an approved instructor
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    if (!instructor || !instructor.isInstructor) {
      throw new Error('Only approved instructors can create courses');
    }

    const course = await prisma.course.create({
      data: {
        ...data,
        instructorId,
        status: CourseStatus.DRAFT // Start as draft
      },
      include: {
        instructor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_CREATED,
      userId: instructorId,
      courseId: course.id,
      details: {
        title: course.title,
        price: course.price,
        category: course.category
      },
      req
    });

    console.log(`Ì≥ù COURSE CREATED: "${data.title}"`);
    console.log(`   Status: DRAFT (needs to be submitted for review)`);
    console.log(`   Instructor: ${instructor.name}`);
    
    return course;
  }

  static async submitCourseForReview(instructorId: string, courseId: string, req?: Request) {
    // Verify course belongs to instructor
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId
      }
    });

    if (!course) {
      throw new Error('Course not found or you are not the instructor');
    }

    if (course.status !== CourseStatus.DRAFT) {
      throw new Error('Course can only be submitted from draft status');
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.PENDING_REVIEW
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_SUBMITTED,
      userId: instructorId,
      courseId,
      details: {
        title: course.title,
        previousStatus: CourseStatus.DRAFT,
        newStatus: CourseStatus.PENDING_REVIEW
      },
      req
    });

    console.log(`Ì≥§ COURSE SUBMITTED FOR REVIEW: "${course.title}"`);
    console.log(`   Now waiting for admin approval`);
    
    return updatedCourse;
  }

  static async getInstructorCourses(instructorId: string) {
    return prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: {
          select: {
            enrollments: true,
            reviews: true,
            payments: {
              where: {
                status: 'COMPLETED'
              }
            }
          }
        },
        reviews: {
          select: {
            rating: true
          },
          take: 50
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ========== ADMIN: COURSE APPROVAL ==========
  
  static async getPendingCourses(adminId: string) {
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });
    
    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error('Admin access required');
    }

    return prisma.course.findMany({
      where: { status: CourseStatus.PENDING_REVIEW },
      include: {
        instructor: {
          select: {
            name: true,
            email: true,
            qualifications: true,
            experience: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async approveCourse(adminId: string, courseId: string, req?: Request) {
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });
    
    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error('Admin access required');
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.APPROVED
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_APPROVED,
      userId: adminId,
      targetUserId: course.instructor.id,
      courseId,
      details: {
        title: course.title,
        approvedBy: admin.email,
        instructor: course.instructor.email
      },
      req
    });

    console.log(`‚úÖ COURSE APPROVED: "${course.title}"`);
    console.log(`   Instructor: ${course.instructor.name}`);
    console.log(`   Instructor can now publish it`);
    
    return course;
  }

  static async publishCourse(instructorId: string, courseId: string, req?: Request) {
    // Verify course belongs to instructor and is approved
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId,
        status: CourseStatus.APPROVED
      }
    });

    if (!course) {
      throw new Error('Course not found, not approved, or you are not the instructor');
    }

    const publishedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date()
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_PUBLISHED,
      userId: instructorId,
      courseId,
      details: {
        title: course.title,
        publishedAt: publishedCourse.publishedAt
      },
      req
    });

    console.log(`Ì∫Ä COURSE PUBLISHED: "${course.title}"`);
    console.log(`   Now visible to all students`);
    
    return publishedCourse;
  }

  static async rejectCourse(adminId: string, courseId: string, reason: string, req?: Request) {
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });
    
    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error('Admin access required');
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        status: CourseStatus.REJECTED,
        rejectionReason: reason
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.COURSE_REJECTED,
      userId: adminId,
      targetUserId: course.instructor.id,
      courseId,
      details: {
        title: course.title,
        reason,
        rejectedBy: admin.email,
        instructor: course.instructor.email
      },
      req
    });

    console.log(`‚ùå COURSE REJECTED: "${course.title}"`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Instructor: ${course.instructor.name}`);
    
    return course;
  }
}
