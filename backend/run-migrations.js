#!/usr/bin/env node
// Run all SQL migrations against Supabase via /pg/query endpoint
// Usage: node run-migrations.js   (from backend/ directory)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PG_URL = `${SUPABASE_URL}/pg/query`;

const MIGRATION_DIR = path.join(__dirname, 'database');
const MIGRATIONS = [
  'migration-v2.sql',
  'migration-s2-identity.sql',
  'migration-s3-i18n.sql',
  'migration-s3-ops.sql',
  'migration-s4-booking.sql',
  'migration-s5-student-success.sql',
  'migration-s6-certs-impersonate.sql',
  'migration-s7-role-org.sql',
  'migration-s8-permission-tiers.sql',
  'migration-s9-org-settings.sql',
  'migration-s10-verticals.sql',
  'migration-s11-polish.sql',
  'migration-s12-widget-prefs.sql',
  'migration-coupon-redemptions.sql',
  'migration-s13-permissions.sql',
  'migration-s14-cms.sql',
];

// Split SQL into individual non-empty statements
function splitSQL(sql) {
  // Remove line comments
  const lines = sql.split('\n').map(l => {
    const ci = l.indexOf('--');
    return ci >= 0 ? l.slice(0, ci) : l;
  }).join('\n');
  return lines.split(';').map(s => s.trim()).filter(s => s.length > 4);
}

const IDEMPOTENT = ['already exists', '42P07', 'duplicate column', '42701', 'does not exist', '42P01'];

(async () => {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(1);
  }
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Running ${MIGRATIONS.length} migrations...\n`);

  for (const file of MIGRATIONS) {
    const filePath = path.join(MIGRATION_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ${file} ⚠️  not found — skipped`);
      continue;
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    const stmts = splitSQL(sql);
    process.stdout.write(`  ${file} (${stmts.length} stmts)... `);

    let ok = 0, warn = 0, fail = 0, firstErr = '';
    for (const stmt of stmts) {
      try {
        await axios.post(PG_URL, { query: stmt + ';' }, {
          headers: { apikey: SERVICE_KEY, 'Content-Type': 'application/json' },
          timeout: 15000,
        });
        ok++;
      } catch (e) {
        const msg = e.response?.data?.message || e.response?.data?.error || e.message || '';
        const isIdempotent = IDEMPOTENT.some(kw => msg.toLowerCase().includes(kw.toLowerCase()));
        if (isIdempotent) { warn++; }
        else { fail++; if (!firstErr) firstErr = msg.slice(0, 100); }
      }
    }
    const sym = fail > 0 ? '❌' : warn > 0 ? '⚠️ ' : '✅';
    console.log(`${sym} ok:${ok} warn:${warn} fail:${fail}${firstErr ? '\n     ' + firstErr : ''}`);
  }

  // Final table check
  console.log('\n─ Verifying key tables via /pg/query ─');
  const TABLES = ['feature_permissions', 'cms_posts', 'cms_media', 'cms_comments', 'cms_categories'];
  for (const t of TABLES) {
    try {
      await axios.post(PG_URL, { query: `SELECT 1 FROM ${t} LIMIT 1;` }, {
        headers: { apikey: SERVICE_KEY, 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      console.log(`  ${t}: ✅`);
    } catch (e) {
      const msg = e.response?.data?.message || e.message || '';
      console.log(`  ${t}: ❌ ${msg.slice(0, 80)}`);
    }
  }
  console.log('\nDone.');
})();
