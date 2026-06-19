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
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { ai, encrypt, safeJson } = require('../config/aiProvider');
const { get: ldbGet, put: ldbPut } = require('../config/leveldb');

const router = express.Router();

// Human-readable names for the 12 supported UI languages — must match the
// frontend picker (i18n-lite.js) and the seed dictionary (i18n-seed.js).
// Used both as the localizer's target and to gate requests to known languages.
const TR_LANGS = {
  en: 'English', hi: 'Hindi', bn: 'Bengali', mr: 'Marathi', ta: 'Tamil',
  te: 'Telugu', gu: 'Gujarati', kn: 'Kannada', pa: 'Punjabi',
  ml: 'Malayalam', or: 'Odia', ur: 'Urdu'
};
// Tolerant array-of-strings parser for the localizer's JSON reply.
function parseTrArray(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  const raw = fenced ? fenced[1] : text;
  try { const v = JSON.parse(raw); if (Array.isArray(v)) return v; } catch (e) { /* fall through */ }
  const m = raw.match(/\[[\s\S]*\]/);
  if (m) { try { const v = JSON.parse(m[0]); if (Array.isArray(v)) return v; } catch (e) { /* give up */ } }
  return null;
}

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

// Batch UI/text localizer. Powers (a) full-page runtime translation when a
// student picks a language and (b) the select-text → translate popup.
// Every unique string is persisted in LevelDB keyed by target+hash, so it is
// translated by a model exactly once and is then free for every other user and
// every later page load. Degrades to source text (English) on quota/provider
// error so the UI never breaks.
router.post('/translate', authenticateToken, async (req, res) => {
  try {
    let { q, target, source } = req.body || {};
    target = String(target || '').toLowerCase();
    source = String(source || 'en').toLowerCase();
    if (!TR_LANGS[target]) return res.status(400).json({ error: 'Unsupported target language' });
    if (typeof q === 'string') q = [q];
    if (!Array.isArray(q)) return res.status(400).json({ error: 'q (string or array) required' });
    // Dedupe, drop blanks, and cap the batch so cost stays bounded.
    q = [...new Set(q.filter(s => typeof s === 'string' && s.trim()))].slice(0, 80);
    if (!q.length) return res.json({ map: {} });
    // Identity when the source is a known language equal to the target.
    if (TR_LANGS[source] && source === target) {
      const m = {}; q.forEach(s => { m[s] = s; }); return res.json({ map: m, calls: 0 });
    }

    const map = {};
    const miss = [];
    for (const s of q) {
      const key = 'tr:' + target + ':' + crypto.createHash('sha1').update(s).digest('hex');
      const hit = await ldbGet(key);
      if (typeof hit === 'string') map[s] = hit;
      else miss.push({ s, key });
    }
    if (!miss.length) return res.json({ map, calls: 0 });

    const items = miss.map(m => m.s);
    const srcName = TR_LANGS[source] || 'the source language';
    const sys = `You are a professional UI localizer for a mobile education app. Translate each input string from ${srcName} to ${TR_LANGS[target]}. Keep translations short and natural for buttons, labels and reading. Preserve any leading emoji, numbers, %, currency symbols and placeholders such as {x} or :id exactly. Do NOT translate brand names (JeetMantra, EduOS) or code. Reply with ONLY a JSON array of translated strings, same length and order as the input — no keys, no prose, no markdown.`;
    let arr = null;
    try {
      const out = await ai(req.user.id, sys, JSON.stringify(items), { json: true, action: 'translate' });
      arr = parseTrArray(out.text);
    } catch (e) {
      // Quota / provider failure → return cached hits only; UI keeps source text.
      return res.status(e.code === 'RATE_LIMITED' ? 429 : 200)
        .json({ map, error: e.message, code: e.code, degraded: true });
    }
    if (Array.isArray(arr)) {
      for (let i = 0; i < miss.length; i++) {
        const tr = (arr[i] != null) ? String(arr[i]) : miss[i].s;
        map[miss[i].s] = tr;
        ldbPut(miss[i].key, tr).catch(() => {}); // persist durably (no TTL)
      }
    } else {
      for (const m of miss) map[m.s] = m.s; // unparseable → leave source
    }
    res.json({ map, calls: 1 });
  } catch (e) {
    res.status(500).json({ error: e.message });
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

// ── AI TUTOR: ask a question, optionally scoped to a course AND/OR a specific
// topic. With no courseId it answers as a general study tutor. When documents
// have been indexed for the course, relevant chunks are retrieved (RAG) and
// injected as grounding context, and their sources are returned for citation.
router.post('/tutor', authenticateToken, async (req, res) => {
  try {
    const { courseId, topicId, question } = req.body || {};
    if (!question) return res.status(400).json({ error: 'question required' });
    const { supabaseAdmin } = require('../config/supabase');

    let contextBlocks = [];
    let header = 'GENERAL STUDY QUESTION (no specific course selected).';
    let level = 'beginner';

    if (courseId) {
      const [{ data: course }, { data: topics }] = await Promise.all([
        supabaseAdmin.from('courses').select('title, description, category, level').eq('id', courseId).single(),
        supabaseAdmin.from('course_topics').select('id, title, description').eq('course_id', courseId).order('order_index')
      ]);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      level = course.level || 'beginner';
      header = `COURSE: ${course.title}\nLEVEL: ${level}\nDESCRIPTION: ${course.description || ''}`;
      if (topicId) {
        // Tighten context to the selected topic.
        const topic = (topics || []).find(t => t.id === topicId);
        if (topic) contextBlocks.push(`SELECTED TOPIC — ${topic.title}:\n${topic.description || '(no description)'}`);
      } else {
        const topicSummary = (topics || []).slice(0, 12).map(t => '- ' + t.title + (t.description ? ': ' + t.description : '')).join('\n');
        if (topicSummary) contextBlocks.push('TOPICS:\n' + topicSummary);
      }
    }

    // RAG: pull the most relevant indexed document chunks for this course.
    let sources = [];
    if (courseId) {
      try {
        const { retrieveChunks } = require('./rag');
        const hits = await retrieveChunks({ courseId, query: question, limit: 4 });
        if (hits && hits.length) {
          contextBlocks.push('REFERENCE MATERIAL (from uploaded documents):\n' +
            hits.map((h, i) => `[${i + 1}] ${h.content}`).join('\n\n'));
          sources = hits.map((h, i) => ({ n: i + 1, title: h.source_title || 'Document', materialId: h.material_id }));
        }
      } catch (e) { /* rag not available / no index — answer without it */ }
    }

    const sys = 'You are an AI tutor for students. Answer concisely in 3-6 sentences with simple, encouraging language. ' +
      (sources.length ? 'Prefer the REFERENCE MATERIAL when answering and cite it inline like [1]. ' : '') +
      'If the question is off-topic for the course, gently steer back.';
    const userMsg = `${header}\n\n${contextBlocks.join('\n\n')}\n\nSTUDENT QUESTION: ${question}`;
    const out = await ai(req.user.id, sys, userMsg, { action: 'tutor' });
    res.json({ answer: out.text, provider: out.provider, sources, grounded: sources.length > 0 });
  } catch (e) {
    res.status(e.code === 'RATE_LIMITED' ? 429 : 400).json({ error: e.message, code: e.code });
  }
});

// ── AI SUGGESTIONS: personalized next steps learned from the student's
// HISTORY — enrollments + progress, recent test scores, study time, and
// activity. Advanced path uses the user's own profile API key (via ai());
// when no key is available it falls back to grounded heuristics so the
// feature always answers, even with the AI provider unreachable.
router.post('/suggest', authenticateToken, async (req, res) => {
  try {
    const { supabaseAdmin } = require('../config/supabase');
    const uid = req.user.id;
    const since14 = new Date(Date.now() - 14 * 86400000).toISOString();
    const [{ data: enrollments }, { data: sessions }, { data: activity }, { data: testSubs }] = await Promise.all([
      supabaseAdmin.from('enrollments').select('progress_percentage, courses(title,category,level)').eq('student_id', uid).limit(10),
      supabaseAdmin.from('user_sessions').select('duration_seconds').eq('user_id', uid).gte('started_at', since14),
      supabaseAdmin.from('activity_feed').select('event_type, message').eq('actor_id', uid).order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('test_submissions').select('score').eq('student_id', uid).order('submitted_at', { ascending: false }).limit(5)
    ]);
    const studyMin = Math.round((sessions || []).reduce((s, r) => s + (r.duration_seconds || 0), 0) / 60);
    const courses = (enrollments || []).map(e => ({ title: e.courses?.title, category: e.courses?.category, progress: e.progress_percentage || 0 }));
    const cats = [...new Set(courses.map(c => c.category).filter(Boolean))];
    const history = {
      courses, categories: cats, studyMinutesLast14Days: studyMin,
      recentScores: (testSubs || []).map(t => t.score).filter(s => s != null),
      recentActivity: (activity || []).map(a => a.message || a.event_type).slice(0, 8)
    };
    // Advanced path: the user's own AI key (or shared free tier).
    try {
      const out = await ai(uid,
        'You are a personal education advisor for an Indian student. Reply ONLY with JSON.',
        `Student history: ${JSON.stringify(history)}\n\nSuggest exactly 4 personalized next steps as JSON: {"suggestions":[{"icon":"<emoji>","title":"...","reason":"one short sentence grounded in THEIR history","type":"course|skill|habit|revision"}]}. Mix types; be concrete about their categories and progress.`,
        { json: true, action: 'suggest' });
      const parsed = safeJson(out.text);
      if (parsed && Array.isArray(parsed.suggestions) && parsed.suggestions.length) {
        return res.json({ suggestions: parsed.suggestions.slice(0, 4), source: 'ai', provider: out.provider });
      }
    } catch (e) { /* no key / provider down — heuristics below */ }
    // Heuristic fallback — grounded in the same history.
    const sugg = [];
    const stalled = courses.filter(c => c.progress > 0 && c.progress < 60).sort((a, b) => a.progress - b.progress)[0];
    if (stalled) sugg.push({ icon: '📖', title: `Resume “${stalled.title}”`, reason: `You're at ${stalled.progress}% — one short session will push it forward.`, type: 'revision' });
    if (studyMin < 120) sugg.push({ icon: '⏰', title: 'Build a 20-minute daily study habit', reason: `Only ${studyMin} min studied in the last 2 weeks — small daily blocks beat cramming.`, type: 'habit' });
    else sugg.push({ icon: '🔥', title: 'Keep your study streak going', reason: `${studyMin} min in 2 weeks — schedule today's session now.`, type: 'habit' });
    const SKILL_MAP = [
      [/science|physics|chem|bio/i, '🔬 Try practical experiments & olympiad problems'],
      [/math/i, '🧮 Add mental-math speed drills'],
      [/cod|program|computer|it/i, '💻 Build a small project from your course'],
      [/lang|english|hindi/i, '🗣 Add daily speaking practice']
    ];
    const cat = cats[0] || 'General';
    const skill = (SKILL_MAP.find(([re]) => re.test(cat)) || [null, '🧠 Learn spaced-revision note-taking'])[1];
    sugg.push({ icon: '✨', title: skill, reason: `Complements your ${cat} courses.`, type: 'skill' });
    const low = history.recentScores.find(s => s < 50);
    if (low != null) sugg.push({ icon: '📝', title: 'Revise your weakest test topic', reason: `A recent score of ${low} suggests a focused revision would pay off.`, type: 'revision' });
    else sugg.push({ icon: '📍', title: 'Explore courses near you', reason: 'Use Near Me to find offline/hybrid programs in your city.', type: 'course' });
    res.json({ suggestions: sugg.slice(0, 4), source: 'heuristic' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── AI LESSON PLAN: turn a topic into a structured lesson plan.
router.post('/lesson-plan', authenticateToken, async (req, res) => {
  try {
    const { topic, durationMinutes, level } = req.body || {};
    if (!topic) return res.status(400).json({ error: 'topic required' });
    const out = await ai(req.user.id,
      'You are an instructional designer. Reply ONLY with a JSON object.',
      `Create a ${durationMinutes || 45}-minute lesson plan for "${topic}" at ${level || 'beginner'} level. JSON:
{
  "title": "...",
  "objectives": ["...", "..."],
  "segments": [ { "minutes": 5, "activity": "warm-up", "detail": "..." } ],
  "materials": ["..."],
  "assessment": "how to check understanding",
  "homework": "..."
}`,
      { json: true, action: 'lesson-plan' });
    const parsed = safeJson(out.text);
    if (!parsed) return res.status(502).json({ error: 'AI returned unparseable response', raw: out.text });
    res.json({ plan: parsed, provider: out.provider });
  } catch (e) {
    res.status(e.code === 'RATE_LIMITED' ? 429 : 400).json({ error: e.message, code: e.code });
  }
});

// ── AI PRACTICE QUESTIONS: generate N practice questions for a student on a
// topic (or their weak topics, passed in).
router.post('/practice-questions', authenticateToken, async (req, res) => {
  try {
    const { topic, count, level } = req.body || {};
    if (!topic) return res.status(400).json({ error: 'topic required' });
    const n = Math.min(10, Math.max(1, Number(count) || 5));
    const out = await ai(req.user.id,
      'You write practice questions with answers + explanations. Reply ONLY with a JSON object.',
      `Generate ${n} practice questions on "${topic}" (${level || 'beginner'}). JSON:
{ "questions": [ { "question": "...", "answer": "...", "explanation": "..." } ] }`,
      { json: true, action: 'practice-questions' });
    const parsed = safeJson(out.text);
    if (!parsed) return res.status(502).json({ error: 'AI returned unparseable response' });
    res.json({ questions: parsed.questions || [], provider: out.provider });
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
