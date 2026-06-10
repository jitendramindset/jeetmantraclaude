/**
 * rag.js — lightweight Retrieval-Augmented Generation for course documents.
 *
 * Pipeline: upload doc -> extract text -> chunk -> embed -> store in rag_chunks.
 * At query time the tutor calls retrieveChunks() to pull the most relevant
 * passages and ground its answer.
 *
 * AUTO-FALLBACK: if OPENAI_API_KEY is set we embed with text-embedding-3-small
 * and rank by cosine similarity. Otherwise we store no vectors and rank by
 * keyword/term-overlap scoring over the raw chunk text. Either way the same
 * retrieveChunks() API works — the tutor doesn't care which mode is active.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const OPENAI_KEY = () => process.env.OPENAI_API_KEY || '';
const EMBED_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE = 900;     // ~chars per chunk
const CHUNK_OVERLAP = 150;

// ── Text extraction ────────────────────────────────────────────────────
async function extractText(absPath, ext) {
  ext = (ext || path.extname(absPath) || '').toLowerCase().replace('.', '');
  if (['txt', 'md', 'csv', 'json', 'html', 'htm'].includes(ext)) {
    return fs.readFileSync(absPath, 'utf8');
  }
  if (ext === 'pdf') {
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(fs.readFileSync(absPath));
      return data.text || '';
    } catch (e) { console.warn('pdf extract failed:', e.message); return ''; }
  }
  return ''; // unsupported (images, video, docx) — skipped
}

// ── Chunking ───────────────────────────────────────────────────────────
function chunkText(text) {
  const clean = (text || '').replace(/\s+\n/g, '\n').replace(/[ \t]{2,}/g, ' ').trim();
  if (!clean) return [];
  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    let end = Math.min(i + CHUNK_SIZE, clean.length);
    // try to break on a sentence/paragraph boundary near the end
    if (end < clean.length) {
      const slice = clean.slice(i, end);
      const lastBreak = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('\n'));
      if (lastBreak > CHUNK_SIZE * 0.5) end = i + lastBreak + 1;
    }
    const piece = clean.slice(i, end).trim();
    if (piece) chunks.push(piece);
    i = end - CHUNK_OVERLAP;
    if (i < 0) i = 0;
    if (end >= clean.length) break;
  }
  return chunks;
}

// ── Embeddings (OpenAI, optional) ──────────────────────────────────────
async function embedBatch(texts) {
  const key = OPENAI_KEY();
  if (!key || !texts.length) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: EMBED_MODEL, input: texts })
    });
    if (!res.ok) { console.warn('embeddings http', res.status); return null; }
    const data = await res.json();
    return (data.data || []).map(d => d.embedding);
  } catch (e) { console.warn('embedBatch failed:', e.message); return null; }
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return (na && nb) ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

// Keyword score: term-overlap frequency, normalized by chunk length.
function keywordScore(queryTerms, content) {
  const lc = content.toLowerCase();
  let score = 0;
  for (const t of queryTerms) {
    if (t.length < 3) continue;
    let idx = 0;
    while ((idx = lc.indexOf(t, idx)) !== -1) { score += 1; idx += t.length; }
  }
  return score / Math.sqrt(content.length || 1);
}

// ── Indexing ───────────────────────────────────────────────────────────
// Index raw text OR a file for a course. Returns { chunks, mode }.
async function indexContent({ courseId, materialId, title, text, absPath, ext }) {
  let body = text || '';
  if (!body && absPath) body = await extractText(absPath, ext);
  const chunks = chunkText(body);
  if (!chunks.length) return { chunks: 0, mode: 'none' };

  // Remove any previous chunks for this material to avoid duplicates.
  if (materialId) await supabaseAdmin.from('rag_chunks').delete().eq('material_id', materialId);

  const embeddings = await embedBatch(chunks); // null if no key
  const rows = chunks.map((c, i) => ({
    id: uuidv4(),
    course_id: String(courseId),
    material_id: materialId ? String(materialId) : null,
    source_title: title || 'Document',
    content: c,
    embedding: embeddings ? embeddings[i] : null,
    chunk_index: i
  }));
  // insert in batches of 100
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabaseAdmin.from('rag_chunks').insert(rows.slice(i, i + 100));
    if (error) { console.warn('rag insert error:', error.message); break; }
  }
  return { chunks: rows.length, mode: embeddings ? 'vector' : 'keyword' };
}

// ── Retrieval (used by the AI tutor) ───────────────────────────────────
async function retrieveChunks({ courseId, query, limit = 4 }) {
  if (!courseId || !query) return [];
  const { data: rows } = await supabaseAdmin.from('rag_chunks')
    .select('content, source_title, material_id, embedding')
    .eq('course_id', String(courseId)).limit(500);
  if (!rows || !rows.length) return [];

  const haveVectors = rows.some(r => Array.isArray(r.embedding) && r.embedding.length);
  let scored;
  if (haveVectors && OPENAI_KEY()) {
    const qEmb = (await embedBatch([query]) || [])[0];
    if (qEmb) {
      scored = rows.map(r => ({ r, s: Array.isArray(r.embedding) ? cosine(qEmb, r.embedding) : -1 }));
    }
  }
  if (!scored) {
    const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
    scored = rows.map(r => ({ r, s: keywordScore(terms, r.content) }));
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, limit)
    .filter(x => x.s > 0)
    .map(x => ({ content: x.r.content, source_title: x.r.source_title, material_id: x.r.material_id }));
}

// ── Routes ─────────────────────────────────────────────────────────────
// Owner/teacher/admin guard for a course.
async function canIndex(courseId, user) {
  if (user.role === 'admin') return true;
  const { data } = await supabaseAdmin.from('courses').select('teacher_id').eq('id', courseId).single();
  return data && data.teacher_id === user.id;
}

// Index pasted text (knowledge base) for a course.
router.post('/index/:courseId', authenticateToken, async (req, res) => {
  try {
    if (!(await canIndex(req.params.courseId, req.user))) return res.status(403).json({ error: 'Not your course' });
    const { text, title } = req.body || {};
    if (!text || text.trim().length < 20) return res.status(400).json({ error: 'Provide at least a short paragraph of text' });
    const r = await indexContent({ courseId: req.params.courseId, materialId: 'text-' + uuidv4(), title: title || 'Pasted notes', text });
    res.json({ message: 'Indexed', ...r });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Index an already-uploaded material (by material id) for a course.
router.post('/index-material/:materialId', authenticateToken, async (req, res) => {
  try {
    const { data: mat } = await supabaseAdmin.from('course_materials').select('*').eq('id', req.params.materialId).single();
    if (!mat) return res.status(404).json({ error: 'Material not found' });
    if (!(await canIndex(mat.course_id, req.user))) return res.status(403).json({ error: 'Not your course' });
    const r = await indexFromMaterial(mat);
    res.json({ message: 'Indexed', ...r });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Index status for a course.
router.get('/status/:courseId', authenticateToken, async (req, res) => {
  try {
    const { data: rows } = await supabaseAdmin.from('rag_chunks')
      .select('material_id, embedding').eq('course_id', String(req.params.courseId));
    const chunks = rows || [];
    const docs = new Set(chunks.map(c => c.material_id)).size;
    const mode = chunks.some(c => Array.isArray(c.embedding) && c.embedding.length) ? 'vector' : (chunks.length ? 'keyword' : 'none');
    res.json({ chunks: chunks.length, documents: docs, mode, embeddingsAvailable: !!OPENAI_KEY() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Clear a course index.
router.delete('/:courseId', authenticateToken, async (req, res) => {
  try {
    if (!(await canIndex(req.params.courseId, req.user))) return res.status(403).json({ error: 'Not your course' });
    await supabaseAdmin.from('rag_chunks').delete().eq('course_id', String(req.params.courseId));
    res.json({ message: 'Index cleared' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Helper: resolve a material's file on disk and index it. Best-effort; called
// automatically from the material-upload handler.
async function indexFromMaterial(mat) {
  if (!mat || !mat.url) return { chunks: 0, mode: 'none' };
  // material.url looks like /uploads/courses/<file>; map to disk path.
  const rel = mat.url.replace(/^\//, '');
  const abs = path.join(__dirname, '..', rel);
  if (!fs.existsSync(abs)) return { chunks: 0, mode: 'none', note: 'file not on disk (external url)' };
  return indexContent({ courseId: mat.course_id, materialId: mat.id, title: mat.title, absPath: abs });
}

module.exports = router;
module.exports.retrieveChunks = retrieveChunks;
module.exports.indexContent = indexContent;
module.exports.indexFromMaterial = indexFromMaterial;
