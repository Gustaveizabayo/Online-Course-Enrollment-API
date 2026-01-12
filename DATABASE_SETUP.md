# Database Setup Guide
**Quick Guide to Connect and Sync with Neon PostgreSQL**

---

## Current Status

✅ **Prisma Schema:** Fully configured and validated  
✅ **Prisma Client:** Generated and ready  
⚠️ **Database Connection:** Requires valid credentials  

---

## Option 1: Connect to Neon Database (Recommended)

### Step 1: Get Your Neon Connection String

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string (should look like):
   ```
   postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

### Step 2: Update .env File

Open `.env` and update the `DATABASE_URL`:

```env
DATABASE_URL=postgresql://your_user:your_password@your_host.neon.tech/your_db?sslmode=require
```

### Step 3: Push Schema to Database

Choose one of these methods:

#### Method A: Push Schema (Quick, No Migration Files)
```bash
npm run prisma:push
```
This will:
- Create all tables in your database
- Apply the schema directly
- No migration history

#### Method B: Create Migration (Recommended for Production)
```bash
npm run prisma:migrate
```
This will:
- Create migration files
- Apply migration to database
- Keep migration history
- When prompted, enter migration name: `init`

### Step 4: Verify Connection

```bash
# Open Prisma Studio to view your database
npm run prisma:studio
```

This will open a browser at `http://localhost:5555` where you can:
- View all tables
- Add/edit/delete records
- Verify schema is correct

---

## Option 2: Use Local PostgreSQL

### Step 1: Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE course_platform;

# Create user (optional)
CREATE USER course_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE course_platform TO course_admin;

# Exit
\q
```

### Step 3: Update .env

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/course_platform
```

### Step 4: Run Migration

```bash
npm run prisma:migrate
```

---

## Option 3: Use SQLite (Development Only)

### Step 1: Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Step 2: Update .env

```env
DATABASE_URL=file:./dev.db
```

### Step 3: Regenerate Client and Migrate

```bash
npm run prisma:generate
npm run prisma:migrate
```

**Note:** SQLite has limitations (no native enums, etc.)

---

## Database Schema Overview

### Tables Created

1. **users** - User accounts with roles
2. **otps** - OTP verification codes
3. **courses** - Course information
4. **enrollments** - Student enrollments
5. **payments** - Payment records
6. **instructor_applications** - Instructor applications
7. **modules** - Course modules
8. **lessons** - Lesson content
9. **lesson_progress** - Student progress
10. **reviews** - Course reviews
11. **activity_logs** - System activity

### Key Relations

```
User (1) ←→ (N) Course (as instructor)
User (1) ←→ (N) Enrollment
User (1) ←→ (N) Payment
User (1) ←→ (1) OTP
Course (1) ←→ (N) Enrollment
Course (1) ←→ (N) Module
Module (1) ←→ (N) Lesson
Enrollment (1) ←→ (1) Payment
```

---

## Seeding the Database (Optional)

### Create Seed File

Create `prisma/seed.ts`:

```typescript
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create Admin User
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // Create Instructor
  const instructorPassword = await bcrypt.hash('Instructor123!', 10);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      password: instructorPassword,
      name: 'Jane Instructor',
      role: Role.INSTRUCTOR,
      status: UserStatus.ACTIVE,
    },
  });

  // Create Sample Course
  const course = await prisma.course.upsert({
    where: { id: 'sample-course-1' },
    update: {},
    create: {
      id: 'sample-course-1',
      title: 'Complete Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, and Node.js',
      price: 99.99,
      duration: 40,
      category: 'Web Development',
      instructorId: instructor.id,
      isPublished: true,
    },
  });

  // Create Module
  const module1 = await prisma.module.create({
    data: {
      title: 'Introduction to Web Development',
      order: 1,
      courseId: course.id,
    },
  });

  // Create Lessons
  await prisma.lesson.createMany({
    data: [
      {
        title: 'What is Web Development?',
        type: 'VIDEO',
        videoUrl: 'https://example.com/video1.mp4',
        duration: 15,
        order: 1,
        moduleId: module1.id,
      },
      {
        title: 'Setting Up Your Environment',
        type: 'ARTICLE',
        content: '# Setup Guide\n\nFollow these steps...',
        duration: 10,
        order: 2,
        moduleId: module1.id,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('Admin:', admin.email);
  console.log('Instructor:', instructor.email);
  console.log('Course:', course.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Update package.json

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Run Seed

```bash
npx prisma db seed
```

---

## Troubleshooting

### Error: "Can't reach database server"

**Causes:**
- Database server not running
- Wrong connection string
- Firewall blocking connection
- SSL/TLS issues

**Solutions:**
```bash
# Check if PostgreSQL is running
# Windows:
Get-Service postgresql*

# Mac/Linux:
brew services list
# or
sudo systemctl status postgresql

# Test connection manually
psql -h your_host -U your_user -d your_db
```

### Error: "SSL connection required"

**Solution:** Add `?sslmode=require` to connection string:
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### Error: "Database does not exist"

**Solution:** Create the database first:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE your_database_name;
```

### Error: "Migration failed"

**Solution:** Reset database and try again:
```bash
# WARNING: This deletes all data!
npx prisma migrate reset

# Then run migration again
npm run prisma:migrate
```

---

## Verification Checklist

After setup, verify:

- [ ] Database connection successful
- [ ] All 11 tables created
- [ ] Prisma Studio opens and shows tables
- [ ] Can insert test data
- [ ] Server starts without database errors

---

## Quick Commands Reference

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema (no migrations)
npm run prisma:push

# Create and run migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Reset database (deletes all data!)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Format schema file
npx prisma format
```

---

## Database Connection String Format

### PostgreSQL (Neon/Local)
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

### Example:
```
postgresql://myuser:mypass@localhost:5432/course_platform
```

### With Special Characters in Password:
```
postgresql://myuser:my%40pass@localhost:5432/course_platform
# @ becomes %40
# # becomes %23
# etc.
```

---

## Next Steps After Database Setup

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test the connection:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Register first user (becomes admin):**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "Admin123!",
       "name": "Admin User"
     }'
   ```

4. **Check Swagger docs:**
   - Open browser: `http://localhost:3000/api-docs`

---

## Production Considerations

### Security
- [ ] Use strong database password
- [ ] Enable SSL/TLS
- [ ] Restrict database access by IP
- [ ] Use connection pooling
- [ ] Enable database backups

### Performance
- [ ] Add database indexes
- [ ] Configure connection pool size
- [ ] Enable query logging (development only)
- [ ] Monitor slow queries

### Backup
```bash
# PostgreSQL backup
pg_dump -U username -d database_name > backup.sql

# Restore
psql -U username -d database_name < backup.sql
```

---

**Database setup complete! 🎉**

For issues, check:
- Prisma documentation: https://www.prisma.io/docs
- Neon documentation: https://neon.tech/docs
