/**
 * Apply database/migration-coupon-redemptions.sql via the pg-meta /pg/query API.
 * Idempotent — safe to run more than once.
 *   node scripts/run-coupon-redemptions-migration.js
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
  console.log('\n🚀 coupon_redemptions migration\n');
  let sql = fs.readFileSync(path.join(__dirname, '..', 'database', 'migration-coupon-redemptions.sql'), 'utf8');
  // Strip line comments first so a leading comment block doesn't get glued to
  // the first statement (which would make the splitter drop it).
  sql = sql.replace(/^\s*--.*$/gm, '');
  const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(s => s.length > 0);
  let passed = 0, failed = 0;
  for (const stmt of statements) {
    const label = stmt.slice(0, 70).replace(/\n/g, ' ');
    try { await runSQL(stmt + ';'); console.log('  ✅', label); passed++; }
    catch (e) {
      const msg = e.response?.data?.message || e.message;
      if (msg.includes('already exists')) { console.log('  ⚠️ ', label, '→', msg.slice(0, 80)); passed++; }
      else { console.log('  ❌', label, '→', msg.slice(0, 140)); failed++; }
    }
  }
  console.log(`\n📊 Done: ${passed} ok, ${failed} errors\n`);
  process.exit(failed > 0 ? 1 : 0);
}
main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
