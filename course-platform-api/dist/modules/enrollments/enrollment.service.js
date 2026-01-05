"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
const prisma_1 = require("../../database/prisma");
const apiError_1 = require("../../utils/apiError");
const client_1 = require("@prisma/client");
class EnrollmentService {
    async enrollStudent(userId, courseId) {
        // Check if course exists
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new apiError_1.NotFoundError('Course not found');
        }
        // Check if user is already enrolled
        const existingEnrollment = await prisma_1.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
        if (existingEnrollment) {
            throw new apiError_1.BadRequestError('You are already enrolled in this course');
        }
        // Create enrollment
        const enrollment = await prisma_1.prisma.enrollment.create({
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
    async getStudentEnrollments(userId) {
        const enrollments = await prisma_1.prisma.enrollment.findMany({
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
    async getCourseEnrollments(courseId, userId, userRole) {
        // Check if course exists
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new apiError_1.NotFoundError('Course not found');
        }
        // Check permission
        if (userRole !== client_1.Role.ADMIN && course.instructorId !== userId) {
            throw new apiError_1.BadRequestError('You do not have permission to view enrollments for this course');
        }
        const enrollments = await prisma_1.prisma.enrollment.findMany({
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
exports.EnrollmentService = EnrollmentService;
