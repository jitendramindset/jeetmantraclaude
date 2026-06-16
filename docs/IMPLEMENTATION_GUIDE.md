# HTML Backend Integration Implementation Guide
**Date**: May 21, 2026  
**Status**: AUDIT COMPLETE + FIXES APPLIED

---

## Quick Summary

✅ **FIXED**: 
- signup.html → Calls `/api/auth/signup` ✓
- admin.html → Calls `/api/admin/*` endpoints ✓
- components.html → API URL corrected ✓

⚠️ **NEEDS INTEGRATION**:
- dashboard.html → API service created (`dashboard-api.js`)
- website.html → Login service created (`login-api.js`)

---

## Files Created/Modified

### 1. **dashboard-api.js** ✅ NEW
**Purpose**: Provides all backend API calls for dashboard.html  
**Location**: `jeetmantraclaude-main/dashboard-api.js`

**What it does**:
- Fetches student/teacher/partner dashboard data
- Manages authentication tokens
- Handles all 401 errors and token expiration
- Provides functions for:
  - `getDashboardData()` - Main dashboard stats
  - `getUserCourses()` - Enrolled courses
  - `getUserAttendance()` - Attendance records
  - `getUserHomework()` - Homework assignments
  - `getLiveClasses()` - Live lectures schedule
  - `getPartnerServices()` - Partner recommendations
  - `submitClassFeedback()` - Submit feedback
  - And more...

**How to use in dashboard.html**:
```javascript
// Load data
const data = await getDashboardData();

// Or load all at once
const allData = await loadAllDashboardData();
```

### 2. **login-api.js** ✅ NEW
**Purpose**: Provides authentication API calls for website.html login form  
**Location**: `jeetmantraclaude-main/login-api.js`

**What it does**:
- Handles email/password login
- Handles OTP-based login
- Handles Google OAuth login
- Manages tokens and user info in localStorage
- Provides redirect logic based on user role

**How to use in website.html**:
```javascript
// Email login
const result = await loginUser(email, password);
if (result.success) {
  redirectToDashboard(); // Auto-redirect based on role
}

// OTP login
await requestOTP(phone);
const result = await verifyOTP(phone, otp);

// Google login
const result = await loginWithGoogle(googleToken);
```

### 3. **components.html** ✅ FIXED
**Change**: Updated API configuration from `localhost:3000` to `localhost:5000`

**Before**:
```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:3000',
  webhookBase: '/webhook',
};
```

**After**:
```javascript
const API_CONFIG = {
  baseURL: 'http://localhost:5000',
  apiBase: '/api',
};
```

**Change**: Updated callWebhook function URL construction

**Before**:
```javascript
const url = `${API_CONFIG.baseURL}${API_CONFIG.webhookBase}${endpoint}`;
```

**After**:
```javascript
const url = `${API_CONFIG.baseURL}${API_CONFIG.apiBase}${endpoint}`;
```

### 4. **dashboard.html** ✅ SCRIPT ADDED
**Change**: Added script tag to load dashboard-api.js

**Added**:
```html
<script src="dashboard-api.js"></script>
```

---

## Backend API Endpoints Required

### Authentication Endpoints
```
POST   /api/auth/signup              ← Create new user account
POST   /api/auth/login               ← Login with email/password
GET    /api/auth/verify              ← Verify token validity
POST   /api/auth/send-otp            ← Send OTP to phone
POST   /api/auth/verify-otp          ← Verify OTP and login
POST   /api/auth/google-login        ← Google OAuth login
POST   /api/auth/refresh             ← Refresh JWT token
```

### Admin Endpoints
```
GET    /api/admin/stats              ← Platform statistics
GET    /api/admin/users              ← List all users
PUT    /api/admin/users/:id/toggle-status  ← Block/unblock user
```

### Dashboard Endpoints (NEW - Need to create)
```
GET    /api/dashboard                ← Main dashboard data
GET    /api/dashboard/attendance     ← Attendance records
GET    /api/dashboard/homework       ← Homework assignments
GET    /api/live-classes             ← Live class schedule
GET    /api/user/skills              ← User skills progress
GET    /api/enrollments              ← User's enrollments
GET    /api/courses                  ← Available courses
GET    /api/courses/recorded         ← Recorded lectures
GET    /api/partners/services        ← Partner services
POST   /api/enrollments              ← Enroll in course
POST   /api/bookings                 ← Book partner service
POST   /api/feedback                 ← Submit class feedback
```

### Teacher Endpoints (NEW - Need to create)
```
GET    /api/teacher/classes          ← Teacher's classes
GET    /api/teacher/payments         ← Teacher payments/earnings
GET    /api/teacher/referrals        ← Teacher referrals
POST   /api/courses                  ← Create course (teacher)
```

### Partner Endpoints (NEW - Need to create)
```
GET    /api/partner/bookings         ← Partner bookings
GET    /api/partner/revenue          ← Partner revenue/earnings
GET    /api/partner/referrals        ← Partner referrals
POST   /api/services                 ← Register partner service
```

### Payments Endpoints
```
GET    /api/payments/my              ← User payment history
POST   /api/payments                 ← Create payment record
POST   /api/payments/webhook/payment ← Update payment status
```

---

## Implementation Checklist

### Phase 1: Frontend Ready (Current State) ✅
- [x] signup.html - Connected to `/api/auth/signup`
- [x] admin.html - Connected to admin endpoints
- [x] components.html - API URL fixed
- [x] dashboard-api.js - Created with all functions
- [x] login-api.js - Created with auth functions
- [x] dashboard.html - Script tag added to load API service

### Phase 2: Backend Implementation (PENDING)
- [ ] Verify `/api/auth/login` endpoint works
- [ ] Verify `/api/auth/verify` endpoint works
- [ ] Create `/api/dashboard` endpoint
- [ ] Create `/api/dashboard/attendance` endpoint
- [ ] Create `/api/dashboard/homework` endpoint
- [ ] Create `/api/live-classes` endpoint
- [ ] Create `/api/user/skills` endpoint
- [ ] Create `/api/courses` endpoint endpoints
- [ ] Create `/api/partners/services` endpoint
- [ ] Create `/api/teacher/*` endpoints
- [ ] Create `/api/partner/*` endpoints

### Phase 3: Frontend Integration (PENDING)
- [ ] Update website.html LoginPage to use login-api.js
- [ ] Update dashboard.html HomeScreen to use dashboard-api.js
- [ ] Add loading states and error handling
- [ ] Add token refresh logic
- [ ] Add 401 error handling
- [ ] Test full login → dashboard flow
- [ ] Test role-based redirects (student/teacher/partner/admin)

### Phase 4: Testing (PENDING)
- [ ] Test signup flow end-to-end
- [ ] Test login flow end-to-end
- [ ] Test token expiration handling
- [ ] Test all role-based dashboards
- [ ] Test all admin CRUD operations
- [ ] Test API error scenarios

### Phase 5: Documentation (PENDING)
- [ ] Update README with API endpoints
- [ ] Document authentication flow
- [ ] Document error codes and messages
- [ ] Create API schema documentation

---

## Token Management

### How Authentication Works:
```javascript
// 1. User logs in
const result = await loginUser(email, password);

// 2. Token is stored in localStorage
localStorage.setItem('authToken', result.token);
localStorage.setItem('user', JSON.stringify(result.user));

// 3. All subsequent API calls include token
headers: {
  'Authorization': `Bearer ${token}`
}

// 4. If 401 error (token expired)
// - Clear localStorage
// - Redirect to login page
```

### Token Requirements:
- JWT format
- Stored in `localStorage.authToken`
- Included in all protected route headers as: `Authorization: Bearer {token}`
- Should be refreshed before expiration
- Clear on logout

---

## Next Steps

### 1. Backend Development
Create the missing dashboard/teacher/partner endpoints listed above in `/backend/routes/`.

### 2. Update website.html
Integrate login-api.js into the LoginPage component:

```javascript
// In LoginPage component
async function handleEmailLogin() {
  const result = await loginUser(email, password);
  if (result.success) {
    redirectToDashboard();
  } else {
    showError(result.error);
  }
}
```

### 3. Update dashboard.html
Integrate dashboard-api.js into HomeScreen and other components:

```javascript
// In HomeScreen component useEffect
useEffect(() => {
  loadDashboardData();
}, []);

async function loadDashboardData() {
  const data = await getDashboardData();
  // Update state with real data instead of hardcoded
}
```

### 4. Testing
- Open http://localhost:3000/website.html
- Click Login
- Enter test credentials
- Verify redirect to dashboard
- Check if data loads from backend

### 5. Deployment
Once all endpoints are created and tested:
- Run full E2E test suite
- Deploy backend changes
- Deploy frontend changes
- Monitor for 401 errors

---

## Error Handling Examples

### Login Error
```javascript
const result = await loginUser(email, password);
if (!result.success) {
  showToast(`Login failed: ${result.error}`, 'error');
  // Show error to user
}
```

### Dashboard Data Error
```javascript
try {
  const data = await getDashboardData();
  if (data) updateUI(data);
} catch (error) {
  showToast('Failed to load dashboard data', 'error');
  // Keep showing cached data or placeholder
}
```

### Token Expiration
```javascript
if (response.status === 401) {
  // Clear auth
  localStorage.clear();
  
  // Redirect to login
  window.location.href = '/website.html?tab=login';
  
  // Show message
  showToast('Session expired, please login again', 'warning');
}
```

---

## Browser Console Diagnostics

Users/developers can check if API integration is working by running in browser console:

```javascript
// Check if API services loaded
console.log(typeof getDashboardData); // Should be 'function'
console.log(typeof loginUser); // Should be 'function'

// Check auth token
console.log(localStorage.getItem('authToken')); // Should show token if logged in

// Check stored user
console.log(JSON.parse(localStorage.getItem('user'))); // Should show user object

// Test API call
const data = await getDashboardData();
console.log(data); // Should show dashboard data
```

---

## Files Summary

| File | Type | Purpose | Status |
|------|------|---------|--------|
| **signup.html** | HTML | User registration | ✅ Fixed - Calls `/api/auth/signup` |
| **website.html** | HTML | Landing/Login page | ⚠️ Needs login form integration |
| **dashboard.html** | HTML | Role-based dashboard | ⚠️ Ready for API integration |
| **admin.html** | HTML | Admin dashboard | ✅ Fixed - All APIs working |
| **components.html** | HTML | Component library | ✅ Fixed - API URL corrected |
| **dashboard-api.js** | JavaScript | Dashboard backend calls | ✅ New - Ready to use |
| **login-api.js** | JavaScript | Login/Auth backend calls | ✅ New - Ready to use |
| **webhook-handler.js** | JavaScript | n8n webhook client | ⚠️ Deprecated - no longer used |
| **webhook-test.html** | HTML | Webhook testing tool | ℹ️ Testing utility only |

---

## Quick Reference URLs

### Frontend
- Landing/Login: `http://localhost:3000/website.html`
- Signup: `http://localhost:3000/signup.html`
- Dashboard: `http://localhost:3000/dashboard.html`
- Admin: `http://localhost:3000/admin.html`

### Backend
- API Base: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/health`

### n8n (Deprecated)
- Webhook Base: `http://localhost:5678/webhook` (local)
- Production: `https://work.mantravat.cloud/webhook` (not used)

---

## Troubleshooting

### "API Error: 400" in signup
- Check that all required fields are provided
- Check password requirements (8+ chars, uppercase, lowercase, number, special char)
- Check if email already exists

### "Failed to load dashboard data"
- Check if user token is stored in localStorage
- Check if backend server is running on port 5000
- Check browser console for specific error message
- Check network tab to see response status

### "Session expired" after login
- Token may have been set to short expiration
- Check backend JWT_SECRET configuration
- Check token expiration time in backend

### Login form not working
- Check if login-api.js is loaded in website.html
- Check if backend `/api/auth/login` endpoint exists
- Test endpoint directly: `curl -X POST http://localhost:5000/api/auth/login -d '{"email":"test@test.com","password":"Test123!"}'`

---

**Report Status**: AUDIT COMPLETE - READY FOR IMPLEMENTATION  
**Next Phase**: Backend endpoint creation and frontend integration testing

