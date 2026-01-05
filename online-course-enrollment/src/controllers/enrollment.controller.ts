import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError, ConflictError, ValidationError, AuthorizationError } from '../middleware/errorHandler';
import logger from '../config/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         courseId:
 *           type: string
 *         enrollmentDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, CANCELLED]
 *         completionDate:
 *           type: string
 *           format: date-time
 *     EnrollRequest:
 *       type: object
 *       required:
 *         - courseId
 *       properties:
 *         courseId:
 *           type: string
 */

export const enrollInCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }

        const { courseId } = req.body;

        // Check if course exists and is published
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            throw new NotFoundError('Course not found');
        }

        if (course.status !== 'PUBLISHED') {
            throw new ValidationError('Cannot enroll in unpublished course');
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: req.user.id,
                    courseId,
                },
            },
        });

        if (existingEnrollment) {
            throw new ConflictError('Already enrolled in this course');
        }

        // Check capacity
        if (course.enrollmentCount >= course.capacity) {
            throw new ValidationError('Course is at full capacity');
        }

        // Create enrollment and update course enrollment count
        const enrollment = await prisma.$transaction(async (tx) => {
            const newEnrollment = await tx.enrollment.create({
                data: {
                    userId: req.user!.id,
                    courseId,
                },
                include: {
                    course: {
                        select: {
                            id: true,
                            title: true,
                            price: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });

            await tx.course.update({
                where: { id: courseId },
                data: { enrollmentCount: { increment: 1 } },
            });

            return newEnrollment;
        });

        logger.info(`User ${req.user.email} enrolled in course ${courseId}`);
        res.status(201).json(enrollment);
    } catch (error) {
        next(error);
    }
};

export const getMyEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }

        const { status } = req.query;
        const where: any = { userId: req.user.id };

        if (status) {
            where.status = status;
        }

        const enrollments = await prisma.enrollment.findMany({
            where,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        price: true,
                        instructor: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: { enrollmentDate: 'desc' },
        });

        res.json(enrollments);
    } catch (error) {
        next(error);
    }
};

export const getCourseEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }

        const { courseId } = req.params;

        // Check if course exists
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            throw new NotFoundError('Course not found');
        }

        // Only instructor of the course or admin can view enrollments
        if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new AuthorizationError('You can only view enrollments for your own courses');
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
            orderBy: { enrollmentDate: 'desc' },
        });

        res.json(enrollments);
    } catch (error) {
        next(error);
    }
};

export const cancelEnrollment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }

        const { id } = req.params;

        const enrollment = await prisma.enrollment.findUnique({
            where: { id },
            include: { course: true },
        });

        if (!enrollment) {
            throw new NotFoundError('Enrollment not found');
        }

        // Only the enrolled user can cancel their enrollment
        if (enrollment.userId !== req.user.id) {
            throw new AuthorizationError('You can only cancel your own enrollments');
        }

        if (enrollment.status === 'CANCELLED') {
            throw new ValidationError('Enrollment is already cancelled');
        }

        // Update enrollment status and decrement course enrollment count
        await prisma.$transaction(async (tx) => {
            await tx.enrollment.update({
                where: { id },
                data: { status: 'CANCELLED' },
            });

            await tx.course.update({
                where: { id: enrollment.courseId },
                data: { enrollmentCount: { decrement: 1 } },
            });
        });

        logger.info(`User ${req.user.email} cancelled enrollment ${id}`);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
