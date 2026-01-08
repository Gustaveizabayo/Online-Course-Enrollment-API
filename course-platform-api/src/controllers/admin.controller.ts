import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import prisma from '../database/prisma';

export class AdminController {
  // Get all users (admin only)
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await AuthService.getAllUsers();

      return res.json({
        success: true,
        count: users.length,
        users
      });
    } catch (error: any) {
      console.error('❌ AdminController getAllUsers error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  // Approve a user (admin only)
  static async approveUser(req: Request, res: Response) {
    try {
      const admin = (req as any).user;
      const { userId } = req.params;

      const user = await AuthService.approveUser(admin.id, userId);

      return res.json({
        success: true,
        message: `User ${user.email} approved successfully`,
        user
      });
    } catch (error: any) {
      console.error('❌ AdminController approveUser error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  // Reject a user (admin only)
  static async rejectUser(req: Request, res: Response) {
    try {
      const admin = (req as any).user;
      const { userId } = req.params;

      const result = await AuthService.rejectUser(admin.id, userId);

      return res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      console.error('❌ AdminController rejectUser error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  // Get pending instructor applications
  static async getPendingUsers(req: Request, res: Response) {
    try {
      const applications = await prisma.instructorApplication.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true
            }
          }
        }
      });

      const pendingUsers = applications.map(app => ({
        ...app.user,
        applicationId: app.id,
        motivation: app.motivation,
        appliedAt: app.appliedAt
      }));

      return res.json({
        success: true,
        count: pendingUsers.length,
        pendingUsers
      });
    } catch (error: any) {
      console.error('❌ AdminController getPendingUsers error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }
}
