import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { NotFoundError, AuthorizationError, ValidationError } from '../middleware/errorHandler';
import logger from '../config/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         instructorId:
 *           type: string
 *         price:
 *           type: number
 *         capacity:
 *           type: integer
 *         enrollmentCount:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateCourseRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - capacity
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *         capacity:
 *           type: integer
 *           minimum: 1
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 */

export const getAllCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { page = '1', limit = '10', status, search } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const take = parseInt(limit as string);

        const where: any = {};

        if (status) {
            where.status = status;
        } else {
            // Default to showing only published courses for non-authenticated users
            if (!req.user) {
                where.status = 'PUBLISHED';
            }
        }

        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                skip,
                take,
                include: {
                    instructor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.course.count({ where }),
        ]);

        res.json({
            courses,
            pagination: {
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                total,
                totalPages: Math.ceil(total / take),
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getCourseById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                instructor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                enrollments: {
                    select: {
                        id: true,
                        userId: true,
                        status: true,
                    },
                },
            },
        });

        if (!course) {
            throw new NotFoundError('Course not found');
        }

        res.json(course);
    } catch (error) {
        next(error);
    }
};

export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }

        const { title, description, price, capacity, status } = req.body;

        if (price < 0) {
            throw new ValidationError('Price cannot be negative');
        }

        if (capacity < 1) {
            throw new ValidationError('Capacity must be at least 1');
        }

        const course = await prisma.course.create({
            data: {
                title,
                description,
                price: parseFloat(price),
                capacity: parseInt(capacity),
                status: status || 'DRAFT',
                instructorId: req.user.id,
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

        logger.info(`Course created: ${course.id} by ${req.user.email}`);
        res.status(201).json(course);
    } catch (error) {
        next(error);
    }
};

export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            throw new AuthorizationError();
        }

        const { id } = req.params;
        const { title, description, price, capacity, status } = req.body;

        const existingCourse = await prisma.course.findUnique({ where: { id } });
        if (!existingCourse) {
            throw new NotFoundError('Course not found');
        }

        // Only instructor who created the course or admin can update
        if (existingCourse.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new AuthorizationError('You can only update your own courses');
        }

        if (price !== undefined && price < 0) {
            throw new ValidationError('Price cannot be negative');
        }

        if (capacity !== undefined && capacity < existingCourse.enrollmentCount) {
            throw new ValidationError('Capacity cannot be less than current enrollment count');
        }

        const course = await prisma.course.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(capacity !== undefined && { capacity: parseInt(capacity) }),
                ...(status && { status }),
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

        logger.info(`Course updated: ${course.id} by ${req.user.email}`);
        res.json(course);
    } catch (error) {
        next(error);
    }
};

export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user || req.user.role !== 'ADMIN') {
            throw new AuthorizationError('Only admins can delete courses');
        }

        const { id } = req.params;

        const course = await prisma.course.findUnique({ where: { id } });
        if (!course) {
            throw new NotFoundError('Course not found');
        }

        await prisma.course.delete({ where: { id } });

        logger.info(`Course deleted: ${id} by ${req.user.email}`);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
