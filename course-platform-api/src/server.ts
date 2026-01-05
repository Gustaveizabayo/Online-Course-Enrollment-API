import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import courseRoutes from './modules/courses/course.routes';
import enrollmentRoutes from './modules/enrollments/enrollment.routes';
import paymentRoutes from './modules/payments/payment.routes';

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
      description: 'API for managing courses, enrollments, and payments',
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
    },
  },
  apis: ['./src/modules/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Routes
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
      '/api/payments'
    ]
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /docs',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/courses',
      'POST /api/courses',
      'POST /api/enrollments',
      'POST /api/payments/create'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`\n👤 Test Credentials:`);
  console.log(`   Admin: admin@example.com / Admin123!`);
  console.log(`   Student: student@example.com / Student123!`);
  console.log(`   Instructor: instructor@example.com / Instructor123!`);
});