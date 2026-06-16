# 🔧 Manual Workflow Setup - If Import Fails

If the workflow import doesn't work, follow these steps to manually recreate the unified webhook in n8n.

---

## Step 1: Create New Workflow

1. Go to **https://work.mantravat.cloud/home/workflows**
2. Click **Create** or **+** button
3. Name it: `JeetMantra Unified Router`
4. Click **Create**

---

## Step 2: Add Webhook Node

1. Click **+** to add first node
2. Search for: **Webhook**
3. Click **Webhook** by n8n
4. Configure:
   - **Method:** POST
   - **Path:** /webhook/jeetmantra
   - **Response Mode:** responseNode
5. Click the **Webhook Trigger** box to verify it's active

---

## Step 3: Add Validation Node

1. Click **+** to add node after Webhook
2. Search: **Code**
3. Click **Code** by n8n
4. Rename node to: `Validate Request`
5. Select **Language:** JavaScript
6. Replace code with:

```javascript
const action = $json.action;
const data = $json.data;

// Validate required fields
if (!action || !data) {
  return [{
    success: false,
    code: "INVALID_REQUEST",
    error: "Missing 'action' or 'data' field",
    details: { receivedAction: action }
  }];
}

console.log(`[${new Date().toISOString()}] Action: ${action}`);

return [{
  action: action,
  data: data,
  valid: true
}];
```

7. Click **Execute node** to test
8. Click the **+** on the right to add output

---

## Step 4: Add Switch Node (Router)

1. Click **+** to add node after Validation
2. Search: **Switch**
3. Click **Switch** by n8n
4. In the **Switch on** field, enter: `action`
5. Add cases for each action:

### Case 1: user-signup
- Value: `user-signup`
- Connect to: (new node)

### Case 2: user-login
- Value: `user-login`

### Case 3: user-profile-get
- Value: `user-profile-get`

### Case 4: user-profile-update
- Value: `user-profile-update`

### Case 5: course-create
- Value: `course-create`

### Case 6: course-list
- Value: `course-list`

### Case 7: course-enroll
- Value: `course-enroll`

### Case 8: mcp-validate
- Value: `mcp-validate`

### Case 9: mcp-recommend
- Value: `mcp-recommend`

### Case 10: admin-get-users
- Value: `admin-get-users`

### Case 11: admin-block-user
- Value: `admin-block-user`

### Default case: (error)
- No value = default

---

## Step 5: Add Sub-flow Nodes

For each case, add a **Code** node. Here's an example for **user-signup**:

### Node: user-signup Sub-flow

1. Click **+** below Switch for first case
2. Search: **Code**
3. Name: `User Signup`
4. Paste code:

```javascript
const { fullName, email, phone, password, userType, skills, aiProvider, apiKey } = $json.data;

// TODO: Implement full signup logic:
// 1. Validate email via MCP
// 2. Check if email exists
// 3. Hash password
// 4. Encrypt API key if provided
// 5. Create user in database
// 6. Send verification email

return [{
  success: true,
  code: "SUCCESS",
  data: {
    userId: `user_${Date.now()}`,
    email: email,
    message: "Signup successful. Verification email sent."
  },
  message: "User created successfully"
}];
```

### Node: user-login Sub-flow

```javascript
const { email, password } = $json.data;

// TODO: Full login logic:
// 1. Find user by email
// 2. Verify password hash
// 3. Generate JWT token
// 4. Return token + user info

return [{
  success: true,
  code: "SUCCESS",
  data: {
    token: `jwt_${Date.now()}`,
    user: {
      id: "user_123",
      name: "John Doe",
      email: email,
      role: "student"
    }
  },
  message: "Login successful"
}];
```

### Node: MCP Validate Sub-flow

```javascript
const { formType, formData } = $json.data;

// TODO: Call Claude AI for validation via MCP
// 1. Get user's AI provider from database
// 2. Call appropriate AI API
// 3. Parse validation response
// 4. Return validation result

return [{
  success: true,
  code: "SUCCESS",
  data: {
    valid: true,
    errors: [],
    warnings: [],
    formType: formType
  }
}];
```

### Continue for other operations...

---

## Step 6: Add Response Node

1. After Switch node, add **Respond to Webhook**
2. Name: `Respond`
3. In **Response Data**, select: **lastNode**
4. This will return the response from whichever sub-flow executed

---

## Step 7: Connect Everything

Your flow should look like:

```
Webhook
    ↓
Validate Request
    ↓
Route by Action (Switch)
    ├─ user-signup → User Signup Code → Respond
    ├─ user-login → User Login Code → Respond
    ├─ mcp-validate → MCP Validate Code → Respond
    ├─ admin-get-users → Admin Get Users Code → Respond
    └─ (default) → Error Code → Respond
```

Make sure:
- Each case has a **Code** node
- Each **Code** node connects to **Respond**
- **Respond** node uses **lastNode** response

---

## Step 8: Test Individual Nodes

1. Click on **Webhook** node
2. Look for the webhook URL at the top (copy it)
3. Test with curl:

```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{"action":"test","data":{}}'
```

---

## Step 9: Activate Workflow

1. Click **Activate** toggle at top right
2. Verify it's **Active** (green check)
3. Your webhook is now live!

---

## Step 10: Test Each Action

### Test 1: Signup
```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "user-signup",
    "data": {
      "fullName": "Jane Smith",
      "email": "jane@test.com",
      "phone": "+91 9876543210",
      "password": "Test123!",
      "userType": "student",
      "skills": ["Python"],
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
    "email": "jane@test.com",
    "message": "Signup successful..."
  }
}
```

### Test 2: Get Users (Admin)
```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "admin-get-users",
    "data": {
      "filter": "active",
      "limit": 10
    }
  }'
```

### Test 3: Validate (MCP)
```bash
curl -X POST https://work.mantravat.cloud/webhook/jeetmantra \
  -H "Content-Type: application/json" \
  -d '{
    "action": "mcp-validate",
    "data": {
      "formType": "course-creation",
      "formData": {
        "title": "Python Basics",
        "price": 4999
      }
    }
  }'
```

---

## 🔍 Execution Monitoring

After testing:

1. Click **Executions** tab
2. You should see your test requests
3. Click each execution to see:
   - Input request
   - Node outputs
   - Final response

---

## 📋 Node Configuration Checklist

- [ ] Webhook node: Path = `/webhook/jeetmantra`
- [ ] Webhook node: Response Mode = `responseNode`
- [ ] Validate node: Returns success/error
- [ ] Switch node: Handles all action types
- [ ] Switch node: Default case for unknown actions
- [ ] Sub-flow nodes: One for each action
- [ ] Respond node: Uses lastNode response
- [ ] All nodes connected properly
- [ ] Workflow activated (green toggle)
- [ ] Webhook URL is correct for cloud

---

## 🚀 Next Steps

1. Once manual setup is working, you can:
   - Add database nodes for persistence
   - Add email nodes for notifications
   - Add HTTP nodes for MCP/AI calls
   - Add payment integration

2. Use the **UNIFIED_WEBHOOK_GUIDE.md** as reference for all operations

3. Reference **n8n-unified-webhook.md** for detailed implementation steps

---

## 💡 Tips

- **Save frequently:** Click Save button often
- **Test as you build:** Test each node individually
- **Use executions:** Check execution logs for errors
- **Clone successful nodes:** If one works, duplicate for similar operations
- **Use sub-flows:** Create reusable sub-workflows for common operations

---

**Your manual workflow is ready! Activate and test with the curl commands above.**
