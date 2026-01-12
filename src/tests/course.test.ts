import request from 'supertest';
import { app } from '../app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const prisma = new PrismaClient();

test('Course API', () => {
  let authToken: string;
  let testUser: any;
  let testCourse: any;

  beforeAll(async () => {
    await prisma.$connect();
    
    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'instructor@example.com',
        password: 'password123',
        name: 'Test Instructor',
        status: 'ACTIVE',
      },
    });

    // Generate auth token
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email, status: 'ACTIVE' },
      config.jwt.secret,
      { expiresIn: '7d' }
    );
  });

  beforeEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.course.deleteMany();
    
    testCourse = await prisma.course.create({
      data: {
        title: 'Test Course',
        description: 'Test Description',
        price: 99.99,
        duration: 30,
        category: 'Programming',
        instructorId: testUser.id,
        isPublished: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  test('POST /api/courses', () => {
    test('should create a new course', async () => {
      const courseData = {
        title: 'New Course',
        description: 'New Description',
        price: 49.99,
        duration: 20,
        category: 'Business',
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(courseData.title);
      expect(response.body.data.instructorId).toBe(testUser.id);
    });

    test('should reject unauthorized requests', async () => {
      const response = await request(app)
        .post('/api/courses')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  test('GET /api/courses', () => {
    test('should get all published courses', async () => {
      // Publish the test course
      await prisma.course.update({
        where: { id: testCourse.id },
        data: { isPublished: true },
      });

      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses).toHaveLength(1);
    });

    test('should filter by category', async () => {
      await prisma.course.update({
        where: { id: testCourse.id },
        data: { isPublished: true },
      });

      const response = await request(app)
        .get('/api/courses?category=Programming')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses[0].category).toBe('Programming');
    });
  });

  test('GET /api/courses/:id', () => {
    test('should get course by ID', async () => {
      const response = await request(app)
        .get(`/api/courses/${testCourse.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testCourse.id);
    });

    test('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/courses/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
