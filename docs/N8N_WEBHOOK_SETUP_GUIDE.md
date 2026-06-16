# N8N WEBHOOK INTEGRATION GUIDE - JeetMantra Components

**For Backend/N8N Setup**  
**Generate Date:** May 4, 2026  

---

## 🎯 IMPORTANT: TOKEN HANDLING

Every API request from components.html includes:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Your N8N webhooks MUST check the token in the Authorization header.**

---

## 📋 REQUIRED WEBHOOKS

### 1. ✅ POST /webhook/create-user

**Frontend Call:**
```javascript
callWebhook('/create-user', 'POST', {
  name: 'Raj Kumar',
  email: 'raj@example.com',
  role: 'Teacher',
  password: 'SecurePass123'
})
```

**N8N Webhook Requirements:**
- **Path:** `POST /webhook/create-user`
- **Check Token:** `Authorization` header contains valid Bearer token
- **Validate User Inputs:**
  - `name`: Required, string
  - `email`: Required, valid email format
  - `role`: Required, one of: Student, Teacher, Partner
  - `password`: Required, min 8 chars with uppercase, lowercase, number

**Expected Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "role": "Teacher",
    "active": true
  },
  "message": "User created successfully"
}
```

**Frontend Action:**
- Add user to data grid
- Close modal
- Show success toast

---

### 2. ✅ PUT /webhook/update-user

**Frontend Call:**
```javascript
callWebhook('/update-user', 'PUT', {
  id: 'user_123',
  name: 'Raj Kumar Updated',
  email: 'raj.new@example.com',
  role: 'Teacher'
})
```

**N8N Webhook Requirements:**
- **Path:** `PUT /webhook/update-user`
- **Check Token:** `Authorization` header
- **Validate Inputs:**
  - `id`: Required, existing user ID
  - `name`: Required, string
  - `email`: Required, valid format
  - `role`: Required, one of: Student, Teacher, Partner

**Expected Response:**
```json
{
  "user": {
    "id": "user_123",
    "name": "Raj Kumar Updated",
    "email": "raj.new@example.com",
    "role": "Teacher",
    "active": true
  },
  "message": "User updated successfully"
}
```

**Frontend Action:**
- Update user in data grid
- Close modal
- Show success toast

---

### 3. ✅ POST /webhook/block-user

**Frontend Call:**
```javascript
callWebhook('/block-user', 'POST', {
  userId: 'user_123'
})
```

**N8N Webhook Requirements:**
- **Path:** `POST /webhook/block-user`
- **Check Token:** `Authorization` header
- **Validate:**
  - `userId`: Required, existing user ID
  - Mark user as inactive/blocked

**Expected Response:**
```json
{
  "message": "User blocked successfully"
}
```

**Frontend Action:**
- Set user.active = false
- Refresh data grid
- Show success toast

---

### 4. ✅ DELETE /webhook/delete-user

**Frontend Call:**
```javascript
callWebhook('/delete-user', 'DELETE', {
  userId: 'user_123'
})
```

**N8N Webhook Requirements:**
- **Path:** `DELETE /webhook/delete-user`
- **Check Token:** `Authorization` header
- **Validate:**
  - `userId`: Required, existing user ID
  - Delete user from database (or soft-delete)

**Expected Response:**
```json
{
  "message": "User deleted successfully"
}
```

**Frontend Action:**
- Remove user from data grid
- Refresh pagination
- Show success toast

---

### 5. ✅ POST /webhook/search

**Frontend Call:**
```javascript
callWebhook('/search', 'POST', {
  query: 'mathematics'
})
```

**N8N Webhook Requirements:**
- **Path:** `POST /webhook/search`
- **Check Token:** `Authorization` header
- **Search:**
  - Search users by name/email
  - Search courses by name/description
  - Combine results from multiple tables
  - Limit to 10 results

**Expected Response:**
```json
{
  "suggestions": [
    {
      "id": "course_123",
      "title": "IIT Mathematics Course",
      "meta": "Course • 4.9★ • 1200 students"
    },
    {
      "id": "teacher_456",
      "title": "Raj Kumar (Teacher)",
      "meta": "Teacher • IIT Delhi • 120+ students"
    }
  ]
}
```

**Frontend Action:**
- Display suggestions dropdown
- On click: Show notification with selected ID
- (You'll handle the click action)

---

### 6. ✅ POST /webhook/upload-file

**Frontend Call:**
```javascript
// FormData with file
formData.append('file', file);

fetch('/webhook/upload-file', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>'
  },
  body: formData
})
```

**N8N Webhook Requirements:**
- **Path:** `POST /webhook/upload-file`
- **Check Token:** `Authorization` header
- **Handle:** Multipart form data with file
- **Validate:**
  - File type: JPEG, PNG, PDF, TXT only
  - File size: Max 10MB
- **Save File:** Save to cloud storage (AWS S3, Cloudinary, etc.)

**Expected Response:**
```json
{
  "fileUrl": "https://cloud.example.com/uploads/file_123.pdf",
  "fileName": "file_123.pdf",
  "size": 5242880,
  "type": "application/pdf"
}
```

**Frontend Action:**
- Store fileUrl in window.uploadedFileUrl
- Show success toast
- Ready for later use in forms

---

### 7. 📝 POST /webhook/login

**This is on a separate login page - NOT in components.html**

**Frontend Call:**
```javascript
// From login.html
callWebhook('/login', 'POST', {
  email: 'user@example.com',
  password: 'SecurePass123'
}, false) // withAuth = false
```

**N8N Webhook Requirements:**
- **Path:** `POST /webhook/login`
- **Check Token:** NO (public endpoint)
- **Validate:**
  - `email`: Required, valid format
  - `password`: Required, string
  - Check credentials against database
- **Generate JWT Token:** Create JWT token for user

**Expected Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "role": "Teacher"
  },
  "message": "Login successful"
}
```

**Expected Response (Failure):**
```json
{
  "message": "Invalid email or password",
  "error": "INVALID_CREDENTIALS"
}
```

**Frontend Action:**
- Save token to localStorage: `setAuthToken(token)`
- Redirect to dashboard
- Show success toast

---

## 🔐 TOKEN VALIDATION LOGIC

### Required in Every Webhook (Except /login)

```javascript
// Pseudocode for N8N webhook
function validateToken() {
  // 1. Extract Authorization header
  const authHeader = request.headers['Authorization'];
  
  // 2. Check format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid token' };
  }
  
  // 3. Extract token
  const token = authHeader.substring(7); // Remove "Bearer "
  
  // 4. Verify JWT (check signature, expiration)
  try {
    const decoded = JWT.verify(token, 'YOUR_SECRET_KEY');
    return { valid: true, userId: decoded.userId, user: decoded };
  } catch (error) {
    return { valid: false, error: 'Invalid or expired token' };
  }
}

// Use in every webhook
if (!validateToken().valid) {
  return { 
    statusCode: 401, 
    body: { message: 'Unauthorized' } 
  };
}
```

---

## 🚀 CORS HEADERS

Your N8N endpoint MUST return CORS headers:

```
Access-Control-Allow-Origin: * (or specific domain)
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## ⚙️ ERROR RESPONSES

Components.html expects these error response formats:

### ✅ Success Response
```json
{
  "message": "Operation successful",
  "data": {...}
}
```

### ❌ Auth Error (401/403)
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Please login again"
}
```
**Frontend Action:** Auto-logout, redirect to login

### ❌ Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Invalid email format",
  "field": "email"
}
```
**Frontend Action:** Show error toast, highlight form field

### ❌ Server Error (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```
**Frontend Action:** Show error toast, log to console

---

## 📊 WEBHOOK SUMMARY TABLE

| Endpoint | Method | Public? | Token Required | Purpose |
|----------|--------|---------|-----------------|---------|
| `/login` | POST | ✅ Yes | ❌ No | User login |
| `/create-user` | POST | ❌ No | ✅ Yes | Create new user |
| `/update-user` | PUT | ❌ No | ✅ Yes | Update user data |
| `/block-user` | POST | ❌ No | ✅ Yes | Block/deactivate user |
| `/delete-user` | DELETE | ❌ No | ✅ Yes | Delete user |
| `/search` | POST | ❌ No | ✅ Yes | Search users/courses |
| `/upload-file` | POST | ❌ No | ✅ Yes | Upload file |

---

## 🔧 FRONTEND CONFIGURATION

### Update this in components.html:
```javascript
const API_CONFIG = {
  baseURL: 'https://your-n8n-domain.com', // ← Change this!
  webhookBase: '/webhook/jeetmantra',     // ← Change this!
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
};
```

### Example Configurations:

**Local Development:**
```javascript
baseURL: 'http://localhost:3000'
webhookBase: '/webhook'
```

**Staging:**
```javascript
baseURL: 'https://staging-n8n.jeetmantra.com'
webhookBase: '/webhook/jeetmantra'
```

**Production:**
```javascript
baseURL: 'https://n8n.jeetmantra.com'
webhookBase: '/webhook/jeetmantra'
```

---

## 🧪 TESTING CHECKLIST FOR BACKEND

### Create User
- [ ] POST /webhook/create-user with valid token
- [ ] POST /webhook/create-user with invalid token → 401
- [ ] POST /webhook/create-user without token → 401
- [ ] POST /webhook/create-user with invalid email → 400
- [ ] POST /webhook/create-user with weak password → 400
- [ ] User actually created in database
- [ ] Response contains user object with ID

### Update User
- [ ] PUT /webhook/update-user with valid token
- [ ] PUT /webhook/update-user with invalid token → 401
- [ ] User data actually updated in database
- [ ] Response returns updated user

### Block User
- [ ] POST /webhook/block-user with valid token
- [ ] User marked as inactive in database
- [ ] Cannot login after being blocked

### Delete User
- [ ] DELETE /webhook/delete-user with valid token
- [ ] User removed from database OR soft-deleted
- [ ] User doesn't appear in searches

### Search
- [ ] POST /webhook/search with valid token
- [ ] Returns relevant results as suggestions
- [ ] Limit to 10 results
- [ ] Returns correct response format

### File Upload
- [ ] POST /webhook/upload-file with valid token
- [ ] File actually saved
- [ ] Returns correct file URL
- [ ] File is accessible at returned URL
- [ ] Reject files larger than 10MB
- [ ] Reject invalid file types

### Login
- [ ] POST /webhook/login with correct credentials
- [ ] Returns valid JWT token
- [ ] Token contains user data
- [ ] POST /webhook/login with wrong password → 401

---

## 📞 SUPPORT

**Common Issues:**

### Issue: "401 Unauthorized"
- Check token format: `Authorization: Bearer <token>`
- Verify token signature on backend
- Check token expiration
- Ensure validate function is checking Authorization header

### Issue: "CORS Error"
- Add CORS headers to N8N webhook response
- Check origin whitelist settings
- Allow Content-Type and Authorization headers

### Issue: "File Upload Not Working"
- Ensure webhook accepts multipart/form-data
- Check file size limit (10MB)
- Verify file type validation
- Test with Postman first

### Issue: "Token Not Passed"
- Check if localStorage has `jeetmantra_token`
- Verify `isTokenValid()` returns true
- Check network tab in browser DevTools
- Ensure `withAuth = true` in callWebhook()

---

## ✨ QUICK START

1. **Create N8N webhooks** for each endpoint (7 total)
2. **Add token validation** to each webhook
3. **Connect to database** for CRUD operations
4. **Test with Postman** before frontend integration
5. **Update API_CONFIG baseURL** in components.html
6. **Test form submission** and verify data in database
7. **Test error scenarios** (401, 400, 500)
8. **Deploy to production**

---

**Status:** 🎉 Ready for Backend Implementation  
**Last Updated:** May 4, 2026
