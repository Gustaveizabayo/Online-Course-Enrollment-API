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
import uploadRoutes from './routes/upload.routes';

// Import email service to initialize it
import './services/email.service';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Course Platform API',
      version: '2.1.0',
      description: 'A comprehensive real-world course platform API with email notifications',
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

// Routes
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
app.use('/api/upload', uploadRoutes);

// Email test endpoint
app.get('/test-email', async (req, res) => {
  try {
    const { EmailService } = require('./services/email.service');
    
    const result = await EmailService.sendEmail({
      to: 'gustavealain723@gmail.com',
      subject: 'Test Email from Course Platform',
      html: '<h1>Test Email</h1><p>This is a test email from the course platform API.</p>'
    });

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test email sent successfully',
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send email',
        details: result.error 
      });
    }
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: 'Email test failed',
      message: error.message 
    });
  }
});

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
      prisma.lesson.count().catch(() => 0)
    ]);

    await prisma.$disconnect();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Course Platform API',
      version: '2.1.0',
      database: 'connected',
      email: 'configured',
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
        'File Upload (Videos/Resources)',
        'Course Enrollment',
        'Progress Tracking',
        'Payment Processing',
        'Reviews & Ratings',
        'Complete Activity Logging',
        'Email Notifications',
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
    message: 'Welcome to Course Platform API v2.1',
    version: '2.1.0',
    documentation: '/api-docs',
    health: '/health',
    testEmail: '/test-email',
    features: [
      'User Registration & Authentication',
      'Instructor Application System',
      'Course Creation & Management',
      'Lesson/Module Management',
      'File Upload (Videos/Resources)',
      'Course Enrollment',
      'Progress Tracking',
      'Payment Processing',
      'Reviews & Ratings',
      'Complete Activity Logging',
      'Email Notifications',
      'Admin/Instructor/Student Dashboards'
    ],
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      courses: '/api/courses',
      lessons: '/api/lessons',
      upload: '/api/upload',
      enrollments: '/api/enrollments',
      payments: '/api/payments',
      reviews: '/api/reviews',
      dashboard: '/api/dashboard',
      activities: '/api/activities'
    }
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
      '/test-email - Test Email',
      '/api/auth - Authentication',
      '/api/courses - Course Management',
      '/api/lessons - Lesson Management',
      '/api/upload - File Upload',
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
  íº€ Server running on port ${PORT}
  
  í³š API Documentation: http://localhost:${PORT}/api-docs
  í´— Health check: http://localhost:${PORT}/health
  í³§ Test email: http://localhost:${PORT}/test-email
  í¿  Home: http://localhost:${PORT}/
  
  í³Š Features:
  â€¢ User Registration & Authentication
  â€¢ Instructor Application System
  â€¢ Course Creation & Management
  â€¢ í¶• Lesson/Module Management
  â€¢ í¶• File Upload (Videos/Resources)
  â€¢ Course Enrollment
  â€¢ Progress Tracking
  â€¢ Payment Processing
  â€¢ Reviews & Ratings
  â€¢ Complete Activity Logging
  â€¢ í¶• Email Notifications
  â€¢ Admin/Instructor/Student Dashboards
  
  í±¤ First user to register becomes ADMIN!
  
  í³§ Email Features:
  â€¢ Welcome emails on registration
  â€¢ Instructor application notifications
  â€¢ Course approval/publishing emails
  â€¢ Enrollment confirmations
  â€¢ Payment receipts
  â€¢ Password reset
  `);
});

export default app;
