import request from 'supertest';
import app from '../index';
import prisma from '../config/database';

describe('Course Endpoints', () => {
    let instructorToken: string;
    let studentToken: string;
    let adminToken: string;
    let courseId: string;

    beforeAll(async () => {
        // Create test users
        const instructor = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'instructor-test@example.com',
                password: 'password123',
                name: 'Test Instructor',
                role: 'INSTRUCTOR',
            });
        instructorToken = instructor.body.token;

        const student = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'student-test@example.com',
                password: 'password123',
                name: 'Test Student',
                role: 'STUDENT',
            });
        studentToken = student.body.token;

        const admin = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'admin-test@example.com',
                password: 'password123',
                name: 'Test Admin',
                role: 'ADMIN',
            });
        adminToken = admin.body.token;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/courses', () => {
        it('should create a course as instructor', async () => {
            const response = await request(app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${instructorToken}`)
                .send({
                    title: 'Test Course',
                    description: 'This is a test course',
                    price: 99.99,
                    capacity: 30,
                    status: 'PUBLISHED',
                });

            expect(response.status).toBe(201);
            expect(response.body.title).toBe('Test Course');
            expect(response.body.price).toBe(99.99);
            courseId = response.body.id;
        });

        it('should fail to create course as student', async () => {
            const response = await request(app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    title: 'Test Course 2',
                    description: 'This is another test course',
                    price: 149.99,
                    capacity: 20,
                });

            expect(response.status).toBe(403);
        });

        it('should fail with invalid data', async () => {
            const response = await request(app)
                .post('/api/courses')
                .set('Authorization', `Bearer ${instructorToken}`)
                .send({
                    title: '',
                    description: 'Test',
                    price: -10,
                    capacity: 0,
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/courses', () => {
        it('should get all published courses', async () => {
            const response = await request(app).get('/api/courses');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('courses');
            expect(response.body).toHaveProperty('pagination');
            expect(Array.isArray(response.body.courses)).toBe(true);
        });

        it('should filter courses by status', async () => {
            const response = await request(app)
                .get('/api/courses')
                .query({ status: 'PUBLISHED' });

            expect(response.status).toBe(200);
            expect(response.body.courses.every((c: any) => c.status === 'PUBLISHED')).toBe(true);
        });

        it('should paginate results', async () => {
            const response = await request(app)
                .get('/api/courses')
                .query({ page: 1, limit: 5 });

            expect(response.status).toBe(200);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(5);
        });
    });

    describe('GET /api/courses/:id', () => {
        it('should get course by ID', async () => {
            const response = await request(app).get(`/api/courses/${courseId}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(courseId);
            expect(response.body.title).toBe('Test Course');
        });

        it('should return 404 for non-existent course', async () => {
            const response = await request(app).get('/api/courses/non-existent-id');

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/courses/:id', () => {
        it('should update own course as instructor', async () => {
            const response = await request(app)
                .put(`/api/courses/${courseId}`)
                .set('Authorization', `Bearer ${instructorToken}`)
                .send({
                    title: 'Updated Test Course',
                    price: 129.99,
                });

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('Updated Test Course');
            expect(response.body.price).toBe(129.99);
        });

        it('should fail to update as student', async () => {
            const response = await request(app)
                .put(`/api/courses/${courseId}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                    title: 'Hacked Course',
                });

            expect(response.status).toBe(403);
        });
    });

    describe('DELETE /api/courses/:id', () => {
        it('should fail to delete as instructor', async () => {
            const response = await request(app)
                .delete(`/api/courses/${courseId}`)
                .set('Authorization', `Bearer ${instructorToken}`);

            expect(response.status).toBe(403);
        });

        it('should delete course as admin', async () => {
            const response = await request(app)
                .delete(`/api/courses/${courseId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(204);
        });
    });
});
