import request from 'supertest';
import { app } from '../app';
import prisma from '../database/prisma';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

describe('Dashboard API', () => {
    let studentToken: string;
    let instructorToken: string;
    let adminToken: string;

    beforeAll(async () => {
        // Create test users for each role
        const student = await prisma.user.create({
            data: {
                email: 'dash_student@test.com',
                password: 'pass',
                role: 'STUDENT',
                status: 'ACTIVE'
            }
        });

        const instructor = await prisma.user.create({
            data: {
                email: 'dash_inst@test.com',
                password: 'pass',
                role: 'INSTRUCTOR',
                status: 'ACTIVE'
            }
        });

        const admin = await prisma.user.create({
            data: {
                email: 'dash_admin@test.com',
                password: 'pass',
                role: 'ADMIN',
                status: 'ACTIVE'
            }
        });

        // Generate tokens
        studentToken = jwt.sign({ id: student.id, email: student.email, role: 'STUDENT' }, config.jwt.secret);
        instructorToken = jwt.sign({ id: instructor.id, email: instructor.email, role: 'INSTRUCTOR' }, config.jwt.secret);
        adminToken = jwt.sign({ id: admin.id, email: admin.email, role: 'ADMIN' }, config.jwt.secret);
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email: { in: ['dash_student@test.com', 'dash_inst@test.com', 'dash_admin@test.com'] }
            }
        });
        await prisma.$disconnect();
    });

    it('should return student dashboard for student', async () => {
        const res = await request(app)
            .get('/api/dashboard')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('totalEnrollments');
        expect(res.body.data).not.toHaveProperty('totalRevenue');
    });

    it('should return instructor dashboard for instructor', async () => {
        const res = await request(app)
            .get('/api/dashboard')
            .set('Authorization', `Bearer ${instructorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('totalStudents');
        expect(res.body.data).toHaveProperty('totalEarnings');
    });

    it('should return admin dashboard for admin', async () => {
        const res = await request(app)
            .get('/api/dashboard')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('totalRevenue');
        expect(res.body.data).toHaveProperty('systemHealth');
    });
});
