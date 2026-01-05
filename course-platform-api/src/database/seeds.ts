import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // Clean up existing data
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  
  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: await hashPassword('Admin123!'),
      role: 'ADMIN',
    },
  });
  
  // Create instructor
  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@example.com',
      name: 'Test Instructor',
      password: await hashPassword('Instructor123!'),
      role: 'INSTRUCTOR',
    },
  });
  
  // Create courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript',
      price: 49.99,
      instructorId: instructor.id,
    },
  });
  
  const course2 = await prisma.course.create({
    data: {
      title: 'Advanced React Patterns',
      description: 'Master advanced React concepts and patterns',
      price: 79.99,
      instructorId: instructor.id,
    },
  });
  
  // Create student
  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      name: 'Test Student',
      password: await hashPassword('Student123!'),
      role: 'STUDENT',
    },
  });
  
  console.log('✅ Database seeded!');
  console.log('\n📋 Test Credentials:');
  console.log('Admin: admin@example.com / Admin123!');
  console.log('Instructor: instructor@example.com / Instructor123!');
  console.log('Student: student@example.com / Student123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });