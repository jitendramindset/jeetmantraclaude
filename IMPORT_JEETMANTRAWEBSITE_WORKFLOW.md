# 🚀 Import jeetmantrawebsite Workflow to Cloud n8n

**File Location:** `/home/claude/repo/n8n-jeetmantrawebsite-workflow.json`

---

## 📋 What's Included in This Workflow

✅ **Single Webhook Endpoint** - `/webhook/jeetmantra`
✅ **12+ Operations** with complete flows:
- user-signup
- user-login
- user-profile-get
- course-create
- course-list
- course-enroll
- mcp-validate
- mcp-recommend
- admin-get-users
- admin-block-user
- dashboard-student
- dashboard-teacher

✅ **Smart Routing** - Switch node routes by action
✅ **Error Handling** - Unknown actions return error
✅ **Ready to Implement** - All flows have TODO comments

---

## 🎯 Quick Import (3 Steps)

### Step 1: Go to Your Cloud n8n

**URL:** https://work.mantravat.cloud/home/workflows

### Step 2: Create New Workflow

Click **+ Create** or **New** button

### Step 3: Import Workflow

**Option A: Import File (Recommended)**

1. Click the **⋯ (three dots menu)** at top
2. Select **Import from file**
3. Choose: `n8n-jeetmantrawebsite-workflow.json`
4. Click **Import**
5. Wait for success message

**Option B: Copy-Paste**

1. Click **⋯ (three dots menu)**
2. Select **Import from clipboard**
3. Copy entire contents of `n8n-jeetmantrawebsite-workflow.json`
4. Paste into dialog
5. Click **Import**

**Option C: Manual Creation**

If import fails, follow: `MANUAL_WORKFLOW_SETUP.md`

---

## ✅ Verify Import

After import, you should see:

```
Workflow Name: jeetmantrawebsite
Nodes: 14 total
- 1 Webhook node
- 1 Validation node
- 1 Switch (router) node
- 12 Sub-flow nodes
- 1 Response node
```

**Check the flow:**
```
Webhook
  ↓
Validate Request
  ↓
Route by Action (Switch)
  ├─ user-signup
  ├─ user-login
  ├─ user-profile-get
  ├─ course-create
  ├─ course-list
  ├─ course-enroll
  ├─ mcp-validate
  ├─ mcp-recommend
  ├─ admin-get-users
  ├─ admin-block-user
  ├─ dashboard-student
  ├─ dashboard-teacher
  └─ (error handler)
  ↓
Respond to Webhook
```

---

## 🔌 Activate Workflow

1. Click **Activate** toggle at top right
2. Wait for green checkmark ✅
3. Your webhook is now LIVE at:
   ```
   https://work.mantravat.cloud/webhook/jeetmantra
   ```

---

## 🧪 Test the Workflow

### Test 1: User Signup

```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "user-signup",
    "data": {
      "fullName": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+91 9876543210",
      "password": "SecurePass123!",
      "userType": "student",
      "skills": ["Python", "Mathematics"],
      "aiProvider": "openai",
      "apiKey": null
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "code": "SUCCESS",
  "data": {
    "userId": "user_...",
    "email": "jane@example.com",
    "fullName": "Jane Smith",
    "userType": "student",
    "createdAt": "2026-04-28T..."
  },
  "message": "User signup successful. Verification email sent."
}
```

### Test 2: User Login

```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "user-login",
    "data": {
      "email": "jane@example.com",
      "password": "SecurePass123!"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "code": "SUCCESS",
  "data": {
    "token": "jwt_token_...",
    "user": {
      "id": "user_123",
      "email": "jane@example.com",
      "name": "User Name",
      "role": "student"
    }
  },
  "message": "Login successful"
}
```

### Test 3: Get User Profile

```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "user-profile-get",
    "data": {
      "userId": "user_123"
    }
  }'
```

### Test 4: Create Course

```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "course-create",
    "data": {
      "title": "Python Basics",
      "description": "Learn Python from scratch",
      "category": "Programming",
      "price": 4999,
      "teacherId": "user_456",
      "duration": 30,
      "level": "beginner"
    }
  }'
```

### Test 5: Admin Get Users

```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
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

### Test 6: Unknown Action (Error Handling)

```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "invalid-action",
    "data": {}
  }'
```

**Expected Error Response:**
```json
{
  "success": false,
  "code": "UNKNOWN_ACTION",
  "error": "Unknown action: invalid-action",
  "availableActions": [...]
}
```

---

## 📊 Monitor Executions

1. After testing, click **Executions** tab in n8n
2. You should see your test requests
3. Click each execution to see:
   - **Input:** The request you sent
   - **Output:** The response returned
   - **Logs:** Execution details

### Check Execution Details

Click on any execution to see:
- Input data (what came in)
- Each node's output
- Final response
- Any errors

---

## 🔧 Node Configuration Details

### Webhook Node
- **Path:** `/webhook/jeetmantra`
- **Method:** POST
- **Response Mode:** responseNode
- **Authentication:** None (add later if needed)

### Validate Request Node
- Checks for `action` and `data` fields
- Logs incoming requests
- Returns error if fields missing

### Route by Action Node (Switch)
- **Switch on:** action (from request)
- **12 cases:** One for each operation type
- **Default:** Error handler

### Sub-flow Nodes (user-signup, etc.)
- **Type:** Code/Function nodes
- **Current:** Placeholder implementations
- **TODO:** Add real database operations, API calls, etc.

### Respond to Webhook Node
- **Response Data:** lastNode (uses output of last executed node)
- Returns JSON response to client

---

## 📝 Implementation TODOs

Each sub-flow has TODO comments. Here's the implementation order:

### Priority 1: User Operations
**In `user-signup` node, implement:**
- Validate email format
- Hash password using bcrypt
- Encrypt API key (if provided)
- Create user in `jeetmantra_users` table
- Create profile in `jeetmantra_user_profiles`
- Add skills to `jeetmantra_user_skills`
- Send verification email

**In `user-login` node, implement:**
- Query user by email from `jeetmantra_users`
- Verify password hash
- Generate JWT token
- Create session in `jeetmantra_sessions`

### Priority 2: Course Operations
**In `course-create` node:**
- Validate course data
- Create in `jeetmantra_courses`
- Return courseId

**In `course-enroll` node:**
- Check capacity
- Create in `jeetmantra_enrollments`
- Send confirmation email

### Priority 3: MCP Integration
**In `mcp-validate` node:**
- Get user's AI provider from DB
- Call appropriate AI API
- Return validation result

**In `mcp-recommend` node:**
- Get user profile
- Call Claude AI
- Return top 5 recommendations

### Priority 4: Admin & Dashboard
**In `admin-get-users` node:**
- Query with pagination
- Apply filters
- Return user list

**In `dashboard-*` nodes:**
- Query multiple tables
- Aggregate statistics
- Return dashboard data

---

## 🎯 Next: Connect Database

After testing, add database nodes:

1. **Set up Database Credentials** in n8n
   - Go to Credentials
   - Create MySQL/PostgreSQL credential
   - Test connection

2. **Add Database Queries** to each sub-flow
   - Add **Execute Query** node
   - Write SQL for each operation
   - Reference `database-schema-jeetmantra.sql`

3. **Update Response** with real data
   - Instead of placeholders
   - Return actual query results

---

## 💡 Tips

- **Save frequently** - Click Save after changes
- **Test individual nodes** - Click node → Execute to test
- **Check execution logs** - See what each node received/returned
- **Use Executions tab** - Monitor all requests
- **Reference documentation** - See `UNIFIED_WEBHOOK_GUIDE.md` for operation formats

---

## 🚀 Success Criteria

✅ Workflow imported successfully
✅ Webhook node shows `/webhook/jeetmantra`
✅ 12 sub-flow nodes created
✅ All nodes connected properly
✅ Workflow activated (green toggle)
✅ Test requests return success responses
✅ Executions tab shows requests
✅ Errors handled correctly

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| n8n-jeetmantrawebsite-workflow.json | **THIS WORKFLOW** |
| QUICK_START_CLOUD.md | Quick setup guide |
| UNIFIED_WEBHOOK_GUIDE.md | All operations reference |
| CLOUD_N8N_SETUP.md | Full configuration steps |
| MANUAL_WORKFLOW_SETUP.md | Manual creation backup |
| database-schema-jeetmantra.sql | Database schema |
| TROUBLESHOOTING.md | Debug help |

---

## 🆘 Troubleshooting

### Workflow doesn't import
- Try Option B: Copy-Paste import
- Use Option C: Manual creation
- Check `MANUAL_WORKFLOW_SETUP.md`

### Webhook returns 404
- Workflow not activated
- Click Activate toggle
- Wait for green checkmark

### Test request hangs
- Check n8n logs
- Click Executions tab
- See if request appears

### Response is error
- Check operation name spelling (case-sensitive)
- Verify request format
- See `UNIFIED_WEBHOOK_GUIDE.md` for correct format

---

## 🎉 You're Ready!

1. **Import** the workflow
2. **Activate** it
3. **Test** with curl commands
4. **Implement** the TODOs
5. **Connect** your database

**File:** `n8n-jeetmantrawebsite-workflow.json`
**Location:** https://work.mantravat.cloud/home/workflows
**Status:** Ready to import!

---

**Next: Import and activate the workflow, then test with curl commands above.**
