import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import prisma from '../database/prisma';
import { Role, ApplicationStatus } from '@prisma/client';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role = 'STUDENT' } = req.body;

      console.log('AuthController: Registration attempt for:', email);

      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'Name, email, and password are required'
        });
      }

      const validRoles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
      const userRole = validRoles.includes(role) ? role : 'STUDENT';

      const result = await AuthService.register(name, email, password, userRole, req);

      console.log('AuthController: Registration successful for:', email);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: result.user,
        token: result.token
      });
    } catch (error: any) {
      console.error('❌ AuthController Register Error:', error);

      if (error.message === 'User with this email already exists') {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }

      const result = await AuthService.login(email, password, req);

      return res.json({
        success: true,
        message: 'Login successful',
        user: result.user,
        token: result.token
      });
    } catch (error: any) {
      console.error('Login error:', error);

      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }

      return res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          profileImage: true,
          bio: true,
          isVerified: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({
        success: true,
        user
      });

    } catch (error: any) {
      console.error('❌ Get profile error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // ADMIN: Get pending instructor applications
  static async getPendingInstructors(req: Request, res: Response) {
    try {
      const applications = await prisma.instructorApplication.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return res.json({
        success: true,
        count: applications.length,
        applications
      });
    } catch (error: any) {
      console.error('Get pending instructors error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ADMIN: Approve instructor
  static async approveInstructor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const applicationId = parseInt(id);

      const application = await prisma.instructorApplication.findUnique({
        where: { id: applicationId }
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Update application status
      await prisma.instructorApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date()
        }
      });

      // Update user role
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: 'INSTRUCTOR' }
      });

      return res.json({
        success: true,
        message: 'Instructor approved successfully'
      });
    } catch (error: any) {
      console.error('Approve instructor error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // ADMIN: Reject instructor
  static async rejectInstructor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const applicationId = parseInt(id);

      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }

      const application = await prisma.instructorApplication.findUnique({
        where: { id: applicationId }
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      await prisma.instructorApplication.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
          reviewedAt: new Date()
        }
      });

      return res.json({
        success: true,
        message: 'Instructor application rejected'
      });
    } catch (error: any) {
      console.error('Reject instructor error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          error: 'Email and OTP are required'
        });
      }

      const { OTPService } = require('../services/otp.service');
      const isValid = await OTPService.verifyOTPByEmail(email, otp);

      if (!isValid) {
        return res.status(400).json({
          error: 'Invalid or expired verification code'
        });
      }

      // Mark user as verified
      await prisma.user.update({
        where: { email },
        data: { isVerified: true, emailVerified: true }
      });

      // Fetch user name for the email
      const user = await prisma.user.findUnique({ where: { email }, select: { name: true } });

      // Send success email
      const { EmailService } = require('../utils/email');
      EmailService.sendVerificationSuccess(email, user?.name || 'User').catch((err: any) =>
        console.error('⚠️ Failed to send verification success email:', err)
      );

      return res.json({
        success: true,
        title: '🎉 You’re all set!',
        message: 'Your account has been successfully created and verified. Explore, learn, and grow—your journey begins now.',
        buttonText: 'Go to Dashboard'
      });
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
