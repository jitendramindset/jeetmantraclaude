# 🏗️ JeetMantra - Visual Architecture Overview

**Complete system diagrams and flow charts**

---

## 🌐 System Architecture Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   User Browser (React 18)                    │  │
│  │  ┌─────────────────────────────────────────────────────┐    │  │
│  │  │  website.html (Marketing)                           │    │  │
│  │  │  dashboard.html (Multi-role)                        │    │  │
│  │  │  signup.html (Registration)                         │    │  │
│  │  │  admin.html (Management)                            │    │  │
│  │  └─────────────────────────────────────────────────────┘    │  │
│  │              ↓ (JavaScript Form Submission)                  │  │
│  │  ┌─────────────────────────────────────────────────────┐    │  │
│  │  │  webhook-handler.js (Client Library)                │    │  │
│  │  │  • Validates locally                                 │    │  │
│  │  │  • Prepares JSON payload                             │    │  │
│  │  │  • Sends HTTP POST                                   │    │  │
│  │  └─────────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP/HTTPS
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER (n8n)                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │        Webhook Node (Receives POST requests)                 │  │
│  │        https://work.mantravat.cloud/webhook/jeetmantra      │  │
│  └────────────────────────┬─────────────────────────────────────┘  │
│                           │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐  │
│  │    Switch Node (Route by action type)                        │  │
│  │    ┌─────────────────────────────────────────────────────┐   │  │
│  │    │ Case: user-signup ─────────────────────────────┐   │   │  │
│  │    │ Case: user-login ──────────────────────────────┼──┐│   │  │
│  │    │ Case: course-create ───────────────────────────┼──┼─┐ │   │  │
│  │    │ Case: course-enroll ───────────────────────────┼──┼─┼─┐│   │  │
│  │    │ Case: mcp-validate ────────────────────────────┼──┼─┼─┼┤   │  │
│  │    │ ... [more cases]                               │  │ │ ││   │  │
│  │    └─────────────────────────────────────────────────┘  │ │ ││   │  │
│  └──────────────────────────────────────────────────────────┼─┼─┼┤   │  │
│                                                             │ │ ││   │  │
│  ┌──────────────────────────────────────────────────────────▼─▼─▼┐   │  │
│  │           Sub-flow Nodes (Action Processing)                 │   │  │
│  │  • HTTP Request (Call Claude MCP)                            │   │  │
│  │  • Function Node (Transform data)                            │   │  │
│  │  • Database Node (Query/Store)                               │   │  │
│  │  • Email Node (SendGrid)                                     │   │  │
│  │  • Conditional Nodes (If/Error handling)                     │   │  │
│  └──────────────────┬─────────────────────────────────────────┘   │  │
│                     │                                               │  │
│  ┌──────────────────▼────────────────────────────────────────┐    │  │
│  │         Respond Node (Return HTTP 200)                    │    │  │
│  │         { success: bool, data: {...}, message: string }   │    │  │
│  └──────────────────────────────────────────────────────────┘    │  │
│                                                                     │  │
│  Docker Container: n8nio/n8n:latest                                │  │
│  Port: 5678 (Admin UI)                                             │  │
│  Webhook: 5678/webhook/*                                           │  │
└────────┬─────────────────────────────────┬────────────────────────┘
         │                                 │
         │ (API calls)                     │ (DB queries)
         ↓                                 ↓
┌─────────────────────────────┐  ┌──────────────────────────────────┐
│   AI PROVIDER LAYER         │  │   DATA LAYER                     │
│                             │  │                                  │
│ ┌─────────────────────────┐ │  │ ┌────────────────────────────┐  │
│ │ Claude API              │ │  │ │ PostgreSQL 15              │  │
│ │ (Anthropic)             │ │  │ │ jeetmantra_db              │  │
│ └─────────────────────────┘ │  │ │                            │  │
│                             │  │ │ Tables:                    │  │
│ ┌─────────────────────────┐ │  │ │ • users                    │  │
│ │ ChatGPT API             │ │  │ │ • courses                  │  │
│ │ (OpenAI)                │ │  │ │ • enrollments              │  │
│ └─────────────────────────┘ │  │ │ • payments                 │  │
│                             │  │ │ • attendance               │  │
│ ┌─────────────────────────┐ │  │ │ • [10+ more]              │  │
│ │ Gemini API              │ │  │ │                            │  │
│ │ (Google)                │ │  │ │ 15+ interconnected tables  │  │
│ └─────────────────────────┘ │  │ └────────────────────────────┘  │
│                             │  │                                  │
│ ┌─────────────────────────┐ │  │ ┌────────────────────────────┐  │
│ │ OpenRouter              │ │  │ │ SQLite (Dev)               │  │
│ │ (Multi-provider)        │ │  │ │ n8n default database       │  │
│ └─────────────────────────┘ │  │ └────────────────────────────┘  │
│                             │  │                                  │
│ Response: Validation,       │  │ Response: Stored data,           │
│ Suggestions, Generated      │  │ Query results                    │
│ Content                     │  │                                  │
└─────────────────────────────┘  └──────────────────────────────────┘

Additional Services:
┌────────────────────────────────┐  ┌──────────────────────┐
│ SendGrid (Email Service)        │  │ Razorpay (Payments)  │
│ • Verification emails           │  │ • Payment gateway    │
│ • Course notifications          │  │ • Webhook callbacks  │
└────────────────────────────────┘  └──────────────────────┘
```

---

## 📱 Frontend Component Hierarchy

### website.html (Marketing Website)
```
App
├── Header
│   ├── Logo
│   ├── Navigation
│   └── Mobile Hamburger
├── HomePage
│   ├── Hero Section
│   ├── Programs Section (4 cards)
│   ├── Course Grid
│   ├── Earn & Learn Section
│   ├── Stats Bar
│   ├── Testimonials
│   └── CTA Section
├── CoursesPage
│   ├── Course Filter
│   └── Course Card Grid
├── EarnPage
│   ├── Referral System
│   └── Task Marketplace
├── AboutPage
├── ContactPage
├── DirectoryPage
│   ├── Teacher Search
│   ├── Partner Search
│   └── Filter Controls
├── LoginModal
│   ├── Email/Password
│   ├── Google OAuth
│   └── Mobile OTP
└── Footer
    ├── Links
    └── Location Info

Total: 12 React Components
```

### dashboard.html (Multi-role Dashboard)
```
App
├── RoleSelector
│   ├── Student Card
│   ├── Teacher Card
│   └── Partner Card
└── [Role-specific Dashboard] ──────────────────────────┐
                                                        │
    STUDENT DASHBOARD:                                  │
    ├── Sidebar                                         │
    │   ├── Home                                        │
    │   ├── My Courses                                  │
    │   ├── Attendance                                  │
    │   ├── Earnings                                    │
    │   └── Profile                                     │
    ├── DashboardHome                                   │
    │   ├── Stats Grid (Cards)                          │
    │   ├── Upcoming Classes Card                       │
    │   └── Earnings Summary                            │
    ├── CoursesScreen                                   │
    │   ├── Progress Bar                                │
    │   └── Course Actions (Continue, Rate)             │
    ├── AttendanceScreen                                │
    │   ├── Calendar View                               │
    │   └── Streak Tracker                              │
    ├── WalletScreen                                    │
    │   ├── Balance Display                             │
    │   ├── Transaction History                         │
    │   ├── Referral Code                               │
    │   └── Withdraw Button                             │
    ├── ProfileScreen                                   │
    │   ├── User Info Editor                            │
    │   ├── Skills Manager                              │
    │   └── Preferences                                 │
    ├── SettingsPanel (Fixed bottom-right FAB)          │
    │   ├── Theme Selector                              │
    │   ├── Accent Color Picker                         │
    │   ├── Language Selector                           │
    │   └── Live Preview                                │
    └── [Similar for Teacher & Partner roles]           │
                                                        │
    TEACHER DASHBOARD: (30+ components total)           │
    ├── Dashboard Stats                                 │
    ├── My Courses Manager                              │
    ├── Classes & Schedule                              │
    ├── Students List & Analytics                       │
    ├── Earnings Breakdown                              │
    └── Profile & Settings                              │
                                                        │
    PARTNER DASHBOARD:                                  │
    ├── Activity Stats                                  │
    ├── Services Manager                                │
    ├── Bookings Calendar                               │
    ├── Users/Connections                               │
    ├── Earnings & Payouts                              │
    └── Business Profile Settings

Total: 30+ React Components, 3 Independent Role UIs
```

### signup.html (Registration Wizard)
```
SignupWizard
├── Progress Indicators (4 steps)
├── Step 1: AI Provider Selection
│   ├── Provider Cards (Claude, ChatGPT, Gemini, OpenRouter)
│   └── Optional API Key Input
├── Step 2: Account Details
│   ├── Full Name Input
│   ├── Email Input
│   ├── Phone Input
│   └── Password Input
├── Step 3: Role & Profile
│   ├── Role Selector (Student/Teacher/Partner)
│   └── Role-specific Fields
│       ├── Student: Academic Level, Interest Area
│       ├── Teacher: Qualification, Experience, Institution
│       └── Partner: Service Category, Hourly Rate
├── Step 4: Skills & Review
│   ├── Skills Manager (Add/Remove)
│   ├── Proficiency Level Selector
│   ├── Form Review
│   └── Submit Button
└── Success Message + Redirect

Total: ~12 Components in Single File
```

---

## 🔄 Data Flow: Signup Process

```
┌──────────────────────────────────────────────────────┐
│ 1. User fills signup.html form                       │
│    - Selects AI provider                             │
│    - Enters account info                             │
│    - Chooses role (student/teacher/partner)          │
│    - Adds skills                                     │
└────────────┬─────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────┐
│ 2. User clicks "Create Account"                      │
│    Form validation happens client-side               │
│    - Email format check                              │
│    - Password strength check                         │
│    - Required fields check                           │
└────────────┬─────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────┐
│ 3. webhook-handler.js prepares payload               │
│    {                                                 │
│      action: "user-signup",                          │
│      data: {                                         │
│        name: "Arjun Sharma",                         │
│        email: "arjun@example.com",                   │
│        phone: "+91-9876543210",                      │
│        password: "SecurePass@123",                   │
│        userType: "student",                          │
│        skills: ["Python", "Web Dev"],                │
│        aiProvider: "gemini",                         │
│        apiKey: "..." (if provided)                   │
│      },                                              │
│      timestamp: "2026-05-14T10:00:00Z",              │
│      source: "frontend"                              │
│    }                                                 │
└────────────┬─────────────────────────────────────────┘
             │
             ↓ HTTP POST
┌──────────────────────────────────────────────────────┐
│ 4. n8n receives at /webhook/jeetmantra               │
│    → Switch node routes to "user-signup" branch      │
└────────────┬─────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────┐
│ 5. MCP Validation via Claude                         │
│    HTTP POST to api.anthropic.com                    │
│    - Validate email format                           │
│    - Check password strength                         │
│    - Validate phone number                           │
│    Response: { valid: true/false, reason: "" }       │
└────────────┬─────────────────────────────────────────┘
             │
             ↓ (if validation passed)
┌──────────────────────────────────────────────────────┐
│ 6. Function Node: Hash Password                      │
│    plaintext: "SecurePass@123"                       │
│    → bcrypt hashing                                  │
│    hashed: "$2b$12$..."                              │
└────────────┬─────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────┐
│ 7. Database Node: Create User Record                 │
│    INSERT INTO jeetmantra_users (                    │
│      id, full_name, email, phone,                    │
│      password_hash, user_type, status, ...           │
│    ) VALUES (...)                                    │
│    → Returns: userId                                 │
└────────────┬─────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────┐
│ 8. Database Node: Create User Profile                │
│    INSERT INTO jeetmantra_user_profiles (            │
│      id, user_id, user_type,                         │
│      academic_level, interest_area                   │
│    ) VALUES (...)                                    │
└────────────┬─────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────┐
│ 9. Database Node: Add Skills                         │
│    INSERT INTO jeetmantra_user_skills (              │
│      id, user_id, skill_name, proficiency_level      │
│    ) VALUES (...)  -- for each skill                 │
└────────────┬─────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────┐
│ 10. Email Node: Send Verification Email              │
│     SendGrid API                                     │
│     To: arjun@example.com                            │
│     Template: Account verification                   │
│     Link: {verify_url}?token={token}                 │
│     → Token stored in email_verifications table      │
└────────────┬─────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────┐
│ 11. Respond Node: Return to Frontend                 │
│     {                                                │
│       "success": true,                               │
│       "data": {                                      │
│         "userId": "user_2026-05-14-abc123",          │
│         "email": "arjun@example.com",                │
│         "message": "Verification email sent"         │
│       }                                              │
│     }                                                │
└────────────┬─────────────────────────────────────────┘
             │
             ↓ HTTP 200
┌──────────────────────────────────────────────────────┐
│ 12. Browser receives response                        │
│     → webhook-handler.js processes                   │
│     → showToast("Verification email sent", "success")│
│     → setTimeout(2s) → redirect to website.html      │
│     → User sees success message                      │
│     → User checks email for verification link        │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 Data Flow: Dashboard Loading

```
Dashboard Component Mounts
        │
        ↓
React.useEffect(() => {
  webhooks.getDashboardStats(userId)
})
        │
        ↓ HTTP POST /webhook/jeetmantra
┌──────────────────────────────────────────┐
│ n8n receives action: "dashboard-get-stats"│
│ Payload: { userId: "user_123" }           │
└─────────────┬────────────────────────────┘
              │
              ↓ (route to stats sub-flow)
┌──────────────────────────────────────────┐
│ Database Query 1: Enrolled Courses       │
│ SELECT COUNT(*) FROM enrollments         │
│ WHERE student_id = ? AND status='active' │
│ Result: 5 active courses                 │
└─────────────┬────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────┐
│ Database Query 2: Progress Average       │
│ SELECT AVG(progress_percentage)          │
│ FROM enrollments WHERE student_id = ?    │
│ Result: 45% average                      │
└─────────────┬────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────┐
│ Database Query 3: Attendance             │
│ SELECT COUNT(*) FROM attendance          │
│ WHERE student_id = ? AND status='present'│
│ Result: 23 days present                  │
└─────────────┬────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────┐
│ Database Query 4: Earnings               │
│ SELECT SUM(amount) FROM payments         │
│ WHERE user_id = ? AND status='success'   │
│ Result: ₹12,500 total                    │
└─────────────┬────────────────────────────┘
              │
              ↓ (combine all results)
┌──────────────────────────────────────────┐
│ Function Node: Format Response           │
│ {                                        │
│   totalCourses: 5,                       │
│   activeCourses: 5,                      │
│   avgProgress: 45,                       │
│   attendance: 23,                        │
│   totalEarnings: 12500,                  │
│   recentActivity: [...]                  │
│ }                                        │
└─────────────┬────────────────────────────┘
              │
              ↓ HTTP 200
┌──────────────────────────────────────────┐
│ webhook-handler.js receives response     │
│ → onSuccess callback called              │
│ → setStats(result.data)                  │
│ → React re-renders with new data         │
└─────────────┬────────────────────────────┘
              │
              ↓
┌──────────────────────────────────────────┐
│ Browser Updates UI                       │
│ - Stats cards populate                   │
│ - Charts update                          │
│ - Recent activity list shows             │
│ User sees personalized dashboard         │
└──────────────────────────────────────────┘
```

---

## 🔐 Authentication & Authorization Flow

```
┌─────────────────────────────────────┐
│ Login Form (website.html)           │
│ - Email input                       │
│ - Password input                    │
│ - Submit                            │
└──────────────┬──────────────────────┘
               │
               ↓ HTTP POST /webhook/jeetmantra
┌──────────────────────────────────────────┐
│ n8n: action "user-login"                 │
│ { email, password }                      │
└──────────────┬─────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│ Database: Find user by email             │
│ SELECT * FROM jeetmantra_users           │
│ WHERE email = ?                          │
│ Result: user record with password_hash   │
└──────────────┬─────────────────────────┘
               │
               ↓ (if not found)
        ┌──────▼──────┐
        │ Error: user │
        │ not found   │
        └─────────────┘
               │
        ┌──────▼──────────────────┐
        │ (if found)               │
        │ Compare passwords        │
        │ bcrypt.compare(          │
        │   input_password,        │
        │   stored_hash            │
        │ )                        │
        └──────┬──────────────────┘
               │
        ┌──────▼──────────────────┐
        │ Passwords match?         │
        │ ├─ Yes:                  │
        │ │  Generate JWT token    │
        │ │  exp: now + 24 hours   │
        │ │  payload: userId       │
        │ └─ No:                   │
        │    Error: invalid pwd    │
        └──────┬──────────────────┘
               │
               ↓ HTTP 200
┌──────────────────────────────────────────┐
│ Response:                                │
│ {                                        │
│   "success": true,                       │
│   "data": {                              │
│     "token": "eyJhbGc...",               │
│     "userId": "user_123",                │
│     "userType": "student",               │
│     "name": "Arjun Sharma"               │
│   }                                      │
│ }                                        │
└──────────────┬──────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│ Browser (webhook-handler.js)             │
│ → localStorage.setItem('token', token)   │
│ → localStorage.setItem('userId', userId) │
│ → Redirect to dashboard.html             │
└──────────────┬──────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│ Dashboard.html mounts                    │
│ → Reads token from localStorage          │
│ → Includes token in all webhook calls:   │
│    headers: {                            │
│      'Authorization': `Bearer ${token}`  │
│    }                                     │
│ → n8n verifies JWT token                 │
│ → Requests allowed if valid token       │
└──────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Relationship Diagram

```
                    ┌─────────────────┐
                    │  jeetmantra_    │
                    │     users       │
                    │  (id, email,    │
                    │   user_type)    │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┬──────────────┐
            │                │                │              │
            ↓                ↓                ↓              ↓
      ┌──────────┐      ┌──────────┐    ┌──────────┐   ┌──────────┐
      │profiles  │      │ courses  │    │payments  │   │feedback  │
      │(1:1)     │      │(1:N)     │    │(1:N)     │   │(1:N)     │
      └──────────┘      └────┬─────┘    └──────────┘   └──────────┘
                             │
                    ┌────────┼────────┐
                    │        │        │
                    ↓        ↓        ↓
            ┌────────────┐┌────────┐┌──────────────┐
            │ modules    ││lessons ││enrollments   │
            │(1:N)       ││(1:N)   ││(1:N)         │
            └────────────┘└────────┘└──┬───────────┘
                                       │
                    ┌──────────────────┼──────────────┐
                    │                  │              │
                    ↓                  ↓              ↓
            ┌──────────────┐    ┌──────────────┐ ┌──────────┐
            │lesson_       │    │attendance    │ │ payment  │
            │progress      │    │(1:N)         │ │(1:N)     │
            │(1:N)         │    └──────────────┘ └──────────┘
            └──────────────┘

Each user → has 1 profile, many courses/enrollments/payments
Each course → has many modules → has many lessons
Each enrollment → has progress tracking, attendance, payments
```

---

## 📊 Component State Management Pattern

```
React Component (e.g., DashboardHome)
│
├── useState Hooks
│   ├── const [stats, setStats] = useState(null)
│   ├── const [loading, setLoading] = useState(true)
│   └── const [error, setError] = useState(null)
│
├── useEffect Hook
│   │
│   └── On mount:
│       ├── setLoading(true)
│       ├── call webhooks.getDashboardStats(userId)
│       └── on response:
│           ├── setStats(response.data)
│           ├── setLoading(false)
│           └── if error: setError(response.error)
│
├── Render Logic
│   ├── if (loading) → Show spinner
│   ├── if (error) → Show error message
│   └── if (stats) → Render with data
│
└── Event Handlers
    ├── onClick → call webhook
    ├── onChange → update local state
    └── onSubmit → form handling
```

---

## 🔌 Webhook Action Routing Table

```
┌──────────────────┬──────────────────────────┬─────────────────┐
│ Action           │ Processing Sub-flow      │ External Calls  │
├──────────────────┼──────────────────────────┼─────────────────┤
│ user-signup      │ Validate → Hash → Store  │ Claude MCP      │
│                  │ → Email                  │ SendGrid        │
├──────────────────┼──────────────────────────┼─────────────────┤
│ user-login       │ Query → Compare → JWT    │ (none)          │
├──────────────────┼──────────────────────────┼─────────────────┤
│ user-verify-     │ Query token → Update     │ SendGrid (email │
│ email            │ email_verified           │ confirmation)   │
├──────────────────┼──────────────────────────┼─────────────────┤
│ course-create    │ Validate → Store →       │ Claude MCP      │
│                  │ Generate description     │ (optional)      │
├──────────────────┼──────────────────────────┼─────────────────┤
│ course-enroll    │ Check availability →     │ Razorpay        │
│                  │ Process payment → Store  │ (if paid)       │
├──────────────────┼──────────────────────────┼─────────────────┤
│ dashboard-get-   │ Multi-query → Aggregate  │ (none)          │
│ stats            │ → Format                 │                 │
├──────────────────┼──────────────────────────┼─────────────────┤
│ mcp-validate     │ Route to Claude API →    │ Claude MCP      │
│                  │ Parse → Return           │                 │
├──────────────────┼──────────────────────────┼─────────────────┤
│ admin-get-users  │ Auth check → Query →     │ (none)          │
│                  │ Paginate → Return        │                 │
└──────────────────┴──────────────────────────┴─────────────────┘
```

---

## 🚀 Deployment Architecture (Cloud)

```
Internet
  │
  ├─→ CDN (Static Files)
  │   ├── website.html
  │   ├── dashboard.html
  │   ├── signup.html
  │   ├── webhook-handler.js
  │   └── assets/
  │
  └─→ mantravat.cloud (Reverse Proxy)
      │
      ├─→ /webhook/jeetmantra
      │   └── n8n Cloud Instance
      │       ├── Webhook Router
      │       ├── Workflow Executor
      │       └── Database Connector
      │
      ├─→ External Services
      │   ├── Claude API (ai.anthropic.com)
      │   ├── SendGrid API (mail service)
      │   ├── Razorpay API (payments)
      │   └── PostgreSQL Cloud DB
      │
      └─→ PostgreSQL Database
          ├── Primary (Write)
          └── Read Replicas (Scaling)
```

---

## 🎨 Color & Theme System

```
Light Mode (Default)
├── Primary Variables
│   ├── --primary: #0d9488 (Teal)
│   ├── --primary-dark: #0c7a6f
│   ├── --accent: #f97316 (Orange)
│   └── --accent-dark: #ea6c0a
├── Background
│   ├── --bg-page: #f4f6f8
│   ├── --bg-surface: #ffffff
│   └── --bg-surface2: #f8fafc
├── Text
│   ├── --fg-1: #0f172a (Primary)
│   ├── --fg-2: #64748b (Secondary)
│   └── --fg-3: #9ca3af (Tertiary)
└── UI Elements
    ├── --border: #e5e7eb
    ├── --shadow-sm: 0 2px 10px rgba(0,0,0,0.07)
    └── --shadow-md: 0 4px 20px rgba(0,0,0,0.11)

Dark Mode (body.dark)
├── Primary Variables (Same accent colors)
├── Background
│   ├── --bg-page: #0d1117
│   ├── --bg-surface: #161b22
│   └── --bg-surface2: #1c2330
├── Text
│   ├── --fg-1: #f0f6fc
│   ├── --fg-2: #8b949e
│   └── --fg-3: #484f58
└── UI Elements
    ├── --border: rgba(255,255,255,0.08)
    ├── --shadow-sm: 0 2px 10px rgba(0,0,0,0.4)
    └── --shadow-md: 0 4px 20px rgba(0,0,0,0.5)

Theme Toggle (Settings Panel)
├── Light ↔ Dark Switch
├── Accent Color Selector (6 presets)
│   ├── Orange (#f97316)
│   ├── Blue (#3b82f6)
│   ├── Purple (#a855f7)
│   ├── Green (#10b981)
│   ├── Pink (#ec4899)
│   └── Red (#ef4444)
└── Language Selector
    ├── English
    ├── Hindi
    └── Hinglish
```

---

**Last Updated:** May 14, 2026 | **For:** JeetMantra Development Team
