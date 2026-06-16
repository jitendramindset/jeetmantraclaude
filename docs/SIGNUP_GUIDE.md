# 🚀 Complete Signup Flow - Setup & Testing Guide

## 📋 Overview

The new signup system allows users to:
1. Choose their AI provider (ChatGPT, Gemini, Claude, OpenRouter)
2. Provide their AI API key (encrypted and stored securely)
3. Create account with email/password
4. Select user type (Student/Teacher/Partner)
5. Enter type-specific details and skills
6. Review everything and submit

---

## 🔑 Getting API Keys for Each Provider

### 1️⃣ OpenAI (ChatGPT)
```
1. Go to https://platform.openai.com/account/api-keys
2. Sign in with your OpenAI account
3. Click "Create new secret key"
4. Copy the key (starts with sk-...)
5. Paste in signup form
```

**Key Format:** `sk-...` (48+ characters)

### 2️⃣ Google Gemini
```
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create new API key"
3. Select or create a project
4. Copy the API key
5. Paste in signup form
```

**Key Format:** `AIza...` (39+ characters)

### 3️⃣ Anthropic Claude
```
1. Go to https://console.anthropic.com/account/keys
2. Sign in with your Anthropic account
3. Click "Create Key"
4. Copy the key (starts with sk-ant-...)
5. Paste in signup form
```

**Key Format:** `sk-ant-...` (80+ characters)

### 4️⃣ OpenRouter
```
1. Go to https://openrouter.ai/keys
2. Sign up or login
3. Click "Create Key"
4. Copy your API key
5. Paste in signup form
```

**Key Format:** `sk-or-...` (varies)

---

## 🎯 Testing the Signup Flow

### Step 1: Start Everything
```bash
# Terminal 1: Start n8n
cd /home/claude/repo
docker-compose up -d n8n

# Terminal 2: Start HTTP server
python3 -m http.server 3000 --bind 0.0.0.0

# Verify both are running:
# - http://localhost:5678 (n8n)
# - http://localhost:3000 (website)
```

### Step 2: Open Signup Page
```
http://localhost:3000/signup.html
```

### Step 3: Fill Out Form

**Step 1 - AI Setup:**
- Select AI provider (try "ChatGPT" first)
- Get your API key from provider above
- Paste in the API key field
- Click "Continue →"

**Step 2 - Account Info:**
- Full Name: `John Doe`
- Email: `john.doe@example.com`
- Phone: `+91 9876543210`
- Password: `SecurePass123!` (needs uppercase, lowercase, number, special char)
- Confirm Password: (same as above)
- Click "Continue →"

**Step 3 - Profile:**
- Select User Type: Try "Student"
- Academic Level: "Undergraduate"
- Interest Area: "Engineering"
- Skills: Type "Python" and press Enter, then "Mathematics", etc.
- Click "Continue →"

**Step 4 - Review:**
- Check all details
- Check "I agree to terms..."
- Click "Create Account"

### Step 4: Create n8n Workflow

While signup is tested, you need to create the actual workflow in n8n:

1. Go to http://localhost:5678
2. Click **New Workflow**
3. Name it: `user-complete-signup`
4. Follow the guide in `n8n-signup-workflow.md`

For quick testing without the full workflow:
- Add a **Webhook** node set to `POST /webhook/user-complete-signup`
- Add a **Respond** node with:
  ```json
  {
    "success": true,
    "userId": "test_user_123",
    "message": "Signup successful!"
  }
  ```

### Step 5: Test
- Fill form completely
- Submit
- Should see success message
- Check n8n logs for webhook hit

---

## 📊 Form Validation Rules

### Email
- Must be valid format: `user@domain.com`
- Must not already exist in database
- Verified via MCP/AI before creation

### Password
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number (0-9)
- Must contain special character (@$!%*?&)

**Example valid passwords:**
- `Secure@Pass123`
- `MyPassword$2024`
- `Test#Pass99`

### Phone
- Minimum 10 characters
- Format: `+91 9876543210` or `9876543210`

### Skills
- At least 1 skill required
- Examples: Python, JavaScript, Mathematics, Physics, Teaching, Design, etc.

### Student Specific
- Must select academic level
- Must select interest area

### Teacher Specific
- Must enter qualification (e.g., "B.Tech CS", "M.A English")
- Must enter years of experience (0-70)
- Must enter institution/organization

### Partner Specific
- Must select service category
- Must enter hourly rate (in ₹)

---

## 🔐 Security Features

✅ **Password Hashing**
- Passwords hashed with salt before storage
- Never stored as plaintext
- SHA-256 + salt in n8n

✅ **API Key Encryption**
- Encrypted with AES-256
- Decryption key stored securely in n8n environment
- Never sent to frontend after initial submission

✅ **Email Verification**
- Verification link sent to email
- Token valid for 24 hours
- User cannot login until verified

✅ **HTTPS Ready**
- All API calls can use HTTPS in production
- API keys transmitted over HTTPS only

---

## 🚀 Integration Checklist

- [ ] Docker running (n8n container active)
- [ ] HTTP server running on :3000
- [ ] signup.html loads without errors
- [ ] AI provider dropdown shows all 4 options
- [ ] Can enter all form fields
- [ ] Form validation works (try invalid email)
- [ ] Can proceed through all 4 steps
- [ ] n8n webhook endpoint created: `/webhook/user-complete-signup`
- [ ] Test workflow processes the data
- [ ] User record created in database
- [ ] Verification email sent (or logged)

---

## 📱 Mobile Testing

The signup form is fully responsive:
- Desktop: 3-column layout
- Tablet (768px): 2-column layout
- Mobile (< 768px): Full width (1-column)

Test on different screen sizes:
```
# Mobile: 375px width
# Tablet: 768px width
# Desktop: 1024px+ width
```

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path (Student)
✅ All valid data
✅ New email
✅ Valid AI key
✅ Expected: Account created, email sent

### Scenario 2: Duplicate Email
❌ Email already exists
Expected: Error message "Email already registered"

### Scenario 3: Invalid Password
❌ Password too weak: `password`
Expected: Error "Password must contain uppercase..."

### Scenario 4: Invalid AI Key
❌ API key doesn't work
Expected: Error "Invalid API key"

### Scenario 5: Missing Required Fields
❌ Missing skills
Expected: Error "Please add at least one skill"

### Scenario 6: Teacher Signup
✅ Select Teacher role
✅ Enter qualification, experience, institution
✅ Expected: All teacher-specific fields saved

### Scenario 7: Partner Signup
✅ Select Partner role
✅ Enter service category, hourly rate
✅ Expected: All partner-specific fields saved

---

## 🔄 Data Flow

```
User fills form (signup.html)
    ↓
Client-side validation (JavaScript)
    ↓
Send to n8n webhook
    ↓
n8n: Validate email via AI
n8n: Check if email exists
N8n: Test AI API key
n8n: Hash password
n8n: Encrypt API key
n8n: Create user record
n8n: Generate welcome message via AI
n8n: Send verification email
    ↓
Return success response
    ↓
Show success message
    ↓
Redirect to email verification page
    ↓
User clicks link in email
    ↓
Account verified
    ↓
User can login
```

---

## 📂 Files Involved

| File | Purpose |
|------|---------|
| `signup.html` | Multi-step signup form (NEW) |
| `webhook-handler.js` | Frontend webhook calls |
| `n8n-signup-workflow.md` | Complete workflow instructions |
| `SIGNUP_GUIDE.md` | This guide |

---

## 🐛 Troubleshooting

### Form loads but is blank
```
Check: Browser console (F12) for JavaScript errors
Fix: Clear browser cache and reload
```

### API key field shows error immediately
```
Check: Did you select an AI provider first?
Fix: Click on an AI provider option first
```

### Form won't submit
```
Check: Are all required fields filled?
Check: Does password meet requirements?
Check: Is terms checkbox checked?
Fix: Fill all required fields with valid data
```

### Webhook not triggered
```
Check: Is n8n running? (docker ps)
Check: Is HTTP server running on :3000?
Check: Is workflow created in n8n?
Fix: Create the /webhook/user-complete-signup workflow
```

### "Email already exists" error
```
Check: Is this a real email address?
Fix: Use a unique email address
```

### "Invalid API key" error
```
Check: Did you copy the full API key?
Check: Is the key for the selected provider?
Check: Is the key valid and not expired?
Fix: Get a fresh API key from the provider
```

---

## 🎓 API Provider Comparison

| Provider | Free Tier | Speed | Quality | Cost | Best For |
|----------|-----------|-------|---------|------|----------|
| **OpenAI** | 3 months trial | Fast | Excellent | $0.003 per 1K tokens | Complex tasks |
| **Gemini** | Free quota | Very Fast | Good | Free tier available | Quick analysis |
| **Claude** | Free quota | Medium | Excellent | $0.003 per 1K tokens | Quality output |
| **OpenRouter** | Free tier | Fast | Variable | Pay per use | Model flexibility |

**Recommendation for Testing:**
1. Start with **Gemini** (free tier, no credit card needed)
2. Then try **OpenAI** (gives free credits)
3. Try **Claude** for comparison

---

## 🚀 Next Steps

1. ✅ Test signup flow locally
2. ✅ Create the n8n workflow
3. ✅ Verify data is stored correctly
4. ✅ Test email verification
5. ✅ Create login flow
6. ✅ Create password reset flow
7. ✅ Deploy to production

---

## 📞 Support

If you get stuck:
1. Check the browser console (F12 → Console tab)
2. Check n8n logs: `docker-compose logs -f n8n`
3. Check webhook received data in n8n workflow test
4. Refer to `n8n-signup-workflow.md` for detailed node configs

---

**Ready to signup? Open http://localhost:3000/signup.html 🎉**
