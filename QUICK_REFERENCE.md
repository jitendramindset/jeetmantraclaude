# ⚡ JeetMantra Backend - Quick Reference Card

## 🚀 Server Status
**Status:** 🟢 RUNNING  
**URL:** `http://localhost:5000`  
**Port:** 5000  
**Environment:** Development  
**Database:** Supabase (Ready for credentials)

---

## 🔑 Important Files

| File | Location | Purpose |
|------|----------|---------|
| **Start Server** | `backend/` → `npm start` | Run backend |
| **Configuration** | `backend/.env` | API keys & secrets |
| **Database Schema** | `backend/database/schema.sql` | PostgreSQL tables |
| **API Reference** | `backend/README.md` | Complete endpoint docs |
| **Frontend Client** | `backend/api-client.js` | JavaScript library |
| **Setup Guide** | `BACKEND_SETUP_GUIDE.md` | Installation steps |
| **Integration Guide** | `BACKEND_INTEGRATION_GUIDE.md` | How to use API |
| **API Testing** | `JeetMantra_API.postman_collection.json` | Postman collection |

---

## 📝 Essential Commands

```bash
# Start server
cd backend && npm start

# Install dependencies
npm install

# Test health endpoint
curl http://localhost:5000/health

# View logs (in current terminal)
# See output above npm start
```

---

## 🔐 Authentication

### Generate Token (Login)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "password123"
  }'
```

### Use Token (Authenticated Request)
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Database Setup (Must Do First)

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up (free)

2. **Get Credentials**
   - Dashboard → Settings → API
   - Copy all 3 keys

3. **Update `.env`**
   ```env
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Create Tables**
   - Supabase → SQL Editor → New Query
   - Copy `backend/database/schema.sql`
   - Click Run

5. **Restart Server**
   - Ctrl+C
   - `npm start`

---

## 🧪 Quick API Tests

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```
✅ Expected: `{"status":"ok",...}`

### Test 2: Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@jeetmantra.com",
    "password": "TestPass123",
    "fullName": "Test User",
    "role": "student"
  }'
```
✅ Expected: User created + JWT token

### Test 3: Get All Courses
```bash
curl http://localhost:5000/api/courses
```
✅ Expected: Array of courses

### Test 4: Dashboard (Need Token)
```bash
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer TOKEN_FROM_LOGIN"
```
✅ Expected: Role-specific dashboard data

---

## 🎯 All API Endpoints (20+)

### Authentication (4)
```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/verify
POST   /api/auth/refresh
```

### Users (3)
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/stats
```

### Courses (5)
```
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id
```

### Enrollments (4)
```
GET    /api/enrollments/my
POST   /api/enrollments
GET    /api/enrollments/course/:id/students
DELETE /api/enrollments/:id
```

### Dashboard (1)
```
GET    /api/dashboard
```

### Attendance (3)
```
POST   /api/attendance
GET    /api/attendance/student/:id
GET    /api/attendance/course/:id
```

### Payments (3)
```
POST   /api/payments
GET    /api/payments/my
POST   /api/payments/webhook/payment
```

### Admin (3)
```
GET    /api/admin/users
PUT    /api/admin/users/:id/toggle-status
GET    /api/admin/stats
```

### Webhooks (1)
```
POST   /api/webhooks
```

---

## 🔗 Frontend Integration

### In HTML File
```html
<!-- Add before your React code -->
<script src="../backend/api-client.js"></script>

<script type="text/babel">
  // Login
  async function login() {
    const response = await window.JeetMantraAPI.login('email@test.com', 'pass123');
    console.log(response.token);
  }

  // Get Profile
  async function getProfile() {
    const profile = await window.JeetMantraAPI.getProfile();
    console.log(profile);
  }

  // Get Courses
  async function getCourses() {
    const courses = await window.JeetMantraAPI.getCourses({
      category: 'Programming',
      level: 'beginner'
    });
    console.log(courses);
  }
</script>
```

---

## 📦 Response Format

### Success (200)
```json
{
  "message": "Action completed successfully",
  "user": { ... },
  "token": "jwt-token-here"
}
```

### Error (400/401/500)
```json
{
  "error": "Error description",
  "details": []
}
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 in use | `taskkill /PID <PID> /F` |
| Database connection error | Check `.env` credentials |
| Authentication fails | Clear localStorage + retry |
| CORS error | Update `FRONTEND_URL` in `.env` |
| Server crashes | Check terminal for error message |

---

## 📂 Project Structure (Backend Only)

```
backend/
├── server.js              ← Main app
├── package.json           ← Dependencies
├── .env                   ← Configuration
├── api-client.js          ← Frontend library
├── config/
│   └── supabase.js       ← Database client
├── middleware/
│   ├── auth.js           ← JWT middleware
│   └── validation.js     ← Input validation
├── routes/
│   ├── auth.js           ← (4 endpoints)
│   ├── users.js          ← (3 endpoints)
│   ├── courses.js        ← (5 endpoints)
│   ├── enrollments.js    ← (4 endpoints)
│   ├── dashboard.js      ← (1 endpoint)
│   ├── attendance.js     ← (3 endpoints)
│   ├── payments.js       ← (3 endpoints)
│   ├── admin.js          ← (3 endpoints)
│   └── webhooks.js       ← (1 endpoint)
└── database/
    └── schema.sql        ← 15+ tables
```

---

## 🔄 Workflow

```
1. User fills form (HTML)
     ↓
2. JavaScript calls API (api-client.js)
     ↓
3. Backend validates input
     ↓
4. Backend queries database (Supabase)
     ↓
5. Backend returns JSON response
     ↓
6. Frontend updates UI
```

---

## 🎓 Learning Path

1. ✅ Backend is running
2. ⏳ Update `.env` with Supabase credentials
3. ⏳ Create database tables (schema.sql)
4. ⏳ Test with Postman
5. ⏳ Connect frontend to API
6. ⏳ Deploy to production

---

## 📞 Need Help?

- **API docs:** See `backend/README.md`
- **Setup guide:** See `BACKEND_SETUP_GUIDE.md`
- **Integration:** See `BACKEND_INTEGRATION_GUIDE.md`
- **Testing:** Import `JeetMantra_API.postman_collection.json` to Postman
- **Database:** Supabase Dashboard
- **Server logs:** Check terminal output

---

## ✨ Status Checklist

- ✅ Backend running on port 5000
- ✅ Health check working
- ✅ All 20+ endpoints created
- ✅ Database schema ready
- ✅ Authentication system ready
- ✅ Frontend library ready
- ⏳ Supabase credentials needed
- ⏳ Database tables need to be created
- ⏳ Frontend integration pending

---

**Last Updated:** May 14, 2026  
**Server Status:** 🟢 RUNNING  
**Next Step:** Share Supabase credentials
