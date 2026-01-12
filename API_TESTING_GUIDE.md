# API Testing Guide
**Quick Reference for Testing All Endpoints**

---

## Prerequisites

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Server will run on:** `http://localhost:3000`

3. **API Base URL:** `http://localhost:3000/api`

4. **Swagger Docs:** `http://localhost:3000/api-docs`

---

## Testing Flow

### 1. User Registration & Authentication

#### Register First User (Auto-Admin)
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123!",
  "name": "Admin User"
}

# Response: { "message": "Verification code sent" }
# Check email for OTP code
```

#### Verify OTP
```bash
POST http://localhost:3000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "admin@example.com",
  "code": "123456"
}

# Response: 
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clx...",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
}

# Save the token for authenticated requests!
```

#### Resend OTP (if needed)
```bash
POST http://localhost:3000/api/auth/resend-otp
Content-Type: application/json

{
  "email": "admin@example.com"
}
```

---

### 2. Register Additional Users

#### Register Student
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "Student123!",
  "name": "John Student"
}

# Then verify with OTP
POST http://localhost:3000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "student@example.com",
  "code": "123456"
}
```

#### Register Instructor Candidate
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "instructor@example.com",
  "password": "Instructor123!",
  "name": "Jane Instructor"
}

# Verify OTP
POST http://localhost:3000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "instructor@example.com",
  "code": "123456"
}
```

---

### 3. Instructor Application Workflow

#### Apply to Become Instructor
```bash
POST http://localhost:3000/api/auth/apply-instructor
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "bio": "Experienced software developer with 10 years in web development",
  "qualifications": "BS Computer Science, AWS Certified",
  "experience": "Senior Developer at Tech Corp, taught 5000+ students online"
}

# Response: Application created with PENDING status
```

#### Get All Applications (Admin Only)
```bash
GET http://localhost:3000/api/auth/applications
Authorization: Bearer <admin_token>

# Response: List of all instructor applications
```

#### Approve Application (Admin Only)
```bash
PATCH http://localhost:3000/api/auth/applications/:applicationId
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "APPROVED"
}

# This promotes the user to INSTRUCTOR role
```

---

### 4. Course Management

#### Create Course (Instructor/Admin)
```bash
POST http://localhost:3000/api/courses
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "title": "Complete Web Development Bootcamp",
  "description": "Learn HTML, CSS, JavaScript, React, Node.js and more",
  "price": 99.99,
  "duration": 40,
  "category": "Web Development",
  "instructorId": "<instructor_user_id>"
}

# Response: Course created (unpublished by default)
# Save the course ID!
```

#### Get All Published Courses
```bash
GET http://localhost:3000/api/courses?page=1&limit=10
Authorization: Bearer <any_token>

# Optional query params:
# - page: Page number (default: 1)
# - limit: Items per page (default: 10)
# - category: Filter by category
```

#### Get Course by ID
```bash
GET http://localhost:3000/api/courses/:courseId
Authorization: Bearer <any_token>
```

#### Update Course
```bash
PATCH http://localhost:3000/api/courses/:courseId
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "title": "Updated Course Title",
  "price": 89.99
}
```

#### Publish Course
```bash
PATCH http://localhost:3000/api/courses/:courseId/publish
Authorization: Bearer <instructor_token>

# Makes course visible to students
```

#### Unpublish Course
```bash
PATCH http://localhost:3000/api/courses/:courseId/unpublish
Authorization: Bearer <instructor_token>

# Hides course from students
```

#### Delete Course
```bash
DELETE http://localhost:3000/api/courses/:courseId
Authorization: Bearer <instructor_token>
```

---

### 5. Module Management

#### Add Module to Course
```bash
POST http://localhost:3000/api/courses/:courseId/modules
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "title": "Introduction to JavaScript",
  "order": 1
}

# Response: Module created
# Save the module ID!
```

#### Update Module
```bash
PATCH http://localhost:3000/api/courses/modules/:moduleId
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "title": "Advanced JavaScript Concepts",
  "order": 2
}
```

#### Delete Module
```bash
DELETE http://localhost:3000/api/courses/modules/:moduleId
Authorization: Bearer <instructor_token>
```

---

### 6. Lesson Management

#### Add Lesson to Module
```bash
POST http://localhost:3000/api/courses/modules/:moduleId/lessons
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "title": "Variables and Data Types",
  "type": "VIDEO",
  "videoUrl": "https://example.com/video.mp4",
  "duration": 15,
  "order": 1
}

# Lesson types: VIDEO, ARTICLE, QUIZ, ASSIGNMENT, RESOURCE
```

#### Add Article Lesson
```bash
POST http://localhost:3000/api/courses/modules/:moduleId/lessons
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "title": "JavaScript Best Practices",
  "type": "ARTICLE",
  "content": "# Best Practices\n\n1. Use const and let...",
  "duration": 10,
  "order": 2
}
```

#### Update Lesson
```bash
PATCH http://localhost:3000/api/courses/lessons/:lessonId
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "title": "Updated Lesson Title",
  "duration": 20
}
```

#### Delete Lesson
```bash
DELETE http://localhost:3000/api/courses/lessons/:lessonId
Authorization: Bearer <instructor_token>
```

---

### 7. Enrollment Management

#### Enroll in Course (Student)
```bash
POST http://localhost:3000/api/enrollments
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "courseId": "<course_id>",
  "userId": "<student_user_id>"
}

# Response: Enrollment created with ACTIVE status
# Save the enrollment ID!
```

#### Get User's Enrollments
```bash
GET http://localhost:3000/api/enrollments?page=1&limit=10
Authorization: Bearer <student_token>

# Returns all enrollments for the authenticated user
```

#### Get Enrollment by ID
```bash
GET http://localhost:3000/api/enrollments/:enrollmentId
Authorization: Bearer <student_token>
```

#### Get Course Enrollments (Instructor)
```bash
GET http://localhost:3000/api/enrollments/course/:courseId?page=1&limit=10
Authorization: Bearer <instructor_token>

# Returns all students enrolled in the course
```

#### Update Enrollment Status
```bash
PATCH http://localhost:3000/api/enrollments/:enrollmentId/status
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "status": "COMPLETED"
}

# Status options: ACTIVE, COMPLETED, CANCELLED
```

#### Cancel Enrollment
```bash
DELETE http://localhost:3000/api/enrollments/:enrollmentId
Authorization: Bearer <student_token>

# Sets status to CANCELLED
```

---

### 8. Payment Management

#### Create Payment for Enrollment
```bash
POST http://localhost:3000/api/payments
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "enrollmentId": "<enrollment_id>",
  "amount": 99.99,
  "currency": "USD",
  "paymentMethod": "credit_card"
}

# Response: Payment created with PENDING status
# Save the payment ID and transaction ID!
```

#### Get User's Payments
```bash
GET http://localhost:3000/api/payments?page=1&limit=10
Authorization: Bearer <student_token>

# Returns all payments for the authenticated user
```

#### Get Payment by ID
```bash
GET http://localhost:3000/api/payments/:paymentId
Authorization: Bearer <student_token>
```

#### Update Payment Status
```bash
PATCH http://localhost:3000/api/payments/:paymentId/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "transactionId": "txn_1234567890"
}

# Status options: PENDING, COMPLETED, FAILED, REFUNDED
```

#### Verify Payment by Transaction ID
```bash
GET http://localhost:3000/api/payments/verify/:transactionId
Authorization: Bearer <any_token>
```

---

### 9. Reviews

#### Add Review to Course
```bash
POST http://localhost:3000/api/courses/:courseId/reviews
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "userId": "<student_user_id>",
  "rating": 5,
  "comment": "Excellent course! Learned a lot."
}

# Rating: 1-5
# Must be enrolled to review
```

---

### 10. Dashboard

#### Get Role-Based Dashboard
```bash
GET http://localhost:3000/api/dashboard
Authorization: Bearer <any_token>

# Returns different data based on user role:
# - STUDENT: Enrollments, progress, upcoming lessons
# - INSTRUCTOR: Total students, earnings, course performance
# - ADMIN: System stats, revenue, user counts
```

### 11. Admin Management

#### Initial Admin User
A seed admin user has been created:
- Email: `admin@platform.com`
- Password: `Admin123!`

#### Assign Roles (Admin Only)
Endpoint to promote users to Admin or other roles.

```bash
PATCH http://localhost:3000/api/auth/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "ADMIN"  # or INSTRUCTOR, STUDENT
}
```

### 12. Testing Scenarios

### Scenario: Student Enrolls and Completes Course

```bash
# 1. Register and verify student
POST /api/auth/register
POST /api/auth/verify-otp

# 2. Browse courses
GET /api/courses?page=1&limit=10

# 3. View course details
GET /api/courses/:courseId

# 4. Enroll in course
POST /api/enrollments
{
  "courseId": "...",
  "userId": "..."
}

# 5. Create payment
POST /api/payments
{
  "enrollmentId": "...",
  "amount": 99.99,
  "paymentMethod": "credit_card"
}

# 6. Admin processes payment
PATCH /api/payments/:paymentId/status
{
  "status": "COMPLETED"
}

# 7. Student accesses course content
GET /api/courses/:courseId

# 8. Student completes course
PATCH /api/enrollments/:enrollmentId/status
{
  "status": "COMPLETED"
}

# 9. Student leaves review
POST /api/courses/:courseId/reviews
{
  "rating": 5,
  "comment": "Great course!"
}
```

---

## Common Headers

### For All Authenticated Requests:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Response Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate entry)
- **500** - Internal Server Error

---

## Testing with cURL

### Example: Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

### Example: Get Courses (Authenticated)
```bash
curl -X GET http://localhost:3000/api/courses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Testing with Postman

1. **Import Collection:**
   - Create new collection "Online Course Platform"
   - Add environment variable `baseUrl` = `http://localhost:3000/api`
   - Add environment variable `token` = `<your_jwt_token>`

2. **Set Authorization:**
   - Type: Bearer Token
   - Token: `{{token}}`

3. **Create Requests:**
   - Use `{{baseUrl}}/auth/register` format
   - Save responses to extract IDs

---

## Testing with VS Code REST Client

Create a file `test.http`:

```http
### Variables
@baseUrl = http://localhost:3000/api
@token = your_jwt_token_here

### Register User
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!",
  "name": "Test User"
}

### Verify OTP
POST {{baseUrl}}/auth/verify-otp
Content-Type: application/json

{
  "email": "test@example.com",
  "code": "123456"
}

### Get Courses
GET {{baseUrl}}/courses
Authorization: Bearer {{token}}
```

---

## Troubleshooting

### Issue: "Unauthorized" Error
- **Solution:** Check if token is valid and not expired
- **Solution:** Ensure token is in format: `Bearer <token>`

### Issue: "Course not found"
- **Solution:** Verify course ID is correct
- **Solution:** Check if course is published (for students)

### Issue: "User already enrolled"
- **Solution:** Check existing enrollments first
- **Solution:** Use different user or course

### Issue: "Payment already exists"
- **Solution:** One payment per enrollment
- **Solution:** Check existing payment status

---

## Quick Reference: Role Permissions

| Endpoint | Student | Instructor | Admin |
|----------|---------|------------|-------|
| Register | ✅ | ✅ | ✅ |
| Apply Instructor | ✅ | ✅ | ✅ |
| Review Applications | ❌ | ❌ | ✅ |
| Create Course | ❌ | ✅ | ✅ |
| View Courses | ✅ | ✅ | ✅ |
| Enroll | ✅ | ✅ | ✅ |
| Create Payment | ✅ | ✅ | ✅ |
| Update Payment Status | ❌ | ❌ | ✅ |
| Add Review | ✅ | ✅ | ✅ |

---

**Happy Testing! 🚀**
