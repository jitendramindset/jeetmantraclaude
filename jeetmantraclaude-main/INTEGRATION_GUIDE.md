# 🔗 JeetMantra - Complete Integration Guide

How to connect HTML forms → n8n Webhooks → MCP (Claude) → Database & Responses

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (HTML + JavaScript)                                    │
│ website.html │ dashboard.html │ admin.html │ components.html    │
└────────────────────┬────────────────────────────────────────────┘
                     │ (Form Submit)
                     │ webhook-handler.js sends POST
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ N8N WEBHOOKS (Orchestration Layer)                              │
│ http://localhost:5678/webhook/*                                  │
│                                                                   │
│ • Receives form data                                             │
│ • Calls MCP (Claude) for validation/generation                  │
│ • Stores in database                                            │
│ • Returns response to frontend                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │ (HTTP POST)
                     │ Sends to Claude API
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ MCP (Claude - AI Logic Layer)                                   │
│ https://api.anthropic.com/v1/messages                            │
│                                                                   │
│ • Validate email, password, course data                         │
│ • Generate course descriptions, homework                        │
│ • Suggest optimal schedules, prices                             │
│ • Auto-fill form recommendations                                │
│ • Check for spam/plagiarism                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │ (JSON response)
                     │ Returns validation/suggestions
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ N8N DATA STORAGE (Built-in Database)                            │
│ + External Services                                              │
│                                                                   │
│ • n8n's SQLite database (development)                           │
│ • SendGrid (Email)                                              │
│ • Razorpay (Payments)                                           │
│ • AWS S3 (File Storage)                                         │
└────────────────────┬────────────────────────────────────────────┘
                     │ (Response)
                     │ Returns success/error
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (Display Result)                                       │
│ • Show toast notification                                       │
│ • Update form with suggestions                                  │
│ • Redirect to dashboard                                         │
│ • Refresh UI                                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Checklist

### ✅ Prerequisites
- [ ] Claude API key (https://console.anthropic.com/)
- [ ] Docker & Docker Compose installed
- [ ] n8n running on http://localhost:5678
- [ ] SendGrid key (optional, for emails)
- [ ] Razorpay keys (optional, for payments)

### ✅ Step 1: Start n8n Locally
```bash
cd /home/claude/repo
docker-compose up -d n8n

# Wait 30 seconds for n8n to start
sleep 30

# Access at: http://localhost:5678
# Login: admin / jeetmantra123
```

### ✅ Step 2: Configure n8n Environment Variables
1. Go to http://localhost:5678
2. Click **Settings** (gear icon) → **Environment variables**
3. Add:
   ```
   CLAUDE_API_KEY = your-anthropic-api-key
   SENDGRID_API_KEY = your-sendgrid-key (optional)
   RAZORPAY_KEY_ID = your-razorpay-key (optional)
   RAZORPAY_KEY_SECRET = your-razorpay-secret (optional)
   ```

### ✅ Step 3: Include Files in HTML
Add these to your `<head>` in HTML files:

```html
<!-- Component Library -->
<link rel="stylesheet" href="components.html">

<!-- Webhook Handler -->
<script src="webhook-handler.js"></script>
```

Or include components inline in HTML files.

### ✅ Step 4: Create First Workflow in n8n
Follow the steps in `n8n-workflows.md` to create:
- ✅ User Registration workflow
- ✅ Course Creation workflow
- ✅ etc.

### ✅ Step 5: Wire HTML Forms to Webhooks
Use `webhook-handler.js` to connect forms:

```html
<form id="signup-form">
  <input name="name" required>
  <input name="email" type="email" required>
  <input name="password" type="password" required>
  <button type="submit">Sign Up</button>
</form>

<script>
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  const result = await webhooks.registerUser(data);
});
</script>
```

### ✅ Step 6: Test End-to-End
1. Open http://localhost:3000/website.html
2. Fill out signup form
3. Submit
4. Check n8n logs for execution
5. Verify response in browser console

---

## 📝 Example: Wire Up User Registration

### Step 1: HTML Form (in website.html)

```html
<div id="signup-modal" class="modal">
  <div class="modal-content">
    <h2>Create Account</h2>
    <form id="signup-form">
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" name="name" required>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" name="email" required>
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input type="tel" name="phone" required>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" name="password" required>
      </div>
      <div class="form-group">
        <label>Role</label>
        <select name="role">
          <option>Student</option>
          <option>Teacher</option>
          <option>Partner</option>
        </select>
      </div>
      <button type="submit" class="btn-primary">Create Account</button>
    </form>
  </div>
</div>
```

### Step 2: Include webhook-handler.js

```html
<script src="webhook-handler.js"></script>
```

### Step 3: Wire Form to Webhook

```html
<script>
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.querySelector('[name="name"]').value,
    email: document.querySelector('[name="email"]').value,
    phone: document.querySelector('[name="phone"]').value,
    password: document.querySelector('[name="password"]').value,
    role: document.querySelector('[name="role"]').value
  };
  
  await webhooks.registerUser(formData);
});
</script>
```

### Step 4: Create n8n Workflow
(Follow instructions in `n8n-workflows.md` → Workflow 1)

### Step 5: Test
1. Fill form → Click "Create Account"
2. n8n webhook receives data
3. n8n calls Claude MCP to validate
4. n8n stores user in database
5. Frontend shows success toast

---

## 🔌 Common Integrations

### 1️⃣ Connect Admin Panel to n8n

**Admin loads user list:**
```javascript
// In admin.html
async function loadUsers() {
  const response = await fetch('http://localhost:5678/webhook/admin-get-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  renderUsersTable(data.users);
}
```

**n8n Workflow (admin-get-users):**
1. Webhook receives request
2. Function node: Return all users from storage
3. Return response with user list

### 2️⃣ Connect Dashboard to Load Enrollments

**Dashboard loads student courses:**
```javascript
// In dashboard.html
async function loadMyCourses() {
  const userId = localStorage.getItem('userId');
  const response = await fetch('http://localhost:5678/webhook/dashboard-get-courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  const data = await response.json();
  renderCourses(data.courses);
}
```

**n8n Workflow:**
1. Webhook receives userId
2. Filter courses where studentId == userId
3. Return filtered courses

### 3️⃣ Connect Website Directory Search to MCP

**Website search with AI:**
```javascript
// In website.html directory page
async function searchTeachers(query) {
  const response = await fetch('http://localhost:5678/webhook/mcp-search-teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  renderSearchResults(data.teachers);
}
```

**n8n Workflow:**
1. Webhook receives search query
2. Call Claude MCP: Semantic search
3. Return ranked results

---

## 🔐 Security Best Practices

### 1. Validate on Frontend & Backend
```javascript
// Frontend (quick check)
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Backend (n8n - authoritative)
// Always validate again in n8n
```

### 2. Never Store Passwords in Plaintext
```javascript
// n8n workflow: Hash password before storage
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash($json.password, 10);
```

### 3. Protect Admin Endpoints
```javascript
// n8n workflow: Check user role before allowing admin action
if ($json.userRole !== 'Admin') {
  return [{
    success: false,
    error: "Unauthorized"
  }];
}
```

### 4. Rate Limiting
```javascript
// n8n: Use Wait node to throttle requests
// Prevents spam/abuse
```

### 5. Audit Logging
```javascript
// n8n: Log all actions
{
  action: 'USER_CREATED',
  userId: $json.userId,
  createdBy: $json.createdByAdmin,
  timestamp: new Date(),
  ip: $json.clientIp
}
```

---

## 🧪 Testing Endpoints

### Via curl
```bash
# Test user signup
curl -X POST http://localhost:5678/webhook/user-signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "Test@123",
    "role": "Student"
  }'

# Test course enrollment
curl -X POST http://localhost:5678/webhook/course-enroll \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course_123",
    "studentId": "student_456"
  }'
```

### Via n8n Test Interface
1. Open workflow
2. Click **Test Workflow**
3. Click **Webhook** node
4. Enter test data
5. Click "Send Test Request"
6. View execution logs

### Via HTML Form
1. Open browser
2. Fill form
3. Submit
4. Check browser console (F12)
5. Check n8n execution logs

---

## 📊 Database Schema (n8n Storage)

n8n uses SQLite by default. Key tables:

```
users:
- id (primary key)
- name, email, phone
- password_hash
- role (Student/Teacher/Partner/Admin)
- is_blocked
- created_at

courses:
- id
- title, description, category
- teacher_id (foreign key)
- price, duration, level
- status (active/draft/archived)

enrollments:
- id
- student_id (foreign key)
- course_id (foreign key)
- progress_percentage
- created_at

attendance:
- id
- class_id
- student_id
- status (present/absent)
- marked_at

payments:
- id
- user_id, amount, type
- status (pending/completed/failed)
- created_at
```

---

## 🚀 Deployment Steps

### Local Development
✅ Running now (docker-compose)

### Staging
1. Push code to GitHub
2. Deploy n8n to staging server
3. Update environment variables
4. Test end-to-end

### Production
1. Use managed n8n (n8n Cloud)
2. Use PostgreSQL instead of SQLite
3. Enable HTTPS
4. Set up email service (SendGrid)
5. Set up payment gateway (Razorpay)
6. Monitor logs and errors

---

## 🐛 Troubleshooting

### n8n Webhook Not Receiving Requests
**Problem:** Frontend sends POST, but n8n doesn't log it
**Solution:**
```bash
# Check if n8n is running
docker ps | grep n8n

# Check logs
docker-compose logs -f n8n

# Verify webhook URL in HTML matches n8n path
# Example: POST http://localhost:5678/webhook/user-signup
```

### Claude API Errors
**Problem:** "Invalid API key" or "Unauthorized"
**Solution:**
1. Verify Claude API key is set in n8n Environment Variables
2. Check key is not expired (https://console.anthropic.com/)
3. Ensure key starts with `sk-ant-`

### Form Data Not Reaching n8n
**Problem:** Webhook never triggered
**Solution:**
```javascript
// Add logging to webhook-handler.js
console.log('Sending to:', this.n8nUrl + '/' + endpoint);
console.log('Data:', data);

// Verify request is actually being sent
// Check Network tab in browser DevTools (F12)
```

### MCP Response Parsing Error
**Problem:** "Cannot read property 'content' of undefined"
**Solution:**
```javascript
// In n8n Function node, add error handling
try {
  const result = JSON.parse($json.content[0].text);
} catch (e) {
  console.error('Parse error:', e);
  return [{ error: 'Failed to parse MCP response' }];
}
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Start n8n locally |
| `DOCKER_SETUP.md` | n8n setup instructions |
| `components.html` | Reusable UI components |
| `webhook-handler.js` | Frontend webhook client |
| `admin.html` | SuperAdmin panel |
| `n8n-workflows.md` | Workflow templates |
| `INTEGRATION_GUIDE.md` | This file |
| `website.html` | Marketing website |
| `dashboard.html` | Student/Teacher/Partner dashboard |

---

## ✅ Quick Checklist to Start

- [ ] Docker running locally
- [ ] n8n accessible at http://localhost:5678
- [ ] Claude API key configured in n8n
- [ ] HTTP server running on http://localhost:3000
- [ ] website.html loads without errors
- [ ] webhook-handler.js included in HTML
- [ ] First workflow created (User Registration)
- [ ] Test form submission works
- [ ] n8n logs show successful execution
- [ ] Response appears in browser console

**Once all checked: You're ready to build! 🚀**

---

## 🤝 Need Help?

1. **n8n Docs:** https://docs.n8n.io/
2. **Claude API Docs:** https://docs.anthropic.com/
3. **Check logs:** `docker-compose logs -f n8n`
4. **Test webhooks:** Use curl commands above

**Start simple, build incrementally. You've got this!** 💪
