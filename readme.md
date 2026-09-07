# Edu-Matrix Backend

Edu-Matrix Backend is a TypeScript-based Express API for managing educational institutions, departments, students, teachers, courses, and payments. The service supports user authentication, institution approval flows, Google sign-in, Stripe-based course payments, file uploads, and role-based access control.

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- JWT authentication
- Passport.js (Google OAuth)
- Stripe
- Cloudinary
- Nodemailer
- Multer
- Zod validation

## Project Structure

```bash
src/
├── app.ts
├── server.ts
├── app/
│   ├── config/
│   │   ├── index.ts
│   │   └── passport.ts
│   ├── lib/
│   │   ├── cloudinary.ts
│   │   ├── multer.ts
│   │   ├── nodeMailer.ts
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── stripe.ts
│   ├── middlewares/
│   │   ├── auth.ts
│   │   ├── globalErrorHandler.ts
│   │   ├── notFound.ts
│   │   └── validateRequest.ts
│   ├── modules/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── course/
│   │   ├── department/
│   │   ├── institution/
│   │   ├── payment/
│   │   ├── student/
│   │   ├── teacher/
│   │   └── user/
│   ├── templates/
│   ├── types/
│   └── utils/
│       ├── appError.ts
│       ├── catchAsync.ts
│       ├── hashPassword.ts
│       ├── jwt.ts
│       ├── mergeMulterPayload.ts
│       ├── removeUndefined.ts
│       ├── seed.ts
│       ├── sendResponse.ts
│       └── uploadImage.ts
├── generated/
│   └── prisma/
└── prisma/
    ├── migrations/
    └── schema/
```

## Core Features

### 1. Authentication and User Management
- Email/password registration
- Email verification with OTP
- Login with JWT access and refresh tokens stored in cookies
- Google OAuth login
- Role-based authorization (`SUPER_ADMIN`, `INSTITUTION_ADMIN`, `STUDENT`, `TEACHER`)
- User profile photo updates

### 2. Institution Flow
- Institution creation by authenticated users
- Institution approval/rejection by super admins
- Enrollment and joining requests for students and teachers
- Application review workflows

### 3. Department Management
- Department creation per institution
- Department updates and deletions
- Department joining requests
- Review/approval process for memberships

### 4. Courses and Curriculum
- Create courses for a department
- Create course details per semester/batch
- Update course status
- Assign teachers to courses
- Fetch course data based on department and role

### 5. Payment System
- Stripe checkout session creation for course payments
- Payment status tracking
- Stripe webhook event handling
- Student payment history retrieval

### 6. Admin Dashboard
- Platform overview data for super admin

## How the Application Works

The backend starts in [src/server.ts](src/server.ts). On startup it:

1. Connects to PostgreSQL via Prisma
2. Connects to Redis
3. Seeds the default super admin if it does not exist
4. Starts the Express app on the configured port

The main app entry is [src/app.ts](src/app.ts), where Express is configured with:

- CORS
- JSON body parsing
- URL-encoded form parsing
- Cookie parsing
- Passport initialization
- API routing
- Global error handling
- 404 fallback

Middleware is used throughout the project for:

- Authentication and authorization via [src/app/middlewares/auth.ts](src/app/middlewares/auth.ts)
- Request validation via [src/app/middlewares/validateRequest.ts](src/app/middlewares/validateRequest.ts)
- Global error response formatting via [src/app/middlewares/globalErrorHandler.ts](src/app/middlewares/globalErrorHandler.ts)

Prisma models are organized in the [prisma/schema](prisma/schema) directory, and the generated client is used through [src/app/lib/prisma.ts](src/app/lib/prisma.ts).

## Authentication Model

The app uses JWT tokens together with cookies.

- Access token is sent in a cookie named `access_token`
- Refresh token is stored in `refresh_token`
- Protected routes enforce authorization using the `auth(...)` middleware
- User approval status and role are checked before granting access

Example roles:

- `SUPER_ADMIN`
- `INSTITUTION_ADMIN`
- `STUDENT`
- `TEACHER`

## File Uploads and Media

The project supports image uploads and media handling using:

- Multer for local multipart handling
- Cloudinary for image storage
- A helper utility to merge uploaded file payloads into request data

This is used for profile photos, certificates, and related media.

## Database and Schema

The Prisma schema is defined under the [prisma/schema](prisma/schema) folder and includes models for:

- User
- Student
- Teacher
- Institution
- Department
- Course
- CourseDetails
- StudentEnrollment
- TeacherDepartment
- StudentDepartment
- Payment

The project also defines enums for statuses, roles, providers, and payment states.

## Environment Variables

Create a `.env` file in the project root with values like the following:

```env
ENVIRONMENT=development
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://username:password@host:port/database
BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET=your-access-secret
JWT_ACCESS_TIME=1d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_TIME=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password
REDIS_HOST=localhost
REDIS_PORT=6379
EMAIL_SENDER=your-email@example.com
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_CB_URL=http://localhost:5000/api/v1/auth/google/callback
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-google-refresh-token
SUPER_ADMIN_NAME=Super Admin
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=your-password
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## Setup Instructions

### Install dependencies

```bash
npm install
```

### Generate Prisma client

```bash
npx prisma generate
```

### Run database migrations

```bash
npx prisma migrate dev
```

### Start the app in development mode

```bash
npm run dev
```

### Build the project

```bash
npm run build
```

### Start production build

```bash
npm start
```

## API Overview

All APIs are prefixed with `/api/v1`.

### 1. Auth Routes

Base path: `/api/v1/auth`

- `POST /register`  
  Register a new user and send an email OTP for verification.

- `POST /verify-email`  
  Verify the OTP and complete registration.

- `POST /login`  
  Log in with email and password.

- `GET /google`  
  Start Google OAuth login flow.

- `GET /google/callback`  
  Handle Google OAuth callback and issue JWT tokens.

---

### 2. User Routes

Base path: `/api/v1/user`

- `PATCH /update-profile-picture`  
  Upload and update the authenticated user profile picture.

---

### 3. Student Routes

Base path: `/api/v1/student`

- `PATCH /profile-update`  
  Update student profile information.

---

### 4. Teacher Routes

Base path: `/api/v1/teacher`

- `PATCH /profile-update`  
  Update teacher profile and certificate details.

- `GET /`  
  Get list of teachers for the institution admin.

---

### 5. Institution Routes

Base path: `/api/v1/institution`

- `POST /create-institution`  
  Create a new institution record.

- `GET /institution-applications`  
  Fetch all institution applications for super admins.

- `PATCH /institution-application-review`  
  Approve or reject an institution application.

- `POST /apply-for-institution`  
  Submit an application to join or create an institutional relationship.

- `GET /joining-applications`  
  Fetch pending join applications for institution admins.

- `PATCH /joining-application-review`  
  Approve or reject a user application to join an institution.

---

### 6. Department Routes

Base path: `/api/v1/department`

- `GET /departments`  
  Fetch departments available to the current user context.

- `POST /create`  
  Create a department under an institution.

- `PATCH /update`  
  Update department details.

- `DELETE /delete`  
  Delete a department.

- `POST /join`  
  Send a join request to a department.

- `PATCH /review-request`  
  Review and approve or reject department membership requests.

---

### 7. Course Routes

Base path: `/api/v1/course`

- `GET /courses/:departmentId`  
  Get courses in a specific department.

- `POST /create`  
  Create a new course.

- `POST /create-details`  
  Create course details such as batch, semester, dates, and pricing.

- `PATCH /update-details`  
  Update existing course detail information.

- `PATCH /update-status`  
  Change the course status.

- `PATCH /assign-teacher`  
  Assign a teacher to a course.

---

### 8. Payment Routes

Base path: `/api/v1/payment`

- `POST /create-stripe-checkout-session`  
  Create a Stripe checkout session for students to pay for a course.

- `POST /webhook`  
  Receive Stripe webhook events and update payment records.

- `GET /`  
  Get payment history for the authenticated student.

---

### 9. Admin Routes

Base path: `/api/v1/admin`

- `GET /overview`  
  Get a summary of platform data for the super admin dashboard.

---

### 10. Health Check

- `GET /`  
  Returns a basic server status JSON response.

## Security Notes

- JWT tokens are validated using middleware before protected routes are accessed
- Role-based checks prevent unauthorized access
- Payment webhook endpoint is mounted with raw JSON parsing required by Stripe
- Sensitive credentials are stored in environment variables

## License

This project is for educational and internal use unless otherwise specified by the project owner.
