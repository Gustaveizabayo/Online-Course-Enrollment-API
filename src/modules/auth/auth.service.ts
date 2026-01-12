import { PrismaClient, UserStatus, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { OtpGenerator } from '../../utils/otpGenerator';
import { emailService } from '../../utils/emailService';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  TooManyRequestsError,
} from '../../utils/ApiError';
import { UserPayload } from '../../types';

const prisma = new PrismaClient();

export class AuthService {
  async register(email: string, password: string, name?: string, requestedRole?: Role) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.status === UserStatus.ACTIVE) {
        throw new ConflictError('User already exists and is active');
      }

      await prisma.user.update({
        where: { email },
        data: {
          password,
          name,
          role: requestedRole || existingUser.role, // Update role if provided
          status: UserStatus.PENDING,
        },
      });
    } else {
      // Default role is STUDENT unless explicitly requested (and allowed by controller)
      let role: Role = Role.STUDENT;

      if (requestedRole) {
        role = requestedRole;
      }

      await prisma.user.create({
        data: {
          email,
          password,
          name,
          role,
          status: UserStatus.PENDING,
        },
      });
    }

    const otpCode = OtpGenerator.generate();
    const hashedOtp = OtpGenerator.hashOtp(otpCode);
    const expiresAt = OtpGenerator.generateExpiry(config.otp.expiryMinutes);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found after creation');

    await prisma.oTP.upsert({
      where: { userId: user.id },
      update: {
        code: hashedOtp,
        expiresAt,
      },
      create: {
        userId: user.id,
        code: hashedOtp,
        expiresAt,
      },
    });

    await emailService.sendOtpEmail(email, otpCode);

    return { message: 'Verification code sent' };
  }

  async verifyOtp(email: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { otp: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestError('User is already active');
    }

    if (!user.otp) {
      throw new BadRequestError('No OTP found. Please request a new one.');
    }

    if (OtpGenerator.isExpired(user.otp.expiresAt)) {
      await prisma.oTP.delete({ where: { userId: user.id } });
      throw new BadRequestError('OTP has expired. Please request a new one.');
    }

    if (!OtpGenerator.verifyOtp(code, user.otp.code)) {
      throw new UnauthorizedError('Invalid verification code');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { status: UserStatus.ACTIVE },
      }),
      prisma.oTP.delete({
        where: { userId: user.id },
      }),
    ]);

    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: UserStatus.ACTIVE,
    };

    // FIXED: Simplified JWT sign call
    const token = jwt.sign(payload, config.jwt.secret, { expiresIn: '7d' });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async resendOtp(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { otp: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestError('User is already active');
    }

    const otpCode = OtpGenerator.generate();
    const hashedOtp = OtpGenerator.hashOtp(otpCode);
    const expiresAt = OtpGenerator.generateExpiry(config.otp.expiryMinutes);

    await prisma.oTP.upsert({
      where: { userId: user.id },
      update: {
        code: hashedOtp,
        expiresAt,
      },
      create: {
        userId: user.id,
        code: hashedOtp,
        expiresAt,
      },
    });

    await emailService.sendOtpEmail(email, otpCode);

    return { message: 'New verification code sent' };
  }

  // Instructor Application Workflow
  async applyToBeInstructor(userId: string, data: any) {
    const existingApplication = await prisma.instructorApplication.findFirst({
      where: { userId, status: 'PENDING' },
    });

    if (existingApplication) {
      throw new ConflictError('You already have a pending application');
    }

    return await prisma.instructorApplication.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getApplications() {
    return await prisma.instructorApplication.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewApplication(applicationId: string, status: 'APPROVED' | 'REJECTED') {
    const application = await prisma.instructorApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const updatedApplication = await prisma.instructorApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: Role.INSTRUCTOR },
      });
    }

    return updatedApplication;
  }

  async updateUserRole(adminUserId: string, targetUserId: string, newRole: Role) {
    // 1. Check if the requester is actually an Admin (double check, though middleware should handle this)
    const admin = await prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      throw new UnauthorizedError('Only admins can assign roles');
    }

    // 2. Update the target user's role
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, email: true, role: true, name: true }
    });

    return updatedUser;
  }
}

export const authService = new AuthService();
