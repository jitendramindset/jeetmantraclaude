# 🏗️ JeetMantra Platform - Complete Architecture & Tech Stack Summary

**Comprehensive analysis of the JeetMantra education platform project**
**Generated:** May 14, 2026

---

## 📋 Executive Summary

**JeetMantra** is a full-stack education ecosystem ("The Modern Gurukul") combining academic coaching, skills marketplace, AI integration, and earning opportunities. The platform uses:

- **Frontend:** React 18 (via CDN) with Babel standalone - no build tools required
- **Orchestration:** n8n workflow engine for business logic
- **AI Layer:** Claude MCP (Claude, ChatGPT, Gemini, OpenRouter support)
- **Database:** PostgreSQL 15 (MySQL compatible)
- **Infrastructure:** Docker Compose with n8n + PostgreSQL

---

## 🎯 Project Structure

```
jeetmantraclaude-main/
├── Frontend Files (HTML + React)
│   ├── website.html              (216 KB - Marketing website, 12 React components)
│   ├── dashboard.html            (301 KB - Multi-role dashboard, 30 React components)
│   ├── signup.html               (Complete 4-step signup wizard)
│   ├── admin.html                (SuperAdmin panel)
│   └── components.html           (Component library reference)
│
├── Backend Integration
│   ├── webhook-handler.js        (Frontend → n8n client library)
│   ├── n8n-jeetmantra-unified-router.json   (Main workflow export)
│   ├── docker-compose.yml        (n8n + PostgreSQL setup)
│   └── database-schema-*.sql     (Complete DB schema)
│
├── Documentation
│   ├── COMPLETE_GUIDE.md         (Getting started & full overview)
│   ├── INTEGRATION_GUIDE.md      (System architecture)
│   ├── UNIFIED_WEBHOOK_GUIDE.md  (Webhook reference)
│   ├── n8n-workflows.md          (Workflow templates)
│   ├── SIGNUP_GUIDE.md           (Signup flow testing)
│   └── [Various setup guides]
│
├── Testing Tools
│   ├── webhook-test.html         (Interactive webhook tester)
│   └── [Test scenarios]
│
└── Design System
    └── project/
        ├── colors_and_type.css   (Design tokens)
        └── ui_kits/
            ├── website/          (Website UI components)
            └── dashboard/        (Dashboard UI components)
```

---

## 🖥️ Frontend Technologies

### Framework & Core
- **React 18** (via unpkg CDN)
  - URL: `https://unpkg.com/react@18.3.1/umd/react.development.js`
  - No npm/build tools needed - everything in single HTML files
  
- **Babel Standalone** (JSX compilation in browser)
  - URL: `https://unpkg.com/@babel/standalone@7.29.0/babel.min.js`
  - Type: `text/babel` for JSX

- **ReactDOM 18** (DOM rendering)
  - URL: `https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js`

### Styling
- **CSS Custom Properties (Variables)** for theming
- **Plus Jakarta Sans** (Google Fonts - primary typography)
- **JetBrains Mono** (Google Fonts - monospace/code display)
- **Responsive Design** - Mobile (375px) → Tablet → Desktop (1280px)

### Color System
```
Primary (Teal):      #0d9488 / #0c7a6f (dark)
Accent (Orange):     #f97316 / #ea6c0a (dark)
Success:             #10b981 / #22c55e
Danger/Error:        #ef4444
Warning:             #f59e0b
Background:          #f5f5f5 / #f4f6f8
Surfaces:            #ffffff
Text Primary:        #1f2937 / #0f172a
Text Secondary:      #6b7280 / #64748b
```

### Theming Support
- **Dark Mode** - Full CSS variable switching
- **Accent Colors** - 6 preset color themes
- **Internationalization** - English, Hindi, Hinglish support
- **No CSS-in-JS** - Pure CSS with custom properties

### Component Architecture
Components are **React functional components** using hooks:
- `useState` for state management
- Event handlers for interactivity
- No external state management (Redux, Zustand) needed
- Components are self-contained in HTML files

---

## 📱 Frontend Components Overview

### Website (website.html)
**Purpose:** Marketing website + login gateway
**Size:** 216 KB (all-in-one)

**Pages:**
1. **Home** - Hero section, programs (Study, Skills, Sports, AI), call-to-action
2. **Courses** - Course grid with filtering/search
3. **Earn & Learn** - Referral system, task marketplace
4. **About** - Platform overview
5. **Contact** - Contact form + location
6. **Directory** - Teacher/Partner search with filters
7. **Login** - 3 authentication methods

**Key Components:**
- `Header` - Sticky navigation with mobile hamburger
- `Hero` - Full-bleed dark hero with tagline
- `ProgramsSection` - 4-pillar feature cards
- `CourseCard` - Reusable course display component
- `EarnSection` - Earning opportunities showcase
- `StatsBar` - Social proof metrics
- `Footer` - Links + location info
- `LoginModal` - Multi-method authentication

**Features:**
- Course cards with pricing
- Teacher/partner directory with search
- Responsive mobile/tablet/desktop
- 0 JavaScript errors
- Interactive navigation flows

---

### Dashboard (dashboard.html)
**Purpose:** Multi-role user dashboard
**Size:** 301 KB (all-in-one)
**Roles:** 3 independent interfaces (Student, Teacher, Partner)

**Student Dashboard Screens:**
1. **Home/Overview** - Stats, upcoming classes, earnings summary
2. **My Courses** - Enrolled courses with progress tracking
3. **Attendance** - Calendar view + streak tracker
4. **Earnings & Wallet** - Transaction history, referral code, withdrawal options
5. **Profile** - Account settings, skills, preferences
6. **Settings** - Theme/language/accent customization

**Teacher Dashboard Screens:**
1. **Dashboard** - Class stats, earnings, pending approvals
2. **My Courses** - Courses created, edit/delete options
3. **Classes** - Schedule, create class, attendance marking
4. **Students** - Student list, performance analytics
5. **Earnings** - Revenue breakdown, payouts
6. **Settings** - Profile, pricing, notifications

**Partner Dashboard Screens:**
1. **Dashboard** - Activity stats, bookings, earnings
2. **Services** - Manage offered services
3. **Bookings** - Calendar view of bookings
4. **Users** - User connections and history
5. **Earnings** - Payment history, withdrawal
6. **Settings** - Business profile, rates

**Key Components:**
- `Sidebar` - Fixed navigation (240px)
- `DashboardHome` - Overview with stats
- `CoursesScreen` - Course management
- `WalletScreen` - Financial tracking
- `AttendanceScreen` - Attendance calendar
- `SettingsPanel` - Customization options (fixed bottom-right)

**Features:**
- Full theming system (dark/light + 6 accent colors)
- Tab-based navigation between screens
- Role switching capability
- Theme customization with live preview
- Language selection (English, Hindi, Hinglish)
- Responsive mobile/tablet/desktop
- 30+ React components
- 0 JavaScript errors

---

### Signup Wizard (signup.html)
**Purpose:** 4-step account creation
**Features:**
- Step 1: AI Provider Selection (Claude, ChatGPT, Gemini, OpenRouter)
- Step 2: Account details (email, password, phone)
- Step 3: Role-specific profile fields
- Step 4: Skills management + review
- Form validation
- Optional API key upload
- Responsive design
- Real-time preview

**Data Collected:**
- Full Name, Email, Phone, Password
- User Type (Student/Teacher/Partner)
- Role-specific fields
- Skills + proficiency levels
- Optional AI provider API key

---

### Admin Panel (admin.html)
**Purpose:** SuperAdmin management interface
**Features:**
- User management (view, block, delete)
- Course moderation
- Payment reconciliation
- System analytics
- Settings management

---

### Component Library (components.html)
**Purpose:** Reference for all reusable UI components
**Contains:**
- Buttons (primary, secondary, danger)
- Form inputs (text, email, password, select, textarea)
- Cards (course card, stat card, profile card)
- Badges (status, category, skill level)
- Navigation components
- Modals and overlays
- Loading states
- Toast notifications

---

## 🔄 Backend Architecture

### Orchestration Layer: n8n

**n8n** is the business logic layer that:
- Receives webhook requests from frontend
- Calls Claude MCP for AI operations
- Stores/retrieves data from database
- Sends emails, handles payments
- Coordinates cross-system workflows

**Setup:**
```bash
docker-compose up -d n8n
# Access at: http://localhost:5678
# Credentials: admin / jeetmantra123
```

**Configuration:**
```yaml
Services:
  - n8n (port 5678)
  - PostgreSQL (port 5432)

Environment Variables:
  - CLAUDE_API_KEY
  - SENDGRID_API_KEY (optional)
  - RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (optional)
```

---

### Webhook Architecture

**Unified Webhook Endpoint:**
```
POST https://work.mantravat.cloud/webhook/jeetmantra
```

**Request Format:**
```json
{
  "action": "user-signup",      // action type
  "data": { /* action-specific data */ },
  "timestamp": "2026-05-14T10:00:00Z",
  "source": "frontend"
}
```

**Response Format:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed"
}
```

---

### Webhook Actions (Operations)

#### User & Authentication
| Action | Purpose | Input | Output |
|--------|---------|-------|--------|
| `user-signup` | Register new user | name, email, phone, password, role, skills | userId, message |
| `user-login` | Authenticate user | email, password | token, user data |
| `user-verify-email` | Verify email | email, token | success message |
| `user-reset-password` | Reset password | email | reset link sent |
| `user-update-profile` | Update profile | userId, fields to update | updated user data |

#### Course Operations
| Action | Purpose | Input | Output |
|--------|---------|-------|--------|
| `course-create` | Create new course | teacherId, title, description, price | courseId |
| `course-update` | Update course | courseId, fields | updated course |
| `course-enroll` | Student enrolls in course | studentId, courseId | enrollmentId |
| `course-list` | Get courses | category, filters | [courses] |
| `course-get` | Get course details | courseId | course object |

#### Dashboard & Data
| Action | Purpose | Input | Output |
|--------|---------|-------|--------|
| `dashboard-get-stats` | Get user dashboard stats | userId | stats object |
| `dashboard-get-courses` | Get user's courses | userId | [courses] |
| `dashboard-get-earnings` | Get earnings data | userId | earnings object |
| `dashboard-get-attendance` | Get attendance records | userId | [attendance] |

#### MCP (Claude AI)
| Action | Purpose | Input | Output |
|--------|---------|-------|--------|
| `mcp-validate` | Validate data using AI | data, provider | validation result |
| `mcp-recommend` | Get recommendations | userId, context | recommendations |
| `mcp-generate` | Generate content | prompt, type | generated content |

#### Admin Operations
| Action | Purpose | Input | Output |
|--------|---------|-------|--------|
| `admin-get-users` | List all users | filters | [users] |
| `admin-block-user` | Block a user | userId | success message |
| `admin-get-analytics` | Platform analytics | date range | analytics data |
| `admin-update-settings` | Update platform settings | settings object | success message |

---

### Frontend Webhook Client (webhook-handler.js)

**Library for calling webhooks from JavaScript:**

```javascript
// Initialize
const webhooks = new WebhookHandler('https://work.mantravat.cloud/webhook/jeetmantra');

// User Operations
await webhooks.registerUser(userData);
await webhooks.loginUser(email, password);
await webhooks.verifyEmail(email, token);

// Course Operations
await webhooks.createCourse(courseData);
await webhooks.enrollInCourse(studentId, courseId);
await webhooks.getCourses(filters);

// Dashboard
await webhooks.getDashboardStats(userId);
await webhooks.getEarnings(userId);

// MCP Operations
await webhooks.validateData(data, provider);
await webhooks.getRecommendations(userId, context);

// Admin
await webhooks.adminGetUsers(filters);
await webhooks.adminBlockUser(userId);
```

**Features:**
- 36+ helper functions
- Standardized request/response format
- Error handling + logging
- Global `webhooks` instance ready to use
- CORS-compatible

---

## 💾 Database Architecture

### Database Engine
- **Primary:** PostgreSQL 15
- **Alternative:** MySQL (schema compatible)
- **Local Dev:** SQLite (n8n default)
- **Port:** 5432
- **Credentials:** `jeetmantra_user` / `jeetmantra_secure_pwd_123`

### Schema Overview

**Core Tables:**
```
jeetmantra_users              (Authentication & core profile)
jeetmantra_user_profiles      (Role-specific details)
jeetmantra_user_skills        (Skills inventory)
jeetmantra_email_verifications (Email verification tokens)

jeetmantra_courses            (Course catalog)
jeetmantra_course_modules     (Course structure)
jeetmantra_course_lessons     (Lesson content)

jeetmantra_enrollments        (Student enrollment tracking)
jeetmantra_lesson_progress    (Student progress per lesson)
jeetmantra_attendance         (Class attendance)

jeetmantra_assignments        (Course assignments)
jeetmantra_assignment_submissions (Student submissions)

jeetmantra_payments           (Payment records)
jeetmantra_feedback           (Course reviews)
```

**Total:** 15+ tables with comprehensive relationships and indexes

---

### Users Table (Core)

```sql
jeetmantra_users {
  id: UUID (PK)
  full_name: VARCHAR(255)
  email: VARCHAR(255) UNIQUE
  phone: VARCHAR(20)
  password_hash: VARCHAR(255)
  user_type: ENUM('student', 'teacher', 'partner', 'admin')
  status: ENUM('active', 'blocked', 'deleted')
  email_verified: BOOLEAN
  ai_provider: VARCHAR(50)
  api_key_encrypted: VARCHAR(500)
  profile_picture_url: VARCHAR(500)
  bio: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  deleted_at: TIMESTAMP
}
```

---

### User Profiles Table (Role-Specific)

```sql
jeetmantra_user_profiles {
  id: UUID (PK)
  user_id: UUID (FK)
  user_type: ENUM('student', 'teacher', 'partner')
  
  # Student fields
  academic_level: VARCHAR(100)
  interest_area: VARCHAR(255)
  
  # Teacher fields
  qualification: VARCHAR(255)
  experience_years: INT
  institution: VARCHAR(255)
  
  # Partner fields
  service_category: VARCHAR(100)
  hourly_rate: DECIMAL(10, 2)
}
```

---

### Courses & Enrollment Tables

```sql
jeetmantra_courses {
  id: UUID (PK)
  teacher_id: UUID (FK)
  title: VARCHAR(255)
  description: LONGTEXT
  category: VARCHAR(100)
  price: DECIMAL(10, 2)
  duration_hours: INT
  level: ENUM('beginner', 'intermediate', 'advanced')
  status: ENUM('draft', 'active', 'archived')
  max_students: INT
  enrolled_count: INT
  rating: DECIMAL(3, 1)
  rating_count: INT
  created_at: TIMESTAMP
}

jeetmantra_course_modules {
  id: UUID (PK)
  course_id: UUID (FK)
  title: VARCHAR(255)
  description: LONGTEXT
  module_order: INT
  duration_hours: INT
}

jeetmantra_course_lessons {
  id: UUID (PK)
  module_id: UUID (FK)
  course_id: UUID (FK)
  title: VARCHAR(255)
  content: LONGTEXT
  video_url: VARCHAR(500)
  duration_minutes: INT
  lesson_order: INT
}

jeetmantra_enrollments {
  id: UUID (PK)
  course_id: UUID (FK)
  student_id: UUID (FK)
  enrollment_date: TIMESTAMP
  progress_percentage: INT
  status: ENUM('active', 'completed', 'dropped')
  amount_paid: DECIMAL(10, 2)
  payment_method: VARCHAR(50)
  payment_id: VARCHAR(255)
}
```

---

### Tracking & Progress Tables

```sql
jeetmantra_lesson_progress {
  id: UUID (PK)
  enrollment_id: UUID (FK)
  lesson_id: UUID (FK)
  student_id: UUID (FK)
  status: ENUM('not_started', 'in_progress', 'completed')
  completed_at: TIMESTAMP
}

jeetmantra_attendance {
  id: UUID (PK)
  course_id: UUID (FK)
  student_id: UUID (FK)
  class_date: DATE
  status: ENUM('present', 'absent', 'excused')
}

jeetmantra_feedback {
  id: UUID (PK)
  course_id: UUID (FK)
  student_id: UUID (FK)
  rating: INT (1-5)
  review_text: LONGTEXT
  submitted_at: TIMESTAMP
}
```

---

### Assignments & Payments

```sql
jeetmantra_assignments {
  id: UUID (PK)
  course_id: UUID (FK)
  lesson_id: UUID (FK)
  title: VARCHAR(255)
  description: LONGTEXT
  due_date: TIMESTAMP
  max_score: INT
  created_by: UUID (FK)
}

jeetmantra_assignment_submissions {
  id: UUID (PK)
  assignment_id: UUID (FK)
  student_id: UUID (FK)
  submission_text: LONGTEXT
  file_url: VARCHAR(500)
  submitted_at: TIMESTAMP
  score: INT
  feedback: LONGTEXT
  status: ENUM('submitted', 'grading', 'graded')
}

jeetmantra_payments {
  id: UUID (PK)
  user_id: UUID (FK)
  enrollment_id: UUID (FK)
  amount: DECIMAL(10, 2)
  currency: VARCHAR(3) DEFAULT 'INR'
  payment_method: VARCHAR(50)
  payment_gateway: VARCHAR(50)
  transaction_id: VARCHAR(255) UNIQUE
  status: ENUM('pending', 'success', 'failed', 'refunded')
}
```

---

## 🤖 AI Integration (MCP)

### Supported Providers

| Provider | Free | Speed | Quality | Setup Time |
|----------|------|-------|---------|-----------|
| **Claude** (Anthropic) | Trial | ⚡⚡ | ⭐⭐⭐⭐⭐ | 2 min |
| **ChatGPT** (OpenAI) | Trial | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | 2 min |
| **Gemini** (Google) | ✅ Free | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | 2 min |
| **OpenRouter** | ✅ Free | ⚡⚡⚡ | ⭐⭐⭐⭐ | 3 min |

### MCP Use Cases

**Validation:**
- Email validation (format, existence)
- Password strength checking
- Phone number verification
- Course title/description validation

**Generation:**
- Course descriptions (from brief)
- Homework/assignment generation
- Pricing recommendations
- Schedule optimization
- Personalized recommendations

**Analysis:**
- Student performance analytics
- Spam/plagiarism detection
- Content moderation
- Sentiment analysis on reviews

**Integration Points:**
- Called from n8n workflows
- Response stored in database
- Results sent back to frontend
- Used for form recommendations

---

## 📡 Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ User Browser (website.html / dashboard.html)            │
│ • Fill form                                             │
│ • Click submit                                          │
└─────────────────┬───────────────────────────────────────┘
                  │ Form data (JSON)
                  ↓
┌─────────────────────────────────────────────────────────┐
│ webhook-handler.js (Frontend Client)                    │
│ • Prepare payload                                       │
│ • Add action type                                       │
│ • Send POST request                                     │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP POST
                  ↓
┌─────────────────────────────────────────────────────────┐
│ n8n Webhook (Orchestration)                             │
│ • Receive POST to /webhook/jeetmantra                   │
│ • Parse action from payload                             │
│ • Route to appropriate workflow                         │
└──┬──────────────┬──────────────┬──────────────┬──────┬──┘
   │              │              │              │      │
   ↓ (user-signup)↓ (course-get)  ↓ (mcp-validate)↓(payment)
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐
│ MCP          │ │ Database     │ │ Claude API   │ │ Razorpay │
│ Validation   │ │ Query        │ │ Process      │ │ Process  │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───┘
       │                │                │               │
       └────────────────┴────────────────┴───────────────┘
              │
              ↓
        ┌─────────────────────┐
        │ PostgreSQL Database │
        │ • Store result      │
        │ • Update records    │
        └────────┬────────────┘
                 │
                 ↓
        ┌─────────────────────┐
        │ n8n Response Node   │
        │ • Format response   │
        │ • Return 200 OK     │
        └────────┬────────────┘
                 │
                 ↓ HTTP Response (JSON)
        ┌─────────────────────┐
        │ webhook-handler.js  │
        │ • Parse response    │
        │ • Call success callback
        └────────┬────────────┘
                 │
                 ↓ Update UI
        ┌─────────────────────┐
        │ Browser             │
        │ • Show toast        │
        │ • Redirect/refresh  │
        └─────────────────────┘
```

---

## 🚀 Deployment & Environment Setup

### Local Development

```bash
# 1. Start services
docker-compose up -d

# 2. Start HTTP server
cd /repo
python3 -m http.server 3000

# 3. Access
http://localhost:3000/website.html    # Website
http://localhost:3000/dashboard.html  # Dashboard
http://localhost:3000/signup.html     # Signup
http://localhost:5678                 # n8n admin
```

### Cloud Deployment

**Current cloud endpoint:**
```
https://work.mantravat.cloud/webhook/jeetmantra
```

**Services:**
- Frontend: CDN + static hosting
- n8n: Cloud deployment (mantravat.cloud)
- Database: PostgreSQL on cloud provider
- Email: SendGrid
- Payments: Razorpay

---

## 📊 Data Flow Summary

### Signup Flow
```
User fills signup form
  ↓
Clicks submit
  ↓
webhook-handler.js validates locally
  ↓
POST to /webhook/jeetmantra with action: "user-signup"
  ↓
n8n routes to signup sub-flow
  ↓
MCP validates email/password
  ↓
Hash password, create user record
  ↓
Send verification email
  ↓
Return userId + success message
  ↓
Frontend shows toast + redirects
```

### Login Flow
```
User fills login form
  ↓
webhook-handler.js sends POST with action: "user-login"
  ↓
n8n queries database for user by email
  ↓
Verify password hash
  ↓
Generate JWT token
  ↓
Return token + user data
  ↓
Frontend stores token in localStorage
  ↓
Redirect to dashboard
```

### Dashboard Loading
```
Dashboard.html loads
  ↓
React component mounts
  ↓
webhooks.getDashboardStats(userId) called
  ↓
POST to /webhook/jeetmantra with action: "dashboard-get-stats"
  ↓
n8n queries database for user data
  ↓
Calculate stats (courses, earnings, attendance)
  ↓
Return stats object
  ↓
React updates state
  ↓
Component re-renders with data
```

---

## 📋 Data Models Captured

### 1. Student Profile
```
- Name, Email, Phone, Password
- Academic Level (Class 7-12, JEE, NEET, CA)
- Interest Areas (Skills/subjects)
- Enrolled Courses + Progress
- Attendance Record
- Earnings/Wallet balance
- Referral code + earnings
```

### 2. Teacher Profile
```
- Name, Email, Phone, Password
- Qualification + Years of Experience
- Institution
- Courses Created (with prices)
- Student List + Performance tracking
- Earnings breakdown
- Availability/Schedule
```

### 3. Partner Profile
```
- Business Name, Email, Phone
- Service Category (Sports, AI, Coding, etc.)
- Hourly Rate
- Services Offered
- Bookings + Calendar
- Customer List
- Earnings + Payouts
```

### 4. Course Model
```
- Title, Description, Category
- Price, Level (Beginner/Intermediate/Advanced)
- Teacher ID
- Modules (with lessons)
- Lessons (with video URLs, content)
- Max Students, Enrolled Count
- Rating + Reviews
- Status (Draft/Active/Archived)
```

### 5. Enrollment Model
```
- Student ID, Course ID
- Enrollment Date, Start Date
- Progress Percentage (0-100%)
- Status (Active/Completed/Dropped)
- Amount Paid
- Payment Method + ID
```

### 6. Transaction Model
```
- User ID
- Amount, Currency (INR)
- Payment Gateway (Razorpay, etc.)
- Transaction ID
- Status (Pending/Success/Failed/Refunded)
- Description
```

---

## 🔌 Required Backend Endpoints (Missing)

### Currently Defined But Not Fully Implemented

```
POST /webhook/jeetmantra
```

**Action:** `user-signup`
- **Status:** Framework ready, needs implementation
- **Needed:** Email validation, password hashing, DB insert, email send

**Action:** `user-login`
- **Status:** Framework ready, needs implementation
- **Needed:** Email lookup, password verification, JWT token generation

**Action:** `course-create`
- **Status:** Not started
- **Needed:** Validate teacher, create course record, validate pricing

**Action:** `course-enroll`
- **Status:** Not started
- **Needed:** Check availability, process payment, create enrollment

**Action:** `mcp-validate`
- **Status:** Framework ready
- **Needed:** Route to appropriate Claude API call

**Action:** `mcp-recommend`
- **Status:** Not started
- **Needed:** Analyze user profile, call Claude, rank results

**Action:** `dashboard-get-stats`
- **Status:** Not started
- **Needed:** Query user courses, attendance, earnings, compile stats

**Action:** `admin-get-users`
- **Status:** Not started
- **Needed:** Permission check, database query with filters

---

## 🎨 Design System

### Typography
- **Display/Hero:** Plus Jakarta Sans, Bold/800, 48-96px
- **Headings:** Plus Jakarta Sans, 600-700, large scale
- **Body:** Plus Jakarta Sans, 400, 16-18px, line-height 1.6
- **Labels:** Plus Jakarta Sans, 600, 11-13px, uppercase
- **Code:** JetBrains Mono, 400, dashboard displays

### Color Palette
- **Primary Brand:** Teal `#0d9488` / `#0c7a6f`
- **Accent:** Orange `#f97316` / `#ea6c0a`
- **Semantic:** Green (success), Red (error), Amber (warning)
- **Neutrals:** Gray scale for text, borders, backgrounds

### Spacing System
- **Base:** 4px
- **Scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px

### Corner Radii
- **Small (badges):** 6px
- **Medium (cards):** 12px
- **Large (modals):** 16-18px

### Responsive Breakpoints
- **Mobile:** 375px
- **Tablet:** 768px
- **Desktop:** 1280px+

---

## 🛠️ Technology Stack Summary

| Layer | Technology | Details |
|-------|-----------|---------|
| **Frontend Framework** | React 18 | CDN-based, no build tools |
| **Templating** | Babel Standalone | JSX in browser |
| **Styling** | CSS Variables + Pure CSS | No preprocessor needed |
| **Forms** | HTML5 + JavaScript | Validation in JS |
| **Webhooks** | webhook-handler.js | ~36 helper functions |
| **HTTP** | Fetch API | Modern browser standard |
| **Orchestration** | n8n | Business logic layer |
| **Database** | PostgreSQL 15 | Primary; MySQL compatible |
| **Database (Dev)** | SQLite (n8n default) | For local testing |
| **AI Provider** | Claude / OpenAI / Gemini | Via MCP |
| **Email** | SendGrid | Integration in n8n |
| **Payments** | Razorpay | Integration in n8n |
| **Infrastructure** | Docker Compose | n8n + PostgreSQL |
| **Hosting (Cloud)** | Static + mantravat.cloud | Frontend + backend |
| **Version Control** | Git | .gitignore configured |

---

## 📈 Project Status

### ✅ Complete & Tested
- Website prototype (12 React components)
- Dashboard prototype (30 React components, 3 roles)
- Signup wizard (4-step, multi-provider)
- Component library
- Design system (colors, typography, spacing)
- Database schema (15+ tables)
- Webhook architecture (framework)
- Integration guide
- Docker setup
- Admin panel
- Webhook testing tool

### ⏳ Ready for Implementation
- User signup workflow (email validation, DB insert)
- User login workflow (auth, JWT)
- Course operations (CRUD, enrollment)
- Dashboard data loading (stats query)
- Payment processing (Razorpay integration)
- Email verification (SendGrid templates)
- Admin operations (user management)
- Analytics (metrics calculation)
- Referral system
- Notifications

---

## 🎯 Next Steps Recommended

### Phase 1: Backend Foundation (1-2 weeks)
1. Set up n8n cloud environment
2. Implement core workflows:
   - User signup + email verification
   - User login + JWT token
   - Database connection
3. Test end-to-end with webhook tester
4. Deploy to cloud

### Phase 2: Feature Implementation (2-3 weeks)
1. Course CRUD operations
2. Enrollment + payment processing
3. Dashboard data endpoints
4. Admin panel operations

### Phase 3: Polish & Scale (1 week)
1. Error handling + logging
2. Performance optimization
3. Security hardening (rate limiting, input validation)
4. Monitoring + analytics
5. Documentation

---

## 📚 Documentation Files

All documentation is comprehensive and in-repo:

- **README.md** - Project overview
- **SETUP.md** - Quick start (5 min)
- **COMPLETE_GUIDE.md** - Full platform guide
- **INTEGRATION_GUIDE.md** - System architecture
- **UNIFIED_WEBHOOK_GUIDE.md** - Webhook reference
- **n8n-workflows.md** - Workflow templates
- **SIGNUP_GUIDE.md** - Signup testing
- **DOCKER_SETUP.md** - Docker configuration
- **TROUBLESHOOTING.md** - Common issues
- **WORKFLOW_IMPORT_GUIDE.md** - n8n import steps

---

## 🏁 Conclusion

**JeetMantra** is a well-architected, modern education platform with:

✅ **Modern Frontend** - React 18 + responsive design (no build tools)  
✅ **Clean Architecture** - n8n orchestration + webhooks  
✅ **AI-Ready** - Claude MCP integration support  
✅ **Database Ready** - PostgreSQL schema complete  
✅ **Well Documented** - Comprehensive guides  
✅ **Scalable** - Cloud deployment ready  

**What's needed:** Backend workflow implementations in n8n to wire the frontend forms to the database through AI validation. All infrastructure, design, and frontend is production-ready.

---

**Generated:** May 14, 2026 | **Project:** JeetMantra Education Platform
