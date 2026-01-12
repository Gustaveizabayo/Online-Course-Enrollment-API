import request from 'supertest';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

test('POST /api/auth/resend-otp', () => {
  let testUser: any;

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

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = bcrypt.hashSync(otpCode, 10);
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

  test('should resend OTP for pending user', async () => {
    const response = await request(app)
      .post('/api/auth/resend-otp')
      .send({
        email: 'test@example.com',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('New verification code sent');

    const otp = await prisma.oTP.findUnique({
      where: { userId: testUser.id },
    });

    expect(otp).toBeTruthy();
  });

  test('should reject resend for non-existent user', async () => {
    const response = await request(app)
      .post('/api/auth/resend-otp')
      .send({
        email: 'nonexistent@example.com',
      })
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User not found');
  });

  test('should reject resend for already active user', async () => {
    await prisma.user.update({
      where: { id: testUser.id },
      data: { status: 'ACTIVE' },
    });

    const response = await request(app)
      .post('/api/auth/resend-otp')
      .send({
        email: 'test@example.com',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User is already active');
  });

  test('should enforce rate limiting', async () => {
    await request(app)
      .post('/api/auth/resend-otp')
      .send({ email: 'test@example.com' })
      .expect(200);

    const response = await request(app)
      .post('/api/auth/resend-otp')
      .send({ email: 'test@example.com' })
      .expect(429);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Please wait');
  });

  test('should reject invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/resend-otp')
      .send({
        email: 'invalid-email',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid email format');
  });
});
