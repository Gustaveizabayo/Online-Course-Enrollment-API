# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ONLINE COURSE PLATFORM                              │
│                              Architecture                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Web Browser / Mobile App / API Client                                   │
│  • Swagger UI (API Documentation)                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MIDDLEWARE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Helmet  │  │   CORS   │  │  Morgan  │  │   JSON   │  │  Custom  │    │
│  │ Security │  │  Policy  │  │  Logger  │  │  Parser  │  │  Error   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐                       │
│  │  Authentication      │  │  Authorization       │                       │
│  │  (JWT Validation)    │  │  (Role Guard)        │                       │
│  └──────────────────────┘  └──────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ROUTING LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  /api/auth          /api/courses      /api/enrollments    /api/payments    │
│       │                   │                   │                  │          │
│       ↓                   ↓                   ↓                  ↓          │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CONTROLLER LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Auth      │  │   Course     │  │  Enrollment  │  │   Payment    │  │
│  │  Controller  │  │  Controller  │  │  Controller  │  │  Controller  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                 │                  │                 │           │
│         │  • Validation   │                  │                 │           │
│         │  • Request      │                  │                 │           │
│         │  • Response     │                  │                 │           │
│         ↓                 ↓                  ↓                 ↓           │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Auth      │  │   Course     │  │  Enrollment  │  │   Payment    │  │
│  │   Service    │  │   Service    │  │   Service    │  │   Service    │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├──────────────┤  │
│  │ • register   │  │ • create     │  │ • enroll     │  │ • create     │  │
│  │ • verifyOtp  │  │ • update     │  │ • getAll     │  │ • getAll     │  │
│  │ • resendOtp  │  │ • delete     │  │ • cancel     │  │ • verify     │  │
│  │ • apply      │  │ • publish    │  │ • complete   │  │ • update     │  │
│  │ • review     │  │ • modules    │  │              │  │              │  │
│  │              │  │ • lessons    │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DATA ACCESS LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                         Prisma Client (ORM)                                 │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  User    │  │  Course  │  │Enrollment│  │ Payment  │  │   OTP    │   │
│  │  Model   │  │  Model   │  │  Model   │  │  Model   │  │  Model   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Module  │  │  Lesson  │  │  Review  │  │  Progress│  │ Activity │   │
│  │  Model   │  │  Model   │  │  Model   │  │  Model   │  │   Log    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                     PostgreSQL (Neon Cloud)                                 │
│                                                                             │
│  Tables: users, otps, courses, enrollments, payments,                      │
│          instructor_applications, modules, lessons,                         │
│          lesson_progress, reviews, activity_logs                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐         ┌──────────────────┐                         │
│  │  Email Service   │         │  Payment Gateway │                         │
│  │  (SMTP/Gmail)    │         │  (Simulated)     │                         │
│  │                  │         │                  │                         │
│  │  • Send OTP      │         │  • Process       │                         │
│  │  • Notifications │         │  • Verify        │                         │
│  └──────────────────┘         └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
                              USER FLOW DIAGRAM
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                           STUDENT JOURNEY                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │ Register │ ──> │ Get OTP  │ ──> │ Verify   │ ──> │  Login   │
   │  Email   │     │   Code   │     │   OTP    │     │ Success  │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                              │
                                                              ↓
2. COURSE DISCOVERY
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Browse  │ ──> │  Filter  │ ──> │   View   │
   │ Courses  │     │ Category │     │ Details  │
   └──────────┘     └──────────┘     └──────────┘
                                            │
                                            ↓
3. ENROLLMENT
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Enroll  │ ──> │  Create  │ ──> │  Process │ ──> │  Access  │
   │  Course  │     │ Payment  │     │ Payment  │     │  Content │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                              │
                                                              ↓
4. LEARNING
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Watch   │ ──> │  Track   │ ──> │ Complete │ ──> │  Leave   │
   │ Lessons  │     │ Progress │     │  Course  │     │  Review  │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         INSTRUCTOR JOURNEY                                  │
└─────────────────────────────────────────────────────────────────────────────┘

1. BECOME INSTRUCTOR
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │ Register │ ──> │  Apply   │ ──> │  Admin   │ ──> │ Promoted │
   │as Student│     │Instructor│     │ Approves │     │   Role   │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                              │
                                                              ↓
2. CREATE COURSE
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Create  │ ──> │   Add    │ ──> │   Add    │ ──> │ Publish  │
   │  Course  │     │ Modules  │     │ Lessons  │     │  Course  │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                              │
                                                              ↓
3. MANAGE COURSE
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │   View   │ ──> │  Update  │ ──> │  Monitor │
   │Enrollments     │ Content  │     │  Reviews │
   └──────────┘     └──────────┘     └──────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            ADMIN JOURNEY                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. SYSTEM MANAGEMENT
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Review  │ ──> │ Approve/ │ ──> │  Manage  │ ──> │  Monitor │
   │  Apply   │     │  Reject  │     │ Payments │     │ Activity │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘


═══════════════════════════════════════════════════════════════════════════════
                            DATA FLOW DIAGRAM
═══════════════════════════════════════════════════════════════════════════════

AUTHENTICATION FLOW:
┌────────┐         ┌────────┐         ┌────────┐         ┌────────┐
│ Client │ ──1──> │  API   │ ──2──> │Service │ ──3──> │   DB   │
│        │ <──8── │        │ <──7── │        │ <──4── │        │
└────────┘         └────────┘         └────────┘         └────────┘
                        │                  │
                        │ ──5──> ┌────────┐
                        │ <──6── │ Email  │
                        │         └────────┘

1. POST /register {email, password}
2. authService.register()
3. Create user, generate OTP
4. Save to database
5. Send OTP email
6. Email sent confirmation
7. Return success message
8. Response to client


COURSE ENROLLMENT FLOW:
┌────────┐         ┌────────┐         ┌────────┐         ┌────────┐
│Student │ ──1──> │  API   │ ──2──> │Service │ ──3──> │   DB   │
│        │         │        │         │        │         │        │
│        │         │        │ ──4──> │Payment │ ──5──> │        │
│        │ <──8── │        │ <──7── │Service │ <──6── │        │
└────────┘         └────────┘         └────────┘         └────────┘

1. POST /enrollments {courseId, userId}
2. enrollmentService.enrollStudent()
3. Create enrollment record
4. paymentService.createPayment()
5. Create payment record
6. Return payment details
7. Return enrollment + payment
8. Response to client


═══════════════════════════════════════════════════════════════════════════════
                          DATABASE RELATIONSHIPS
═══════════════════════════════════════════════════════════════════════════════

                            ┌──────────────┐
                            │     User     │
                            ├──────────────┤
                            │ id           │
                            │ email        │
                            │ password     │
                            │ role         │
                            │ status       │
                            └──────────────┘
                                   │
                    ┌──────────────┼──────────────┬──────────────┐
                    │              │              │              │
                    ↓              ↓              ↓              ↓
            ┌──────────┐   ┌──────────┐  ┌──────────┐  ┌──────────┐
            │   OTP    │   │  Course  │  │Enrollment│  │ Payment  │
            ├──────────┤   ├──────────┤  ├──────────┤  ├──────────┤
            │ userId   │   │instructorId  │ userId   │  │ userId   │
            │ code     │   │ title    │  │ courseId │  │enrollmentId
            │ expiresAt│   │ price    │  │ status   │  │ amount   │
            └──────────┘   └──────────┘  └──────────┘  └──────────┘
                                  │              │              │
                                  │              └──────┬───────┘
                                  ↓                     ↓
                           ┌──────────┐         ┌──────────┐
                           │  Module  │         │ Payment  │
                           ├──────────┤         │(1-to-1)  │
                           │ courseId │         └──────────┘
                           │ title    │
                           │ order    │
                           └──────────┘
                                  │
                                  ↓
                           ┌──────────┐
                           │  Lesson  │
                           ├──────────┤
                           │ moduleId │
                           │ title    │
                           │ type     │
                           │ content  │
                           └──────────┘


═══════════════════════════════════════════════════════════════════════════════
                            SECURITY LAYERS
═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│ Layer 1: Network Security                                                  │
│  • HTTPS/TLS encryption                                                    │
│  • CORS policy enforcement                                                 │
│  • Helmet security headers                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ Layer 2: Authentication                                                     │
│  • JWT token validation                                                    │
│  • Token expiration checking                                               │
│  • Bearer token extraction                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ Layer 3: Authorization                                                      │
│  • Role-based access control (RBAC)                                        │
│  • Resource ownership verification                                         │
│  • Permission checking                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ Layer 4: Input Validation                                                  │
│  • Zod schema validation                                                   │
│  • Type checking                                                           │
│  • Sanitization                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│ Layer 5: Data Protection                                                   │
│  • Password hashing (bcrypt)                                               │
│  • OTP hashing                                                             │
│  • SQL injection prevention (Prisma)                                       │
└─────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
                              API ENDPOINTS MAP
═══════════════════════════════════════════════════════════════════════════════

/api
 │
 ├── /auth
 │    ├── POST   /register              [Public]
 │    ├── POST   /verify-otp            [Public]
 │    ├── POST   /resend-otp            [Public]
 │    ├── POST   /apply-instructor      [Protected: Student+]
 │    ├── GET    /applications          [Protected: Admin]
 │    └── PATCH  /applications/:id      [Protected: Admin]
 │
 ├── /courses
 │    ├── POST   /                      [Protected: Instructor+]
 │    ├── GET    /                      [Protected: All]
 │    ├── GET    /:id                   [Protected: All]
 │    ├── PATCH  /:id                   [Protected: Instructor+]
 │    ├── DELETE /:id                   [Protected: Instructor+]
 │    ├── PATCH  /:id/publish           [Protected: Instructor+]
 │    ├── PATCH  /:id/unpublish         [Protected: Instructor+]
 │    ├── POST   /:id/modules           [Protected: Instructor+]
 │    ├── POST   /modules/:id/lessons   [Protected: Instructor+]
 │    └── POST   /:id/reviews           [Protected: Student+]
 │
 ├── /enrollments
 │    ├── POST   /                      [Protected: Student+]
 │    ├── GET    /                      [Protected: All]
 │    ├── GET    /:id                   [Protected: All]
 │    ├── GET    /course/:courseId      [Protected: Instructor+]
 │    ├── PATCH  /:id/status            [Protected: Student+]
 │    └── DELETE /:id                   [Protected: Student+]
 │
 └── /payments
      ├── POST   /                      [Protected: Student+]
      ├── GET    /                      [Protected: All]
      ├── GET    /:id                   [Protected: All]
      ├── PATCH  /:id/status            [Protected: Admin]
      └── GET    /verify/:txnId         [Protected: All]


═══════════════════════════════════════════════════════════════════════════════
                            DEPLOYMENT DIAGRAM
═══════════════════════════════════════════════════════════════════════════════

                         ┌─────────────────┐
                         │   Load Balancer │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ↓             ↓             ↓
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │  Node.js │  │  Node.js │  │  Node.js │
            │ Instance │  │ Instance │  │ Instance │
            │   :3000  │  │   :3000  │  │   :3000  │
            └──────────┘  └──────────┘  └──────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  ↓
                         ┌─────────────────┐
                         │  PostgreSQL     │
                         │  (Neon Cloud)   │
                         └─────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ↓             ↓             ↓
            ┌──────────┐  ┌──────────┐  ┌──────────┐
            │  Email   │  │  Redis   │  │  File    │
            │ Service  │  │  Cache   │  │ Storage  │
            └──────────┘  └──────────┘  └──────────┘


═══════════════════════════════════════════════════════════════════════════════
                              LEGEND
═══════════════════════════════════════════════════════════════════════════════

Symbols:
  ──>   Data flow / Request
  <──   Response
  │     Relationship / Connection
  ↓     Downward flow
  ┌─┐   Component boundary
  
Roles:
  [Public]              No authentication required
  [Protected: All]      Any authenticated user
  [Protected: Student+] Student, Instructor, or Admin
  [Protected: Instructor+] Instructor or Admin
  [Protected: Admin]    Admin only

Status:
  ✅   Implemented and working
  ⚠️   Requires configuration
  ❌   Not implemented
```
