/**
 * ai.js — AI-assisted endpoints.
 *
 *   POST   /api/ai/key                — set/clear my AI provider + key
 *   GET    /api/ai/key                — view current status (key never returned)
 *   POST   /api/ai/usage              — usage summary for today
 *   POST   /api/ai/generate           — generic prompt (for chat / arbitrary AI features)
 *   POST   /api/ai/create-course      — describe → structured course suggestion
 *   POST   /api/ai/create-assignment  — describe → structured assignment suggestion
 *   POST   /api/ai/transcribe-summary — paste a long description, get a concise summary
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { ai, encrypt, safeJson } = require('../config/aiProvider');

const router = express.Router();

router.get('/key', authenticateToken, async (req, res) => {
  const { data } = await supabaseAdmin.from('jeetmantra_users')
    .select('ai_provider, api_key_encrypted').eq('id', req.user.id).single();
  res.json({
    provider: data?.ai_provider || null,
    hasKey: !!data?.api_key_encrypted,
    supported: ['openai', 'anthropic', 'gemini', 'openrouter']
  });
});

router.post('/key', authenticateToken, async (req, res) => {
  const { provider, apiKey, clear } = req.body;
  if (clear) {
    await supabaseAdmin.from('jeetmantra_users')
      .update({ ai_provider: null, api_key_encrypted: null }).eq('id', req.user.id);
    return res.json({ message: 'Cleared' });
  }
  if (!provider || !apiKey) return res.status(400).json({ error: 'provider and apiKey required' });
  if (!['openai', 'anthropic', 'gemini', 'openrouter'].includes(provider)) {
    return res.status(400).json({ error: 'Unsupported provider' });
  }
  await supabaseAdmin.from('jeetmantra_users')
    .update({ ai_provider: provider, api_key_encrypted: encrypt(apiKey) })
    .eq('id', req.user.id);
  res.json({ message: 'AI key saved' });
});

router.get('/usage', authenticateToken, async (req, res) => {
  const since = new Date(); since.setHours(0, 0, 0, 0);
  const { count } = await supabaseAdmin.from('ai_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.user.id)
    .gte('created_at', since.toISOString());
  res.json({ todayCalls: count || 0, freeLimit: 5 });
});

// Generic prompt — used by the in-modal "AI assistant" buttons.
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { systemPrompt, prompt, json, model } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const out = await ai(req.user.id, systemPrompt || '', prompt, { json, model, action: 'generate' });
    res.json(out);
  } catch (e) {
    res.status(e.code === 'RATE_LIMITED' ? 429 : 400).json({ error: e.message, code: e.code });
  }
});

// "Describe your course → AI fills the form." Returns title, description,
// category, level, suggested price.
router.post('/create-course', authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'description required' });
    const out = await ai(req.user.id,
      'You help educators design online courses. Reply with ONLY a JSON object — no prose, no markdown.',
      `Based on this description, return a course outline as JSON with exactly these fields:
{
  "title": "short, marketing-ready title",
  "description": "1-2 paragraphs",
  "category": "Mathematics|Science|Programming|Languages|Arts|Commerce|General",
  "level": "beginner|intermediate|advanced",
  "price": <number in INR, 0 if free>,
  "topics": ["chapter 1 title", "chapter 2 title", ...up to 8],
  "tags": ["tag1", "tag2"]
}

DESCRIPTION:
${description}`,
      { json: true, action: 'create-course' });
    const parsed = safeJson(out.text);
    if (!parsed) return res.status(502).json({ error: 'AI returned unparseable response', raw: out.text });
    res.json({ suggestion: parsed, provider: out.provider, ownKey: out.ownKey });
  } catch (e) {
    res.status(e.code === 'RATE_LIMITED' ? 429 : 400).json({ error: e.message, code: e.code });
  }
});

// "Describe an assignment → fill the form."
router.post('/create-assignment', authenticateToken, async (req, res) => {
  try {
    const { description, courseTitle } = req.body;
    if (!description) return res.status(400).json({ error: 'description required' });
    const out = await ai(req.user.id,
      'You help teachers write clear assignments. Reply with ONLY a JSON object.',
      `Course: ${courseTitle || '(unknown)'}\nDescribe a homework assignment based on:\n${description}\n\nReturn JSON:
{
  "title": "short title",
  "description": "clear instructions (2-4 sentences)",
  "due_in_days": <integer, default 7>
}`,
      { json: true, action: 'create-assignment' });
    const parsed = safeJson(out.text);
    if (!parsed) return res.status(502).json({ error: 'AI returned unparseable response' });
    res.json({ suggestion: parsed, provider: out.provider });
  } catch (e) {
    res.status(e.code === 'RATE_LIMITED' ? 429 : 400).json({ error: e.message, code: e.code });
  }
});

// "Summarize a long voice/typed description into something concise"
router.post('/transcribe-summary', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });
    const out = await ai(req.user.id,
      'You produce concise, action-oriented summaries.',
      `Summarize in 2-3 sentences:\n\n${content}`,
      { action: 'summary' });
    res.json({ summary: out.text.trim(), provider: out.provider });
  } catch (e) {
    res.status(e.code === 'RATE_LIMITED' ? 429 : 400).json({ error: e.message, code: e.code });
  }
});

module.exports = router;
