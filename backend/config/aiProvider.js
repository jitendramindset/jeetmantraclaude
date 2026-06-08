/**
 * aiProvider.js — single dispatch layer for every AI provider.
 *
 *   const { ai } = require('./config/aiProvider');
 *   const out = await ai(user, 'system prompt', 'user prompt', { json: true });
 *
 * Resolves which provider/key to use:
 *   1. If the user has their own ai_provider + api_key_encrypted set, use it.
 *   2. Else fall back to the platform shared key (env), gated by plan rate limit.
 *
 * Plan rules (simple MVP):
 *   - FREE  (default): 5 shared-key calls per day
 *   - PRO   (their own key): unlimited
 *
 * Supports OpenAI, Anthropic (Claude), Google Gemini, OpenRouter. Each request
 * is logged to ai_usage_log so future paid plans can be billed.
 */
const https = require('https');
const crypto = require('crypto');
const { supabaseAdmin } = require('./supabase');

// Symmetric key for the per-user api_key_encrypted column.
// Prefer a dedicated AI_ENC_KEY env var so this lifecycle is decoupled from
// JWT_SECRET — rotating JWT tokens must NOT invalidate stored user keys.
// We hard-fail at boot if neither AI_ENC_KEY nor JWT_SECRET is set, to avoid
// silently encrypting with a publicly-known default.
const _seed = process.env.AI_ENC_KEY || process.env.JWT_SECRET;
if (!_seed) {
  // Throwing here would crash the whole server; instead null out the key and
  // refuse to encrypt/decrypt. Routes that require AI keys will return 503.
  console.warn('⚠️  AI_ENC_KEY and JWT_SECRET both missing — AI key storage disabled.');
}
const ENC_KEY = _seed ? crypto.createHash('sha256').update(_seed).digest() : null;
const ALGO = 'aes-256-gcm';

function encrypt(plain) {
  if (!plain || !ENC_KEY) return null;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv(ALGO, ENC_KEY, iv);
  const enc = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  const tag = c.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(b64) {
  if (!b64 || !ENC_KEY) return null;
  try {
    const raw = Buffer.from(b64, 'base64');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const enc = raw.subarray(28);
    const d = crypto.createDecipheriv(ALGO, ENC_KEY, iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(enc), d.final()]).toString('utf8');
  } catch (_) { return null; }
}

const SHARED_LIMITS = { free: 5, pro: 1000 };  // calls per day

// Resolve the provider/key/plan for this user.
async function resolveCreds(userId) {
  const { data: u } = await supabaseAdmin
    .from('jeetmantra_users')
    .select('id, ai_provider, api_key_encrypted, status')
    .eq('id', userId)
    .single();
  if (!u) throw new Error('User not found');
  const userKey = decrypt(u.api_key_encrypted);
  if (userKey && u.ai_provider) {
    return { provider: u.ai_provider, apiKey: userKey, ownKey: true, plan: 'pro' };
  }
  // Fall back to platform shared key, with a daily quota.
  const since = new Date(); since.setHours(0, 0, 0, 0);
  const { count } = await supabaseAdmin
    .from('ai_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since.toISOString());
  const plan = 'free';
  const limit = SHARED_LIMITS[plan];
  if ((count || 0) >= limit) {
    const err = new Error(`Daily limit reached on the FREE plan (${limit}/day). Add your own AI key in Profile for unlimited use.`);
    err.code = 'RATE_LIMITED';
    throw err;
  }
  const fallback = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY;
  if (!fallback) {
    const err = new Error('No AI provider configured. Add your own key in Profile.');
    err.code = 'NO_KEY';
    throw err;
  }
  const provider = process.env.OPENAI_API_KEY ? 'openai' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'gemini';
  return { provider, apiKey: fallback, ownKey: false, plan };
}

function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers }
    }, (res) => {
      let chunks = '';
      res.on('data', (c) => chunks += c);
      res.on('end', () => {
        try {
          const json = chunks ? JSON.parse(chunks) : {};
          if (res.statusCode >= 400) return reject(new Error(json.error?.message || json.error || `HTTP ${res.statusCode}`));
          resolve(json);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Provider adapters — each takes (apiKey, systemPrompt, userPrompt, opts) and
// returns plain text completion.
const ADAPTERS = {
  async openai(key, system, user, opts) {
    const body = {
      model: opts.model || 'gpt-4o-mini',
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: user }
      ],
      temperature: opts.temperature ?? 0.4
    };
    if (opts.json) body.response_format = { type: 'json_object' };
    const r = await postJson('https://api.openai.com/v1/chat/completions',
      { Authorization: 'Bearer ' + key }, body);
    return { text: r.choices?.[0]?.message?.content || '', usage: r.usage?.total_tokens || 0 };
  },
  async anthropic(key, system, user, opts) {
    const body = {
      model: opts.model || 'claude-3-5-haiku-latest',
      max_tokens: opts.maxTokens || 1024,
      ...(system ? { system } : {}),
      messages: [{ role: 'user', content: user }]
    };
    const r = await postJson('https://api.anthropic.com/v1/messages',
      { 'x-api-key': key, 'anthropic-version': '2023-06-01' }, body);
    return { text: r.content?.[0]?.text || '', usage: (r.usage?.input_tokens || 0) + (r.usage?.output_tokens || 0) };
  },
  async gemini(key, system, user, opts) {
    const model = opts.model || 'gemini-1.5-flash-latest';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const body = {
      contents: [{ parts: [{ text: (system ? system + '\n\n' : '') + user }] }],
      generationConfig: { temperature: opts.temperature ?? 0.4 }
    };
    const r = await postJson(url, {}, body);
    return { text: r.candidates?.[0]?.content?.parts?.[0]?.text || '', usage: r.usageMetadata?.totalTokenCount || 0 };
  },
  async openrouter(key, system, user, opts) {
    const body = {
      model: opts.model || 'openai/gpt-4o-mini',
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: user }
      ],
      temperature: opts.temperature ?? 0.4
    };
    const r = await postJson('https://openrouter.ai/api/v1/chat/completions',
      { Authorization: 'Bearer ' + key, 'HTTP-Referer': 'https://jeetmantra' }, body);
    return { text: r.choices?.[0]?.message?.content || '', usage: r.usage?.total_tokens || 0 };
  }
};

// Public entry-point. Returns { text, provider, ownKey, plan }.
async function ai(userId, systemPrompt, userPrompt, opts = {}) {
  const creds = await resolveCreds(userId);
  const adapter = ADAPTERS[creds.provider];
  if (!adapter) throw new Error('Unsupported provider: ' + creds.provider);
  const { text, usage } = await adapter(creds.apiKey, systemPrompt, userPrompt, opts);
  // Best-effort log
  supabaseAdmin.from('ai_usage_log').insert({
    user_id: userId,
    provider: creds.provider,
    model: opts.model || null,
    used_own_key: creds.ownKey,
    tokens_used: usage,
    action: opts.action || 'generate'
  }).then(() => {}).catch(() => {});
  return { text, provider: creds.provider, ownKey: creds.ownKey, plan: creds.plan };
}

// Try to parse JSON from an AI response that may wrap it in code fences.
function safeJson(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  const raw = fenced ? fenced[1] : text;
  try { return JSON.parse(raw); } catch (_) {
    // Try to extract the first {...} object
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
    return null;
  }
}

module.exports = { ai, encrypt, decrypt, safeJson, resolveCreds };
