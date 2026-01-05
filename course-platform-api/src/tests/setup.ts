import { prisma } from '../database/prisma';
import { hashPassword } from '../utils/bcrypt';
import { Role } from '@prisma/client';

// Jest setup file
beforeAll(async () => {
  // Clean database before tests
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.course.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  // Disconnect Prisma after tests
  await prisma.$disconnect();
});

// Test utilities
export const testUtils = {
  async createTestUser(role: Role = Role.STUDENT) {
    const email = `test.${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        name: `Test User ${Date.now()}`,
        email,
        password: await hashPassword('Test123!'),
        role,
      },
    });
    return user;
  },

  async createTestCourse(instructorId: string) {
    const course = await prisma.course.create({
      data: {
        title: `Test Course ${Date.now()}`,
        description: 'Test course description',
        price: 49.99,
        instructorId,
      },
    });
    return course;
  },

  async cleanup() {
    await prisma.$transaction([
      prisma.payment.deleteMany(),
      prisma.enrollment.deleteMany(),
      prisma.course.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  },
};