"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const package_json_1 = require("../../package.json");
const env_1 = require("./env");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Course Platform API',
            version: package_json_1.version,
            description: `
## 🎓 Course Platform REST API Documentation

Welcome to the Course Platform API documentation. This API provides endpoints for:

- **User Authentication & Authorization** (JWT, Google OAuth)
- **Course Management** (CRUD operations for instructors)
- **Student Enrollment** (Course registration system)
- **Payment Processing** (PayPal integration)
- **Role-based Access Control** (Student, Instructor, Admin)

### 📋 Getting Started

1. **Register** a new account or use test credentials
2. **Login** to get your JWT token
3. **Use the token** in Authorization header: \`Bearer <your-token>\`

### 🚀 Test Credentials

\`\`\`json
{
  "admin": {
    "email": "admin@example.com",
    "password": "Admin123!"
  },
  "instructor": {
    "email": "instructor@example.com",
    "password": "Instructor123!"
  },
  "student": {
    "email": "student@example.com",
    "password": "Student123!"
  }
}
\`\`\`

### 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### 📊 Rate Limiting

API is rate limited to 100 requests per 15 minutes per IP address.

### 🛡️ Security

- Passwords are hashed using bcrypt
- JWT tokens expire in 7 days
- CORS enabled for specified origins
- Helmet.js security headers
- Input validation with Zod

### 🐳 Docker Support

Run the complete stack with Docker Compose:

\`\`\`bash
npm run docker:up
\`\`\`

### 📝 Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "message": "Error description",
  "error": "ErrorType",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
\`\`\`
      `,
            contact: {
                name: 'API Support',
                email: 'support@courseplatform.com',
                url: 'https://courseplatform.com/support',
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            },
        },
        servers: [
            {
                url: env_1.env.BASE_URL,
                description: env_1.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
            },
            {
                url: 'http://localhost:3000',
                description: 'Local Development',
            },
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Authentication and user management',
            },
            {
                name: 'Courses',
                description: 'Course management operations',
            },
            {
                name: 'Enrollments',
                description: 'Student enrollment management',
            },
            {
                name: 'Payments',
                description: 'Payment processing and history',
            },
            {
                name: 'Health',
                description: 'Health check and status',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token in the format: Bearer <token>',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['id', 'name', 'email', 'role'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000',
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john@example.com',
                        },
                        role: {
                            type: 'string',
                            enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
                            example: 'STUDENT',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00.000Z',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00.000Z',
                        },
                    },
                },
                Course: {
                    type: 'object',
                    required: ['id', 'title', 'price', 'instructorId'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000',
                        },
                        title: {
                            type: 'string',
                            example: 'Introduction to Web Development',
                        },
                        description: {
                            type: 'string',
                            example: 'Learn the basics of HTML, CSS, and JavaScript',
                        },
                        price: {
                            type: 'number',
                            format: 'float',
                            example: 49.99,
                        },
                        instructorId: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000',
                        },
                        instructor: {
                            $ref: '#/components/schemas/User',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00.000Z',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00.000Z',
                        },
                        _count: {
                            type: 'object',
                            properties: {
                                enrollments: {
                                    type: 'number',
                                    example: 25,
                                },
                            },
                        },
                    },
                },
                Enrollment: {
                    type: 'object',
                    required: ['id', 'userId', 'courseId', 'enrolledAt'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        userId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        courseId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        enrolledAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        user: {
                            $ref: '#/components/schemas/User',
                        },
                        course: {
                            $ref: '#/components/schemas/Course',
                        },
                    },
                },
                Payment: {
                    type: 'object',
                    required: ['id', 'userId', 'courseId', 'amount', 'status'],
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        userId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        courseId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        amount: {
                            type: 'number',
                            format: 'float',
                        },
                        provider: {
                            type: 'string',
                            enum: ['paypal'],
                            default: 'paypal',
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'completed', 'failed', 'cancelled'],
                            default: 'pending',
                        },
                        transactionId: {
                            type: 'string',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        user: {
                            $ref: '#/components/schemas/User',
                        },
                        token: {
                            type: 'string',
                            description: 'JWT token for authentication',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Invalid email or password',
                        },
                        error: {
                            type: 'string',
                            example: 'BadRequestError',
                        },
                        statusCode: {
                            type: 'integer',
                            example: 400,
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                        },
                        path: {
                            type: 'string',
                            example: '/api/auth/login',
                        },
                        stack: {
                            type: 'string',
                            description: 'Only included in development mode',
                        },
                    },
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'integer',
                            example: 1,
                        },
                        limit: {
                            type: 'integer',
                            example: 10,
                        },
                        total: {
                            type: 'integer',
                            example: 100,
                        },
                        totalPages: {
                            type: 'integer',
                            example: 10,
                        },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Authentication token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                ForbiddenError: {
                    description: 'User does not have permission to access this resource',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                NotFoundError: {
                    description: 'The requested resource was not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                ValidationError: {
                    description: 'Request validation failed',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
            },
            parameters: {
                pageParam: {
                    name: 'page',
                    in: 'query',
                    description: 'Page number',
                    required: false,
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        default: 1,
                    },
                },
                limitParam: {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page',
                    required: false,
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 100,
                        default: 10,
                    },
                },
            },
        },
        externalDocs: {
            description: 'Find more info about the API',
            url: 'https://docs.courseplatform.com',
        },
    },
    apis: [
        './src/modules/**/*.ts',
        './src/modules/**/*.controller.ts',
        './src/modules/**/*.routes.ts',
        './src/modules/**/*.schema.ts',
    ],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
function swaggerDocs(app, port) {
    // Swagger UI
    app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Course Platform API Docs',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
            tryItOutEnabled: true,
        },
    }));
    // Docs in JSON format
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    console.log(`📚 Swagger Docs available at ${env_1.env.BASE_URL}/docs`);
}
exports.default = swaggerDocs;
