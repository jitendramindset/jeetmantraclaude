# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. n8n Not Running

**Symptom:** "Cannot connect to n8n" error

```bash
# Check if container is running
docker ps | grep n8n

# Start n8n
docker-compose up -d n8n

# Check logs
docker-compose logs -f n8n

# Stop and start fresh
docker-compose down
docker-compose up -d n8n
```

### 2. Webhook Not Triggered

**Symptom:** Request sent but no response

**Check:**
- [ ] Is n8n running? (docker ps)
- [ ] Is workflow activated? (green toggle in n8n)
- [ ] Is webhook path correct? (/webhook/jeetmantra)
- [ ] Is HTTP server running on :3000?

**Fix:**
```bash
# Verify webhook exists
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{"action":"test","data":{}}'

# If 404: Workflow not activated
# If hangs: n8n issue, check logs
# If response: Webhook works!
```

### 3. "Invalid JSON" Error

**Symptom:** Webhook tester shows "Invalid JSON"

**Check:**
- [ ] Open browser DevTools (F12)
- [ ] Look for syntax errors in JSON
- [ ] Make sure all strings use double quotes

**Common mistakes:**
```javascript
// Wrong - single quotes
{"action": 'user-signup'}

// Wrong - unquoted keys
{action: "user-signup"}

// Wrong - trailing comma
{"action": "user-signup", }

// Correct
{"action": "user-signup"}
```

**Fix:** Use JSON validator at https://jsonlint.com/

### 4. CORS Error in Browser

**Symptom:** "Access to XMLHttpRequest blocked by CORS policy"

**Check:**
- [ ] Are both frontend and n8n on localhost?
- [ ] Is HTTP server running on :3000?

**Fix for local testing:**
```bash
# Make sure HTTP server allows all origins
python3 -m http.server 3000 --bind 0.0.0.0

# For frontend, ensure it accesses localhost, not 127.0.0.1
# Use http://localhost:3000 not http://127.0.0.1:3000
```

### 5. Signup Form Not Loading

**Symptom:** Blank page or "404 Not Found"

**Check:**
- [ ] File exists: `ls -la /home/claude/repo/signup.html`
- [ ] HTTP server running: `curl http://localhost:3000/signup.html`
- [ ] JavaScript console errors: F12 → Console tab

**Fix:**
```bash
# Start HTTP server in correct directory
cd /home/claude/repo
python3 -m http.server 3000 --bind 0.0.0.0

# Or use Python 2
python -m SimpleHTTPServer 3000
```

### 6. Webhook Returns Wrong Response

**Symptom:** Response is error but should be success

**Debug:**
1. Check n8n execution logs:
   - Go to http://localhost:5678
   - Click **Executions** tab
   - Click recent execution
   - Check **Input** and **Output** tabs

2. Check if payload matches expected format:
   ```json
   {
     "action": "user-signup",
     "data": { /* action-specific fields */ },
     "timestamp": "2026-04-28T10:30:00Z",
     "source": "frontend"
   }
   ```

3. Verify action name is exact match in Switch node

### 7. API Key Not Encrypting

**Symptom:** API key stored as plaintext

**Check:**
- [ ] Is encryption function implemented in n8n?
- [ ] Is encryption key set in n8n environment?

**Fix:** Add to user-signup sub-flow:
```javascript
// In n8n Function node
const crypto = require('crypto');
const apiKey = $json.data.apiKey;
const encryptionKey = process.env.ENCRYPTION_KEY;

if (apiKey) {
  // Implement AES-256 encryption
  // Store encrypted version in database
}
```

### 8. Database Connection Failed

**Symptom:** "Cannot connect to database"

**Fix:**
1. Check database is running:
   ```bash
   # MySQL
   docker ps | grep mysql
   
   # PostgreSQL  
   docker ps | grep postgres
   ```

2. Test connection:
   ```bash
   # MySQL
   mysql -h localhost -u root -p
   
   # PostgreSQL
   psql -h localhost -U postgres
   ```

3. Configure connection in n8n:
   - Credentials → New Credential
   - Select database type
   - Enter connection details
   - Test connection

### 9. Email Not Sending

**Symptom:** Email node executes but user doesn't receive email

**Check:**
- [ ] Email provider configured in n8n
- [ ] SMTP credentials correct
- [ ] Email address valid
- [ ] Check spam folder

**Fix:**
```bash
# Test email node manually in n8n
# Click node → Test node → Check results

# Check logs for SMTP errors
docker-compose logs -f n8n | grep -i email
```

### 10. JWT Token Invalid

**Symptom:** Login works but token doesn't validate

**Check:**
- [ ] Token generated in user-login?
- [ ] Token stored in localStorage?
- [ ] Token includes user data?

**Fix:**
1. In user-login sub-flow, add:
   ```javascript
   // Generate JWT
   const jwt = require('jsonwebtoken');
   const token = jwt.sign(
     { userId: user.id, role: user.role },
     process.env.JWT_SECRET,
     { expiresIn: '7d' }
   );
   ```

2. Set JWT_SECRET in n8n environment:
   ```bash
   # In docker-compose.yml or n8n container
   export JWT_SECRET="your-secret-key-here"
   ```

---

## Performance Issues

### Workflow Executes Slowly

**Symptom:** Requests take > 5 seconds

**Check:**
- [ ] Are database queries indexed?
- [ ] Are MCP calls timing out?
- [ ] Is n8n overloaded?

**Fix:**
1. Add database indexes:
   ```sql
   CREATE INDEX idx_user_email ON users(email);
   CREATE INDEX idx_course_teacher ON courses(teacherId);
   ```

2. Set MCP timeouts:
   ```javascript
   // In HTTP nodes calling MCP
   timeout: 5000 // 5 seconds
   ```

3. Scale n8n:
   ```bash
   # Increase n8n workers
   N8N_WORKER_THREADS=4 docker-compose up -d n8n
   ```

### High Memory Usage

**Symptom:** n8n container using too much memory

**Fix:**
1. Limit container memory:
   ```yaml
   # In docker-compose.yml
   services:
     n8n:
       mem_limit: 2g
   ```

2. Clear old executions:
   - n8n UI → Admin → Executions
   - Delete old records

---

## Testing Checklist

Before going to production:

- [ ] Webhook responds to all actions
- [ ] Signup creates user in database
- [ ] Verification email sends
- [ ] Login generates valid token
- [ ] Admin operations require auth
- [ ] API keys are encrypted
- [ ] Passwords are hashed
- [ ] Error responses are consistent
- [ ] No sensitive data in logs
- [ ] Rate limiting works

---

## Debug Mode

### Enable Verbose Logging

```bash
# In docker-compose.yml
environment:
  - NODE_ENV=debug
  - LOG_LEVEL=debug
  - N8N_LOG_LEVEL=debug

# Start with logging
docker-compose up -d n8n
docker-compose logs -f n8n
```

### Monitor Webhook Requests

```bash
# Terminal 1: Watch n8n logs
docker-compose logs -f n8n | grep webhook

# Terminal 2: Send test request
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{"action":"test","data":{}}'
```

### Browser DevTools

```javascript
// In browser console to debug webhook calls
// Check what's being sent
console.log(webhooks.lastResponse);

// Monitor all fetch calls
// F12 → Network tab → Click request → Headers/Response
```

---

## Getting Help

1. **Check the logs:**
   ```bash
   docker-compose logs -f n8n | grep -i error
   ```

2. **Test with webhook tester:**
   - Open http://localhost:3000/webhook-test.html
   - Select preset
   - Check response

3. **Verify architecture:**
   - Review n8n-unified-webhook.md
   - Check node connections in workflow
   - Validate Switch node cases

4. **Check documentation:**
   - UNIFIED_WEBHOOK_GUIDE.md - Operation reference
   - WORKFLOW_IMPORT_GUIDE.md - Setup steps
   - SIGNUP_GUIDE.md - Signup flow

---

## Emergency Debug

If everything fails:

```bash
# 1. Stop everything
docker-compose down

# 2. Remove n8n data (if safe)
rm -rf n8n_data

# 3. Start fresh
docker-compose up -d n8n

# 4. Wait for startup
sleep 30

# 5. Re-import workflow
# Upload n8n-jeetmantra-unified-router.json

# 6. Test again
curl https://work.mantravat.cloud/webhook/jeetmantra
```

---

## Contact

For issues not covered here:

1. Check n8n documentation: https://docs.n8n.io
2. Review workflow logs in n8n UI
3. Check browser console for JavaScript errors
4. Verify all services are running: `docker ps`
