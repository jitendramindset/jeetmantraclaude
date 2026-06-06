# 📊 JeetMantra - Data Models & Database Schema

**Complete guide to all data structures in the platform**

---

## 🎯 Overview

JeetMantra captures data for three user roles across an integrated education and earning ecosystem. All data flows through webhooks to n8n workflows, which validate with Claude MCP, then store in PostgreSQL.

---

## 👥 User Models

### Core User Record
```typescript
User {
  id: UUID                          // Primary key
  full_name: string                 // Required
  email: string                     // Unique, required
  phone: string                     // Optional, e.g., "+91-9876543210"
  password_hash: string             // Hashed only, never plaintext
  user_type: enum                   // 'student' | 'teacher' | 'partner' | 'admin'
  status: enum                      // 'active' | 'blocked' | 'deleted'
  email_verified: boolean           // Default: false
  email_verified_at: timestamp      // When email was verified
  ai_provider: string               // 'claude' | 'openai' | 'gemini' | 'openrouter'
  api_key_encrypted: string         // Encrypted, never returned in responses
  profile_picture_url: string       // Avatar/profile image
  bio: text                         // Short bio/about section
  created_at: timestamp             // Account creation time
  updated_at: timestamp             // Last profile update
  deleted_at: timestamp             // Soft delete timestamp (null if active)
}
```

**Indexes:**
- email (unique, for login)
- status (for admin queries)
- user_type (for role-based operations)
- created_at (for analytics)

**Example Student User:**
```json
{
  "id": "user_2026-05-14-abc123",
  "full_name": "Arjun Sharma",
  "email": "arjun@example.com",
  "phone": "+91-9876543210",
  "password_hash": "$2b$12$...",
  "user_type": "student",
  "status": "active",
  "email_verified": true,
  "email_verified_at": "2026-05-14T10:30:00Z",
  "ai_provider": "gemini",
  "profile_picture_url": "https://cdn.example.com/avatar_123.jpg",
  "bio": "Aspiring engineer, learning full-stack development",
  "created_at": "2026-05-14T10:00:00Z",
  "updated_at": "2026-05-14T10:30:00Z",
  "deleted_at": null
}
```

---

## 👤 Student Profile

### Captured During Signup
```typescript
StudentProfile {
  id: UUID
  user_id: UUID (FK → users)
  user_type: enum = 'student'    // Always 'student'
  academic_level: string         // "Class 7", "Class 12", "JEE", "NEET", "CA"
  interest_area: string          // "Science", "Commerce", "Coding", "Arts"
  // Additional fields captured via skills table (see below)
}
```

**Example:**
```json
{
  "id": "profile_123",
  "user_id": "user_123",
  "user_type": "student",
  "academic_level": "Class 12 (Science)",
  "interest_area": "Coding & AI"
}
```

### Related Skills Data
```typescript
UserSkill {
  id: UUID
  user_id: UUID (FK → users)
  skill_name: string              // "Python", "Web Design", "Content Writing"
  proficiency_level: enum         // 'beginner' | 'intermediate' | 'advanced' | 'expert'
  created_at: timestamp
}
```

**Example:** Student "Arjun" has skills:
```json
[
  { "skill_name": "Python", "proficiency_level": "intermediate" },
  { "skill_name": "Web Development", "proficiency_level": "beginner" },
  { "skill_name": "Data Science", "proficiency_level": "beginner" }
]
```

---

## 🧑‍🏫 Teacher Profile

### Captured During Signup
```typescript
TeacherProfile {
  id: UUID
  user_id: UUID (FK → users)
  user_type: enum = 'teacher'    // Always 'teacher'
  qualification: string          // "B.Tech", "M.Tech", "MBA", "BCA"
  experience_years: int          // Years of teaching experience
  institution: string            // "IIT Delhi", "DPS School", "Self-employed"
  // Courses taught tracked in courses table
}
```

**Example:**
```json
{
  "id": "profile_456",
  "user_id": "teacher_user_456",
  "user_type": "teacher",
  "qualification": "M.Tech Computer Science (IIT Delhi)",
  "experience_years": 5,
  "institution": "Self-employed"
}
```

### Teacher Skills (optional)
Teachers also have UserSkill records for their teaching expertise:
```json
[
  { "skill_name": "Python", "proficiency_level": "expert" },
  { "skill_name": "Web Development", "proficiency_level": "advanced" },
  { "skill_name": "Competitive Coding", "proficiency_level": "advanced" }
]
```

---

## 🤝 Partner Profile

### Captured During Signup
```typescript
PartnerProfile {
  id: UUID
  user_id: UUID (FK → users)
  user_type: enum = 'partner'    // Always 'partner'
  service_category: string       // "Sports", "AI", "Coding", "Arts", "Fitness"
  hourly_rate: decimal(10,2)     // Pricing in INR, e.g., 500.00
}
```

**Example:**
```json
{
  "id": "profile_789",
  "user_id": "partner_user_789",
  "user_type": "partner",
  "service_category": "Sports - Cricket Coaching",
  "hourly_rate": 1000.00
}
```

---

## 📚 Course Model

### Course Record
```typescript
Course {
  id: UUID (PK)
  teacher_id: UUID (FK → users)   // Teacher who created course
  title: string                    // "Python Basics for Beginners"
  description: longtext            // Full course description
  category: string                 // "Programming", "Math", "Sports", "Arts"
  price: decimal(10,2)             // Price in INR, e.g., 2999.00
  duration_hours: int              // Estimated hours to complete
  level: enum                      // 'beginner' | 'intermediate' | 'advanced'
  status: enum                     // 'draft' | 'active' | 'archived'
  max_students: int                // Capacity limit
  enrolled_count: int              // Current enrollment (calculated)
  rating: decimal(3,1)             // Average rating (0.0 - 5.0)
  rating_count: int                // Number of ratings
  created_at: timestamp
  updated_at: timestamp
  published_at: timestamp          // When course went live
}
```

**Example:**
```json
{
  "id": "course_123",
  "teacher_id": "teacher_456",
  "title": "Python for Data Science - Complete Bootcamp",
  "description": "Learn Python programming from scratch. Covers basics, OOP, pandas, numpy, matplotlib...",
  "category": "Programming",
  "price": 2999.00,
  "duration_hours": 40,
  "level": "beginner",
  "status": "active",
  "max_students": 100,
  "enrolled_count": 47,
  "rating": 4.8,
  "rating_count": 23,
  "created_at": "2026-04-01T12:00:00Z",
  "updated_at": "2026-05-10T08:30:00Z",
  "published_at": "2026-04-05T10:00:00Z"
}
```

### Course Module (Course Curriculum)
```typescript
CourseModule {
  id: UUID
  course_id: UUID (FK → courses)
  title: string                    // "Module 1: Python Fundamentals"
  description: longtext            // Module description
  module_order: int                // Display order (1, 2, 3...)
  duration_hours: int              // Estimated time for this module
  created_at: timestamp
  updated_at: timestamp
}
```

**Example:**
```json
{
  "id": "module_1",
  "course_id": "course_123",
  "title": "Module 1: Python Fundamentals",
  "description": "Introduction to Python, syntax, variables, data types",
  "module_order": 1,
  "duration_hours": 8,
  "created_at": "2026-04-01T12:00:00Z"
}
```

### Course Lesson
```typescript
CourseLesson {
  id: UUID
  module_id: UUID (FK → modules)
  course_id: UUID (FK → courses)   // For quick reference
  title: string                    // "Setting up Python environment"
  content: longtext                // Lesson content/transcript
  video_url: string                // YouTube, Vimeo, etc.
  duration_minutes: int            // Video length or estimated read time
  lesson_order: int                // Order within module (1, 2, 3...)
  created_at: timestamp
  updated_at: timestamp
}
```

**Example:**
```json
{
  "id": "lesson_1_1",
  "module_id": "module_1",
  "course_id": "course_123",
  "title": "Lesson 1.1: Installing Python & IDE Setup",
  "content": "# Installing Python\n\n1. Download from python.org\n2. Run installer...",
  "video_url": "https://youtube.com/watch?v=...",
  "duration_minutes": 15,
  "lesson_order": 1,
  "created_at": "2026-04-01T12:00:00Z"
}
```

---

## 📝 Enrollment Model

### Enrollment Record
```typescript
Enrollment {
  id: UUID
  course_id: UUID (FK → courses)
  student_id: UUID (FK → users)
  enrollment_date: timestamp       // When student signed up
  start_date: timestamp            // When student started course
  completion_date: timestamp       // When student completed (null if ongoing)
  progress_percentage: int         // 0-100%
  status: enum                     // 'active' | 'completed' | 'dropped'
  amount_paid: decimal(10,2)       // How much student paid
  payment_method: string           // "credit_card", "upi", "bank_transfer"
  payment_id: string               // External payment gateway ID
  created_at: timestamp
  updated_at: timestamp
  UNIQUE(course_id, student_id)    // One enrollment per student per course
}
```

**Example:**
```json
{
  "id": "enroll_123",
  "course_id": "course_123",
  "student_id": "user_123",
  "enrollment_date": "2026-05-01T10:00:00Z",
  "start_date": "2026-05-02T14:00:00Z",
  "completion_date": null,
  "progress_percentage": 35,
  "status": "active",
  "amount_paid": 2999.00,
  "payment_method": "upi",
  "payment_id": "PAY_2026_123_45678",
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-05-13T09:30:00Z"
}
```

---

## 📍 Progress Tracking

### Lesson Progress
```typescript
LessonProgress {
  id: UUID
  enrollment_id: UUID (FK → enrollments)
  lesson_id: UUID (FK → lessons)
  student_id: UUID (FK → users)
  status: enum                     // 'not_started' | 'in_progress' | 'completed'
  completed_at: timestamp          // When lesson was completed
  created_at: timestamp
  updated_at: timestamp
  UNIQUE(enrollment_id, lesson_id) // One progress record per student per lesson
}
```

**Example - Student progress on lessons:**
```json
[
  {
    "lesson_id": "lesson_1_1",
    "status": "completed",
    "completed_at": "2026-05-02T15:30:00Z"
  },
  {
    "lesson_id": "lesson_1_2",
    "status": "in_progress",
    "completed_at": null
  },
  {
    "lesson_id": "lesson_1_3",
    "status": "not_started",
    "completed_at": null
  }
]
```

### Attendance
```typescript
Attendance {
  id: UUID
  course_id: UUID (FK → courses)
  enrollment_id: UUID (FK → enrollments)
  student_id: UUID (FK → users)
  class_date: date                 // Date of class
  status: enum                     // 'present' | 'absent' | 'excused'
  created_at: timestamp
  UNIQUE(enrollment_id, class_date) // One attendance per student per day
}
```

**Example:**
```json
[
  {
    "class_date": "2026-05-01",
    "status": "present"
  },
  {
    "class_date": "2026-05-02",
    "status": "present"
  },
  {
    "class_date": "2026-05-03",
    "status": "absent"
  }
]
```

---

## 📋 Assignment Model

### Assignment
```typescript
Assignment {
  id: UUID
  course_id: UUID (FK → courses)
  lesson_id: UUID (FK → lessons)   // Optional - links to specific lesson
  title: string                    // "Assignment 1: Simple Calculator"
  description: longtext            // Full assignment description
  due_date: timestamp              // When it's due
  max_score: int                   // Out of 100
  created_by: UUID (FK → users)   // Teacher who created
  created_at: timestamp
  updated_at: timestamp
}
```

**Example:**
```json
{
  "id": "assign_1",
  "course_id": "course_123",
  "lesson_id": "lesson_1_5",
  "title": "Create a Simple Python Calculator",
  "description": "Build a calculator that can add, subtract, multiply, divide two numbers",
  "due_date": "2026-05-20T23:59:59Z",
  "max_score": 100,
  "created_by": "teacher_456",
  "created_at": "2026-05-10T12:00:00Z"
}
```

### Assignment Submission
```typescript
AssignmentSubmission {
  id: UUID
  assignment_id: UUID (FK → assignments)
  student_id: UUID (FK → users)
  submission_text: longtext        // Markdown code or text
  file_url: string                 // Uploaded file (GitHub link, etc.)
  submitted_at: timestamp          // When submitted
  graded_at: timestamp             // When graded (null if pending)
  score: int                       // Points earned
  feedback: longtext               // Teacher feedback
  status: enum                     // 'submitted' | 'grading' | 'graded'
  created_at: timestamp
  UNIQUE(assignment_id, student_id) // One submission per student per assignment
}
```

**Example:**
```json
{
  "id": "submit_1",
  "assignment_id": "assign_1",
  "student_id": "user_123",
  "submission_text": "```python\ndef add(a, b):\n    return a + b\n```",
  "file_url": "https://github.com/student/calculator/blob/main/main.py",
  "submitted_at": "2026-05-15T18:30:00Z",
  "graded_at": "2026-05-16T10:00:00Z",
  "score": 95,
  "feedback": "Excellent implementation! Minor: Add docstrings.",
  "status": "graded",
  "created_at": "2026-05-15T18:30:00Z"
}
```

---

## 💰 Payment Model

### Payment Record
```typescript
Payment {
  id: UUID
  user_id: UUID (FK → users)       // Who paid
  enrollment_id: UUID (FK → enrollments) // For which course (optional)
  amount: decimal(10,2)            // Amount in INR
  currency: string = 'INR'         // Always INR for now
  payment_method: string           // "credit_card", "debit_card", "upi", "bank_transfer"
  payment_gateway: string          // "razorpay", "stripe", "paypal"
  transaction_id: string           // External gateway ID (unique)
  status: enum                     // 'pending' | 'success' | 'failed' | 'refunded'
  description: text                // "Course enrollment: Python Basics"
  created_at: timestamp
  updated_at: timestamp
}
```

**Example:**
```json
{
  "id": "payment_123",
  "user_id": "user_123",
  "enrollment_id": "enroll_123",
  "amount": 2999.00,
  "currency": "INR",
  "payment_method": "upi",
  "payment_gateway": "razorpay",
  "transaction_id": "pay_1234567890",
  "status": "success",
  "description": "Course enrollment: Python for Data Science",
  "created_at": "2026-05-01T10:00:00Z",
  "updated_at": "2026-05-01T10:05:00Z"
}
```

---

## ⭐ Feedback & Review

### Feedback Record
```typescript
Feedback {
  id: UUID
  course_id: UUID (FK → courses)
  student_id: UUID (FK → users)
  rating: int                      // 1-5 stars
  review_text: longtext            // Student's review
  submitted_at: timestamp
  created_at: timestamp
}
```

**Example:**
```json
{
  "id": "feedback_1",
  "course_id": "course_123",
  "student_id": "user_123",
  "rating": 5,
  "review_text": "Excellent course! The instructor explains concepts very clearly. Highly recommended for beginners.",
  "submitted_at": "2026-05-13T18:00:00Z",
  "created_at": "2026-05-13T18:00:00Z"
}
```

---

## 🔑 Email Verification

### Email Verification Record
```typescript
EmailVerification {
  id: UUID
  user_id: UUID (FK → users)
  email: string                    // Email being verified
  token: string                    // Unique verification token (unique)
  expires_at: timestamp            // When token expires (usually 24 hours)
  verified_at: timestamp           // When email was verified (null if pending)
  created_at: timestamp
}
```

**Example (before verification):**
```json
{
  "id": "verify_1",
  "user_id": "user_123",
  "email": "arjun@example.com",
  "token": "verify_abc123xyz789...",
  "expires_at": "2026-05-15T10:00:00Z",
  "verified_at": null,
  "created_at": "2026-05-14T10:00:00Z"
}
```

**After verification, `verified_at` is set:**
```json
{
  "verified_at": "2026-05-14T10:30:00Z"
}
```

---

## 🔗 Relationship Diagram

```
jeetmantra_users (Core)
├── 1:1 → jeetmantra_user_profiles (Student/Teacher/Partner specific)
├── 1:N → jeetmantra_user_skills (Multiple skills)
├── 1:N → jeetmantra_courses (Teacher creates courses)
├── 1:N → jeetmantra_enrollments (Student enrolls in courses)
├── 1:N → jeetmantra_payments (Multiple transactions)
├── 1:N → jeetmantra_feedback (Multiple reviews)
├── 1:N → jeetmantra_email_verifications (Email verification tokens)
└── 1:N → jeetmantra_assignment_submissions (Student submissions)

jeetmantra_courses
├── 1:N → jeetmantra_course_modules (Multiple modules)
├── 1:N → jeetmantra_course_lessons (Multiple lessons)
├── 1:N → jeetmantra_enrollments (Multiple students)
├── 1:N → jeetmantra_assignments (Multiple assignments)
├── 1:N → jeetmantra_attendance (Multiple attendance records)
└── 1:N → jeetmantra_feedback (Multiple reviews)

jeetmantra_course_modules
└── 1:N → jeetmantra_course_lessons (Lessons in module)

jeetmantra_enrollments
├── 1:N → jeetmantra_lesson_progress (Student progress per lesson)
└── 1:N → jeetmantra_attendance (Attendance records)

jeetmantra_assignments
├── 1:N → jeetmantra_assignment_submissions (Multiple submissions)
└── 1:1 → jeetmantra_course_lessons (Optional link)
```

---

## 📊 Data Volume Estimates

| Table | Typical Volume | Growth |
|-------|---|---|
| users | 1,000 - 10,000 | +5% monthly |
| user_profiles | 1,000 - 10,000 | Same as users |
| user_skills | 2,000 - 20,000 | +6% monthly |
| courses | 100 - 500 | +3% monthly |
| course_modules | 500 - 2,500 | +3% monthly |
| course_lessons | 5,000 - 20,000 | +3% monthly |
| enrollments | 5,000 - 50,000 | +8% monthly |
| lesson_progress | 50,000 - 500,000 | +8% monthly |
| assignments | 200 - 1,000 | +3% monthly |
| assignment_submissions | 10,000 - 100,000 | +8% monthly |
| payments | 5,000 - 50,000 | +7% monthly |
| feedback | 1,000 - 10,000 | +8% monthly |
| attendance | 50,000 - 500,000 | +8% monthly |

---

## 🔒 Security Considerations

### Encrypted Fields
- `password_hash` - Never store plaintext, always hash with bcrypt/argon2
- `api_key_encrypted` - User's optional Claude API key, encrypted with AES-256

### Access Control
- `teacher_id` in courses - Only teacher can edit their course
- `student_id` in enrollments - Only student can view their enrollment
- `admin` role - Can access any data

### Sensitive Data Handling
- Never return `password_hash` to frontend
- Never return `api_key_encrypted` unencrypted to frontend
- Log access to sensitive fields
- Implement rate limiting on login attempts

---

## 📈 Query Patterns

### Common Queries

**Get student's dashboard stats:**
```sql
SELECT 
  COUNT(e.id) as total_courses,
  COUNT(CASE WHEN e.status='active' THEN 1 END) as active_courses,
  SUM(lp.status='completed') as lessons_completed,
  AVG(e.progress_percentage) as avg_progress,
  SUM(CASE WHEN a.status='present' THEN 1 END) as attendance_count
FROM users u
LEFT JOIN enrollments e ON u.id = e.student_id
LEFT JOIN lesson_progress lp ON e.id = lp.enrollment_id
LEFT JOIN attendance a ON e.id = a.enrollment_id
WHERE u.id = ?;
```

**Get teacher's course analytics:**
```sql
SELECT 
  c.title,
  COUNT(e.id) as enrolled_students,
  AVG(e.progress_percentage) as avg_progress,
  AVG(f.rating) as avg_rating,
  SUM(CASE WHEN f.rating >= 4 THEN 1 END) as positive_reviews
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
LEFT JOIN feedback f ON c.id = f.course_id
WHERE c.teacher_id = ?
GROUP BY c.id;
```

---

## ✅ Data Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| email | Must be valid email format | valid@example.com |
| password | Min 8 chars, must have upper/lower/number/special | Secure@123 |
| price | Must be >= 0, max 999999.99 | 2999.00 |
| progress_percentage | Must be 0-100 | 50 |
| rating | Must be 1-5 | 4 |
| duration_hours | Must be > 0 | 40 |
| module_order | Must be unique within course | 1, 2, 3 |

---

**Last Updated:** May 14, 2026 | **For:** JeetMantra Development Team
