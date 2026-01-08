import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardService {
  // Get platform statistics
  static async getPlatformStats() {
    const [
      totalUsers,
      totalInstructors,
      totalCourses,
      totalPublishedCourses,
      totalEnrollments,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.INSTRUCTOR } }),
      prisma.course.count(),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.enrollment.count(),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ]);

    // Recent activities
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
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
      }
    });

    // Recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Recent courses
    const recentCourses = await prisma.course.findMany({
      take: 5,
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      include: {
        instructor: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    return {
      overview: {
        totalUsers,
        totalInstructors,
        totalCourses,
        totalPublishedCourses,
        totalEnrollments,
        totalRevenue: totalRevenue._sum.amount || 0
      },
      recentActivities,
      recentUsers,
      recentCourses
    };
  }

  // Get admin dashboard data
  static async getAdminDashboard() {
    const platformStats = await this.getPlatformStats();

    // Pending approvals
    const pendingApplications = await prisma.instructorApplication.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            qualifications: true,
            experienceYears: true,
            createdAt: true
          }
        }
      }
    });

    const pendingInstructors = pendingApplications.map(app => ({
      ...app.user,
      applicationId: app.id,
      motivation: app.motivation
    }));

    const pendingCourses = await prisma.course.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: {
        instructor: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Revenue statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: { amount: true }
    });

    // User growth (last 30 days)
    const userGrowth = await prisma.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    return {
      ...platformStats,
      pendingApprovals: {
        instructors: pendingInstructors.length,
        courses: pendingCourses.length
      },
      pendingInstructors,
      pendingCourses,
      analytics: {
        recentRevenue: recentRevenue._sum.amount || 0,
        userGrowth,
        enrollmentGrowth: 0 // You can calculate this similarly
      }
    };
  }

  // Get instructor dashboard
  static async getInstructorDashboard(instructorId: number) {
    const [
      courses,
      enrollments,
      payments,
      reviews
    ] = await Promise.all([
      prisma.course.findMany({
        where: { instructorId },
        include: {
          _count: {
            select: {
              enrollments: true,
              reviews: true
            }
          }
        }
      }),
      prisma.enrollment.findMany({
        where: {
          course: { instructorId }
        }
      }),
      prisma.payment.findMany({
        where: {
          course: { instructorId },
          status: 'COMPLETED'
        }
      }),
      prisma.review.findMany({
        where: {
          course: { instructorId }
        }
      })
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const monthlyRevenue = payments
      .filter(p => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return p.createdAt > monthAgo;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    // Course statistics
    const courseStats = courses.map(course => ({
      id: course.id,
      title: course.title,
      status: course.status,
      enrollments: course._count.enrollments,
      reviews: course._count.reviews,
      revenue: payments
        .filter(p => p.courseId === course.id)
        .reduce((sum, p) => sum + p.amount, 0)
    }));

    // Recent enrollments
    const recentEnrollments = await prisma.enrollment.findMany({
      where: {
        course: { instructorId }
      },
      take: 10,
      orderBy: { enrolledAt: 'desc' },
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
      }
    });

    // Recent reviews
    const recentReviews = await prisma.review.findMany({
      where: {
        course: { instructorId }
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      }
    });

    return {
      overview: {
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.status === 'PUBLISHED').length,
        totalEnrollments: enrollments.length,
        totalRevenue,
        monthlyRevenue,
        totalReviews: reviews.length,
        averageRating: reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0
      },
      courseStats,
      recentEnrollments,
      recentReviews
    };
  }

  // Get student dashboard
  static async getStudentDashboard(userId: number) {
    const [
      enrollments,
      completedCourses,
      inProgressCourses,
      payments,
      reviews
    ] = await Promise.all([
      prisma.enrollment.findMany({
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
                  reviews: true
                }
              }
            }
          }
        },
        orderBy: { enrolledAt: 'desc' }
      }),
      prisma.enrollment.count({
        where: {
          userId,
          completed: true
        }
      }),
      prisma.enrollment.count({
        where: {
          userId,
          completed: false
        }
      }),
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.review.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              title: true,
              thumbnail: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Recommended courses (based on user's enrolled categories)
    const userCategories = Array.from(new Set(
      enrollments.map(e => (e.course as any).category).filter(Boolean)
    ));

    let recommendedCourses = [];
    if (userCategories.length > 0) {
      recommendedCourses = await prisma.course.findMany({
        where: {
          status: 'PUBLISHED',
          category: { in: userCategories },
          id: { notIn: enrollments.map(e => e.course.id) }
        },
        take: 5,
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
      });
    }

    // If no recommendations, get popular courses
    if (recommendedCourses.length === 0) {
      recommendedCourses = await prisma.course.findMany({
        where: {
          status: 'PUBLISHED',
          id: { notIn: enrollments.map(e => e.course.id) }
        },
        take: 5,
        orderBy: {
          enrollments: {
            _count: 'desc'
          }
        },
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
      });
    }

    // Learning statistics
    const totalLearningHours = enrollments.reduce((sum, e) => {
      return sum + (e.course.duration || 0) * (e.progress / 100);
    }, 0);

    return {
      overview: {
        totalEnrollments: enrollments.length,
        completedCourses,
        inProgressCourses,
        totalLearningHours: Math.round(totalLearningHours)
      },
      enrollments: enrollments.slice(0, 5), // Recent 5
      recentPayments: payments,
      myReviews: reviews,
      recommendedCourses
    };
  }
}
