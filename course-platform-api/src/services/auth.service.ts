import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../database/prisma';
import { Role } from '@prisma/client';
import { EmailService } from '../utils/email';

export class AuthService {
  static async register(name: string, email: string, password: string, role: string = 'STUDENT', req?: any) {
    try {
      console.log('🚀 AuthService: Registering user:', email);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      console.log('🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      console.log('📝 Inserting user into database...');
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role as Role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      console.log('✅ User created with ID:', user.id);

      // 1. Generate and Store OTP
      const otp = require('../services/otp.service').OTPService.generateOTP();
      await require('../services/otp.service').OTPService.storeOTP(user.id, otp);

      // 2. Send emails (non-blocking)
      EmailService.sendWelcomeEmail(email, name).catch(err =>
        console.error('⚠️ Failed to send welcome email:', err)
      );

      EmailService.sendOTP(email, otp).catch(err =>
        console.error('⚠️ Failed to send OTP email:', err)
      );

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-jwt-secret-key-12345',
        { expiresIn: '7d' }
      );

      return { user, token, message: 'Registration successful. Please check your email for the verification code.' };

    } catch (error: any) {
      console.error('❌ AuthService register error:', error.message);
      throw error;
    }
  }

  static async login(email: string, password: string, req?: any) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-jwt-secret-key-12345',
        { expiresIn: '7d' }
      );

      // Remove password hash from response
      const { password: _, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };

    } catch (error: any) {
      console.error('AuthService login error:', error);
      throw error;
    }
  }

  static async getAllUsers() {
    try {
      return await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error: any) {
      console.error('❌ AuthService getAllUsers error:', error);
      throw error;
    }
  }

  static async approveUser(adminId: number, targetUserId: string | number) {
    try {
      const id = typeof targetUserId === 'string' ? parseInt(targetUserId) : targetUserId;

      const application = await prisma.instructorApplication.findUnique({
        where: { userId: id }
      });

      if (!application) {
        throw new Error('Application not found');
      }

      await prisma.instructorApplication.update({
        where: { userId: id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      });

      const user = await prisma.user.update({
        where: { id },
        data: { role: Role.INSTRUCTOR },
        select: { id: true, email: true, role: true }
      });

      return user;
    } catch (error: any) {
      console.error('❌ AuthService approveUser error:', error);
      throw error;
    }
  }

  static async rejectUser(adminId: number, targetUserId: string | number) {
    try {
      const id = typeof targetUserId === 'string' ? parseInt(targetUserId) : targetUserId;

      const application = await prisma.instructorApplication.findUnique({
        where: { userId: id }
      });

      if (!application) {
        throw new Error('Application not found');
      }

      await prisma.instructorApplication.update({
        where: { userId: id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      });

      return { success: true, message: 'User application rejected' };
    } catch (error: any) {
      console.error('❌ AuthService rejectUser error:', error);
      throw error;
    }
  }
}
