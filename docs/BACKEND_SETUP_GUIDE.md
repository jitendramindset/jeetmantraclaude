# Backend Setup & Deployment Guide

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Get Supabase Credentials

1. Go to https://supabase.com and sign up (free)
2. Create a new project
3. Wait for project to initialize (2-3 minutes)
4. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Create `.env` File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and paste your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this

SENDGRID_API_KEY=SG.xxx (optional for emails)
EMAIL_FROM=noreply@jeetmantra.com

FRONTEND_URL=http://localhost:3000
```

### 4. Set Up Database

1. Go to Supabase Dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open `backend/database/schema.sql`
5. Copy all content and paste into the SQL editor
6. Click **Run**

✅ Tables are now created!

### 5. Start the Backend

```bash
npm run dev
```

Expected output:
```
🚀 JeetMantra Backend running on port 5000
📚 Environment: development
🔗 Supabase: Connected
```

## Environment Variables Explained

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `SUPABASE_URL` | ✅ | `https://xxx.supabase.co` | Database URL |
| `SUPABASE_ANON_KEY` | ✅ | `eyJhbGc...` | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | `eyJhbGc...` | Admin API key |
| `JWT_SECRET` | ✅ | `randomstring123` | Token signing key |
| `PORT` | ❌ | `5000` | Server port (default: 5000) |
| `NODE_ENV` | ❌ | `development` | dev/production |
| `SENDGRID_API_KEY` | ❌ | `SG.xxx` | Email service |
| `FRONTEND_URL` | ❌ | `http://localhost:3000` | CORS origin |

## Testing the API

### Health Check

```bash
curl http://localhost:5000/health
```

### Sign Up Test

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@jeetmantra.com",
    "password": "TestPass123",
    "fullName": "Test User",
    "role": "student",
    "phone": "+91-9876543210"
  }'
```

Expected response:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid-xxx",
    "email": "test@jeetmantra.com",
    "fullName": "Test User",
    "role": "student"
  },
  "token": "eyJhbGc..."
}
```

### Login Test

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@jeetmantra.com",
    "password": "TestPass123"
  }'
```

## Connecting Frontend to Backend

### In HTML Files (website.html, dashboard.html, etc.)

Add this script tag before your React code:

```html
<!-- API Client -->
<script src="../backend/api-client.js"></script>

<!-- Your React App -->
<script type="text/babel">
  // Now you can use: window.JeetMantraAPI

  async function handleLogin(email, password) {
    try {
      const response = await window.JeetMantraAPI.login(email, password);
      console.log('Login successful:', response);
      // Redirect to dashboard
      window.location.href = '/dashboard.html';
    } catch (error) {
      console.error('Login failed:', error);
      alert('Invalid credentials');
    }
  }

  async function handleSignup(userData) {
    try {
      const response = await window.JeetMantraAPI.signup(userData);
      console.log('Signup successful:', response);
      // Auto-login after signup
      window.JeetMantraAPI.setToken(response.token);
      window.location.href = '/dashboard.html';
    } catch (error) {
      console.error('Signup failed:', error);
      alert(error.message);
    }
  }

  async function loadDashboard() {
    try {
      const dashboard = await window.JeetMantraAPI.getDashboard();
      console.log('Dashboard data:', dashboard);
      // Update UI with dashboard data
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  }
</script>
```

### Example: Login Page Integration

```jsx
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await window.JeetMantraAPI.login(email, password);
      // Store user info
      localStorage.setItem('user', JSON.stringify(response.user));
      // Redirect
      window.location.href = '/dashboard.html';
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

## Deployment

### Heroku Deployment

```bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create jeetmantra-backend

# 3. Set environment variables
heroku config:set SUPABASE_URL=https://xxx.supabase.co
heroku config:set SUPABASE_ANON_KEY=eyJhbGc...
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# 4. Deploy
git push heroku main
```

### Railway Deployment

```bash
# 1. Connect your repo to railway.app
# 2. Add environment variables in dashboard
# 3. Auto-deploys on push
```

### AWS EC2 Deployment

```bash
# 1. SSH into EC2 instance
ssh -i key.pem ubuntu@your-instance.com

# 2. Install Node.js
sudo apt update
sudo apt install nodejs npm

# 3. Clone and setup
git clone your-repo
cd jeetmantra/backend
npm install

# 4. Create .env file with credentials

# 5. Start with PM2
npm install -g pm2
pm2 start server.js --name "jeetmantra-api"
pm2 startup
pm2 save
```

## Database Management

### Backup Database

```bash
# Supabase automatically backs up your data
# Download backup from Dashboard → Settings → Backup
```

### View Logs

```bash
# In Supabase Dashboard
# Settings → Logs → Query Performance
```

### Reset Database

```bash
# Go to Supabase Dashboard
# Settings → Danger Zone → Reset Database
```

## Troubleshooting

### "Cannot connect to Supabase"
- ✅ Check SUPABASE_URL and keys in `.env`
- ✅ Verify Supabase project is running (not paused)
- ✅ Check network connectivity

### "CORS Error"
- ✅ Update `FRONTEND_URL` in `.env`
- ✅ Match exactly with frontend domain
- ✅ No trailing slashes

### "JWT Token Invalid"
- ✅ Ensure JWT_SECRET is same on server restart
- ✅ Token expires after 24 hours, refresh needed
- ✅ Clear browser localStorage and retry

### "Database Tables Missing"
- ✅ Run `database/schema.sql` again in Supabase SQL editor
- ✅ Check for SQL execution errors
- ✅ Verify you're in correct Supabase project

## Performance Optimization

### Enable Connection Pooling

```env
# In Supabase, use transaction mode for connections
SUPABASE_URL=https://xxx.supabase.co?mode=transaction
```

### Enable Caching

```javascript
// Add Redis caching layer (optional)
const redis = require('redis');
const client = redis.createClient();

// Cache user profiles for 1 hour
const cachedProfile = await client.get(`user:${userId}`);
```

### Database Indexes

Already included in `schema.sql`:
- Email lookups
- Role-based queries
- Course filtering
- User enrollments

## Monitoring

### Check Logs

```bash
# Local logs
tail -f ~/.pm2/logs/jeetmantra-api-error.log

# Heroku logs
heroku logs --tail

# Supabase logs
# Dashboard → Settings → Logs
```

### Monitor Performance

```bash
# Node.js built-in
node --prof server.js

# Using clinic.js (optional)
npm install -g clinic
clinic doctor -- node server.js
```

## API Rate Limiting (Optional)

```bash
npm install express-rate-limit

# Then add to server.js:
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

## Next Steps

1. ✅ Backend is running locally
2. ✅ Connect frontend using `api-client.js`
3. ⏭️ Update UI forms to call API endpoints
4. ⏭️ Deploy to production server
5. ⏭️ Set up monitoring and alerts
6. ⏭️ Enable advanced features (email, payments, etc.)

## Support

- Supabase Docs: https://supabase.com/docs
- Express Docs: https://expressjs.com
- Node.js Docs: https://nodejs.org/docs
