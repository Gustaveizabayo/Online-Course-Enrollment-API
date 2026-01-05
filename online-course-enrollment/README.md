# Online Course Enrollment API

A comprehensive RESTful API for managing online course enrollments with authentication, course management, enrollment tracking, and payment processing.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with role-based access control
- 👥 **User Management** - Support for Students, Instructors, and Admins
- 📚 **Course Management** - Full CRUD operations for courses with pagination and filtering
- 📝 **Enrollment System** - Manage course enrollments with capacity limits
- 💳 **Payment Tracking** - Track payments for course enrollments
- 📖 **API Documentation** - Interactive Swagger/OpenAPI documentation
- ✅ **Input Validation** - Comprehensive request validation
- 🛡️ **Security** - Rate limiting, CORS, and secure password hashing
- 📊 **Logging** - Winston-based logging system
- 🧪 **Testing** - Comprehensive test suite with Jest

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Logging**: Winston

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-course-enrollment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/course_enrollment?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   
   Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   ```

   Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

5. **Seed the database (optional)**
   
   Populate the database with sample data:
   ```bash
   npm run prisma:seed
   ```

   This creates test accounts:
   - Admin: `admin@example.com` / `password123`
   - Instructor 1: `instructor1@example.com` / `password123`
   - Instructor 2: `instructor2@example.com` / `password123`
   - Student 1: `student1@example.com` / `password123`
   - Student 2: `student2@example.com` / `password123`

## Running the Application

### Development Mode
```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot-reloading enabled.

### Production Mode
```bash
npm run build
npm start
```

## API Documentation

Once the server is running, access the interactive API documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires authentication)

### Courses
- `GET /api/courses` - Get all courses (with pagination and filtering)
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create a new course (Instructor/Admin only)
- `PUT /api/courses/:id` - Update a course (Instructor/Admin only)
- `DELETE /api/courses/:id` - Delete a course (Admin only)

### Enrollments
- `POST /api/enrollments` - Enroll in a course (authenticated users)
- `GET /api/enrollments/my` - Get user's enrollments
- `GET /api/enrollments/course/:courseId` - Get course enrollments (Instructor/Admin)
- `DELETE /api/enrollments/:id` - Cancel enrollment

### Payments
- `POST /api/payments` - Process a payment
- `GET /api/payments/my` - Get user's payment history
- `GET /api/payments/:id` - Get payment details

## User Roles

- **STUDENT** - Can enroll in courses, view their enrollments, and make payments
- **INSTRUCTOR** - Can create and manage their own courses, view enrollments
- **ADMIN** - Full access to all resources, can delete courses
 
## Troubleshooting
 
### Prisma 7 "Using engine type client" error on Windows
If you encounter an error about engine types or validation while running Prisma 7 commands, use the provided fix script:
```bash
npm run prisma:fix
```
This forces Prisma to use the stable binary engine.
 
## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Database Management

### View Database
```bash
npm run prisma:studio
```

This opens Prisma Studio at `http://localhost:5555` for visual database management.

### Create Migration
```bash
npm run prisma:migrate
```

### Reset Database
```bash
npx prisma migrate reset
```

## Project Structure

```
online-course-enrollment/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # Prisma client
│   │   ├── logger.ts     # Winston logger
│   │   └── swagger.ts    # Swagger configuration
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── course.controller.ts
│   │   ├── enrollment.controller.ts
│   │   └── payment.controller.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication & authorization
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts
│   │   ├── course.routes.ts
│   │   ├── enrollment.routes.ts
│   │   └── payment.routes.ts
│   ├── tests/            # Test files
│   │   ├── auth.test.ts
│   │   └── course.test.ts
│   ├── utils/            # Utility functions
│   │   └── seed.ts       # Database seeding
│   └── index.ts          # Application entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── .env.example          # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | `7d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## Error Handling

The API uses consistent error responses:

```json
{
  "error": "Error message",
  "details": [] // Optional, for validation errors
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: All inputs are validated and sanitized
- **CORS**: Configurable cross-origin resource sharing
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Support

For support, email support@example.com or open an issue in the repository.

## Acknowledgments

- Express.js for the web framework
- Prisma for the excellent ORM
- JWT for secure authentication
- All other open-source contributors
