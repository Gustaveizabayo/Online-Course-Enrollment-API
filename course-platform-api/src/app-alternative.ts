import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import enrollmentRoutes from './routes/enrollment.routes';
import paymentRoutes from './routes/payment.routes';
import reviewRoutes from './routes/review.routes';
import dashboardRoutes from './routes/dashboard.routes';
import activityRoutes from './routes/activity.routes';
import lessonRoutes from './routes/lesson.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Course Platform API',
      version: '1.5.0',
      description: 'A comprehensive real-world course platform API with lesson management',
    },
    servers: [
      {
        url: 'http://localhost:3002',
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
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes (without upload routes for now)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/lessons', lessonRoutes);

// Health check with database connection
app.get('/health', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    // Get basic stats
    const [userCount, courseCount, lessonCount] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.lesson.count().catch(() => 0) // In case lesson table doesn't exist yet
    ]);

    await prisma.$disconnect();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Course Platform API',
      version: '1.5.0',
      database: 'connected',
      stats: {
        users: userCount,
        courses: courseCount,
        lessons: lessonCount
      },
      features: [
        'User Registration & Authentication',
        'Instructor Application System',
        'Course Creation & Management',
        'Lesson/Module Management',
        'Course Enrollment',
        'Progress Tracking',
        'Payment Processing',
        'Reviews & Ratings',
        'Complete Activity Logging',
        'Admin/Instructor/Student Dashboards'
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    });
  }
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Course Platform API v1.5',
    version: '1.5.0',
    documentation: '/api-docs',
    health: '/health',
    features: [
      'User Registration & Authentication',
      'Instructor Application System',
      'Course Creation & Management',
      'Lesson/Module Management',
      'Course Enrollment',
      'Progress Tracking',
      'Payment Processing',
      'Reviews & Ratings',
      'Complete Activity Logging',
      'Admin/Instructor/Student Dashboards'
    ],
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      lessons: '/api/lessons',
      enrollments: '/api/enrollments',
      payments: '/api/payments',
      reviews: '/api/reviews',
      dashboard: '/api/dashboard',
      activities: '/api/activities'
    },
    note: 'File upload via URL endpoints available at /api/upload (see docs)'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: [
      '/api-docs - API Documentation',
      '/health - Health Check',
      '/api/auth - Authentication',
      '/api/courses - Course Management',
      '/api/lessons - Lesson Management',
      '/api/enrollments - Enrollment Management',
      '/api/payments - Payment Processing',
      '/api/reviews - Reviews & Ratings',
      '/api/dashboard - Dashboards',
      '/api/activities - Activity Logs'
    ]
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`
  Ì∫Ä Server running on port ${PORT}
  
  Ì≥ö API Documentation: http://localhost:${PORT}/api-docs
  Ì¥ó Health check: http://localhost:${PORT}/health
  Ìø† Home: http://localhost:${PORT}/
  
  Ì≥ä Features:
  ‚Ä¢ User Registration & Authentication
  ‚Ä¢ Instructor Application System
  ‚Ä¢ Course Creation & Management
  ‚Ä¢ Ì∂ï Lesson/Module Management
  ‚Ä¢ Course Enrollment
  ‚Ä¢ Progress Tracking
  ‚Ä¢ Payment Processing
  ‚Ä¢ Reviews & Ratings
  ‚Ä¢ Complete Activity Logging
  ‚Ä¢ Admin/Instructor/Student Dashboards
  
  Ì±§ First user to register becomes ADMIN!
  
  Ì≥ù File Upload Note:
  ‚Ä¢ For now, use URL-based uploads for videos/resources
  ‚Ä¢ See /api/upload endpoints in documentation
  ‚Ä¢ Actual file upload will be added in next version
  `);
});

export default app;
