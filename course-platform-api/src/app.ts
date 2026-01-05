import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import swaggerDocs from './config/swagger';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import { env } from './config/env';
import './config/passport';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import courseRoutes from './modules/courses/course.routes';
import enrollmentRoutes from './modules/enrollments/enrollment.routes';
import paymentRoutes from './modules/payments/payment.routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);

// Swagger documentation
if (env.NODE_ENV !== 'production') {
  swaggerDocs(app, env.PORT);
}

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;