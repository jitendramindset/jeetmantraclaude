/**
 * Apply ALL backend/database migrations in dependency order against the
 * self-hosted Supabase via the /pg/query DDL endpoint (no direct Postgres port
 * — see [[supabase-selfhosted-quirks]]).
 *
 *   node backend/scripts/run-all-migrations.js          # run the full sequence
 *   node backend/scripts/run-all-migrations.js s9-org-settings s10-verticals s11-polish
 *
 * Every migration is idempotent (IF NOT EXISTS / DROP-THEN-ADD / ON CONFLICT),
 * so re-running is safe; "already exists" responses are warnings, not failures.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Dependency order. v2 + coupon are the pre-sprint base; sprints build on s7's
// organizations table (s8/s9) etc., so numeric order is the safe order.
const ORDER = [
  'v2',
  'coupon-redemptions',
  's2-identity',
  's3-i18n',
  's3-ops',
  's4-booking',
  's5-student-success',
  's6-certs-impersonate',
  's7-role-org',
  's8-permission-tiers',
  's9-org-settings',
  's10-verticals',
  's11-polish'
];

async function runSQL(query) {
  const res = await axios.post(SUPABASE_URL + '/pg/query', { query }, {
    headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    timeout: 30000
  });
  return res.data;
}

function splitStatements(sql) {
  // Strip FULL-LINE comments first (a chunk that merely *starts* with a comment
  // must NOT be discarded — that was dropping CREATE TABLEs preceded by a
  // header comment). Inline trailing comments are left for Postgres to handle.
  const cleaned = sql.split('\n').filter(l => !l.trim().startsWith('--')).join('\n');
  return cleaned
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

async function applyFile(name) {
  const file = path.join(__dirname, '..', 'database', `migration-${name}.sql`);
  if (!fs.existsSync(file)) { console.log(`  ⏭️  (skip — not found) migration-${name}.sql`); return { ok: 0, warn: 0, fail: 0 }; }
  const sql = fs.readFileSync(file, 'utf8');
  const statements = splitStatements(sql);
  let ok = 0, warn = 0, fail = 0;
  for (const stmt of statements) {
    const label = stmt.replace(/\s+/g, ' ').slice(0, 64);
    try {
      await runSQL(stmt + ';');
      ok++;
    } catch (e) {
      const msg = (e.response && e.response.data && (e.response.data.message || JSON.stringify(e.response.data))) || e.message || '';
      if (/already exists|does not exist|duplicate|cannot drop|already a member|multiple primary keys/i.test(msg)) {
        warn++;
      } else {
        console.log(`     ❌ ${label} → ${String(msg).slice(0, 150)}`);
        fail++;
      }
    }
  }
  const tag = fail ? '❌' : (warn ? '⚠️ ' : '✅');
  console.log(`  ${tag} migration-${name}.sql — ${ok} ok, ${warn} warn, ${fail} err`);
  return { ok, warn, fail };
}

(async () => {
  if (!SUPABASE_URL || !KEY) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in backend/.env'); process.exit(1); }
  const list = process.argv.slice(2).length ? process.argv.slice(2) : ORDER;
  console.log(`\n🚀 Applying ${list.length} migrations to ${SUPABASE_URL}\n`);
  let totals = { ok: 0, warn: 0, fail: 0 };
  for (const name of list) {
    const r = await applyFile(name);
    totals.ok += r.ok; totals.warn += r.warn; totals.fail += r.fail;
  }
  // Reload PostgREST schema cache so the new tables/columns are queryable.
  try { await runSQL("NOTIFY pgrst, 'reload schema';"); console.log('\n  🔄 PostgREST schema reload sent'); } catch (_) {}
  console.log(`\n📊 TOTAL: ${totals.ok} ok, ${totals.warn} warn, ${totals.fail} errors\n`);
  process.exit(totals.fail > 0 ? 1 : 0);
})().catch(e => { console.error('Fatal:', e.response?.data || e.message); process.exit(1); });
