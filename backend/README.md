# JeetMantra Backend API

A comprehensive Node.js/Express backend for the JeetMantra learning platform with Supabase PostgreSQL database integration.

## Features

- ✅ User Authentication (JWT)
- ✅ Role-based Access Control (Student, Teacher, Partner, Admin)
- ✅ Course Management
- ✅ Enrollment System
- ✅ Attendance Tracking
- ✅ Payment Processing
- ✅ Dashboard Analytics
- ✅ Webhook Integration
- ✅ Admin Panel

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT
- **Validation:** Joi
- **Security:** bcryptjs

## Installation

### 1. Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### 2. Clone and Setup

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

PORT=5000
NODE_ENV=development

JWT_SECRET=your_jwt_secret_key_here

SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=noreply@jeetmantra.com

FRONTEND_URL=http://localhost:3000

N8N_WEBHOOK_URL=https://work.mantravat.cloud/webhook/jeetmantra
```

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. In Project Settings → API, copy:
   - **API URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## Database Setup

### 1. Create Tables in Supabase

Copy the SQL from `database/schema.sql` and run it in Supabase SQL editor:

1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Click "New Query"
4. Paste the content of `database/schema.sql`
5. Click "Run"

### 2. Enable Row Level Security (RLS)

For production, enable RLS on tables:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
-- ... and other tables
```

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

Server will run on `http://localhost:5000`

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics

### Courses
- `GET /api/courses` - List courses (with pagination, filtering)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (teacher only)
- `PUT /api/courses/:id` - Update course (teacher only)
- `DELETE /api/courses/:id` - Delete course (teacher only)

### Enrollments
- `GET /api/enrollments/my` - Get my enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/course/:courseId/students` - Get course students (teacher only)
- `DELETE /api/enrollments/:enrollmentId` - Cancel enrollment

### Dashboard
- `GET /api/dashboard` - Get role-specific dashboard data

### Attendance
- `POST /api/attendance` - Record attendance (teacher only)
- `GET /api/attendance/student/:studentId` - Get student attendance
- `GET /api/attendance/course/:courseId` - Get course attendance

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments/my` - Get payment history
- `POST /api/payments/webhook/payment` - Payment webhook

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:userId/toggle-status` - Block/unblock user
- `GET /api/admin/stats` - Get platform statistics

### Webhooks
- `POST /api/webhooks` - Unified webhook endpoint

## Example Requests

### Sign Up

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123",
    "fullName": "John Doe",
    "role": "student",
    "phone": "+91-9876543210"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123"
  }'
```

### Create Course

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Basics",
    "description": "Learn Python programming",
    "category": "Programming",
    "level": "beginner",
    "price": 4999,
    "startDate": "2024-06-01",
    "endDate": "2024-07-01",
    "maxStudents": 30,
    "batchTiming": "6:00 PM - 7:00 PM IST"
  }'
```

### Enroll in Course

```bash
curl -X POST http://localhost:5000/api/enrollments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course-uuid-here"
  }'
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error message here",
  "details": []
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Security

- Passwords are hashed using bcryptjs (10 rounds)
- JWT tokens expire after 24 hours
- Supabase handles encryption at rest
- Enable Row Level Security in production
- CORS is configured for frontend domain

## Performance

- Database indexes on frequently queried fields
- Pagination support for list endpoints
- Efficient queries with selective fields

## Monitoring

Check server health:

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-05-14T10:30:00.000Z",
  "environment": "development"
}
```

## Troubleshooting

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Check if Supabase project is active
- Ensure database schema is created

### Authentication Issues
- Verify JWT_SECRET is set in `.env`
- Check token expiration (24 hours)
- Clear browser cache and retry

### CORS Issues
- Update FRONTEND_URL in `.env`
- Ensure frontend domain matches

## Support

For issues or questions, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Documentation](https://expressjs.com)
- Project documentation in root folder

## License

ISC
