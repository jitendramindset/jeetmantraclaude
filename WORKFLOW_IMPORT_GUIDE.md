# 🚀 Importing the Unified Webhook Workflow to n8n

## Quick Start

The file `n8n-jeetmantra-unified-router.json` contains the complete unified webhook workflow ready to import.

### Step 1: Open n8n

1. Go to http://localhost:5678
2. Click **Workflows** in the sidebar
3. Click **New** or **Create Workflow**

### Step 2: Import Workflow

**Option A: Using Import (Recommended)**
1. In n8n, click the three-dot menu (⋯) at top
2. Select **Import workflow**
3. Choose **From file**
4. Select `n8n-jeetmantra-unified-router.json`
5. Click **Import**

**Option B: Copy-Paste**
1. Create a new workflow
2. Click the three-dot menu (⋯) at top
3. Select **Import workflow**
4. Choose **From paste**
5. Paste the contents of `n8n-jeetmantra-unified-router.json`
6. Click **Import**

### Step 3: Review the Workflow

The imported workflow includes:

```
Webhook Input
    ↓
Validate Request
    ↓
Route by Action (Switch Node)
    ├─ user-signup
    ├─ user-login
    ├─ user-profile-get
    ├─ user-profile-update
    ├─ course-create
    ├─ course-list
    ├─ course-enroll
    ├─ mcp-validate
    ├─ mcp-recommend
    ├─ admin-get-users
    ├─ admin-block-user
    └─ (error handling)
    ↓
Response
```

### Step 4: Configure the Webhook

1. Click the **Webhook - Unified Router** node
2. Verify:
   - **Method:** POST
   - **Path:** /webhook/jeetmantra
   - **Response Mode:** responseNode
3. Click **Save**

### Step 5: Activate the Workflow

1. Click the **Activate** toggle at the top right
2. You should see a green checkmark ✅ when active
3. The webhook is now listening at: `https://work.mantravat.cloud/webhook/jeetmantra`

### Step 6: Test the Workflow

**Test User Signup:**
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
      "skills": ["Python"],
      "aiProvider": "openai",
      "apiKey": null
    },
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "source": "test"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "code": "SUCCESS",
  "data": {
    "userId": "user_1234567890",
    "email": "jane@example.com",
    "message": "Signup successful. Verification email sent."
  },
  "message": "User created successfully"
}
```

---

## 🔧 What Each Node Does

### 1. Webhook - Unified Router
- Listens on `POST /webhook/jeetmantra`
- Accepts all requests
- Passes data to validation

### 2. Validate Request
- Checks for required `action` and `data` fields
- Returns error if missing
- Logs incoming requests

### 3. Extract Action
- Extracts the action name
- Prepares it for routing

### 4. Route by Action (Switch)
- Routes to correct sub-flow based on action
- Supports 12+ different operations
- Returns error for unknown actions

### 5. Sub-flows (12 nodes)
- Each handles a specific operation
- Currently have placeholder implementations
- Ready to be enhanced with database calls, MCP integration, etc.

### 6. Error Handler
- Catches unknown actions
- Returns standardized error response

### 7. Respond
- Sends response back to client
- Uses standardized format

---

## 📝 Next Steps: Implement Each Sub-flow

After importing, each operation needs to be fully implemented. Here are the TODO items:

### Priority 1: User Operations
- [ ] **user-signup**
  - Validate email via MCP
  - Check if email exists
  - Hash password
  - Encrypt API key
  - Create user record
  - Send verification email

- [ ] **user-login**
  - Find user by email
  - Verify password
  - Generate JWT token
  - Return token + user info

### Priority 2: MCP Integration
- [ ] **mcp-validate**
  - Get user's AI provider from DB
  - Call appropriate AI API
  - Return validation results

- [ ] **mcp-recommend**
  - Analyze user profile
  - Generate recommendations
  - Return top 5

### Priority 3: Course Operations
- [ ] **course-create**
  - Validate data via MCP
  - Generate description if needed
  - Create record
  - Return courseId

- [ ] **course-enroll**
  - Check course capacity
  - Create enrollment
  - Send confirmation

### Priority 4: Admin Operations
- [ ] **admin-get-users**
  - Build query with filters
  - Fetch from database
  - Return paginated results

- [ ] **admin-block-user**
  - Update user status
  - Revoke sessions
  - Log action

---

## 🔌 Adding Database Integration

To connect to your database, add these nodes to each sub-flow:

### For MySQL/PostgreSQL:
1. Add **Execute Query** node
2. Configure connection
3. Write SQL query
4. Connect to operation flow

### For MongoDB:
1. Add **MongoDB** node
2. Configure connection
3. Set collection and query
4. Connect to operation flow

---

## 📧 Adding Email Integration

To send emails, add an **Email** node:

1. In the user-signup flow, add an **Email** node before Response
2. Configure:
   - **From:** noreply@jeetmantra.com
   - **To:** {{ $json.data.email }}
   - **Subject:** Welcome to JeetMantra!
   - **Body:** HTML template

---

## 🤖 Adding MCP/AI Integration

To call Claude AI via MCP:

1. In mcp-validate flow, add an **HTTP Request** node
2. Configure:
   ```
   Method: POST
   URL: https://api.openai.com/v1/chat/completions
   Headers:
     Authorization: Bearer {{ $env.OPENAI_API_KEY }}
   Body: {
     model: "gpt-4",
     messages: [...]
   }
   ```
3. Parse response
4. Return validation result

---

## 🐛 Troubleshooting

### Webhook not triggering
- [ ] Is workflow active? (green toggle at top)
- [ ] Is n8n running? (`docker ps`)
- [ ] Check webhook path: should be `/webhook/jeetmantra`
- [ ] Check n8n logs: `docker-compose logs -f n8n`

### Workflow errors
- [ ] Click **Execute Workflow** button to test
- [ ] Check error details in the logs panel
- [ ] Verify all node connections are correct

### Response not received
- [ ] Is the **Respond** node connected?
- [ ] Is response mode set to `responseNode`?
- [ ] Check browser DevTools Network tab

---

## 📊 Monitoring Workflow

1. Click **Executions** tab
2. See list of all requests
3. Click each execution to see:
   - Input data
   - Node execution details
   - Output response
   - Error messages (if any)

---

## ✅ Verification Checklist

- [ ] Workflow imported successfully
- [ ] Webhook node shows green checkmark
- [ ] Workflow is activated (toggle is green)
- [ ] Test request receives response
- [ ] No errors in execution logs
- [ ] Response format matches expected output
- [ ] Frontend signup form submits without errors

---

## 🚀 You're Ready!

The workflow is now active and ready to receive requests from your frontend. Test it with the curl commands above, then integrate with your signup form.

**Next:** Implement the actual business logic in each sub-flow (database operations, email sending, MCP calls).
