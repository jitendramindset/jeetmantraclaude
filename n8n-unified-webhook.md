# 🔄 Unified N8N Webhook Handler - All-in-One Router

## 📌 Overview

**Single Webhook Endpoint:** `POST /webhook/jeetmantra`

This endpoint accepts ALL requests and routes them intelligently based on the `action` parameter. Supports:
- User operations (signup, login, profile)
- Course operations (create, enroll, search)
- Dashboard operations (get data, update)
- Admin operations (manage users, courses)
- MCP/AI operations (validate, generate, recommend)

---

## 🏗️ Workflow Architecture

```
POST /webhook/jeetmantra
    ↓
[1] Webhook (receive all requests)
    ↓
[2] Validate Request (check required fields)
    ↓
[3] Switch Node (route by action type)
    ├─ "user-signup" → User Signup Flow
    ├─ "user-login" → Login Flow
    ├─ "course-create" → Course Creation
    ├─ "course-enroll" → Enrollment
    ├─ "mcp-validate" → Call MCP/AI
    ├─ "mcp-recommend" → Recommendations
    ├─ "admin-get-users" → Get Users
    ├─ "admin-block-user" → Block User
    └─ Default → Error Response
    ↓
[4] Execute Operation
    ↓
[5] Return Response
```

---

## 🔌 Setting Up the Webhook

### Step 1: Create Webhook Node in n8n

1. Open n8n: http://localhost:5678
2. Click **New Workflow**
3. Name it: `jeetmantra-unified-router`
4. Drag **Webhook** node
5. Configuration:
   ```
   Method: POST
   Path: /webhook/jeetmantra
   Authentication: None (for now)
   ```
6. Click **Save**

---

## 📋 Request Format

All requests follow this structure:

```json
{
  "action": "operation-name",
  "data": {
    // Operation-specific data
  },
  "timestamp": "2024-04-28T10:30:00Z",
  "source": "frontend"
}
```

### Examples:

**User Signup:**
```json
{
  "action": "user-signup",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "password": "SecurePass123!",
    "userType": "student",
    "skills": ["Python", "Mathematics"],
    "aiProvider": "openai",
    "apiKey": "sk-..." // Optional
  },
  "timestamp": "2024-04-28T10:30:00Z"
}
```

**MCP Validation:**
```json
{
  "action": "mcp-validate",
  "data": {
    "formType": "course-creation",
    "formData": {
      "title": "Advanced Python",
      "price": 4999
    }
  },
  "timestamp": "2024-04-28T10:30:00Z"
}
```

**Admin Get Users:**
```json
{
  "action": "admin-get-users",
  "data": {
    "filter": "active",
    "limit": 50,
    "offset": 0
  },
  "timestamp": "2024-04-28T10:30:00Z"
}
```

---

## 🔀 Step 2: Add Validation Node

Add a **Function** node to validate the request:

```javascript
const action = $json.action;
const data = $json.data;

// Validate required fields
if (!action || !data) {
  return [{
    success: false,
    error: "Missing 'action' or 'data' field",
    code: "INVALID_REQUEST"
  }];
}

// Log the action for debugging
console.log(`[${new Date().toISOString()}] Action: ${action}`);

return [{
  action,
  data,
  valid: true
}];
```

---

## 🔀 Step 3: Add Switch Node (Router)

Add a **Switch** node to route based on action:

```
Switch on: action

Cases:
├─ user-signup → User Signup Flow
├─ user-login → Login Flow
├─ user-profile-get → Get Profile
├─ user-profile-update → Update Profile
│
├─ course-create → Create Course
├─ course-list → List Courses
├─ course-enroll → Enroll Student
├─ course-search → Search Courses
│
├─ dashboard-student → Student Dashboard
├─ dashboard-teacher → Teacher Dashboard
├─ dashboard-partner → Partner Dashboard
│
├─ admin-get-users → Admin Users
├─ admin-block-user → Block User
├─ admin-unblock-user → Unblock User
├─ admin-delete-user → Delete User
├─ admin-get-courses → Admin Courses
│
├─ mcp-validate → MCP Validation
├─ mcp-recommend → MCP Recommendations
├─ mcp-generate → MCP Content Generation
├─ mcp-autofill → MCP Auto-fill
│
└─ Default → Error Response
```

---

## 👤 USER OPERATIONS

### user-signup
```javascript
// Input
{
  "action": "user-signup",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "password": "SecurePass123!",
    "userType": "student",
    "skills": ["Python"],
    "aiProvider": "openai",
    "apiKey": "sk-..." // Optional
  }
}

// Output
{
  "success": true,
  "userId": "user_1234567890",
  "email": "john@example.com",
  "message": "Signup successful. Verification email sent."
}
```

**n8n Nodes:**
1. Validate email (MCP call)
2. Check if email exists
3. Hash password
4. Encrypt API key (if provided)
5. Create user record
6. Send verification email
7. Return response

### user-login
```javascript
{
  "action": "user-login",
  "data": {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
}

// Output
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "role": "student"
  }
}
```

### user-profile-get
```javascript
{
  "action": "user-profile-get",
  "data": {
    "userId": "user_123"
  }
}
```

### user-profile-update
```javascript
{
  "action": "user-profile-update",
  "data": {
    "userId": "user_123",
    "updates": {
      "fullName": "Jane Doe",
      "skills": ["Python", "JavaScript"]
    }
  }
}
```

---

## 📚 COURSE OPERATIONS

### course-create
```javascript
{
  "action": "course-create",
  "data": {
    "title": "Advanced Python",
    "description": "Learn advanced Python concepts",
    "category": "Programming",
    "price": 4999,
    "teacherId": "user_123",
    "duration": 30,
    "level": "intermediate"
  }
}

// MCP Call: Validate course data
// MCP Call: Generate course description
// Result: Course created, returns courseId
```

### course-list
```javascript
{
  "action": "course-list",
  "data": {
    "filter": {
      "category": "Programming",
      "minPrice": 0,
      "maxPrice": 10000
    },
    "limit": 20,
    "offset": 0
  }
}

// Result: Array of courses matching filter
```

### course-enroll
```javascript
{
  "action": "course-enroll",
  "data": {
    "studentId": "user_456",
    "courseId": "course_123"
  }
}

// Check capacity
// Create enrollment record
// Send confirmation email
```

### course-search
```javascript
{
  "action": "course-search",
  "data": {
    "query": "Python for beginners",
    "type": "semantic" // semantic or keyword
  }
}

// MCP Call: Semantic search
// Result: Top matching courses
```

---

## 📊 DASHBOARD OPERATIONS

### dashboard-student
```javascript
{
  "action": "dashboard-student",
  "data": {
    "userId": "user_123"
  }
}

// Result:
{
  "enrolledCourses": [],
  "attendance": { "percentage": 92 },
  "wallet": { "balance": 5000 },
  "skills": [],
  "recommendations": []
}
```

### dashboard-teacher
```javascript
{
  "action": "dashboard-teacher",
  "data": {
    "userId": "user_123"
  }
}

// Result:
{
  "courses": [],
  "students": 45,
  "earnings": 50000,
  "schedule": [],
  "pendingReview": 12
}
```

### dashboard-partner
```javascript
{
  "action": "dashboard-partner",
  "data": {
    "userId": "user_123"
  }
}

// Result:
{
  "services": [],
  "bookings": [],
  "earnings": 75000,
  "ratings": 4.8
}
```

---

## 👨‍💼 ADMIN OPERATIONS

### admin-get-users
```javascript
{
  "action": "admin-get-users",
  "data": {
    "filter": "active", // active, blocked, all
    "role": "all", // student, teacher, partner, all
    "search": "", // search by name/email
    "limit": 50,
    "offset": 0
  }
}

// Result: Array of users with pagination
```

### admin-block-user
```javascript
{
  "action": "admin-block-user",
  "data": {
    "userId": "user_123",
    "reason": "Violation of community guidelines"
  }
}

// Result: User blocked, sessions revoked
```

### admin-unblock-user
```javascript
{
  "action": "admin-unblock-user",
  "data": {
    "userId": "user_123"
  }
}
```

### admin-delete-user
```javascript
{
  "action": "admin-delete-user",
  "data": {
    "userId": "user_123",
    "reason": "User requested deletion"
  }
}

// Result: User and all associated data deleted
```

### admin-get-courses
```javascript
{
  "action": "admin-get-courses",
  "data": {
    "filter": "active", // active, draft, archived
    "limit": 50,
    "offset": 0
  }
}

// Result: Array of courses with enrollment stats
```

---

## 🤖 MCP/AI OPERATIONS

### mcp-validate
```javascript
{
  "action": "mcp-validate",
  "data": {
    "formType": "user-signup", // or course-creation, etc
    "formData": {
      "email": "john@example.com",
      "password": "SecurePass123!"
    }
  }
}

// Calls Claude API via MCP
// Result:
{
  "valid": true,
  "errors": [],
  "warnings": []
}
```

**n8n Flow:**
1. Receive validation request
2. Prepare prompt based on formType
3. HTTP Request to Claude API
4. Parse response
5. Return validation result

### mcp-recommend
```javascript
{
  "action": "mcp-recommend",
  "data": {
    "userId": "user_123",
    "type": "courses" // courses, skills, teachers
  }
}

// MCP Call: Analyze user profile
// MCP Call: Generate recommendations
// Result: Top 5 recommendations
```

### mcp-generate
```javascript
{
  "action": "mcp-generate",
  "data": {
    "type": "course-description",
    "input": {
      "title": "Python Basics",
      "topics": ["variables", "loops", "functions"]
    }
  }
}

// MCP Call: Generate content
// Result: Professional course description
```

### mcp-autofill
```javascript
{
  "action": "mcp-autofill",
  "data": {
    "fieldType": "course-description",
    "context": {
      "title": "Advanced JavaScript",
      "level": "advanced"
    }
  }
}

// MCP Call: Suggest field values
// Result: Suggestions array
```

---

## 🔀 Step 4: Create Operation Flows

For each operation, create a sub-flow:

### user-signup Sub-Flow
```
1. Set node (prepare data)
2. HTTP Request (MCP validate email)
3. Function node (parse MCP response)
4. Function node (hash password)
5. Function node (encrypt API key if provided)
6. Function node (create user record)
7. HTTP Request (send email)
8. Respond node (return success)
```

### mcp-validate Sub-Flow
```
1. Set node (prepare prompt)
2. Function node (detect AI provider from user)
3. HTTP Request (call AI API)
4. Function node (parse response)
5. Respond node (return validation result)
```

### admin-get-users Sub-Flow
```
1. Function node (build query with filters)
2. Function node (fetch from database)
3. Function node (format response)
4. Respond node (return user list)
```

---

## 🧪 TESTING THE UNIFIED WEBHOOK

### Test 1: User Signup (curl)
```bash
curl -X POST http://localhost:5678/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "user-signup",
    "data": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+91 9876543210",
      "password": "SecurePass123!",
      "userType": "student",
      "skills": ["Python"],
      "aiProvider": "openai",
      "apiKey": null
    },
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "source": "test"
  }'
```

### Test 2: MCP Validate (curl)
```bash
curl -X POST http://localhost:5678/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "mcp-validate",
    "data": {
      "formType": "course-creation",
      "formData": {
        "title": "Python Basics",
        "price": 4999
      }
    },
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "source": "test"
  }'
```

### Test 3: Admin Get Users (curl)
```bash
curl -X POST http://localhost:5678/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "admin-get-users",
    "data": {
      "filter": "active",
      "limit": 10
    },
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "source": "test"
  }'
```

---

## 📊 Response Format (Consistent)

All operations return standardized response:

**Success:**
```json
{
  "success": true,
  "code": "SUCCESS",
  "data": {},
  "message": "Operation completed successfully"
}
```

**Error:**
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "error": "Error message",
  "details": {}
}
```

---

## 🔐 Error Handling

Create error response nodes for:
- Invalid action
- Missing required fields
- Authentication failed
- Database error
- MCP API error

---

## 📝 Logging & Monitoring

Add logging node after webhook:

```javascript
{
  "timestamp": new Date().toISOString(),
  "action": $json.action,
  "userId": $json.data.userId || "anonymous",
  "status": "received",
  "source": $json.source
}
```

Store in database for audit trail.

---

## 🎯 Benefits of Unified Webhook

✅ **Single entry point** - Simpler frontend integration
✅ **Scalable routing** - Easy to add new operations
✅ **Consistent response format** - Predictable client handling
✅ **Better logging** - Easier to track all requests
✅ **Flexible MCP routing** - Route to any AI provider
✅ **Error handling** - Centralized error responses

---

## 📋 Supported Operations (Summary)

| Category | Operations |
|----------|-------------|
| **User** | signup, login, profile-get, profile-update |
| **Course** | create, list, enroll, search |
| **Dashboard** | student, teacher, partner |
| **Admin** | get-users, block-user, unblock-user, delete-user, get-courses |
| **MCP** | validate, recommend, generate, autofill |

---

## 🚀 Implementation Checklist

- [ ] Create new workflow: `jeetmantra-unified-router`
- [ ] Add Webhook node set to `/webhook/jeetmantra`
- [ ] Add Validation function node
- [ ] Add Switch (routing) node
- [ ] Create sub-flows for each operation
- [ ] Add error handling nodes
- [ ] Add logging node
- [ ] Test each operation with curl
- [ ] Update frontend to use single webhook URL
- [ ] Test end-to-end from signup form

---

## 📞 Next Steps

1. **Create the workflow** in n8n following above steps
2. **Test each operation** with provided curl commands
3. **Update webhook-handler.js** to use single endpoint
4. **Wire frontend forms** to new unified webhook
5. **Monitor and scale** as needed

---

**Ready to build the unified router? Let's go! 🚀**
