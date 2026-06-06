/**
 * Run migration-v2.sql against Supabase via pg-meta API
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

async function main() {
  console.log('\n🚀 Running JeetMantra v2.0 Database Migration\n');

  const sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'migration-v2.sql'), 'utf8');

  // Split on double-newline after semicolons to get individual statements
  // Send them one at a time so we can report progress
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let passed = 0, failed = 0;
  for (const stmt of statements) {
    const label = stmt.slice(0, 60).replace(/\n/g, ' ');
    try {
      await runSQL(stmt + ';');
      console.log('  ✅', label);
      passed++;
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      // Ignore "already exists" errors — migration is idempotent
      if (msg.includes('already exists') || msg.includes('does not exist')) {
        console.log('  ⚠️ ', label, '→', msg.slice(0, 80));
        passed++;
      } else {
        console.log('  ❌', label, '→', msg.slice(0, 120));
        failed++;
      }
    }
  }

  console.log(`\n📊 Migration complete: ${passed} ok, ${failed} errors\n`);
  if (failed > 0) process.exit(1);
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
