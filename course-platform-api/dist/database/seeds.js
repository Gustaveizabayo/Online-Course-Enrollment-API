"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = require("../utils/bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    // Create admin user
    const adminEmail = 'admin@example.com';
    let admin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!admin) {
        admin = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: adminEmail,
                password: await (0, bcrypt_1.hashPassword)('Admin123!'),
                role: client_1.Role.ADMIN,
            },
        });
        console.log('✅ Admin user created');
    }
    // Create instructor user
    const instructorEmail = 'instructor@example.com';
    let instructor = await prisma.user.findUnique({
        where: { email: instructorEmail },
    });
    if (!instructor) {
        instructor = await prisma.user.create({
            data: {
                name: 'Test Instructor',
                email: instructorEmail,
                password: await (0, bcrypt_1.hashPassword)('Instructor123!'),
                role: client_1.Role.INSTRUCTOR,
            },
        });
        console.log('✅ Instructor user created');
        // Create sample courses for instructor
        const courses = [
            {
                title: 'Introduction to Web Development',
                description: 'Learn the basics of HTML, CSS, and JavaScript',
                price: 49.99,
            },
            {
                title: 'Advanced React Patterns',
                description: 'Master advanced React concepts and patterns',
                price: 79.99,
            },
            {
                title: 'Node.js Backend Development',
                description: 'Build scalable backend APIs with Node.js',
                price: 69.99,
            },
        ];
        for (const courseData of courses) {
            await prisma.course.create({
                data: {
                    ...courseData,
                    instructorId: instructor.id,
                },
            });
        }
        console.log('✅ Sample courses created');
    }
    // Create student user
    const studentEmail = 'student@example.com';
    let student = await prisma.user.findUnique({
        where: { email: studentEmail },
    });
    if (!student) {
        student = await prisma.user.create({
            data: {
                name: 'Test Student',
                email: studentEmail,
                password: await (0, bcrypt_1.hashPassword)('Student123!'),
                role: client_1.Role.STUDENT,
            },
        });
        console.log('✅ Student user created');
    }
    console.log('🎉 Database seeding completed!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin:', adminEmail, '| Password: Admin123!');
    console.log('Instructor:', instructorEmail, '| Password: Instructor123!');
    console.log('Student:', studentEmail, '| Password: Student123!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
