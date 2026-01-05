import { Request, Response } from 'express';
import { prisma } from '../../database/prisma';

export class CourseController {
  async getCourses(req: Request, res: Response) {
    try {
      const courses = await prisma.course.findMany({
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
      });
      
      res.json({ courses });
    } catch (error) {
      console.error('Get courses error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createCourse(req: Request, res: Response) {
    try {
      const { title, description, price } = req.body;
      const userId = 'user-id-from-jwt'; // You'll get this from authentication middleware
      
      if (!title || !price) {
        return res.status(400).json({ error: 'Title and price are required' });
      }
      
      const course = await prisma.course.create({
        data: {
          title,
          description: description || '',
          price: parseFloat(price),
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
      
      res.status(201).json({
        message: 'Course created successfully',
        course,
      });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}