#!/usr/bin/env node
// One-shot migration runner. Run from backend/ directory.
// Usage: node run-migrations.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

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

// Simple SQL statement splitter (skips comments)
function splitSQL(sql) {
  const stmts = [];
  let buf = '';
  let inStr = false;
  let strChar = '';
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    // Skip line comments
    if (!inStr && ch === '-' && sql[i+1] === '-') {
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }
    if (!inStr && (ch === "'" || ch === '"')) { inStr = true; strChar = ch; buf += ch; continue; }
    if (inStr && ch === strChar && sql[i-1] !== '\\') { inStr = false; buf += ch; continue; }
    if (!inStr && ch === ';') {
      const s = buf.trim();
      if (s.length > 4) stmts.push(s);
      buf = '';
    } else {
      buf += ch;
    }
  }
  const last = buf.trim();
  if (last.length > 4) stmts.push(last);
  return stmts;
}

async function runMigration(file) {
  const filePath = path.join(MIGRATION_DIR, file);
  if (!fs.existsSync(filePath)) return { skip: true };

  const sql = fs.readFileSync(filePath, 'utf8');
  const stmts = splitSQL(sql);
  let ok = 0, warn = 0, fail = 0, errors = [];

  for (const stmt of stmts) {
    // Use Supabase's RPC or direct REST. Since exec_sql isn't standard,
    // we POST to the postgres REST endpoint.
    const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ sql: stmt }),
    }).catch(e => ({ status: 0, _fetchErr: e.message }));

    const status = res.status || 0;
    const body = typeof res.json === 'function' ? await res.json().catch(() => ({})) : {};

    if (status >= 200 && status < 300) {
      ok++;
    } else {
      const msg = body?.message || body?.error || JSON.stringify(body).slice(0, 80);
      if (msg.includes('already exists') || msg.includes('42P07') || msg.includes('duplicate') || status === 0) {
        warn++;
      } else {
        fail++;
        errors.push(msg.slice(0, 100));
      }
    }
  }
  return { ok, warn, fail, errors };
}

(async () => {
  console.log(`Supabase: ${process.env.SUPABASE_URL}`);
  console.log(`Running ${MIGRATIONS.length} migrations...\n`);

  for (const file of MIGRATIONS) {
    process.stdout.write(`  ${file}... `);
    const r = await runMigration(file);
    if (r.skip) { console.log('⚠️  not found, skipped'); continue; }
    const sym = r.fail > 0 ? '❌' : r.warn > 0 ? '⚠️ ' : '✅';
    console.log(`${sym} ok:${r.ok} warn:${r.warn} fail:${r.fail}${r.errors.length ? '\n    ' + r.errors[0] : ''}`);
  }

  // Verify key tables
  console.log('\n─ Table check ─');
  for (const t of ['feature_permissions','cms_posts','cms_media','cms_comments','cms_categories']) {
    const { error } = await supabase.from(t).select('id').limit(1);
    console.log(`  ${t}: ${error ? '❌ ' + error.message.slice(0,70) : '✅'}`);
  }
  console.log('\nDone.');
})();
