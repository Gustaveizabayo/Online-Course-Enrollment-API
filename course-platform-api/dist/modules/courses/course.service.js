"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const prisma_1 = require("../../database/prisma");
const apiError_1 = require("../../utils/apiError");
const client_1 = require("@prisma/client");
class CourseService {
    async createCourse(userId, data) {
        const course = await prisma_1.prisma.course.create({
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
            prisma_1.prisma.course.findMany({
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
            prisma_1.prisma.course.count(),
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
    async getCourseById(id) {
        const course = await prisma_1.prisma.course.findUnique({
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
            throw new apiError_1.NotFoundError('Course not found');
        }
        return course;
    }
    async updateCourse(courseId, userId, userRole, data) {
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new apiError_1.NotFoundError('Course not found');
        }
        // Check permission
        if (userRole !== client_1.Role.ADMIN && course.instructorId !== userId) {
            throw new apiError_1.ForbiddenError('You do not have permission to update this course');
        }
        const updatedCourse = await prisma_1.prisma.course.update({
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
    async deleteCourse(courseId, userId, userRole) {
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new apiError_1.NotFoundError('Course not found');
        }
        // Check permission
        if (userRole !== client_1.Role.ADMIN && course.instructorId !== userId) {
            throw new apiError_1.ForbiddenError('You do not have permission to delete this course');
        }
        await prisma_1.prisma.course.delete({
            where: { id: courseId },
        });
        return { message: 'Course deleted successfully' };
    }
    async getInstructorCourses(userId) {
        const courses = await prisma_1.prisma.course.findMany({
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
exports.CourseService = CourseService;
