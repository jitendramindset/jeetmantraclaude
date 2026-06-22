# EduOS / JeetMantra — Disaster Recovery Runbook

Last updated: 2026-06-22. Run through this before an incident — not during one.

---

## 1. What to back up

| Data | Location | Backup method |
|---|---|---|
| All DB tables | Supabase (PostgREST) | `scripts/api-backup.js` → `backups/*.json.gz.enc` |
| Media uploads | `uploads/` volume | `scripts/api-backup.js` → `backups/uploads-*.tar.gz.enc` |
| `.env.production` | VPS `/opt/jeetmantra/` | Manual copy to secure vault (1Password / Bitwarden) |
| n8n workflows | n8n dashboard | Export JSON from n8n → Settings → Export |
| Grafana dashboards | Grafana UI | Dashboards → Export JSON |

---

## 2. Triggering a manual backup

**From Admin OS (UI):**
System → Integrations → "Trigger backup" → wait 35 s → verify in backup list.

**From CLI:**
```bash
cd /opt/jeetmantra
docker compose -f docker-compose.prod.yml --profile backup run --rm backup
```

**Backup file format:**
- `backup-YYYY-MM-DDTHH-MM-SS.json.gz.enc` — AES-256-CBC encrypted DB dump
- `uploads-YYYY-MM-DD.tar.gz.enc` — encrypted media archive
- Decrypt: `openssl enc -d -aes-256-cbc -in backup.json.gz.enc -out backup.json.gz`
  (IV is prepended as first 16 bytes; use the same BACKUP_ENCRYPT_KEY)

---

## 3. Database restore

### 3a. Restore a single table

```bash
# Decrypt backup
openssl enc -d -aes-256-cbc -in backup-2026-06-22T00-00-00.json.gz.enc \
  | gzip -d > backup.json

# Extract one table (jq required)
jq '.tables.enrollments' backup.json > enrollments.json

# Re-insert via Supabase REST (batches of 1000)
# Use the restore script (see scripts/restore-table.sh)
```

### 3b. Full schema + data restore (fresh Supabase instance)

1. Create a new Supabase project (or use existing).
2. Run **all migrations in order** via Admin → System → "Run migration":
   - `001_rls_policies.sql`
   - `002_indexes.sql`
   - Any `00N_*.sql` added since.
3. For each table in the backup, POST rows via `/rest/v1/<table>`:
   ```bash
   node scripts/restore.js --backup backup.json --table jeetmantra_users
   ```

### 3c. `restore.js` quick script

```js
// scripts/restore.js — paste and run ad-hoc
const fs = require('fs');
const https = require('https');
const dump = JSON.parse(require('zlib').gunzipSync(fs.readFileSync('backup.json.gz')));
const TABLE = process.argv[3] || 'jeetmantra_users';
const rows  = dump.tables[TABLE] || [];
const SB    = process.env.SUPABASE_URL;
const KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const batch = 200;
(async () => {
  for (let i = 0; i < rows.length; i += batch) {
    const body = JSON.stringify(rows.slice(i, i + batch));
    await new Promise((ok, fail) => {
      const r = https.request(`${SB}/rest/v1/${TABLE}`,
        { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${KEY}`,
          'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' } },
        res => { res.resume(); res.on('end', ok); });
      r.on('error', fail); r.write(body); r.end();
    });
    console.log(`inserted rows ${i}–${i + batch}`);
  }
})();
```

---

## 4. Application restore

### 4a. Redeploy from GHCR (fastest path)

```bash
cd /opt/jeetmantra
git pull
cp /your-vault/env.production .env.production    # restore secrets
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Watchtower handles rolling restarts on image update. Force a manual pull if Watchtower hasn't run.

### 4b. Rebuild from source

```bash
docker build -t eduos-api:local -f backend/Dockerfile .
docker tag eduos-api:local ghcr.io/jitendramindset/jeetmantraclaude:latest
docker compose -f docker-compose.prod.yml up -d
```

---

## 5. Uploads restore

```bash
# Decrypt archive
openssl enc -d -aes-256-cbc -in backups/uploads-2026-06-22.tar.gz.enc \
  | tar -xzf - -C /opt/jeetmantra/uploads/
```

Then restart the API container so multer can see the restored files:
```bash
docker compose -f docker-compose.prod.yml restart api
```

---

## 6. Secrets checklist

After any restore, verify these env vars are present and correct:

- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `JWT_SECRET` (rotating this logs out all users)
- [ ] `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` + `RAZORPAY_WEBHOOK_SECRET`
- [ ] `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`
- [ ] `N8N_SECRET`
- [ ] `BACKUP_ENCRYPT_KEY` (same key used when backup was created!)
- [ ] `SENTRY_DSN`
- [ ] `GOOGLE_CLIENT_ID`

---

## 7. Post-restore smoke test

```bash
# Health
curl https://api.mantravat.cloud/health

# Auth
curl -X POST https://api.mantravat.cloud/api/auth/send-otp \
  -H 'Content-Type: application/json' -d '{"phone":"9999999999"}'

# Admin (replace TOKEN)
curl https://api.mantravat.cloud/api/admin/users \
  -H "Authorization: Bearer TOKEN"
```

Expected: all return 200 (or 429 if rate-limited — that means the API is alive).

---

## 8. RTO / RPO targets

| Metric | Target |
|---|---|
| Recovery Time Objective (RTO) | < 2 hours |
| Recovery Point Objective (RPO) | < 24 hours (daily backup schedule) |
| Backup retention | 7 days local, 30 days S3 |
