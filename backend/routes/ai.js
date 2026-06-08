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

// ── Scrape any public URL (syllabus PDF preview, Wikipedia page, blog post,
// YouTube description) and expand into a full course outline. Server-side
// fetch sidesteps CORS; the AI does the heavy lifting of turning prose into
// structured course data.
router.post('/course-from-url', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'valid url required' });
    // Fetch with a polite UA and a 6s timeout — we only need the first chunk
    // of text, not the full asset.
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 6000);
    let text = '';
    try {
      const r = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'JeetMantra/1.0' } });
      const raw = await r.text();
      // Strip tags / scripts / styles so the AI sees readable prose.
      text = raw.replace(/<script[\s\S]*?<\/script>/gi, '')
                .replace(/<style[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 6000); // cap for prompt size
    } catch (e) {
      return res.status(400).json({ error: 'Could not fetch URL: ' + e.message });
    } finally { clearTimeout(to); }
    if (!text) return res.status(400).json({ error: 'URL returned no readable text' });

    const out = await ai(req.user.id,
      'You design online courses by reading source material and expanding it into a learning outline. Reply with ONLY a JSON object.',
      `Read the following text scraped from ${url}. Build a complete course outline as JSON:
{
  "title": "marketing-ready course title",
  "description": "2 paragraphs covering scope and outcomes",
  "category": "Mathematics|Science|Programming|Languages|Arts|Commerce|General",
  "level": "beginner|intermediate|advanced",
  "price": <number in INR>,
  "topics": [
    { "title": "Topic 1 title", "description": "1 sentence", "lectures": ["Lecture 1.1", "Lecture 1.2"] },
    ...up to 8 topics
  ],
  "tags": ["tag1", "tag2", "tag3"]
}

SOURCE TEXT:
${text}`,
      { json: true, action: 'course-from-url' });
    const parsed = safeJson(out.text);
    if (!parsed) return res.status(502).json({ error: 'AI returned unparseable response', raw: out.text });
    res.json({ suggestion: parsed, source: url, provider: out.provider });
  } catch (e) {
    res.status(e.code === 'RATE_LIMITED' ? 429 : 400).json({ error: e.message, code: e.code });
  }
});

// ── Suggest topic list from a course title (when the teacher already named
// the course and just wants AI to draft chapter titles).
router.post('/suggest-topics', authenticateToken, async (req, res) => {
  try {
    const { title, level, count } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const n = Math.min(20, Math.max(3, Number(count) || 8));
    const out = await ai(req.user.id,
      'You write course outlines for teachers. Reply with ONLY a JSON object.',
      `Suggest ${n} chapter/topic titles for a ${level || 'beginner'}-level course titled "${title}". JSON:
{
  "topics": [
    { "title": "...", "description": "1 sentence", "lectures": ["...", "..."] }
  ]
}`,
      { json: true, action: 'suggest-topics' });
    const parsed = safeJson(out.text);
    if (!parsed) return res.status(502).json({ error: 'AI returned unparseable response' });
    res.json({ topics: parsed.topics || [], provider: out.provider });
  } catch (e) {
    res.status(e.code === 'RATE_LIMITED' ? 429 : 400).json({ error: e.message, code: e.code });
  }
});

// ── AI TUTOR: student asks a question scoped to a course. We pull the
// course title/description/topic titles as context so answers stay on-topic.
router.post('/tutor', authenticateToken, async (req, res) => {
  try {
    const { courseId, question } = req.body || {};
    if (!courseId || !question) return res.status(400).json({ error: 'courseId + question required' });
    const { supabaseAdmin } = require('../config/supabase');
    const [{ data: course }, { data: topics }] = await Promise.all([
      supabaseAdmin.from('courses').select('title, description, category, level').eq('id', courseId).single(),
      supabaseAdmin.from('course_topics').select('title, description').eq('course_id', courseId).order('order_index')
    ]);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const topicSummary = (topics || []).slice(0, 12).map(t => '- ' + t.title + (t.description ? ': ' + t.description : '')).join('\n');
    const out = await ai(req.user.id,
      'You are an AI tutor. Answer concisely in 3-6 sentences. Use simple, encouraging language. If the question is off-topic for this course, gently steer back.',
      `COURSE: ${course.title}\nLEVEL: ${course.level || 'beginner'}\nDESCRIPTION: ${course.description || ''}\n\nTOPICS:\n${topicSummary}\n\nSTUDENT QUESTION: ${question}`,
      { action: 'tutor' });
    res.json({ answer: out.text, provider: out.provider });
  } catch (e) {
    res.status(e.code === 'RATE_LIMITED' ? 429 : 400).json({ error: e.message, code: e.code });
  }
});

// ── AI ESSAY GRADER: returns {score, feedback} for a long-answer response.
router.post('/grade-essay', authenticateToken, async (req, res) => {
  try {
    const { question, answer, maxMarks, rubric } = req.body || {};
    if (!question || !answer || !maxMarks) return res.status(400).json({ error: 'question, answer, maxMarks required' });
    const out = await ai(req.user.id,
      'You grade student essays fairly. Reply ONLY with a JSON object — no prose.',
      `Grade this essay out of ${maxMarks} marks. Return JSON: {"score": <number>, "feedback": "<2-3 sentence feedback>", "strengths": ["..."], "improvements": ["..."]}.\n${rubric ? 'RUBRIC: ' + rubric + '\n' : ''}\nQUESTION: ${question}\n\nSTUDENT ANSWER:\n${answer}`,
      { json: true, action: 'grade-essay' });
    const parsed = safeJson(out.text);
    if (!parsed) return res.status(502).json({ error: 'AI returned unparseable response', raw: out.text });
    parsed.score = Math.max(0, Math.min(Number(maxMarks), Number(parsed.score) || 0));
    res.json({ ...parsed, provider: out.provider });
  } catch (e) {
    res.status(e.code === 'RATE_LIMITED' ? 429 : 400).json({ error: e.message, code: e.code });
  }
});

module.exports = router;
