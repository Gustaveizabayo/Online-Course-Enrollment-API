"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const passport_1 = __importDefault(require("passport"));
const swagger_1 = __importDefault(require("./config/swagger"));
const error_middleware_1 = require("./middlewares/error.middleware");
const env_1 = require("./config/env");
require("./config/passport");
// Import routes
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const course_routes_1 = __importDefault(require("./modules/courses/course.routes"));
const enrollment_routes_1 = __importDefault(require("./modules/enrollments/enrollment.routes"));
const payment_routes_1 = __importDefault(require("./modules/payments/payment.routes"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: env_1.env.NODE_ENV === 'production'
        ? ['https://your-frontend-domain.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);
// Body parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Passport middleware
app.use(passport_1.default.initialize());
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/courses', course_routes_1.default);
app.use('/api/enrollments', enrollment_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
// Swagger documentation
if (env_1.env.NODE_ENV !== 'production') {
    (0, swagger_1.default)(app, env_1.env.PORT);
}
// 404 handler
app.use(error_middleware_1.notFoundHandler);
// Error handler
app.use(error_middleware_1.errorHandler);
exports.default = app;
