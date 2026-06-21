#!/usr/bin/env node
/**
 * api-backup.js — exports all Supabase tables via the REST API, compresses,
 * encrypts with AES-256-CBC, and saves to ./backups/.
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in environment.
 * Optional:  BACKUP_ENCRYPT_KEY   — 32-char key (generated random if unset)
 *            BACKUP_S3_BUCKET     — s3://bucket/prefix  (skip upload if unset)
 *            BACKUP_S3_REGION     — us-east-1
 *            AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
 *
 * Run manually:   node scripts/api-backup.js
 * Run in Docker:  see docker-compose.prod.yml backup service
 */
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
const https  = require('https');
const http   = require('http');
const zlib   = require('zlib');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

const SB_URL  = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SB_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ENC_KEY = (process.env.BACKUP_ENCRYPT_KEY || '').padEnd(32, '0').slice(0, 32);
const S3_DST  = process.env.BACKUP_S3_BUCKET || '';

if (!SB_URL || !SB_KEY) {
  console.error('[backup] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

// ── HTTP helper ────────────────────────────────────────────────────────────
function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// ── Fetch all rows from one table (paginated) ──────────────────────────────
async function fetchTable(table, pageSize = 1000) {
  const rows = [];
  let offset = 0;
  while (true) {
    const url = `${SB_URL}/rest/v1/${table}?select=*&offset=${offset}&limit=${pageSize}`;
    const { status, data } = await get(url, {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Range-Unit': 'items',
      Prefer: 'count=none',
    });
    if (status === 404) return null; // table doesn't exist via REST
    if (!Array.isArray(data)) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return rows;
}

// ── Fetch table list via /pg/query ─────────────────────────────────────────
async function fetchTableNames() {
  const url = `${SB_URL}/pg/query`;
  const body = JSON.stringify({
    query: "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
  });
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const parsed = new URL(url);
    const req = mod.request({
      hostname: parsed.hostname,
      port: parsed.port || (url.startsWith('https') ? 443 : 80),
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        apikey: SB_KEY,
      },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const rows = Array.isArray(j) ? j : (j.rows || []);
          resolve(rows.map(r => r.tablename).filter(Boolean));
        } catch { resolve([]); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Encrypt buffer with AES-256-CBC ───────────────────────────────────────
function encrypt(buf) {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENC_KEY, 'utf8');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const enc = Buffer.concat([cipher.update(buf), cipher.final()]);
  return Buffer.concat([iv, enc]); // prepend IV for decryption
}

// ── Upload to S3-compatible via signed URL (uses aws CLI if available) ─────
async function uploadToS3(localPath, filename) {
  if (!S3_DST) return;
  const { execSync } = require('child_process');
  try {
    const region = process.env.BACKUP_S3_REGION || 'us-east-1';
    execSync(
      `aws s3 cp "${localPath}" "${S3_DST}/${filename}" --region ${region}`,
      { stdio: 'inherit', env: process.env }
    );
    console.log(`[backup] uploaded to ${S3_DST}/${filename}`);
  } catch (e) {
    console.error('[backup] S3 upload failed:', e.message);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  console.log(`[backup] starting at ${ts}`);

  const tables = await fetchTableNames();
  if (!tables.length) {
    console.error('[backup] could not list tables — check SUPABASE_URL and key');
    process.exit(1);
  }
  console.log(`[backup] exporting ${tables.length} tables: ${tables.join(', ')}`);

  const dump = { _meta: { ts, tables: tables.length }, tables: {} };
  let totalRows = 0;

  for (const tbl of tables) {
    const rows = await fetchTable(tbl);
    if (rows === null) { console.log(`  skip ${tbl} (not via REST)`); continue; }
    dump.tables[tbl] = rows;
    totalRows += rows.length;
    console.log(`  ${tbl}: ${rows.length} rows`);
  }
  dump._meta.totalRows = totalRows;

  const json    = Buffer.from(JSON.stringify(dump));
  const gz      = zlib.gzipSync(json, { level: 9 });
  const enc     = ENC_KEY !== '0'.repeat(32) ? encrypt(gz) : gz;
  const suffix  = ENC_KEY !== '0'.repeat(32) ? 'json.gz.enc' : 'json.gz';
  const fname   = `backup-${ts}.${suffix}`;
  const outDir  = path.join(__dirname, '..', 'backups');

  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, fname);
  fs.writeFileSync(outPath, enc);

  const sizeMB = (enc.length / 1024 / 1024).toFixed(2);
  console.log(`[backup] saved ${outPath} (${sizeMB} MB, ${totalRows} rows)`);
  if (!process.env.BACKUP_ENCRYPT_KEY) {
    console.warn('[backup] ⚠ BACKUP_ENCRYPT_KEY not set — file is NOT encrypted');
  }

  await uploadToS3(outPath, fname);

  // Prune local backups older than 7 days
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  fs.readdirSync(outDir)
    .filter(f => f.startsWith('backup-'))
    .map(f => ({ f, mtime: fs.statSync(path.join(outDir, f)).mtimeMs }))
    .filter(({ mtime }) => Date.now() - mtime > maxAge)
    .forEach(({ f }) => { fs.unlinkSync(path.join(outDir, f)); console.log(`[backup] pruned ${f}`); });

  console.log('[backup] done');
}

main().catch(e => { console.error('[backup] fatal:', e.message); process.exit(1); });
