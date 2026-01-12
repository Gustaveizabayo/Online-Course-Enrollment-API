import request from 'supertest';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const prisma = new PrismaClient();

describe('POST /api/auth/verify-otp', () => {
  let testUser: any;
  let validOtpCode: string;

  beforeEach(async () => {
    await prisma.oTP.deleteMany();
    await prisma.user.deleteMany();

    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'password123',
        status: 'PENDING',
      },
    });

    validOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = bcrypt.hashSync(validOtpCode, 10);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    await prisma.oTP.create({
      data: {
        userId: testUser.id,
        code: hashedOtp,
        expiresAt,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should verify OTP and activate user', async () => {
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'test@example.com',
        code: validOtpCode,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Account verified successfully');
    expect(response.body.data.token).toBeTruthy();
    expect(response.body.data.user.email).toBe('test@example.com');

    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });

    expect(updatedUser?.status).toBe('ACTIVE');

    const otp = await prisma.oTP.findUnique({
      where: { userId: testUser.id },
    });

    expect(otp).toBeNull();

    const decoded = jwt.verify(response.body.data.token, config.jwt.secret);
    expect((decoded as any).email).toBe('test@example.com');
  });

  test('should reject invalid OTP', async () => {
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'test@example.com',
        code: '999999',
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid verification code');
  });

  test('should reject expired OTP', async () => {
    const expiredOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = bcrypt.hashSync(expiredOtpCode, 10);
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() - 10);

    await prisma.oTP.update({
      where: { userId: testUser.id },
      data: {
        code: hashedOtp,
        expiresAt,
      },
    });

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'test@example.com',
        code: expiredOtpCode,
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('OTP has expired. Please request a new one.');

    const otp = await prisma.oTP.findUnique({
      where: { userId: testUser.id },
    });
    expect(otp).toBeNull();
  });

  test('should reject non-existent user', async () => {
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'nonexistent@example.com',
        code: validOtpCode,
      })
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User not found');
  });

  test('should reject already active user', async () => {
    await prisma.user.update({
      where: { id: testUser.id },
      data: { status: 'ACTIVE' },
    });

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'test@example.com',
        code: validOtpCode,
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User is already active');
  });

  test('should reject invalid code format', async () => {
    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({
        email: 'test@example.com',
        code: '123',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('OTP must be 6 digits');
  });
});
