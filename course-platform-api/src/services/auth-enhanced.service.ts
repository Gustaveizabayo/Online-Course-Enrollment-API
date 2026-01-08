import { PrismaClient, Role, ActivityType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ActivityService } from './activity.service';
import { EmailService } from './email.service';
import { Request } from 'express';

const prisma = new PrismaClient();

export class AuthEnhancedService {
  // ========== PUBLIC: ANYONE CAN REGISTER ==========
  
  static async register(
    name: string, 
    email: string, 
    password: string, 
    role: Role,
    req?: Request
  ) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ÌæØ REAL-WORLD LOGIC:
    // 1. First user = ADMIN
    // 2. All others = STUDENT by default (can apply to be instructor later)
    const totalUsers = await prisma.user.count();
    const isFirstUser = totalUsers === 0;
    
    const finalRole = isFirstUser ? Role.ADMIN : Role.STUDENT;
    const instructorStatus = role === Role.INSTRUCTOR ? 'pending' : 'not_applied';

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: finalRole,
        instructorStatus
      }
    });

    // Generate token
    const secret = process.env.JWT_SECRET || 'dev-secret-key-for-testing-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        isInstructor: user.isInstructor
      },
      secret,
      { expiresIn }
    );

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.USER_REGISTERED,
      userId: user.id,
      details: {
        role: user.role,
        isFirstUser,
        instructorStatus: user.instructorStatus
      },
      req
    });

    // Send welcome email (async - don't wait for it)
    EmailService.sendWelcomeEmail(user.email, user.name)
      .then(result => {
        if (result.success) {
          console.log(`Ì≥ß Welcome email sent to ${user.email}`);
        } else {
          console.warn(`‚ö†Ô∏è Failed to send welcome email to ${user.email}`);
        }
      })
      .catch(error => {
        console.error('Email sending error:', error);
      });

    console.log(`\nÌ≥ù USER REGISTERED: ${email}`);
    console.log(`   Role: ${user.role}`);
    if (isFirstUser) {
      console.log(`\nÌæâ FIRST USER = PLATFORM ADMIN!`);
      console.log(`   You can now approve instructors and courses`);
    } else if (role === Role.INSTRUCTOR) {
      console.log(`\nÌ≥ã INSTRUCTOR APPLICATION SUBMITTED`);
      console.log(`   An admin needs to review your application`);
      console.log(`   You can browse courses as a student meanwhile`);
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  static async login(email: string, password: string, req?: Request) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const secret = process.env.JWT_SECRET || 'dev-secret-key-for-testing-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        isInstructor: user.isInstructor
      },
      secret,
      { expiresIn }
    );

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.USER_LOGGED_IN,
      userId: user.id,
      req
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        profileImage: true,
        website: true,
        isInstructor: true,
        instructorStatus: true,
        instructorBio: true,
        qualifications: true,
        experience: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // ========== APPLY TO BE INSTRUCTOR ==========
  
  static async applyForInstructor(
    userId: string, 
    bio: string, 
    qualifications: string, 
    experience: string,
    req?: Request
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.instructorStatus === 'approved') {
      throw new Error('You are already an approved instructor');
    }

    if (user.instructorStatus === 'pending') {
      throw new Error('Your instructor application is already pending review');
    }

    // Update user with instructor application
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        instructorStatus: 'pending',
        instructorBio: bio,
        qualifications,
        experience,
        role: Role.STUDENT // Still a student until approved
      },
      select: {
        id: true,
        name: true,
        email: true,
        instructorStatus: true,
        instructorBio: true
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.INSTRUCTOR_APPLIED,
      userId,
      details: {
        bioLength: bio.length,
        qualificationsLength: qualifications.length,
        experience
      },
      req
    });

    // Send application submitted email
    EmailService.sendInstructorApplicationSubmitted(user.email, user.name)
      .then(result => {
        if (result.success) {
          console.log(`Ì≥ß Instructor application email sent to ${user.email}`);
        }
      })
      .catch(console.error);

    console.log(`\nÌ≥ã INSTRUCTOR APPLICATION: ${user.email}`);
    console.log(`   Status: Pending admin review`);
    
    return updatedUser;
  }

  // ========== ADMIN FUNCTIONS ==========
  
  static async approveInstructor(adminId: string, userId: string, req?: Request) {
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });
    
    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error('Admin access required');
    }

    // Get user before update for email
    const userBeforeUpdate = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userBeforeUpdate) {
      throw new Error('User not found');
    }

    // Approve instructor
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        instructorStatus: 'approved',
        isInstructor: true,
        role: Role.INSTRUCTOR
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isInstructor: true,
        instructorStatus: true
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.INSTRUCTOR_APPROVED,
      userId: adminId,
      targetUserId: userId,
      details: {
        approvedBy: admin.email,
        approvedFor: user.email
      },
      req
    });

    // Send approval email
    EmailService.sendInstructorApproved(userBeforeUpdate.email, userBeforeUpdate.name)
      .then(result => {
        if (result.success) {
          console.log(`Ì≥ß Instructor approval email sent to ${userBeforeUpdate.email}`);
        }
      })
      .catch(console.error);

    console.log(`‚úÖ INSTRUCTOR APPROVED: ${user.email}`);
    return user;
  }

  static async rejectInstructor(adminId: string, userId: string, reason: string, req?: Request) {
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });
    
    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error('Admin access required');
    }

    // Get user before update for email
    const userBeforeUpdate = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userBeforeUpdate) {
      throw new Error('User not found');
    }

    // Reject instructor application
    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        instructorStatus: 'rejected',
        isInstructor: false,
        role: Role.STUDENT
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    // Log activity
    await ActivityService.logActivity({
      type: ActivityType.INSTRUCTOR_REJECTED,
      userId: adminId,
      targetUserId: userId,
      details: {
        reason,
        rejectedBy: admin.email,
        rejectedUser: user.email
      },
      req
    });

    // Send rejection email
    EmailService.sendInstructorRejected(userBeforeUpdate.email, userBeforeUpdate.name, reason)
      .then(result => {
        if (result.success) {
          console.log(`Ì≥ß Instructor rejection email sent to ${userBeforeUpdate.email}`);
        }
      })
      .catch(console.error);

    console.log(`‚ùå INSTRUCTOR REJECTED: ${user.email}`);
    console.log(`   Reason: ${reason}`);
    
    return { user, reason };
  }

  static async getPendingInstructors(adminId: string) {
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    });
    
    if (!admin || admin.role !== Role.ADMIN) {
      throw new Error('Admin access required');
    }

    return prisma.user.findMany({
      where: { instructorStatus: 'pending' },
      select: {
        id: true,
        name: true,
        email: true,
        instructorBio: true,
        qualifications: true,
        experience: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // ========== PASSWORD RESET ==========
  
  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists for security
      return { success: true, message: 'If an account exists, you will receive a reset email' };
    }

    // Generate reset token
    const secret = process.env.JWT_SECRET || 'dev-secret-key-for-testing-change-in-production';
    const resetToken = jwt.sign(
      { 
        userId: user.id,
        type: 'password_reset'
      },
      secret,
      { expiresIn: '1h' }
    );

    // Send reset email
    await EmailService.sendPasswordReset(user.email, user.name, resetToken);

    return { 
      success: true, 
      message: 'Password reset email sent',
      note: 'Check your email for the reset link (valid for 1 hour)'
    };
  }

  static async resetPassword(token: string, newPassword: string) {
    try {
      const secret = process.env.JWT_SECRET || 'dev-secret-key-for-testing-change-in-production';
      const decoded = jwt.verify(token, secret) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword }
      });

      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }
}
