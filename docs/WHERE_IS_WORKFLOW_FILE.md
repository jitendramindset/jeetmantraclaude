# 📍 Where to Find the n8n Workflow File

## 📂 File Location

**Filename:** `n8n-jeetmantrawebsite-workflow.json`

**Full Path:** `/home/claude/repo/n8n-jeetmantrawebsite-workflow.json`

---

## 🔍 How to Access It

### On Your Computer/Server

If you have access to the `/home/claude/repo/` directory:

```bash
# Navigate to the directory
cd /home/claude/repo

# List the file
ls -lh n8n-jeetmantrawebsite-workflow.json

# View file size (should be ~80-100KB)
wc -l n8n-jeetmantrawebsite-workflow.json
```

### If Stored in Git Repository

If this repo is on GitHub/GitLab:

```bash
git clone your-repo-url
cd repo-directory
cat n8n-jeetmantrawebsite-workflow.json
```

### Via curl/wget

If you have a web server hosting the files:

```bash
# Download the file
wget https://your-domain/repo/n8n-jeetmantrawebsite-workflow.json

# Or using curl
curl -O https://your-domain/repo/n8n-jeetmantrawebsite-workflow.json
```

---

## 📥 How to Import to n8n

### Method 1: Upload File (Easiest)

```
1. Go to: https://work.mantravat.cloud/home/workflows
2. Click: + Create / New
3. Click: ⋯ (menu) → Import from file
4. Choose: n8n-jeetmantrawebsite-workflow.json
5. Click: Open/Select
6. Wait for: Import success message
```

### Method 2: Copy-Paste Content

```
1. Open: n8n-jeetmantrawebsite-workflow.json in text editor
2. Select All (Ctrl+A)
3. Copy (Ctrl+C)
4. Go to: https://work.mantravat.cloud/home/workflows
5. Click: + Create / New
6. Click: ⋯ (menu) → Import from clipboard
7. Paste (Ctrl+V)
8. Click: Import
```

### Method 3: Direct File Content

**The file contains:**

```json
{
  "name": "jeetmantrawebsite",
  "nodes": [
    {
      "parameters": {...},
      "id": "webhook_node",
      "name": "Webhook - Unified Router",
      ...
    },
    ... (13 more nodes)
  ],
  "connections": {...},
  "active": false,
  "settings": {...}
}
```

---

## ✅ Verify You Have the Right File

The correct file should have these characteristics:

- **Size:** ~80-100 KB
- **Format:** JSON (plain text)
- **Name:** `jeetmantrawebsite-workflow.json` or similar
- **Contains:**
  - `"name": "jeetmantrawebsite"`
  - `"nodes": [...]` with 14 items
  - `"connections": {...}`
  - Webhook, Validate, Switch, Sub-flows, Response nodes

**Quick Check:**
```bash
# Check if file contains expected content
grep -c '"id"' n8n-jeetmantrawebsite-workflow.json
# Should show: 14 (one id per node)

grep '"name": "jeetmantrawebsite"' n8n-jeetmantrawebsite-workflow.json
# Should return: true (workflow is named correctly)
```

---

## 📋 File Contents Checklist

✅ Webhook node with path `/webhook/jeetmantra`
✅ Validate Request node
✅ Route by Action (Switch) node
✅ 12 Sub-flow nodes:
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
✅ Error handler (Unknown Action)
✅ Respond to Webhook node
✅ All connections properly defined

---

## 🚀 Quick Start

### 1. Download/Copy the File

**Option A:** If on server with file access
```bash
cat /home/claude/repo/n8n-jeetmantrawebsite-workflow.json
```

**Option B:** If in git repository
```bash
git show HEAD:n8n-jeetmantrawebsite-workflow.json
```

### 2. Import to n8n Cloud

```
https://work.mantravat.cloud/home/workflows
→ Create
→ Import from file
→ Select n8n-jeetmantrawebsite-workflow.json
→ Import
```

### 3. Activate & Test

```
→ Click: Activate
→ Wait: Green checkmark
→ Test: curl command (see IMPORT_JEETMANTRAWEBSITE_WORKFLOW.md)
```

---

## 📱 Different Scenarios

### Scenario 1: Local Development
```bash
# File is on your machine
/home/claude/repo/n8n-jeetmantrawebsite-workflow.json

# Import by uploading the file directly
```

### Scenario 2: Server Hosting
```bash
# File is on a web server
https://your-server.com/workflows/n8n-jeetmantrawebsite-workflow.json

# Download and import, or copy-paste content
```

### Scenario 3: Git Repository
```bash
# File is in git repo
git clone repo-url
cat n8n-jeetmantrawebsite-workflow.json | # copy content to paste import
```

---

## 🔐 File Security

The workflow file is:
- ✅ Plain JSON (no executable code)
- ✅ Safe to share
- ✅ No sensitive data (before connecting to DB)
- ✅ Can be version controlled

**Before sharing production workflow, remove:**
- Database credentials
- API keys
- Secret tokens

---

## 💾 File Backup

### Keep a Copy
```bash
# Backup the workflow
cp n8n-jeetmantrawebsite-workflow.json \
   n8n-jeetmantrawebsite-workflow.json.backup

# Or in git
git add n8n-jeetmantrawebsite-workflow.json
git commit -m "Add jeetmantrawebsite workflow"
```

### Export After Creating
Once you've created and tested the workflow in n8n, export it:
```
n8n UI → Workflow menu → Export
Save as: n8n-jeetmantrawebsite-workflow-v2.json
```

---

## 🎯 Next Steps

1. **Find** the file: `/home/claude/repo/n8n-jeetmantrawebsite-workflow.json`
2. **Download/Copy** it to your machine if needed
3. **Import** to https://work.mantravat.cloud/home/workflows
4. **Activate** the workflow
5. **Test** using curl commands
6. **Implement** the TODO items
7. **Connect** to database
8. **Launch** your JeetMantra platform!

---

## 📞 Still Can't Find It?

### Check These Locations

```bash
# Direct path
/home/claude/repo/n8n-jeetmantrawebsite-workflow.json

# Alternative names (if renamed)
find /home/claude/repo -name "*jeetmantra*workflow*"
find /home/claude/repo -name "*.json" | grep -i workflow

# Check current directory
ls -la ./n8n-jeetmantrawebsite-workflow.json
```

### If File Doesn't Exist

I'll create it again:

```bash
# Ask to recreate the workflow file
# Email or message me: "Please recreate n8n-jeetmantrawebsite-workflow.json"
```

---

## ✅ Checklist

- [ ] Located file: `/home/claude/repo/n8n-jeetmantrawebsite-workflow.json`
- [ ] File size reasonable: ~80-100 KB
- [ ] File format: JSON (plain text)
- [ ] Contains 14 nodes
- [ ] Contains workflow name: "jeetmantrawebsite"
- [ ] Ready to import

---

**You're all set! Go import the workflow to n8n now! 🚀**

**File:** `n8n-jeetmantrawebsite-workflow.json`
**Location:** `/home/claude/repo/`
**Status:** ✅ Created and ready
