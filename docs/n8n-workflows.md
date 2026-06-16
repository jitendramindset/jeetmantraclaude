# 🔄 JeetMantra - n8n Workflow Templates

Complete guide to creating n8n workflows that connect HTML forms → MCP (Claude) → Data Storage & Responses

---

## 🚀 Quick Start: Creating Your First Workflow

### Step 1: Open n8n
```
http://localhost:5678
Username: admin
Password: jeetmantra123
```

### Step 2: Create New Workflow
Click **New Workflow** → Name it (e.g., "User Registration")

### Step 3: Add Webhook Trigger
- Drag **Webhook** node
- Set Method: **POST**
- Set Path: `/webhook/user-signup`
- Save & copy the URL

### Step 4: Add Nodes
- **HTTP Request** → Call Claude MCP for validation
- **Set Data** → Store in database
- **HTTP Request** → Send confirmation email
- **Respond** → Return success to frontend

---

## 📋 Workflow 1: User Registration → MCP Validation

### Webhook Trigger
```
POST /webhook/user-signup
Body: { name, email, phone, password, role }
```

### Flow Diagram
```
Webhook Input
    ↓
[1] MCP Validate Email
    ↓
[2] MCP Validate Password Strength
    ↓
[3] Store in Database
    ↓
[4] Send Verification Email
    ↓
Response: { success: true, userId }
```

### n8n Nodes Configuration

**Node 1: Webhook**
- **Trigger**: POST `/webhook/user-signup`

**Node 2: Set Node** (prepare MCP request)
```javascript
{
  "email": $json.email,
  "password": $json.password,
  "name": $json.name
}
```

**Node 3: HTTP Request** (Call Claude MCP - Validate Email)
```
Method: POST
URL: https://api.anthropic.com/v1/messages
Headers:
  x-api-key: {{$env["CLAUDE_API_KEY"]}}
  content-type: application/json

Body:
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 256,
  "messages": [
    {
      "role": "user",
      "content": "Validate this email address and respond with ONLY valid or invalid: {{$json.email}}"
    }
  ]
}
```

**Node 4: Function Node** (Extract validation result)
```javascript
const response = $json.content[0].text;
const isValid = response.includes('valid') && !response.includes('invalid');
return [{
  ...input[0].json,
  emailValid: isValid
}];
```

**Node 5: If Node** (Check if email valid)
```
Condition: emailValid == true
If Yes: Continue to next node
If No: Jump to Error Response
```

**Node 6: HTTP Request** (Call Claude MCP - Validate Password)
```
Method: POST
URL: https://api.anthropic.com/v1/messages
Body:
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 256,
  "messages": [
    {
      "role": "user",
      "content": "Is this a strong password? Respond with ONLY yes or no. Password: {{$json.password}}"
    }
  ]
}
```

**Node 7: Function Node** (Extract password validation)
```javascript
const response = $json.content[0].text;
const isStrong = response.includes('yes');
return [{
  ...input[0].json,
  passwordStrong: isStrong
}];
```

**Node 8: If Node** (Check password strength)
```
Condition: passwordStrong == true
If Yes: Continue
If No: Jump to Error
```

**Node 9: Set Node** (Prepare user data for storage)
```javascript
{
  "id": "user_" + new Date().getTime(),
  "name": $json.name,
  "email": $json.email,
  "phone": $json.phone,
  "role": $json.role || "Student",
  "createdAt": new Date().toISOString(),
  "isVerified": false,
  "isBlocked": false,
  "passwordHash": "hashed_" + $json.password // TODO: Actually hash
}
```

**Node 10: Function Node** (Store in n8n database - simulate)
```javascript
// In production, this would store in PostgreSQL
// For now, we'll use n8n's built-in storage
const users = global.users || [];
const newUser = input[0].json;
users.push(newUser);
global.users = users;

return [{
  success: true,
  userId: newUser.id,
  message: "User created successfully"
}];
```

**Node 11: HTTP Request** (Send verification email via SendGrid)
```
Method: POST
URL: https://api.sendgrid.com/v3/mail/send
Headers:
  Authorization: Bearer {{$env["SENDGRID_API_KEY"]}}
  content-type: application/json

Body:
{
  "personalizations": [{
    "to": [{ "email": "{{$json.email}}" }],
    "subject": "Verify your JeetMantra account"
  }],
  "from": { "email": "noreply@jeetmantra.com" },
  "content": [{
    "type": "text/html",
    "value": "<h1>Welcome {{$json.name}}!</h1><p>Click to verify: <a href='http://localhost:3000/verify?code={{$json.id}}'>Verify Email</a></p>"
  }]
}
```

**Node 12: Respond Node** (Return to frontend)
```
Status: 200
Body:
{
  "success": true,
  "userId": "{{$json.userId}}",
  "message": "Registration successful! Check your email for verification link."
}
```

**Error Response Node** (On validation failure)
```
Status: 400
Body:
{
  "success": false,
  "error": "Invalid email or weak password"
}
```

---

## 📋 Workflow 2: Course Creation with MCP Content Generation

### Webhook Trigger
```
POST /webhook/course-create
Body: { title, description, category, price, teacherId, duration, level }
```

### Flow
```
Webhook
    ↓
[1] MCP Validate Course Data
    ↓
[2] MCP Generate Course Description (if not provided)
    ↓
[3] MCP Suggest Optimal Price
    ↓
[4] Store Course in Database
    ↓
[5] Notify Teacher
    ↓
Response: { courseId, success }
```

### Node: MCP Generate Course Description

**HTTP Request to Claude**
```
Method: POST
URL: https://api.anthropic.com/v1/messages
Headers:
  x-api-key: {{$env["CLAUDE_API_KEY"]}}

Body:
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "Generate a professional course description for a course titled '{{$json.title}}' at {{$json.level}} level covering {{$json.description}}. Make it engaging and 200-300 words."
    }
  ]
}
```

**Function Node** (Extract description)
```javascript
const generated = $json.content[0].text;
return [{
  ...input[0].json,
  generatedDescription: generated
}];
```

**Set Node** (Use generated or provided description)
```javascript
{
  ...all fields,
  "description": $json.description || $json.generatedDescription
}
```

### Node: MCP Suggest Optimal Price

```
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 256,
  "messages": [
    {
      "role": "user",
      "content": "Suggest an optimal price in INR for a {{$json.level}} course on {{$json.category}}. Consider market rates. Respond with ONLY the number (e.g., 4999)"
    }
  ]
}
```

**Function Node**
```javascript
const suggested = parseInt($json.content[0].text);
return [{
  ...input[0].json,
  suggestedPrice: suggested,
  priceToUse: $json.price || suggested
}];
```

---

## 📋 Workflow 3: Course Enrollment

### Trigger
```
POST /webhook/course-enroll
Body: { courseId, studentId }
```

### Flow
```
Webhook
    ↓
[1] Get Course Details
    ↓
[2] Check Capacity
    ↓
[3] Create Enrollment
    ↓
[4] Update Student Dashboard
    ↓
[5] Send Confirmation Email
    ↓
Response: { enrollmentId, success }
```

### Key Nodes

**Check Capacity**
```javascript
const enrolledCount = 45; // In production, query from DB
const capacity = 50;
return [{
  ...input[0].json,
  isFull: enrolledCount >= capacity,
  availableSpots: capacity - enrolledCount
}];
```

**Conditional Logic**
```
If isFull == true:
  → Return error "Course is full"
Else:
  → Create enrollment
```

---

## 📋 Workflow 4: Attendance Marking

### Trigger
```
POST /webhook/attendance-mark
Body: { classId, studentId, status }
```

### Flow
```
Webhook
    ↓
[1] Record Attendance
    ↓
[2] Check Attendance Rate
    ↓
[3] If Low (<75%): Alert Student/Teacher
    ↓
[4] Update Dashboard
    ↓
Response: { success, alert }
```

### Check Attendance Rate Node
```javascript
const attendedClasses = 10;
const totalClasses = 15;
const attendanceRate = (attendedClasses / totalClasses) * 100;

return [{
  ...input[0].json,
  attendanceRate,
  isBelowThreshold: attendanceRate < 75
}];
```

---

## 📋 Workflow 5: Homework Submission → Auto-Grading Prep

### Trigger
```
POST /webhook/homework-submit
Body: { assignmentId, studentId, fileUrl, submissionText }
```

### Flow
```
Webhook
    ↓
[1] Check Submission Time (on-time vs late)
    ↓
[2] MCP Analyze Submission
    ↓
[3] Flag for Manual Grading
    ↓
[4] Notify Teacher
    ↓
[5] Schedule Grading Reminder (48 hours)
    ↓
Response: { submissionId, success }
```

### MCP Analyze Submission
```javascript
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 512,
  "messages": [
    {
      "role": "user",
      "content": "Analyze this homework submission for quality and completeness: '{{$json.submissionText}}'. Respond with: completeness (0-100), quality (0-100), and any immediate feedback."
    }
  ]
}
```

---

## 📋 Workflow 6: Auto-fill Suggestions via MCP

### Trigger
```
POST /webhook/mcp-autofill
Body: { fieldType, context }
```

### Response (Examples)

**For: fieldType = "course-description"**
```javascript
{
  "suggestions": [
    "This comprehensive course covers all fundamentals...",
    "Learn from industry experts in our interactive..."
  ]
}
```

**For: fieldType = "schedule"**
```javascript
{
  "suggestions": [
    { "dayOfWeek": "Monday", "time": "7:00 PM", "reason": "Covers 92% of students, avoids conflicts" },
    { "dayOfWeek": "Wednesday", "time": "6:30 PM", "reason": "Even distribution across week" }
  ]
}
```

---

## 📋 Workflow 7: Form Validation via MCP

### Trigger
```
POST /webhook/mcp-validate
Body: { formType, formData }
```

### MCP Validation Node
```javascript
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 512,
  "messages": [
    {
      "role": "user",
      "content": "Validate this {{$json.formType}} form. Respond with JSON: { valid: boolean, errors: [errors], warnings: [warnings] }. Form: {{JSON.stringify($json.formData)}}"
    }
  ]
}
```

### Parse Response
```javascript
const responseText = $json.content[0].text;
// Extract JSON from response
const jsonMatch = responseText.match(/\{[\s\S]*\}/);
const validationResult = JSON.parse(jsonMatch[0]);

return [{
  isValid: validationResult.valid,
  errors: validationResult.errors || [],
  warnings: validationResult.warnings || []
}];
```

---

## 📋 Workflow 8: Admin Block User

### Trigger
```
POST /webhook/admin-block-user
Body: { userId, reason, blockedBy }
```

### Flow
```
Webhook
    ↓
[1] Verify Admin Permission
    ↓
[2] Block User Account
    ↓
[3] Revoke Active Sessions
    ↓
[4] Log Audit Entry
    ↓
[5] Notify User (optional)
    ↓
Response: { success, userId }
```

### Audit Log Node
```javascript
return [{
  action: "USER_BLOCKED",
  userId: $json.userId,
  reason: $json.reason,
  blockedBy: $json.blockedBy,
  timestamp: new Date().toISOString(),
  adminEmail: "admin@jeetmantra.com"
}];
```

---

## 📋 Workflow 9: Payment Processing

### Trigger
```
POST /webhook/payment-initiate
Body: { userId, amount, paymentMethod, description }
```

### Flow
```
Webhook
    ↓
[1] Validate Amount
    ↓
[2] Call Razorpay API
    ↓
[3] Create Transaction Record
    ↓
[4] Send Payment Link to Student
    ↓
[5] Wait for Webhook Callback
    ↓
[6] Update Wallet on Success
    ↓
Response: { paymentId, paymentUrl }
```

### Call Razorpay
```
Method: POST
URL: https://api.razorpay.com/v1/orders
Headers:
  Authorization: Basic {{base64(RAZORPAY_KEY_ID + ':' + RAZORPAY_KEY_SECRET)}}

Body:
{
  "amount": {{$json.amount * 100}},
  "currency": "INR",
  "receipt": "order_{{$json.userId}}_{{Date.now()}}",
  "description": "{{$json.description}}"
}
```

---

## 📋 Workflow 10: Referral Tracking & Reward

### Trigger
```
POST /webhook/referral-earned
Body: { referrerId, referredId, courseId }
```

### Flow
```
Webhook
    ↓
[1] Verify Referral Link
    ↓
[2] Credit Referral Bonus
    ↓
[3] Send Celebration Email
    ↓
[4] Update Leaderboard
    ↓
Response: { bonusAmount, totalReferrals }
```

---

## 🔌 How to Import These Workflows

### Option 1: Manual Creation
1. Create each workflow step-by-step in n8n UI
2. Reference the nodes and configurations above

### Option 2: JSON Import (Recommended)
Each workflow can be exported as JSON from n8n and imported again.

### Save a Workflow
1. Click **Workflow** → **Download**
2. Saves as `.json` file

### Import a Workflow
1. Click **+** → **Import**
2. Select the `.json` file
3. n8n recreates all nodes

---

## 🔑 Environment Variables (Required)

In n8n Settings → Environment Variables, add:

```
CLAUDE_API_KEY = sk-ant-...
SENDGRID_API_KEY = SG.xxx...
RAZORPAY_KEY_ID = rzp_live_xxx
RAZORPAY_KEY_SECRET = xxx
ANTHROPIC_API_KEY = sk-ant-...
```

---

## 🧪 Testing Workflows

### Option 1: Via Postman/curl
```bash
curl -X POST http://localhost:5678/webhook/user-signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "Test@123",
    "role": "Student"
  }'
```

### Option 2: Via n8n Test Button
1. Open workflow
2. Click **Test Workflow**
3. n8n shows step-by-step execution
4. Debug any errors

### Option 3: Via HTML Form
Use the webhook-handler.js library in HTML:

```html
<form id="signup-form">
  <input name="name" required>
  <input name="email" type="email" required>
  <button type="submit">Sign Up</button>
</form>

<script src="webhook-handler.js"></script>
<script>
webhooks.attachFormWebhook('signup-form', 'user-signup', 
  (result) => alert('Success: ' + result.userId),
  (error) => alert('Error: ' + error)
);
</script>
```

---

## 📊 Workflow Architecture Best Practices

1. **Always Validate** - Check inputs before processing
2. **Call MCP Early** - Validate/enrich data at start of workflow
3. **Error Handling** - Add Try/Catch blocks for each API call
4. **Logging** - Store audit logs for all actions
5. **Async Jobs** - Schedule long-running tasks (emails, backups) for later
6. **Rate Limiting** - Don't hammer APIs; add delays
7. **Data Mapping** - Use JSONata expressions to transform data
8. **Respond Quickly** - Return 202 ACK immediately, process in background

---

## 🚀 Next Steps

1. ✅ n8n running locally
2. ⏳ Create first workflow (User Registration)
3. ⏳ Test with HTML form
4. ⏳ Add more workflows one by one
5. ⏳ Connect to PostgreSQL for persistence
6. ⏳ Deploy to production

**Ready to build? Start with Workflow 1 (User Registration) above.** 🎯
