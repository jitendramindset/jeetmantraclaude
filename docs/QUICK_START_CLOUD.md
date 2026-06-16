# ⚡ Quick Start - Cloud n8n Setup

**Your n8n:** https://work.mantravat.cloud/home/workflows

---

## 🚀 In 5 Minutes

### 1. Import Workflow (2 min)

```
https://work.mantravat.cloud/home/workflows
  ↓
Click: Create / +
  ↓
Click: ⋯ (three dots menu)
  ↓
Select: Import from file
  ↓
Choose: n8n-jeetmantra-unified-router.json
  ↓
Click: Import
```

**Expected:** Workflow appears in your workflows list

---

### 2. Verify Webhook Configuration (1 min)

In the imported workflow:

- [ ] Click **Webhook - Unified Router** node
- [ ] Verify **Path:** `/webhook/jeetmantra`
- [ ] Click **Save**

**Your webhook URL:**
```
https://work.mantravat.cloud/webhook/jeetmantra
```

---

### 3. Activate Workflow (1 min)

- [ ] Click **Activate** toggle (top right)
- [ ] Wait for green checkmark ✅
- [ ] Webhook is now LIVE

---

### 4. Test Webhook (1 min)

Open terminal and run:

```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{"action":"user-signup","data":{"fullName":"Test","email":"test@test.com"}}'
```

**Expected Response:**
```json
{
  "success": true,
  "code": "SUCCESS",
  "data": { "userId": "user_..." }
}
```

---

## 📋 What You Get (Immediately)

✅ Unified webhook at `/webhook/jeetmantra`
✅ Smart action routing (Switch node)
✅ Error handling for unknown actions
✅ Ready for sub-flow implementation

---

## 📊 Database Setup

**File:** `database-schema-jeetmantra.sql`

All tables are prefixed with `jeetmantra_`:
- `jeetmantra_users`
- `jeetmantra_courses`
- `jeetmantra_enrollments`
- `jeetmantra_payments`
- etc.

### Import to your database:

**MySQL:**
```bash
mysql -h your-db-host -u your-user -p your-database < database-schema-jeetmantra.sql
```

**PostgreSQL:**
```bash
psql -h your-db-host -U your-user -d your-database -f database-schema-jeetmantra.sql
```

---

## 🔗 Update Frontend URLs

### In `webhook-handler.js`:

The class now auto-detects:
- If HTTPS → uses cloud URL
- If HTTP → uses localhost

**No changes needed if using cloud!**

Or explicitly set:
```javascript
webhooks = new WebhookHandler('https://work.mantravat.cloud/webhook/jeetmantra');
```

### In `signup.html`:

Just make sure you're serving from HTTPS:
```html
https://your-domain/signup.html
```

---

## ✅ Verification Checklist

- [ ] Workflow imported (appears in workflows list)
- [ ] Webhook node shows `/webhook/jeetmantra`
- [ ] Workflow is activated (green toggle)
- [ ] curl test returns success response
- [ ] n8n Executions tab shows the test request
- [ ] Database schema imported
- [ ] Frontend URLs updated to cloud domain

---

## 🔧 If Import Fails

See: **MANUAL_WORKFLOW_SETUP.md**

Follow step-by-step to recreate the workflow manually in n8n UI.

---

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| CLOUD_N8N_SETUP.md | Detailed cloud setup guide |
| MANUAL_WORKFLOW_SETUP.md | Manual workflow creation |
| database-schema-jeetmantra.sql | All DB tables with jeetmantra_ prefix |
| UNIFIED_WEBHOOK_GUIDE.md | All operations reference |
| TROUBLESHOOTING.md | Debug common issues |

---

## 🎯 Next Phase: Implement Sub-flows

Once workflow is active:

1. **Add database nodes** to each sub-flow
2. **Add email nodes** for notifications
3. **Add HTTP nodes** for MCP/AI calls
4. **Add payment integration**

See: **n8n-unified-webhook.md** for detailed implementation

---

## 💬 Quick Test Commands

### Test Signup:
```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{"action":"user-signup","data":{"fullName":"John","email":"john@test.com","password":"Test123!","userType":"student","skills":["Python"]}}'
```

### Test Login:
```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{"action":"user-login","data":{"email":"john@test.com","password":"Test123!"}}'
```

### Test Get Users:
```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{"action":"admin-get-users","data":{"limit":10}}'
```

---

## 🚨 Troubleshooting (Quick Fixes)

| Problem | Fix |
|---------|-----|
| Workflow not visible | Refresh page, check Executions tab |
| 404 error on webhook | Workflow not activated (toggle it on) |
| No response from webhook | Check n8n Executions for errors |
| Import dialog closes | Try Option B: Copy-Paste import |

---

**Ready? Go to: https://work.mantravat.cloud/home/workflows and import the workflow!**

Questions? Check the full documentation files listed above.
