# Quick Setup Guide

## Prerequisites
- PostgreSQL installed and running
- Node.js v16+ installed

## Step-by-Step Setup

### 1. Create .env file
Create a file named `.env` in the project root with:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/course_enrollment?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
PORT=3000
NODE_ENV=development
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.**

### 2. Create Database
In PostgreSQL, create the database:

```sql
CREATE DATABASE course_enrollment;
```

### 3. Run Database Setup
```bash
npm run prisma:generate
npm run prisma:migrate
```

When prompted for migration name, enter: `init`

### 4. (Optional) Seed Sample Data
```bash
npm run prisma:seed
```

This creates test accounts:
- admin@example.com / password123
- instructor1@example.com / password123
- student1@example.com / password123

### 5. Start the Server
```bash
npm run dev
```

### 6. Test the API
Visit: http://localhost:3000/api-docs

## Quick Test

### Register a user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "STUDENT"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned `token` and use it in subsequent requests:

### Get courses:
```bash
curl http://localhost:3000/api/courses
```

## Troubleshooting

### "DATABASE_URL environment variable not found"
- Make sure you created the `.env` file in the project root
- Check that the file is named exactly `.env` (not `.env.txt`)

### "Can't reach database server"
- Make sure PostgreSQL is running
- Check your database credentials in `.env`
- Verify the database exists: `CREATE DATABASE course_enrollment;`

### "Prisma Client not generated"
- Run: `npm run prisma:generate`

## Next Steps

1. Explore the API documentation at `/api-docs`
2. Run tests: `npm test`
3. View database: `npm run prisma:studio`
4. Check the README.md for detailed documentation
