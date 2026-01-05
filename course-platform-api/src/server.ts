import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

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
      description: 'A complete REST API for online course platform with user management, courses, enrollments, and payments.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] },
          },
        },
        Course: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            instructorId: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Courses', description: 'Course management' },
      { name: 'Enrollments', description: 'Student enrollments' },
      { name: 'Payments', description: 'Payment processing' },
    ],
  },
  apis: ['./src/server.ts'], // We'll add JSDoc comments directly in server.ts
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes with Swagger documentation

/**
 * @swagger
 * /:
 *   get:
 *     summary: API status
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API is running
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'Course Platform API',
    status: 'running',
    documentation: `http://localhost:${PORT}/docs`,
    endpoints: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/courses',
      '/api/enrollments',
      '/api/payments/create'
    ]
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Service health status
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Auth Routes with Swagger documentation

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [STUDENT, INSTRUCTOR]
 *                 example: STUDENT
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad request
 */
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  res.status(201).json({
    message: 'User registered successfully',
    user: { id: '123', name, email, role },
    token: 'dummy-jwt-token'
  });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: student@example.com
 *               password:
 *                 type: string
 *                 example: Student123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Demo credentials check
  const demoUsers = {
    'admin@example.com': { password: 'Admin123!', role: 'ADMIN', name: 'Admin User' },
    'student@example.com': { password: 'Student123!', role: 'STUDENT', name: 'Test Student' },
    'instructor@example.com': { password: 'Instructor123!', role: 'INSTRUCTOR', name: 'Test Instructor' }
  };
  
  const user = demoUsers[email];
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({
    message: 'Login successful',
    user: { 
      id: '123', 
      name: user.name, 
      email, 
      role: user.role 
    },
    token: 'dummy-jwt-token'
  });
});

// Course Routes with Swagger documentation

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 */
app.get('/api/courses', (req, res) => {
  const courses = [
    {
      id: '1',
      title: 'Introduction to Web Development',
      description: 'Learn HTML, CSS, and JavaScript',
      price: 49.99,
      instructorId: 'instructor-123'
    },
    {
      id: '2',
      title: 'Advanced React Patterns',
      description: 'Master React concepts and best practices',
      price: 79.99,
      instructorId: 'instructor-456'
    },
    {
      id: '3',
      title: 'Node.js Backend Development',
      description: 'Build scalable backend APIs with Node.js',
      price: 69.99,
      instructorId: 'instructor-789'
    }
  ];
  res.json({ courses });
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Course Title
 *               description:
 *                 type: string
 *                 example: Course description here
 *               price:
 *                 type: number
 *                 example: 99.99
 *     responses:
 *       201:
 *         description: Course created successfully
 *       401:
 *         description: Unauthorized
 */
app.post('/api/courses', (req, res) => {
  const { title, description, price } = req.body;
  res.status(201).json({
    message: 'Course created successfully',
    course: { 
      id: 'new-id', 
      title, 
      description: description || '', 
      price,
      instructorId: 'current-user-id'
    }
  });
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         description: Course not found
 */
app.get('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    course: {
      id,
      title: 'Sample Course',
      description: 'This is a sample course description',
      price: 49.99,
      instructorId: 'instructor-123',
      createdAt: new Date().toISOString()
    }
  });
});

// Enrollment Routes with Swagger documentation

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: course-123
 *     responses:
 *       201:
 *         description: Successfully enrolled
 *       400:
 *         description: Bad request
 */
app.post('/api/enrollments', (req, res) => {
  const { courseId } = req.body;
  res.status(201).json({
    message: 'Successfully enrolled in course',
    enrollment: { 
      id: 'enrollment-id', 
      courseId,
      userId: 'user-id',
      enrolledAt: new Date().toISOString()
    }
  });
});

/**
 * @swagger
 * /api/enrollments/my-courses:
 *   get:
 *     summary: Get user's enrolled courses
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses
 */
app.get('/api/enrollments/my-courses', (req, res) => {
  res.json({
    enrollments: [
      {
        id: 'enroll-1',
        courseId: '1',
        courseTitle: 'Introduction to Web Development',
        enrolledAt: '2024-01-15T10:30:00Z',
        progress: 75
      }
    ]
  });
});

// Payment Routes with Swagger documentation

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Create a payment for a course
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 example: course-123
 *     responses:
 *       200:
 *         description: Payment created
 */
app.post('/api/payments/create', (req, res) => {
  const { courseId } = req.body;
  res.json({
    message: 'Payment created successfully',
    payment: {
      id: 'payment-id',
      courseId,
      amount: 49.99,
      status: 'pending',
      paymentUrl: 'https://sandbox.paypal.com/checkout?token=PAYMENT_TOKEN'
    }
  });
});

/**
 * @swagger
 * /api/payments/success:
 *   get:
 *     summary: Payment success callback
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment successful
 */
app.get('/api/payments/success', (req, res) => {
  const { token } = req.query;
  res.json({
    message: 'Payment successful!',
    paymentId: token,
    status: 'completed'
  });
});

/**
 * @swagger
 * /api/payments/cancel:
 *   get:
 *     summary: Payment cancel callback
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Payment cancelled
 */
app.get('/api/payments/cancel', (req, res) => {
  res.json({
    message: 'Payment cancelled',
    status: 'cancelled'
  });
});

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Course Platform API Docs',
}));

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    requestedUrl: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /docs',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/courses',
      'POST /api/courses',
      'GET /api/courses/:id',
      'POST /api/enrollments',
      'GET /api/enrollments/my-courses',
      'POST /api/payments/create',
      'GET /api/payments/success',
      'GET /api/payments/cancel'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📡 Base URL: http://localhost:${PORT}
📚 Swagger Docs: http://localhost:${PORT}/docs
🏥 Health check: http://localhost:${PORT}/health

👤 Test Credentials:
   Admin:      admin@example.com / Admin123!
   Student:    student@example.com / Student123!
   Instructor: instructor@example.com / Instructor123!

📋 Quick Test:
   curl http://localhost:${PORT}/health
   curl -X POST http://localhost:${PORT}/api/auth/login \\
     -H "Content-Type: application/json" \\
     -d '{"email":"student@example.com","password":"Student123!"}'
   curl http://localhost:${PORT}/api/courses
  `);
});