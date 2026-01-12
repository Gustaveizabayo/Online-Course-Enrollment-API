import prisma from '../../database/prisma';
import {
    StudentDashboardData,
    InstructorDashboardData,
    AdminDashboardData
} from './dashboard.types';

export class DashboardService {

    // --- Student Dashboard ---
    async getStudentStats(userId: string): Promise<StudentDashboardData> {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: { course: true }
        });

        const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
        const active = enrollments.filter(e => e.status === 'ACTIVE').length;

        // Get recent activity logs
        const recentActivity = await prisma.activityLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        return {
            totalEnrollments: enrollments.length,
            completedCourses: completed,
            inProgressCourses: active,
            recentActivity,
            upcomingLessons: [] // Placeholder: logic to find next uncompleted lesson would go here
        };
    }

    // --- Instructor Dashboard ---
    async getInstructorStats(userId: string): Promise<InstructorDashboardData> {
        const courses = await prisma.course.findMany({
            where: { instructorId: userId },
            include: {
                _count: {
                    select: { enrollments: true }
                },
                reviews: {
                    select: { rating: true }
                }
            }
        });

        const totalStudents = courses.reduce((sum, course) => sum + course._count.enrollments, 0);
        const publishedCourses = courses.filter(c => c.isPublished).length;

        // Calculate basic earnings (assuming simplified model where instructor gets full price)
        // In a real app, you'd fetch actual Payment records linked to these courses
        const payments = await prisma.payment.findMany({
            where: {
                enrollment: {
                    course: {
                        instructorId: userId
                    }
                },
                status: 'COMPLETED'
            }
        });

        const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

        const recentEnrollments = await prisma.enrollment.findMany({
            where: {
                course: { instructorId: userId }
            },
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } }
            },
            orderBy: { enrolledAt: 'desc' },
            take: 5
        });

        const coursePerformance = courses.map(course => {
            const avgRating = course.reviews.length > 0
                ? course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length
                : 0;

            return {
                courseId: course.id,
                title: course.title,
                students: course._count.enrollments,
                rating: parseFloat(avgRating.toFixed(1))
            };
        });

        return {
            totalStudents,
            totalCourses: courses.length,
            publishedCourses,
            totalEarnings,
            recentEnrollments,
            coursePerformance
        };
    }

    // --- Admin Dashboard ---
    async getAdminStats(): Promise<AdminDashboardData> {
        const [
            totalUsers,
            totalInstructors,
            totalStudents,
            totalCourses,
            completedPayments
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.course.count(),
            prisma.payment.findMany({ where: { status: 'COMPLETED' }, select: { amount: true } })
        ]);

        const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

        const recentApplications = await prisma.instructorApplication.findMany({
            where: { status: 'PENDING' },
            include: { user: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        return {
            totalUsers,
            totalInstructors,
            totalStudents,
            totalCourses,
            totalRevenue,
            recentApplications,
            systemHealth: {
                status: 'HEALTHY',
                uptime: process.uptime()
            }
        };
    }
}

export const dashboardService = new DashboardService();
