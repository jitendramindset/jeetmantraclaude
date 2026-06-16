# 🧠 JeetMantra - Tech Stack Quick Reference

**For developers: Everything you need to know at a glance**

---

## 🎯 Quick Facts

| Aspect | Answer |
|--------|--------|
| **Frontend Framework** | React 18 (CDN-based) |
| **Build Tools** | None - vanilla HTML files |
| **Hosting** | Static hosting (HTML files) |
| **Backend Orchestration** | n8n (workflow engine) |
| **Database** | PostgreSQL 15 |
| **AI Integration** | Claude/OpenAI/Gemini via MCP |
| **Programming Languages** | JavaScript (frontend), n8n workflows (backend) |
| **Container Runtime** | Docker & Docker Compose |
| **User Roles** | 3 (Student, Teacher, Partner, Admin) |

---

## 📚 Frontend Technologies

### What's Loaded
```html
<!-- React ecosystem via CDN -->
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>

<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">

<!-- No CSS framework (pure CSS with custom properties) -->
```

### HTML Files
- **website.html** (216 KB) - 12 React components, full website
- **dashboard.html** (301 KB) - 30 React components, 3 role dashboards
- **signup.html** - 4-step signup wizard
- **admin.html** - SuperAdmin panel
- **components.html** - Component reference library

### Key Patterns

**React Components (in HTML):**
```jsx
function MyComponent() {
  const [state, setState] = React.useState(initialValue);
  
  return (
    <div>
      {/* JSX content */}
    </div>
  );
}

// Render to DOM
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MyComponent />);
```

**Styling:**
```css
:root {
  --primary: #0d9488;
  --accent: #f97316;
  --bg: #f5f5f5;
  /* ... more variables */
}

/* Dark mode */
body.dark {
  --primary: #10b981;
  /* ... overrides */
}

/* Components use variables */
.button {
  background-color: var(--primary);
}
```

**Form Handling:**
```javascript
// Capture form data
const formData = new FormData(formElement);
const data = Object.fromEntries(formData);

// Send via webhook
const result = await webhooks.registerUser(data);
```

---

## 🔗 Webhook System

### Library: webhook-handler.js
```javascript
// Initialize
const webhooks = new WebhookHandler('https://work.mantravat.cloud/webhook/jeetmantra');

// Call any action
await webhooks.sendWebhook('user-signup', userData, 
  (result) => { /* success */ },
  (error) => { /* error */ }
);

// Or use specific methods
await webhooks.registerUser(userData);
await webhooks.loginUser(email, password);
await webhooks.createCourse(courseData);
```

### Endpoint Structure
```
POST /webhook/jeetmantra

Request:
{
  "action": "user-signup",
  "data": { /* action-specific */ },
  "timestamp": "2026-05-14T10:00:00Z",
  "source": "frontend"
}

Response:
{
  "success": true,
  "data": { /* response */ },
  "message": "Success"
}
```

---

## 🔧 n8n Workflows

### Setup
```bash
# Start n8n
docker-compose up -d n8n

# Access
http://localhost:5678
# Credentials: admin / jeetmantra123
```

### Workflow Structure
```
Webhook Node (trigger)
  ↓
Switch Node (route by action)
  ├─ user-signup branch
  │  ├─ HTTP → Claude validation
  │  ├─ Function → Hash password
  │  ├─ DB → Create user
  │  └─ Email → Send verification
  ├─ course-create branch
  ├─ mcp-validate branch
  └─ [other branches]
  ↓
Respond Node (return result)
```

### Common Node Types
| Node | Purpose | Example |
|------|---------|---------|
| **Webhook** | Receive HTTP requests | `POST /webhook/jeetmantra` |
| **HTTP Request** | Call external APIs | Claude API, SendGrid |
| **Set Data** | Prepare data | Format for database |
| **Function** | Custom JavaScript | Transform, validate |
| **Database** | Query/store data | PostgreSQL operations |
| **Switch** | Conditional routing | Branch by action type |
| **If** | Simple conditional | Check if value exists |
| **Email** | Send emails | SendGrid integration |
| **Respond** | Return HTTP response | Send result to client |

---

## 💾 Database Schema Reference

### Tables at a Glance
```
jeetmantra_users ..................... Core authentication
jeetmantra_user_profiles ............ Role-specific data
jeetmantra_user_skills .............. Skills inventory
jeetmantra_courses .................. Course catalog
jeetmantra_course_modules .......... Course structure
jeetmantra_course_lessons .......... Lesson content
jeetmantra_enrollments ............. Student enrollment
jeetmantra_lesson_progress ........ Lesson tracking
jeetmantra_attendance .............. Class attendance
jeetmantra_assignments ............. Course assignments
jeetmantra_assignment_submissions . Student submissions
jeetmantra_payments ................ Payment records
jeetmantra_feedback ................ Course reviews
jeetmantra_email_verifications ... Email verification
```

### Key IDs & Relationships
```
user_id (UUID) ─────┐
                    ├─→ user_profiles (1:1)
                    ├─→ user_skills (1:N)
                    ├─→ enrollments (1:N)
                    ├─→ payments (1:N)
                    └─→ feedback (1:N)

teacher_id ─────────→ courses (1:N)

course_id ──────────┐
                    ├─→ course_modules (1:N)
                    ├─→ course_lessons (1:N)
                    ├─→ enrollments (1:N)
                    ├─→ assignments (1:N)
                    └─→ feedback (1:N)

enrollment_id ──────→ lesson_progress (1:N)
                  
assignment_id ──────→ assignment_submissions (1:N)
```

### Connection String
```
PostgreSQL:
  Host: localhost
  Port: 5432
  Database: jeetmantra_db
  User: jeetmantra_user
  Password: jeetmantra_secure_pwd_123

Development (n8n):
  SQLite (auto)
```

---

## 🤖 Claude MCP Integration

### Supported Providers
```javascript
// In n8n HTTP Request node, use one of:

// Claude (Anthropic)
https://api.anthropic.com/v1/messages
Header: x-api-key: {CLAUDE_API_KEY}

// ChatGPT (OpenAI)
https://api.openai.com/v1/chat/completions
Header: Authorization: Bearer {OPENAI_API_KEY}

// Gemini (Google)
https://generativelanguage.googleapis.com/v1beta/models/...
Param: key={GEMINI_API_KEY}

// OpenRouter (Multi-provider)
https://openrouter.ai/api/v1/chat/completions
Header: Authorization: Bearer {OPENROUTER_API_KEY}
```

### Claude Request Format (Most Common)
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 256,
  "messages": [
    {
      "role": "user",
      "content": "Your prompt here"
    }
  ]
}
```

### Example: Email Validation
```javascript
// In n8n Function node:
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isValid = emailRegex.test(input[0].json.email);

// But better: Call Claude for smart validation
// POST to Claude API with:
// "Validate this email: user@example.com"
// Response: "valid" or "invalid"
```

---

## 📱 React Component Patterns

### Function Component with Hooks
```jsx
function UserCard({ userId }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch user data
    webhooks.getUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div style={{ padding: 20, border: '1px solid #e5e7eb' }}>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
```

### Conditional Rendering
```jsx
{isLoggedIn ? (
  <Dashboard />
) : (
  <LoginForm />
)}
```

### Event Handling
```jsx
<button onClick={() => handleClick()}>
  Click me
</button>

<input onChange={(e) => setValue(e.target.value)} />

<form onSubmit={(e) => {
  e.preventDefault();
  submitForm();
}}>
```

### Styling
```jsx
// Inline styles
<div style={{ color: 'var(--primary)', padding: 20 }}>

// CSS classes
<div className="container">

// Conditional styles
<div style={{
  backgroundColor: isActive ? 'var(--accent)' : 'white'
}}>

// CSS Variables (preferred)
// Define in <style> tag at top of HTML
```

---

## 🚀 Development Workflow

### Setup Checklist
- [ ] Clone repo
- [ ] Install Docker
- [ ] `docker-compose up -d` (start n8n + PostgreSQL)
- [ ] `python3 -m http.server 3000` (start dev server)
- [ ] Open http://localhost:3000/website.html
- [ ] n8n admin: http://localhost:5678

### File Structure to Know
```
jeetmantraclaude-main/
├── website.html ................. Edit for website changes
├── dashboard.html ............... Edit for dashboard changes
├── signup.html .................. Edit for signup changes
├── webhook-handler.js ........... Update webhook methods here
├── docker-compose.yml ........... Database config
├── database-schema-*.sql ........ DB schema
├── project/
│   └── ui_kits/ ................. Design system reference
└── [Documentation files]
```

### Common Tasks

**Add new webhook action:**
1. Define in `n8n-jeetmantra-unified-router.json` (Switch node)
2. Add method to `webhook-handler.js`
3. Create sub-flow in n8n
4. Call from frontend form

**Update styling:**
1. Edit CSS variables in `<style>` tag at top of HTML
2. Or edit specific styles in `<style>` section
3. Changes apply immediately (hot reload in browser)

**Add React component:**
1. Define function in `<script type="text/babel">`
2. Use React hooks (useState, useEffect)
3. Render with `ReactDOM.createRoot()`

---

## 🔐 Environment Variables

### n8n Container
```
CLAUDE_API_KEY = sk-ant-...
SENDGRID_API_KEY = SG....
RAZORPAY_KEY_ID = rzp_live_...
RAZORPAY_KEY_SECRET = ...
```

### Frontend (in signup form)
```javascript
// User can paste their own API key
const apiKey = document.querySelector('[name="apiKey"]').value;
// Sent to n8n which stores encrypted
```

---

## 📊 API Response Patterns

### Success
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "email": "user@example.com"
  },
  "message": "User created successfully"
}
```

### Error
```json
{
  "success": false,
  "error": "Email already exists",
  "message": "Registration failed"
}
```

### Pagination (for lists)
```json
{
  "success": true,
  "data": [/* items */],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🐛 Debugging Tips

### Browser Console
```javascript
// Check last webhook response
console.log(webhooks.lastResponse);

// Monitor all webhook calls
// Already logs: console.log(`[Webhook] Action: ...`)

// Test a webhook manually
await webhooks.sendWebhook('user-signup', {
  name: 'Test',
  email: 'test@example.com',
  password: 'Test@123'
});
```

### n8n Debugging
1. Open workflow
2. Click **Execute Workflow** button
3. Check **Execution History**
4. Click on execution to see logs
5. Click on each node to see input/output

### Database Debugging
```bash
# Connect to PostgreSQL
psql -h localhost -U jeetmantra_user -d jeetmantra_db

# Common queries
SELECT * FROM jeetmantra_users LIMIT 5;
SELECT * FROM jeetmantra_courses WHERE status='active';
SELECT COUNT(*) FROM jeetmantra_enrollments;
```

---

## 📈 Performance Tips

### Frontend
- React components already optimized with hooks
- CSS custom properties (no recalculation overhead)
- Images embedded as base64 (no extra requests)
- One JS file per page (minimal bundle)

### Backend (n8n)
- Index database columns (already in schema)
- Cache frequent queries
- Use SELECT only needed columns
- Paginate large result sets

### API Calls
- Batch similar requests
- Implement request debouncing
- Use caching for static data

---

## 🔗 Key URLs

**Development:**
- Website: http://localhost:3000/website.html
- Dashboard: http://localhost:3000/dashboard.html
- Signup: http://localhost:3000/signup.html
- Admin: http://localhost:3000/admin.html
- n8n: http://localhost:5678

**Production:**
- Webhook: https://work.mantravat.cloud/webhook/jeetmantra
- API docs: (to be created)

---

## 📚 Related Files

- **ARCHITECTURE_SUMMARY.md** - Full system overview
- **INTEGRATION_GUIDE.md** - How components talk to each other
- **n8n-workflows.md** - Workflow templates
- **UNIFIED_WEBHOOK_GUIDE.md** - All available webhooks
- **SIGNUP_GUIDE.md** - Test signup flow
- **DOCKER_SETUP.md** - Container configuration

---

## ⚡ Quick Commands

```bash
# Start everything
docker-compose up -d
python3 -m http.server 3000

# Stop everything
docker-compose down

# View logs
docker-compose logs -f n8n

# Access database
docker exec -it jeetmantra_db psql -U jeetmantra_user -d jeetmantra_db

# View n8n workflows directory
ls -la n8n_workflows/
```

---

**Last Updated:** May 14, 2026 | **For:** JeetMantra Development Team
