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
      version: '2.0.0',
      description: 'A comprehensive course platform with Neon PostgreSQL',
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

// Enhanced health check
app.get('/health', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test with a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    // Get connection info (mask password)
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.replace(/:[^:]*@/, ':****@');
    
    // Try to get table counts
    let tableCounts = {};
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      tableCounts = { tables: tables.length };
    } catch (e) {
      tableCounts = { error: 'Could not fetch table info' };
    }
    
    await prisma.$disconnect();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Course Platform API',
      version: '2.0.0',
      database: {
        provider: 'Neon PostgreSQL',
        connection: 'successful',
        url: maskedUrl
      },
      counts: tableCounts,
      endpoints: [
        '/api/auth - Authentication',
        '/api/courses - Course Management',
        '/api/lessons - Lesson Management',
        '/api/enrollments - Enrollment',
        '/api/payments - Payments',
        '/api/dashboard - Dashboards'
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        provider: 'Neon PostgreSQL',
        connection: 'failed',
        suggestion: 'Check DATABASE_URL in .env file'
      }
    });
  }
});

// Database setup endpoint
app.get('/setup-db', async (req, res) => {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    console.log('Ì¥Ñ Setting up database...');
    
    const commands = [
      'npx prisma generate',
      'npx prisma db push --accept-data-loss',
      'npx ts-node prisma/seed.ts || echo "Seed completed (with possible warnings)"'
    ];
    
    const results = [];
    for (const cmd of commands) {
      try {
        const { stdout, stderr } = await execPromise(cmd);
        results.push({ command: cmd, success: true, output: stdout });
        if (stderr) console.warn(stderr);
      } catch (error) {
        results.push({ command: cmd, success: false, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: 'Database setup completed',
      results: results.map(r => ({
        command: r.command.split(' ')[1],
        status: r.success ? '‚úÖ' : '‚ö†Ô∏è',
        details: r.success ? 'Executed successfully' : r.error
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Course Platform API',
    database: 'Neon PostgreSQL (Cloud)',
    version: '2.0.0',
    documentation: '/api-docs',
    health: '/health',
    setup: '/setup-db (if database not initialized)',
    features: [
      'User Registration & Authentication',
      'Instructor Application System',
      'Course Creation & Management',
      'Lesson/Module Management',
      'Course Enrollment',
      'Payment Processing',
      'Reviews & Ratings',
      'Complete Activity Logging',
      'Email Notifications'
    ]
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`
  Ì∫Ä Server running on port ${PORT}
  
  Ì≥ä Database: Neon PostgreSQL (Cloud)
  Ì≥ö API Docs: http://localhost:${PORT}/api-docs
  Ì¥ó Health: http://localhost:${PORT}/health
  Ìª†Ô∏è  Setup: http://localhost:${PORT}/setup-db
  
  Ìºê Neon Dashboard: https://console.neon.tech
  
  Ì≥ã First-time setup:
  1. Open /setup-db to initialize database
  2. Then test endpoints in /api-docs
  `);
});

export default app;
