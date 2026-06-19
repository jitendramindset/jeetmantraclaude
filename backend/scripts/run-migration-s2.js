/**
 * Apply backend/database/migration-s2-identity.sql against the self-hosted
 * Supabase via the /pg/query DDL endpoint (the project has no direct Postgres
 * port — see [[supabase-selfhosted-quirks]]).
 *
 *   node backend/scripts/run-migration-s2.js
 *
 * Idempotent — safe to re-run. Statements that "already exist" are reported
 * as warnings, not failures.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runSQL(query) {
  const res = await axios.post(SUPABASE_URL + '/pg/query', { query }, {
    headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }
  });
  return res.data;
}

(async () => {
  console.log('\n🚀 Sprint 2 migration — Identity foundation + ad-hoc DDL\n');
  const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'migration-s2-identity.sql'), 'utf8');

  // Split on top-level semicolons so we can report per-statement. Tolerates
  // CREATE / INSERT bodies that span multiple lines.
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let ok = 0, warn = 0, fail = 0;
  for (const stmt of statements) {
    const label = stmt.replace(/\s+/g, ' ').slice(0, 70);
    try {
      await runSQL(stmt + ';');
      console.log('  ✅', label);
      ok++;
    } catch (e) {
      const msg = (e.response && e.response.data && e.response.data.message) || e.message || '';
      if (/already exists|does not exist|duplicate|cannot drop/i.test(msg)) {
        console.log('  ⚠️ ', label, '→', msg.slice(0, 100));
        warn++;
      } else {
        console.log('  ❌', label, '→', msg.slice(0, 140));
        fail++;
      }
    }
  }

  console.log(`\n📊 Sprint 2 migration: ${ok} ok, ${warn} warn, ${fail} errors\n`);
  if (fail > 0) process.exit(1);
})().catch(e => {
  console.error('Fatal:', e.response?.data || e.message);
  process.exit(1);
});
