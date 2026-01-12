import request from 'supertest';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test suite
describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await prisma.oTP.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should register a new user and send OTP', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Verification code sent',
    });

    const user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    expect(user).toBeTruthy();
    expect(user?.email).toBe(userData.email);
    expect(user?.status).toBe('PENDING');
    expect(user?.name).toBe(userData.name);

    const otp = await prisma.oTP.findUnique({
      where: { userId: user!.id },
    });

    expect(otp).toBeTruthy();
    expect(otp?.code).toBeTruthy();
    expect(new Date(otp!.expiresAt) > new Date()).toBe(true);
  });

  test('should handle duplicate email for pending user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        ...userData,
        name: 'Updated Name',
      })
      .expect(200);

    expect(response.body.success).toBe(true);

    const user = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    expect(user?.name).toBe('Updated Name');
  });

  test('should reject invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'password123',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid email format');
  });

  test('should reject short password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: '123',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Password must be at least 6 characters');
  });

  test('should reject already active user', async () => {
    await prisma.user.create({
      data: {
        email: 'active@example.com',
        password: 'password123',
        status: 'ACTIVE',
      },
    });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'active@example.com',
        password: 'newpassword',
      })
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('User already exists and is active');
  });
});
