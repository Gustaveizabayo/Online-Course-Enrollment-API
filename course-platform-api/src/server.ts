import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { prisma } from './database/prisma';
import { hashPassword, comparePassword } from './utils/bcrypt';
import { generateToken } from './utils/jwt';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Course Platform API',
      version: '1.0.0',
      description: 'A complete REST API for online course platform',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/server.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes

/**
 * @swagger
 * /:
 *   get:
 *     summary: API status
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'Course Platform API',
    status: 'running',
    docs: `http://localhost:${PORT}/docs`,
    database: 'SQLite (Prisma)'
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 */
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (!['STUDENT', 'INSTRUCTOR'].includes(role)) {
      return res.status(400).json({ error: 'Role must be STUDENT or INSTRUCTOR' });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 */
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 */
app.get('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 */
app.post('/api/courses', async (req, res) => {
  try {
    const { title, description, price } = req.body;
    
    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }
    
    // In a real app, get user ID from JWT token
    const demoInstructorId = 'demo-instructor-id';
    
    const course = await prisma.course.create({
      data: {
        title,
        description: description || '',
        price: parseFloat(price),
        instructorId: demoInstructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll in a course
 */
app.post('/api/enrollments', async (req, res) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // In a real app, get user ID from JWT token
    const demoUserId = 'demo-user-id';
    
    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: demoUserId,
          courseId,
        },
      },
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }
    
    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: demoUserId,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });
    
    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment,
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/enrollments/my-courses:
 *   get:
 *     summary: Get user's enrolled courses
 */
app.get('/api/enrollments/my-courses', async (req, res) => {
  try {
    // In a real app, get user ID from JWT token
    const demoUserId = 'demo-user-id';
    
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: demoUserId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });
    
    res.json({ enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Create a payment for a course
 */
app.post('/api/payments/create', async (req, res) => {
  try {
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // In a real app, get user ID from JWT token
    const demoUserId = 'demo-user-id';
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: demoUserId,
        courseId,
        amount: course.price,
        provider: 'paypal',
        status: 'pending',
        transactionId: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });
    
    res.json({
      message: 'Payment created successfully',
      payment,
      paymentUrl: `${process.env.BASE_URL}/api/payments/success?token=${payment.transactionId}`,
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/payments/success:
 *   get:
 *     summary: Payment success callback
 */
app.get('/api/payments/success', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Payment token is required' });
    }
    
    // Update payment status
    const payment = await prisma.payment.update({
      where: { transactionId: token as string },
      data: { status: 'completed' },
      include: {
        course: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Create enrollment automatically
    await prisma.enrollment.create({
      data: {
        userId: payment.userId,
        courseId: payment.courseId,
      },
    });
    
    res.json({
      message: 'Payment successful! Enrollment completed.',
      payment,
    });
  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    requestedUrl: req.originalUrl,
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`
 Server running on port ${PORT}
 Base URL: http://localhost:${PORT}
 Swagger Docs: http://localhost:${PORT}/docs
 Health check: http://localhost:${PORT}/health
 Database: SQLite (Prisma)



 
  `);
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log(' Database connected successfully');
  } catch (error) {
    console.error(' Database connection failed:', error);
  }
});