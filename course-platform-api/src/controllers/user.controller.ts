import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class UserController {
  // Apply to become an instructor
  static async applyForInstructor(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { bio, qualifications, experience } = req.body;

      if (!bio || !qualifications) {
        return res.status(400).json({
          error: 'Bio and qualifications are required'
        });
      }

      const application = await AuthService.applyForInstructor(
        user.userId,
        bio,
        qualifications,
        experience || '',
        req
      );

      return res.json({
        success: true,
        message: 'Instructor application submitted successfully',
        application,
        note: 'An admin will review your application. You will be notified by email.'
      });
    } catch (error: any) {
      if (error.message.includes('already')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Check instructor application status
  static async getInstructorStatus(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const profile = await AuthService.getProfile(user.userId);

      return res.json({
        success: true,
        isInstructor: profile.isInstructor,
        instructorStatus: profile.instructorStatus,
        appliedOn: profile.instructorStatus !== 'not_applied' ? profile.createdAt : null
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update user profile
  static async updateProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { name, bio, website } = req.body;

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const updatedUser = await prisma.user.update({
        where: { id: user.userId },
        data: {
          name,
          bio,
          website
        },
        select: {
          id: true,
          name: true,
          email: true,
          bio: true,
          website: true,
          profileImage: true,
          updatedAt: true
        }
      });

      await prisma.$disconnect();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
