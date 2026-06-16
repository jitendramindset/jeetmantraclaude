# 🐳 JeetMantra - Docker Setup & n8n Configuration

## Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed
- Claude API key (from https://console.anthropic.com/)

---

## 🚀 Quick Start

### 1. Start n8n (First Time)
```bash
cd /home/claude/repo
docker-compose up -d n8n
```

### 2. Access n8n Dashboard
```
http://localhost:5678
Username: admin
Password: jeetmantra123
```

### 3. Set Environment Variables in n8n
Once logged in:
1. Click **Settings** (gear icon) → **Environment Variables**
2. Add:
   - Key: `CLAUDE_API_KEY`
   - Value: `your-anthropic-api-key`
3. Add:
   - Key: `WEBHOOK_URL`
   - Value: `http://localhost:5678/webhook/`

### 4. Stop n8n
```bash
docker-compose down
```

### 5. View Logs
```bash
docker-compose logs -f n8n
```

---

## 📊 Architecture

```
Website (HTML/JS)
    ↓
n8n Webhook Trigger
    ↓
Form Validation + MCP Call (Claude)
    ↓
Data Processing + Storage (n8n DB)
    ↓
Response back to HTML
```

---

## 🔧 Workflow Types We'll Create

1. **User Registration** - Validate email, create user, send confirmation
2. **Course Creation** - Validate course data, generate description via MCP
3. **Course Enrollment** - Check capacity, enroll student, send confirmation
4. **Mark Attendance** - Record attendance, check thresholds
5. **Submit Homework** - Receive submission, validate, assign to teacher
6. **Feedback Collection** - Record feedback, alert if low rating
7. **Referral Tracking** - Track referral, credit bonus
8. **Admin Actions** - Block/unblock user, manage courses
9. **Auto-fill Suggestions** - Call MCP for recommendations
10. **Content Generation** - Generate course descriptions, assignment questions

---

## 🤖 MCP (Claude) Integration

Every webhook will:
1. Receive form data from HTML
2. Call Claude MCP (via n8n HTTP node)
3. Claude validates/processes/generates
4. n8n stores result in database
5. Returns response to HTML

### MCP Functions Available:
- `validate_form_data()` - Validate any form
- `generate_content()` - Generate course descriptions, homework
- `suggest_recommendations()` - Recommend courses, schedules
- `auto_fill_suggestions()` - Suggest field values
- `process_business_logic()` - Complex processing

---

## 📝 Creating a Workflow

### Example: User Registration

1. **Trigger**: Webhook receives form data
2. **Validate**: Call MCP to validate email, password strength
3. **Check**: See if user exists (n8n DB)
4. **Create**: Add user to n8n database
5. **Send**: Email confirmation (optional, via SendGrid)
6. **Response**: Return success/error to HTML

---

## 🔑 Claude API Key

Get from: https://console.anthropic.com/account/keys

In n8n, use in HTTP node:
```
Headers:
  x-api-key: {{$env["CLAUDE_API_KEY"]}}
  
Body:
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "Validate this email: {{$json.email}}"
    }
  ]
}
```

---

## 🛠️ Troubleshooting

### n8n won't start?
```bash
docker-compose down -v  # Remove all volumes
docker-compose up -d n8n
```

### Webhook not triggering?
1. Check webhook URL in HTML matches n8n endpoint
2. Verify n8n is running: `docker ps`
3. Check n8n logs: `docker-compose logs -f n8n`

### MCP (Claude) calls failing?
1. Verify `CLAUDE_API_KEY` is set in n8n environment
2. Check Claude API key is valid
3. View workflow execution logs in n8n dashboard

---

## 📱 Testing Workflows

### Via curl:
```bash
curl -X POST http://localhost:5678/webhook/user-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "name": "John Doe"
  }'
```

### Via HTML form:
```html
<form id="signup-form">
  <input name="email" type="email" required>
  <input name="password" type="password" required>
  <button type="submit">Sign Up</button>
</form>

<script>
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const response = await fetch('http://localhost:5678/webhook/user-signup', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(data))
  });
  const result = await response.json();
  console.log(result);
});
</script>
```

---

## 🚀 Next Steps

1. ✅ Docker is running
2. ⏳ Add missing components to HTML
3. ⏳ Create SuperAdmin panel
4. ⏳ Build n8n workflows
5. ⏳ Wire everything with webhooks
6. ⏳ Test end-to-end
