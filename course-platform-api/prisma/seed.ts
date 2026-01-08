import { PrismaClient, Role, CourseStatus, PaymentStatus, ContentType, ContentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('í¼± Starting seed...');

  // Clear existing data (in correct order to avoid foreign key constraints)
  await prisma.lessonProgress.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.platformStats.deleteMany();

  console.log('âœ… Cleared existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.ADMIN,
      bio: 'Platform Administrator',
      profileImage: 'https://i.pravatar.cc/300?img=1'
    }
  });
  console.log(`âœ… Created admin user: ${admin.email}`);

  // Create instructors
  const instructorPassword = await bcrypt.hash('instructor123', 10);
  
  const instructor1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: instructorPassword,
      role: Role.INSTRUCTOR,
      bio: 'Senior Web Developer with 10+ years of experience',
      profileImage: 'https://i.pravatar.cc/300?img=5',
      qualifications: 'MSc Computer Science, AWS Certified',
      experience: '10 years'
    }
  });

  const instructor2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: instructorPassword,
      role: Role.INSTRUCTOR,
      bio: 'Data Scientist and ML Engineer',
      profileImage: 'https://i.pravatar.cc/300?img=6',
      qualifications: 'PhD in Machine Learning',
      experience: '8 years'
    }
  });
  console.log(`âœ… Created instructors: ${instructor1.name}, ${instructor2.name}`);

  // Create students
  const studentPassword = await bcrypt.hash('student123', 10);
  
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.create({
      data: {
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        password: studentPassword,
        role: Role.STUDENT,
        profileImage: `https://i.pravatar.cc/300?img=${10 + i}`
      }
    });
    students.push(student);
  }
  console.log(`âœ… Created ${students.length} students`);

  // Create courses
  const coursesData = [
    {
      title: 'Complete Web Development Bootcamp',
      description: 'Learn web development from scratch. HTML, CSS, JavaScript, React, Node.js, and more!',
      shortDescription: 'Become a full-stack web developer',
      price: 89.99,
      category: 'Web Development',
      level: 'BEGINNER',
      duration: 60,
      thumbnail: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800',
      instructorId: instructor1.id,
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date()
    },
    {
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns and best practices for building scalable applications',
      shortDescription: 'Take your React skills to the next level',
      price: 69.99,
      category: 'Web Development',
      level: 'ADVANCED',
      duration: 20,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      instructorId: instructor1.id,
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 86400000)
    },
    {
      title: 'Machine Learning Fundamentals',
      description: 'Learn the fundamentals of machine learning with Python and scikit-learn',
      shortDescription: 'Start your ML journey',
      price: 79.99,
      category: 'Data Science',
      level: 'INTERMEDIATE',
      duration: 40,
      thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
      instructorId: instructor2.id,
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 172800000)
    },
    {
      title: 'Mobile App Development with React Native',
      description: 'Build cross-platform mobile apps using React Native',
      shortDescription: 'Create iOS and Android apps',
      price: 74.99,
      category: 'Mobile Development',
      level: 'INTERMEDIATE',
      duration: 35,
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
      instructorId: instructor2.id,
      status: CourseStatus.PUBLISHED,
      publishedAt: new Date(Date.now() - 259200000)
    }
  ];

  const courses = [];
  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: courseData
    });
    courses.push(course);
  }
  console.log(`âœ… Created ${courses.length} courses`);

  // Create modules and lessons for first course
  console.log('í³š Creating modules and lessons...');
  
  const webDevCourse = courses[0];
  
  // Module 1: HTML & CSS
  const module1 = await prisma.module.create({
    data: {
      courseId: webDevCourse.id,
      title: 'HTML & CSS Fundamentals',
      description: 'Learn the building blocks of web development',
      order: 0
    }
  });

  // Lessons for Module 1
  const module1Lessons = [
    {
      moduleId: module1.id,
      title: 'Introduction to HTML',
      description: 'Learn HTML tags and structure',
      contentType: ContentType.ARTICLE,
      content: '# HTML Basics\n\nHTML is the standard markup language for creating web pages.',
      duration: 30,
      order: 0,
      status: ContentStatus.PUBLISHED,
      isFree: true
    },
    {
      moduleId: module1.id,
      title: 'CSS Styling',
      description: 'Learn how to style web pages with CSS',
      contentType: ContentType.VIDEO,
      videoUrl: 'https://example.com/videos/css-basics.mp4',
      duration: 45,
      order: 1,
      status: ContentStatus.PUBLISHED,
      isFree: true
    },
    {
      moduleId: module1.id,
      title: 'HTML & CSS Quiz',
      description: 'Test your knowledge',
      contentType: ContentType.QUIZ,
      content: JSON.stringify({
        questions: [
          {
            question: 'What does HTML stand for?',
            options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language'],
            correctAnswer: 0
          }
        ]
      }),
      duration: 15,
      order: 2,
      status: ContentStatus.PUBLISHED,
      isFree: false
    }
  ];

  for (const lessonData of module1Lessons) {
    await prisma.lesson.create({
      data: lessonData
    });
  }

  // Module 2: JavaScript
  const module2 = await prisma.module.create({
    data: {
      courseId: webDevCourse.id,
      title: 'JavaScript Programming',
      description: 'Learn JavaScript from basics to advanced concepts',
      order: 1
    }
  });

  // Lessons for Module 2
  const module2Lessons = [
    {
      moduleId: module2.id,
      title: 'JavaScript Basics',
      description: 'Variables, functions, and control flow',
      contentType: ContentType.VIDEO,
      videoUrl: 'https://example.com/videos/js-basics.mp4',
      duration: 60,
      order: 0,
      status: ContentStatus.PUBLISHED,
      isFree: false
    },
    {
      moduleId: module2.id,
      title: 'DOM Manipulation',
      description: 'Working with the Document Object Model',
      contentType: ContentType.ARTICLE,
      content: '# DOM Manipulation\n\nLearn how to interact with web page elements using JavaScript.',
      duration: 50,
      order: 1,
      status: ContentStatus.PUBLISHED,
      isFree: false
    }
  ];

  for (const lessonData of module2Lessons) {
    await prisma.lesson.create({
      data: lessonData
    });
  }

  console.log(`âœ… Created modules and lessons for "${webDevCourse.title}"`);

  // Create enrollments
  const enrollments = [];
  for (const student of students) {
    for (const course of courses.slice(0, 2)) {
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id
        }
      });
      enrollments.push(enrollment);
    }
  }
  console.log(`âœ… Created ${enrollments.length} enrollments`);

  // Create reviews
  const reviews = [];
  for (const enrollment of enrollments) {
    if (Math.random() > 0.5) {
      const course = courses.find(c => c.id === enrollment.courseId);
      const review = await prisma.review.create({
        data: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          rating: Math.floor(Math.random() * 5) + 1,
          comment: `Great course! Learned a lot about ${course?.category || 'programming'}`
        }
      });
      reviews.push(review);
    }
  }
  console.log(`âœ… Created ${reviews.length} reviews`);

  // Create payments
  const payments = [];
  for (const enrollment of enrollments.slice(0, 8)) {
    const course = courses.find(c => c.id === enrollment.courseId);
    if (course && course.price > 0) {
      const payment = await prisma.payment.create({
        data: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          amount: course.price,
          status: PaymentStatus.COMPLETED,
          transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });
      payments.push(payment);
    }
  }
  console.log(`âœ… Created ${payments.length} payments`);

  // Create lesson progress for some students
  const lessonProgress = [];
  const allLessons = await prisma.lesson.findMany();
  
  for (const enrollment of enrollments.slice(0, 3)) {
    const lessons = allLessons.filter(l => 
      l.moduleId === module1.id || l.moduleId === module2.id
    ).slice(0, 2);
    
    for (const lesson of lessons) {
      const progress = await prisma.lessonProgress.create({
        data: {
          userId: enrollment.userId,
          lessonId: lesson.id,
          enrollmentId: enrollment.id,
          completed: Math.random() > 0.5,
          watchedDuration: Math.random() > 0.5 ? Math.floor(Math.random() * lesson.duration!) : 0
        }
      });
      lessonProgress.push(progress);
    }
  }
  console.log(`âœ… Created ${lessonProgress.length} lesson progress records`);

  // Update enrollment progress based on completed lessons
  for (const enrollment of enrollments) {
    const completedLessons = lessonProgress.filter(
      p => p.enrollmentId === enrollment.id && p.completed
    ).length;
    
    const totalLessons = allLessons.filter(l => 
      l.module?.courseId === enrollment.courseId
    ).length;
    
    if (totalLessons > 0) {
      const progressPercentage = (completedLessons / totalLessons) * 100;
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progress: progressPercentage,
          completed: progressPercentage >= 100
        }
      });
    }
  }

  // Create platform stats
  const platformStats = await prisma.platformStats.create({
    data: {
      date: new Date(),
      totalUsers: 1 + 2 + students.length,
      totalInstructors: 2,
      totalCourses: courses.length,
      totalEnrollments: enrollments.length,
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0)
    }
  });
  console.log('âœ… Created platform statistics');

  console.log('\ní¾‰ Seed completed successfully!');
  console.log('\ní³Š Seed Data Summary:');
  console.log(`   Users: ${1 + 2 + students.length} (1 Admin, 2 Instructors, ${students.length} Students)`);
  console.log(`   Courses: ${courses.length}`);
  console.log(`   Modules: 2`);
  console.log(`   Lessons: ${allLessons.length}`);
  console.log(`   Enrollments: ${enrollments.length}`);
  console.log(`   Reviews: ${reviews.length}`);
  console.log(`   Payments: ${payments.length}`);
  console.log(`   Lesson Progress: ${lessonProgress.length}`);
  console.log(`\ní´‘ Test Credentials:`);
  console.log(`   Admin: admin@example.com / admin123`);
  console.log(`   Instructor: john@example.com / instructor123`);
  console.log(`   Student: student1@example.com / student123`);
  console.log(`\níº€ Start the server: npm run dev`);
  console.log(`í³š API Docs: http://localhost:3002/api-docs`);
}

main()
  .catch((e) => {
    console.error('âŒ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
