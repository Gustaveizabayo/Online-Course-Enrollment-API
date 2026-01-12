import request from 'supertest';
import { app } from '../app';
import prisma from '../database/prisma';

describe('Auth Registration with Role', () => {
    beforeAll(async () => {
        await prisma.user.deleteMany();
        await prisma.oTP.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should register a user as INSTRUCTOR', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'instructor.test@example.com',
                password: 'Password123!',
                name: 'Test Instructor',
                role: 'INSTRUCTOR'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const user = await prisma.user.findUnique({
            where: { email: 'instructor.test@example.com' }
        });

        expect(user).toBeDefined();
        expect(user?.role).toBe('INSTRUCTOR');
    });

    it('should register a user as STUDENT by default', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'student.test@example.com',
                password: 'Password123!',
                name: 'Test Student'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        const user = await prisma.user.findUnique({
            where: { email: 'student.test@example.com' }
        });

        expect(user).toBeDefined();
        expect(user?.role).toBe('STUDENT');
    });
});
