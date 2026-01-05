import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import logger from '../config/logger';

async function seed() {
    try {
        logger.info('Starting database seed...');

        // Clear existing data
        await prisma.payment.deleteMany();
        await prisma.enrollment.deleteMany();
        await prisma.course.deleteMany();
        await prisma.user.deleteMany();

        // Create users
        const hashedPassword = await bcrypt.hash('password123', 10);

        const admin = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                password: hashedPassword,
                name: 'Admin User',
                role: 'ADMIN',
            },
        });

        const instructor1 = await prisma.user.create({
            data: {
                email: 'instructor1@example.com',
                password: hashedPassword,
                name: 'John Instructor',
                role: 'INSTRUCTOR',
            },
        });

        const instructor2 = await prisma.user.create({
            data: {
                email: 'instructor2@example.com',
                password: hashedPassword,
                name: 'Jane Instructor',
                role: 'INSTRUCTOR',
            },
        });

        const student1 = await prisma.user.create({
            data: {
                email: 'student1@example.com',
                password: hashedPassword,
                name: 'Alice Student',
                role: 'STUDENT',
            },
        });

        const student2 = await prisma.user.create({
            data: {
                email: 'student2@example.com',
                password: hashedPassword,
                name: 'Bob Student',
                role: 'STUDENT',
            },
        });

        logger.info('Users created');

        // Create courses
        const course1 = await prisma.course.create({
            data: {
                title: 'Introduction to Web Development',
                description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.',
                instructorId: instructor1.id,
                price: 99.99,
                capacity: 30,
                status: 'PUBLISHED',
            },
        });

        const course2 = await prisma.course.create({
            data: {
                title: 'Advanced React and TypeScript',
                description: 'Master React with TypeScript for building scalable applications.',
                instructorId: instructor1.id,
                price: 149.99,
                capacity: 25,
                status: 'PUBLISHED',
            },
        });

        const _course3 = await prisma.course.create({
            data: {
                title: 'Node.js Backend Development',
                description: 'Build RESTful APIs and backend services with Node.js and Express.',
                instructorId: instructor2.id,
                price: 129.99,
                capacity: 20,
                status: 'PUBLISHED',
            },
        });

        const _course4 = await prisma.course.create({
            data: {
                title: 'Database Design and SQL',
                description: 'Learn database design principles and master SQL queries.',
                instructorId: instructor2.id,
                price: 89.99,
                capacity: 40,
                status: 'DRAFT',
            },
        });

        logger.info('Courses created');

        // Create enrollments
        const enrollment1 = await prisma.enrollment.create({
            data: {
                userId: student1.id,
                courseId: course1.id,
                status: 'ACTIVE',
            },
        });

        const enrollment2 = await prisma.enrollment.create({
            data: {
                userId: student1.id,
                courseId: course2.id,
                status: 'ACTIVE',
            },
        });

        const enrollment3 = await prisma.enrollment.create({
            data: {
                userId: student2.id,
                courseId: course1.id,
                status: 'ACTIVE',
            },
        });

        // Update enrollment counts
        await prisma.course.update({
            where: { id: course1.id },
            data: { enrollmentCount: 2 },
        });

        await prisma.course.update({
            where: { id: course2.id },
            data: { enrollmentCount: 1 },
        });

        logger.info('Enrollments created');

        // Create payments
        await prisma.payment.create({
            data: {
                enrollmentId: enrollment1.id,
                userId: student1.id,
                amount: course1.price,
                paymentMethod: 'Credit Card',
                transactionId: 'TXN-SEED-001',
                status: 'COMPLETED',
            },
        });

        await prisma.payment.create({
            data: {
                enrollmentId: enrollment2.id,
                userId: student1.id,
                amount: course2.price,
                paymentMethod: 'PayPal',
                transactionId: 'TXN-SEED-002',
                status: 'COMPLETED',
            },
        });

        await prisma.payment.create({
            data: {
                enrollmentId: enrollment3.id,
                userId: student2.id,
                amount: course1.price,
                paymentMethod: 'Credit Card',
                transactionId: 'TXN-SEED-003',
                status: 'PENDING',
            },
        });

        logger.info('Payments created');

        logger.info('Database seeded successfully!');
        logger.info('\nTest Accounts:');
        logger.info('Admin: admin@example.com / password123');
        logger.info('Instructor 1: instructor1@example.com / password123');
        logger.info('Instructor 2: instructor2@example.com / password123');
        logger.info('Student 1: student1@example.com / password123');
        logger.info('Student 2: student2@example.com / password123');
    } catch (error) {
        logger.error('Error seeding database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seed();
