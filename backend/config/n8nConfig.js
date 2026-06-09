/**
 * n8nConfig.js — the n8n / webhook addon.
 *
 * The webhook URL is an *optional addon a user can add at runtime*: it is stored
 * in LevelDB (key `config:n8n`) and falls back to the N8N_WEBHOOK_URL env var.
 * Routes call triggerN8n() to fire events; if no URL is configured (and no env
 * fallback) the call is a silent no-op, so the platform works fine without n8n.
 */
const axios = require('axios');
const { get, put } = require('./leveldb');

const CONFIG_KEY = 'config:n8n';

const ENV_DEFAULT = {
  url: process.env.N8N_WEBHOOK_URL || '',
  secret: process.env.N8N_WEBHOOK_SECRET || '',
  enabled: !!process.env.N8N_WEBHOOK_URL,
};

/** Read the current addon config (LevelDB override wins over env defaults). */
async function getN8nConfig() {
  try {
    const stored = await get(CONFIG_KEY);
    if (stored && stored.url) return { ...ENV_DEFAULT, ...stored };
  } catch (e) { console.warn('n8n config load err:', e.message); }
  return ENV_DEFAULT;
}

/** Persist a user-supplied webhook URL/secret. Returns the saved config. */
async function setN8nConfig({ url, secret, enabled }) {
  const current = await getN8nConfig();
  const next = {
    url: url !== undefined ? url : current.url,
    secret: secret !== undefined ? secret : current.secret,
    enabled: enabled !== undefined ? enabled : (url ? true : current.enabled),
  };
  await put(CONFIG_KEY, next);
  return next;
}

/**
 * Fire an event to the configured n8n webhook. Non-blocking, never throws —
 * failures are swallowed so a missing/broken n8n never breaks the main request.
 */
async function triggerN8n(event, payload = {}) {
  let cfg;
  try { cfg = await getN8nConfig(); } catch (_) { return { fired: false }; }
  if (!cfg.enabled || !cfg.url) return { fired: false, reason: 'n8n addon not configured' };

  try {
    await axios.post(cfg.url, {
      event,
      data: payload,
      source: 'jeetmantra-backend',
      firedAt: new Date().toISOString(),
    }, {
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
        ...(cfg.secret && { 'X-N8N-Secret': cfg.secret }),
      },
    });
    return { fired: true, event };
  } catch (err) {
    // Swallow — addon is best-effort.
    return { fired: false, event, error: err.message };
  }
}

module.exports = { getN8nConfig, setN8nConfig, triggerN8n, CONFIG_KEY };
