# 🔄 Unified Webhook - Quick Reference Guide

**Single Endpoint:** `POST http://localhost:5678/webhook/jeetmantra`

All operations use this one endpoint. Smart routing handles the rest.

---

## 🚀 Quick Examples

### 1️⃣ User Signup (No AI Key Required!)
```javascript
// From signup.html
const data = {
  action: 'user-signup',
  data: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+91 9876543210',
    password: 'SecurePass123!',
    userType: 'student',
    skills: ['Python', 'Mathematics'],
    aiProvider: 'openai',
    apiKey: null  // Optional - user can skip!
  }
};

fetch('http://localhost:5678/webhook/jeetmantra', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(r => r.json()).then(result => {
  if (result.success) {
    alert('Signup successful!');
    window.location = '/dashboard.html';
  }
});
```

### 2️⃣ User Login
```javascript
const data = {
  action: 'user-login',
  data: {
    email: 'john@example.com',
    password: 'SecurePass123!'
  }
};

// Send to same webhook
```

### 3️⃣ Validate with MCP/Claude
```javascript
const data = {
  action: 'mcp-validate',
  data: {
    formType: 'course-creation',
    formData: {
      title: 'Python Basics',
      price: 4999,
      duration: 30
    }
  }
};

// MCP validates and returns: { valid: true, errors: [], warnings: [] }
```

### 4️⃣ Get Course Recommendations
```javascript
const data = {
  action: 'mcp-recommend',
  data: {
    userId: 'user_123',
    type: 'courses'
  }
};

// MCP analyzes student profile and returns: [course1, course2, course3, ...]
```

### 5️⃣ Admin: Get All Users
```javascript
const data = {
  action: 'admin-get-users',
  data: {
    filter: 'active',
    limit: 50,
    offset: 0
  }
};

// Returns: { users: [...], total: 234, page: 1 }
```

### 6️⃣ Admin: Block User
```javascript
const data = {
  action: 'admin-block-user',
  data: {
    userId: 'user_123',
    reason: 'Inappropriate content'
  }
};

// Returns: { success: true, message: 'User blocked' }
```

---

## 📋 All Actions (Complete List)

### User Operations
- `user-signup` - Create account (AI key optional)
- `user-login` - Login with credentials
- `user-profile-get` - Get user profile
- `user-profile-update` - Update profile details

### Course Operations
- `course-create` - Create new course
- `course-list` - List all courses with filters
- `course-enroll` - Enroll student in course
- `course-search` - Search courses (supports semantic search via MCP)

### Dashboard Operations
- `dashboard-student` - Get student dashboard data
- `dashboard-teacher` - Get teacher dashboard data
- `dashboard-partner` - Get partner dashboard data

### Admin Operations
- `admin-get-users` - List all users
- `admin-block-user` - Block a user
- `admin-unblock-user` - Unblock a user
- `admin-delete-user` - Delete a user
- `admin-get-courses` - List all courses (admin view)

### MCP/AI Operations
- `mcp-validate` - Validate form data via Claude
- `mcp-recommend` - Get recommendations via Claude
- `mcp-generate` - Generate content via Claude
- `mcp-autofill` - Get auto-fill suggestions via Claude

---

## 🔌 How It Works in n8n

```
┌─ POST /webhook/jeetmantra
│  │
│  ├─ Extract action: "user-signup"
│  │
│  ├─ Switch based on action
│  │
│  ├─ Route to correct handler:
│  │  ├─ Validate form data
│  │  ├─ Call MCP if needed
│  │  ├─ Store in database
│  │  └─ Send response
│  │
│  └─ Return JSON response
```

---

## 📊 Response Format (Always Same)

**Success:**
```json
{
  "success": true,
  "code": "SUCCESS",
  "data": {
    // Operation-specific data
  },
  "message": "Operation completed successfully"
}
```

**Error:**
```json
{
  "success": false,
  "code": "INVALID_EMAIL",
  "error": "Email already registered",
  "details": {
    "field": "email",
    "value": "john@example.com"
  }
}
```

---

## 🧪 Testing with curl

### Test Signup (No API Key)
```bash
curl -X POST http://localhost:5678/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "user-signup",
    "data": {
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+91 9876543211",
      "password": "SecurePass123!",
      "userType": "teacher",
      "skills": ["Mathematics", "Physics"],
      "qualification": "B.Sc Mathematics",
      "experience": 5,
      "institution": "Delhi University",
      "aiProvider": "gemini",
      "apiKey": null
    }
  }'
```

### Test MCP Validation
```bash
curl -X POST http://localhost:5678/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "mcp-validate",
    "data": {
      "formType": "course-creation",
      "formData": {
        "title": "Advanced Mathematics",
        "price": 5999,
        "duration": 45
      }
    }
  }'
```

### Test Admin Get Users
```bash
curl -X POST http://localhost:5678/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "admin-get-users",
    "data": {
      "filter": "all",
      "limit": 10,
      "offset": 0
    }
  }'
```

---

## 🛠️ Using in HTML Forms

### Signup Form Integration
```html
<form id="signup-form">
  <input name="fullName" required>
  <input name="email" type="email" required>
  <input name="password" type="password" required>
  <input name="userType" type="hidden" value="student">
  <button type="submit">Sign Up</button>
</form>

<script>
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  const response = await fetch('http://localhost:5678/webhook/jeetmantra', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'user-signup',
      data: data
    })
  });
  
  const result = await response.json();
  if (result.success) {
    alert('Signup successful!');
  } else {
    alert('Error: ' + result.error);
  }
});
</script>
```

---

## 🔐 Key Features

✅ **Single Endpoint** - No need to remember multiple URLs
✅ **AI Key Optional** - Users can skip providing API key
✅ **Smart Routing** - n8n figures out what to do
✅ **MCP Integration** - Automatic AI validation and suggestions
✅ **Admin Ready** - Full admin operations included
✅ **Error Handling** - Consistent error responses
✅ **Logging** - All requests logged for debugging

---

## 📝 Implementation Checklist

Frontend:
- [ ] Update signup.html (✅ AI key optional)
- [ ] Update webhook-handler.js (✅ Uses unified endpoint)
- [ ] Test signup form at /signup.html
- [ ] Verify no errors in console

Backend (n8n):
- [ ] Create workflow: `jeetmantra-unified-router`
- [ ] Add Webhook node: `/webhook/jeetmantra`
- [ ] Add Validation node
- [ ] Add Switch (routing) node
- [ ] Create sub-flows for each action
- [ ] Test with curl commands
- [ ] Verify database storage
- [ ] Check email sending

---

## 🚀 Next Steps

1. **Test Signup**
   ```
   Open: http://localhost:3000/signup.html
   Fill form WITHOUT API key
   Click submit
   Should see success
   ```

2. **Create n8n Workflow**
   ```
   Follow: n8n-unified-webhook.md
   Create: jeetmantra-unified-router
   Add: All nodes and sub-flows
   ```

3. **Test Webhook**
   ```
   Run: curl commands from above
   Verify: Response format
   Check: n8n logs
   ```

4. **Wire Forms**
   ```
   Update: All form submissions
   Use: Single webhook URL
   Test: End-to-end flows
   ```

---

## 💡 Tips

**For Testing:**
- Use curl to test webhook directly
- Check n8n logs for debugging
- Use browser DevTools for frontend issues
- Test each action individually first

**For Development:**
- Keep webhook URL in one place (variable)
- Standardize response handling
- Add loading states during requests
- Show user-friendly error messages

**For Production:**
- Move webhook URL to config
- Add request signing for security
- Implement rate limiting in n8n
- Monitor webhook performance

---

## 🎯 Benefits

| Before | After |
|--------|-------|
| 10+ webhook endpoints | 1 unified endpoint |
| Complex routing | Smart automatic routing |
| Hard to track requests | Centralized logging |
| API key mandatory | API key optional |
| Manual MCP calls | Automatic MCP integration |

---

**Ready to use the unified webhook? Start with signup.html 🚀**

Questions? Check INTEGRATION_GUIDE.md or n8n-unified-webhook.md for details.
