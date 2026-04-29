# 🚀 Cloud n8n Setup - work.mantravat.cloud

Your n8n instance is at: https://work.mantravat.cloud

## Step 1: Import Workflow to Cloud n8n

### Option A: Direct Import (Recommended)

1. Go to **https://work.mantravat.cloud/home/workflows**

2. Click the **+** button or **Create Workflow**

3. Click the **three-dot menu** (⋯) at the top

4. Select **Import from file**

5. Choose the file: `n8n-jeetmantra-unified-router.json`

6. Click **Import** and wait for confirmation

### Option B: Copy-Paste Import

If file upload doesn't work:

1. Go to **https://work.mantravat.cloud/home/workflows**

2. Click **+** or **Create Workflow**

3. Click the **three-dot menu** (⋯) at the top

4. Select **Import from clipboard**

5. Copy the entire contents of `n8n-jeetmantra-unified-router.json`

6. Paste into the dialog

7. Click **Import**

---

## Step 2: Update Webhook URL for Cloud

After import, the webhook might use localhost. **Fix it:**

1. Click **Webhook - Unified Router** node in the workflow

2. In the **Path** field, you'll see: `/webhook/jeetmantra`
   - **Keep this as-is** (the domain will be auto-configured by n8n)

3. Click **Save**

4. When activated, your webhook will be at:
   ```
   https://work.mantravat.cloud/webhook/jeetmantra
   ```

---

## Step 3: Update Frontend Webhook URL

Since your n8n is on cloud, update the frontend to point to cloud:

### In `signup.html`

Find line with webhook-handler:
```html
<script src="webhook-handler.js"></script>
```

Before `<script>` tag, add:
```html
<script>
  // Override webhook URL for cloud
  webhookHandler = new WebhookHandler('https://work.mantravat.cloud/webhook/jeetmantra');
</script>
```

### In `webhook-handler.js`

Update the constructor default (line 8):
```javascript
// OLD:
constructor(webhookUrl = 'http://localhost:5678/webhook/jeetmantra') {

// NEW (for cloud):
constructor(webhookUrl = 'https://work.mantravat.cloud/webhook/jeetmantra') {
```

---

## Step 4: Activate Workflow in Cloud

1. In n8n, click the **Activate** toggle at top right

2. You should see a green checkmark ✅ when active

3. The webhook is now live at:
   ```
   https://work.mantravat.cloud/webhook/jeetmantra
   ```

---

## Step 5: Test the Cloud Webhook

### Using curl:

```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "user-signup",
    "data": {
      "fullName": "Test User",
      "email": "test@example.com",
      "phone": "+91 9876543210",
      "password": "TestPass123!",
      "userType": "student",
      "skills": ["Python"],
      "aiProvider": "openai",
      "apiKey": null
    },
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "source": "test"
  }'
```

### Using the webhook tester:

Update `webhook-test.html`:

Find line:
```javascript
id="webhookUrl" value="http://localhost:5678/webhook/jeetmantra"
```

Change to:
```javascript
id="webhookUrl" value="https://work.mantravat.cloud/webhook/jeetmantra"
```

Then test from: `http://localhost:3000/webhook-test.html`

---

## Step 6: Configure Database Connection in Cloud n8n

Since your n8n is on cloud, connect to your database:

### For MySQL/PostgreSQL:

1. In n8n, go to **Credentials** (left sidebar)

2. Click **+ Create New**

3. Search for **MySQL** or **PostgreSQL**

4. Enter your database details:
   ```
   Host: your-db-host.com
   Port: 3306 (MySQL) or 5432 (PostgreSQL)
   Database: jeetmantra
   User: your-username
   Password: your-password
   ```

5. Click **Test Connection**

6. Click **Create Credential**

### Use in Workflows:

When building sub-flows, add **Execute Query** node:

1. Click **+** to add node
2. Search for **Execute Query**
3. Select your database type
4. In **Credentials**, select the one you just created
5. Write your SQL query

Example:
```sql
SELECT * FROM jeetmantra_users WHERE email = $1
```

---

## Step 7: Configure MCP/AI Integration

Your workflows will call Claude AI via MCP. Set up credentials:

### For OpenAI:

1. Go to Credentials in n8n
2. Create **OpenAI** credential
3. Enter your API key: `sk-...`

### For Google Gemini:

1. Create **Google Generative AI** credential
2. Enter API key: `AIza...`

### For Claude (Anthropic):

1. Create **Anthropic** credential
2. Enter API key: `sk-ant-...`

---

## Step 8: Configure Email Sending

For verification emails and notifications:

### Using Gmail (simplest):

1. Go to Credentials
2. Search for **Gmail**
3. Click **Connect**
4. Authorize with your Gmail account
5. Click **Create Credential**

### Using SMTP Server:

1. Create **SMTP** credential
2. Enter your email server details:
   ```
   Host: smtp.your-provider.com
   Port: 587 or 465
   User: your-email@example.com
   Password: your-app-password
   ```

---

## Step 9: Set Environment Variables in Cloud n8n

For sensitive data (encryption keys, API keys, etc.):

1. Click **Settings** (gear icon) in n8n

2. Go to **Environment**

3. Add these variables:
   ```
   ENCRYPTION_KEY=your-aes-256-key
   JWT_SECRET=your-jwt-secret-key
   DATABASE_URL=mysql://user:pass@host/jeetmantra
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=AIza...
   ANTHROPIC_API_KEY=sk-ant-...
   ```

4. Click **Save**

---

## Step 10: Monitor Workflow Executions

1. Click **Executions** tab in n8n

2. See all webhook requests received

3. Click each execution to see:
   - Input request data
   - Node execution steps
   - Output response
   - Any errors

---

## 🔧 Troubleshooting Cloud Setup

### Webhook not triggering

**Check:**
- [ ] Is workflow activated? (green toggle)
- [ ] Is path exactly `/webhook/jeetmantra`?
- [ ] Are frontend URLs pointing to cloud URL?
- [ ] Check n8n Activity Log for request received

**Fix:**
```bash
# Test if webhook exists
curl https://work.mantravat.cloud/webhook/jeetmantra

# Should return 405 Method Not Allowed (GET not supported)
# If 404: webhook not created
```

### Database connection failed

**Check:**
- [ ] Is database accessible from cloud?
- [ ] Are credentials correct?
- [ ] Click "Test Connection" in credential
- [ ] Check firewall rules

### Email not sending

**Check:**
- [ ] Gmail: Did you authorize?
- [ ] SMTP: Are credentials correct?
- [ ] Check n8n execution logs for error message

### MCP/AI calls failing

**Check:**
- [ ] Is API key valid?
- [ ] Does API have quota remaining?
- [ ] Check execution logs for error response

---

## 📊 Cloud vs Local Differences

| Feature | Local | Cloud |
|---------|-------|-------|
| URL | http://localhost:5678 | https://work.mantravat.cloud |
| Database | localhost | Remote host |
| Emails | Local/SMTP | Cloud mail service |
| Storage | Local disk | Cloud storage |
| Backups | Manual | Auto by n8n |
| SSL/TLS | Not needed | Built-in |

---

## ✅ Cloud Verification Checklist

- [ ] Workflow imported successfully
- [ ] Webhook path is `/webhook/jeetmantra`
- [ ] Workflow is activated (green toggle)
- [ ] Frontend URLs updated to cloud domain
- [ ] Database credentials configured
- [ ] Email service configured
- [ ] MCP credentials set up
- [ ] Environment variables added
- [ ] Test request succeeds
- [ ] Webhook appears in executions

---

## 🚀 Next: Implement Sub-flows

Once everything is connected:

1. **Priority 1: User Operations**
   - user-signup: Add database insert + email send
   - user-login: Add query + JWT generation

2. **Priority 2: MCP Integration**
   - mcp-validate: Add AI validation calls
   - mcp-recommend: Add recommendation logic

3. **Priority 3: Payments**
   - Add payment gateway integration
   - Track payments in database

---

## 📞 Cloud Support

If you encounter issues:

1. **Check n8n logs:**
   - Click **Executions** tab
   - Find failed execution
   - Click to see error details

2. **Test endpoint:**
   ```bash
   curl -v https://work.mantravat.cloud/webhook/jeetmantra
   ```

3. **Verify credentials:**
   - Go to Credentials
   - Click **Test Connection**

---

**Your cloud n8n is ready! Import the workflow and test with the curl commands above.**
