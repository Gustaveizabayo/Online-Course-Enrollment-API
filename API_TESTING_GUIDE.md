# 📖 API Testing Guide & Full Examples

This guide provides complete, step-by-step examples for testing the Online Course Platform APIs. Each section represents a complete "User Journey" you can follow.

---

## 🛠️ Prerequisites

- **Base URL:** `http://localhost:3000/api`
- **Tools:** `curl`, Postman, or PowerShell `Invoke-RestMethod`
- **Header:** Content-Type is always `application/json`

---

## 🎓 Scenario 1: The Student Journey
**Goal:** Register, enroll in a course, view dashboard, and complete a lesson.

### 1. Register as Student
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "password": "Password123!",
    "name": "Alice Student",
    "role": "STUDENT"
  }'
```

### 2. Verify OTP (Check console/email for code)
*Replace `123456` with actual code.*
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "code": "123456"
  }'
```
**Response:** Save the `token` from the response! Let's call it `{STUDENT_TOKEN}`.

### 3. Login (If token expired)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "password": "Password123!"
  }'
```

### 4. View Available Courses
```bash
curl http://localhost:3000/api/courses \
  -H "Authorization: Bearer {STUDENT_TOKEN}"
```

### 5. Enroll in a Course
*Replace `{COURSE_ID}` with an ID from specific step 4.*
```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Authorization: Bearer {STUDENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "{COURSE_ID}"
  }'
```

### 6. View Student Dashboard
```bash
curl http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer {STUDENT_TOKEN}"
```

---

## 👨‍🏫 Scenario 2: The Instructor Journey
**Goal:** Register, create a course, add modules, and publish.

### 1. Register as Instructor
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor1@example.com",
    "password": "Password123!",
    "name": "Bob Instructor",
    "role": "INSTRUCTOR"
  }'
```
*(Verify OTP as shown in Student Scenario Step 2)*. Save `{INSTRUCTOR_TOKEN}`.

### 2. Apply for Instructor Profile (Optional)
```bash
curl -X POST http://localhost:3000/api/auth/apply-instructor \
  -H "Authorization: Bearer {INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Senior Web Developer with 10 years experience",
    "qualifications": "PhD in Computer Science",
    "experience": "5 years teaching"
  }'
```

### 3. Create a Course
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer {INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced React Patterns",
    "description": "Master React Hooks and Context",
    "price": 49.99,
    "duration": 120,
    "category": "Programming"
  }'
```
**Response:** Save the `id` as `{COURSE_ID}`.

### 4. Add a Module
```bash
curl -X POST http://localhost:3000/api/courses/{COURSE_ID}/modules \
  -H "Authorization: Bearer {INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Hooks",
    "order": 1
  }'
```
**Response:** Save the `id` as `{MODULE_ID}`.

### 5. Add a Lesson
```bash
curl -X POST http://localhost:3000/api/courses/modules/{MODULE_ID}/lessons \
  -H "Authorization: Bearer {INSTRUCTOR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "UseState Deep Dive",
    "content": "Video content url or text...",
    "type": "VIDEO",
    "duration": 15,
    "order": 1
  }'
```

### 6. Publish Course
```bash
curl -X PATCH http://localhost:3000/api/courses/{COURSE_ID}/publish \
  -H "Authorization: Bearer {INSTRUCTOR_TOKEN}"
```

### 7. View Instructor Dashboard
```bash
curl http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer {INSTRUCTOR_TOKEN}"
```

---

## 🛡️ Scenario 3: The Admin Journey
**Goal:** Manage users and view system stats.

### 1. Login as Admin
*Using the seed admin credentials.*
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@platform.com",
    "password": "Admin123!"
  }'
```
**Response:** Save `{ADMIN_TOKEN}`.

### 2. View Admin Dashboard
```bash
curl http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

### 3. Promote a User to Admin (or any role)
*Replace `{USER_ID}` with the ID of the user you want to promote.*
```bash
curl -X PATCH http://localhost:3000/api/auth/users/{USER_ID}/role \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ADMIN"
  }'
```

### 4. Review Instructor Applications
```bash
curl http://localhost:3000/api/auth/admin/applications \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

### 5. Approve Application
```bash
curl -X PATCH http://localhost:3000/api/auth/admin/applications/{APPLICATION_ID}/review \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED"
  }'
```

---

## ⚡ Quick Reference: Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register (Student/Instructor) |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/dashboard` | Any | Role-based Dashboard |
| GET | `/api/courses` | Any | List Published Courses |
| POST | `/api/courses` | Instructor | Create Course |
| POST | `/api/enrollments` | Student | Enroll in Course |
| PATCH | `/api/auth/users/:id/role` | Admin | Change User Role |

---

**Tip:** For easier testing, import these requests into Postman or Insomnia!
