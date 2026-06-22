/**
 * settings.js — admin-configurable platform settings resolver.
 *
 * Lets an admin map integrations (SMTP, SMS, AI, n8n) from the UI instead of
 * editing .env on the server. Resolution order for any key:
 *   1. platform_settings table (set via PUT /api/admin/settings)  ← admin UI
 *   2. process.env[envKey]                                        ← .env fallback
 *   3. ''                                                          ← unset
 *
 * The table is cached for 60s; admin saves call invalidate() so changes apply
 * immediately.
 */
const { supabaseAdmin } = require('../config/supabase');

let _cache = null;
let _at = 0;
const TTL_MS = 60 * 1000;

async function _load() {
  if (_cache && (Date.now() - _at) < TTL_MS) return _cache;
  try {
    const { data } = await supabaseAdmin.from('platform_settings').select('key, value');
    _cache = Object.fromEntries((data || []).map(r => [r.key, r.value]));
    _at = Date.now();
  } catch (e) {
    if (!_cache) _cache = {}; // table missing / DB down → fall back to env only
  }
  return _cache;
}

// getSetting('smtp_user', 'SMTP_USER') → admin value, else env, else ''.
async function getSetting(key, envKey) {
  const s = await _load();
  const v = s[key];
  if (v !== undefined && v !== null && v !== '') return v;
  if (envKey && process.env[envKey]) return process.env[envKey];
  return '';
}

function invalidate() { _cache = null; _at = 0; }

module.exports = { getSetting, invalidate };
