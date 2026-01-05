import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../utils/bcrypt';

const prisma = new PrismaClient();

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
        password: await hashPassword('Admin123!'),
        role: Role.ADMIN,
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
        password: await hashPassword('Instructor123!'),
        role: Role.INSTRUCTOR,
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
        password: await hashPassword('Student123!'),
        role: Role.STUDENT,
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