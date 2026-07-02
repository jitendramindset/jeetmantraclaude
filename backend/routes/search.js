/**
 * search.js — course + unified entity search for the public marketplace.
 * Mount: /api/search
 *
 * Endpoints:
 *   GET    /                  🌐 — course search (?q=&category=&level=&limit=)
 *   GET    /suggestions       🌐 — title autocomplete (?q=)
 *   GET    /semantic          🌐 — vector search, falls back to text when no embeddings/OpenAI key
 *   POST   /index-course      🔒 admin — upsert a course embedding record for semantic search
 *   GET    /categories        🌐 — distinct active course categories
 *   GET    /all               🌐 — unified search across courses/orgs/teachers (?q=&types=&limit=)
 *
 * Notes: all read endpoints public. Every user-supplied `q` is passed through
 *   safeLike()/inline sanitizer to strip PostgREST filter metacharacters (filter
 *   injection guard). Vector search is stubbed — currently text fallback.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
// Auto-wrap async route handlers so unhandled rejections reach the global error handler
const asyncHandler = require('../utils/asyncHandler');
['get','post','put','delete','patch'].forEach(m => {
  const orig = router[m].bind(router);
  router[m] = (...args) => {
    const last = args[args.length - 1];
    if (typeof last === 'function' && last.constructor.name === 'AsyncFunction') {
      args[args.length - 1] = asyncHandler(last);
    }
    return orig(...args);
  };
});


// Strip PostgREST filter metacharacters so a crafted `q` can't break out of the
// .or()/.ilike() pattern and inject extra conditions (filter injection).
function safeLike(s) {
  return String(s || '').replace(/[,()*%\\]/g, ' ').trim();
}

// GET /api/search?q=query&limit=10&category=X
router.get('/', async (req, res) => {
  try {
    const { limit = 12, category, level } = req.query;
    const q = safeLike(req.query.q);

    let query = supabaseAdmin
      .from('courses')
      .select('id,title,description,category,level,price,cover_image,batch_timing,is_live,created_at')
      .eq('is_active', true)
      .limit(parseInt(limit));

    if (q.trim()) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
    }
    if (category) query = query.eq('category', category);
    if (level) query = query.eq('level', level);

    const { data: courses, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('Search: courses table error:', error.message);
      return res.json({ results: [], count: 0, query: q });
    }

    res.json({ results: courses || [], count: courses?.length || 0, query: q });
  } catch (error) {
    console.error('Search error:', error);
    res.json({ results: [], count: 0, query: '' });
  }
});

// GET /api/search/suggestions?q=partial — autocomplete
router.get('/suggestions', async (req, res) => {
  try {
    const q = safeLike(req.query.q);
    if (!q.trim()) return res.json({ suggestions: [] });

    const { data: titles } = await supabaseAdmin
      .from('courses')
      .select('title,category')
      .ilike('title', `%${q}%`)
      .eq('is_active', true)
      .limit(8);

    const suggestions = titles?.map(c => ({ text: c.title, category: c.category })) || [];
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Suggestions failed' });
  }
});

// GET /api/search/semantic?q=query — semantic / vector search
router.get('/semantic', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const q = safeLike(req.query.q);
    if (!q.trim()) return res.json({ results: [] });

    // Check if course_embeddings table exists
    const { data: embeddings, error: embError } = await supabaseAdmin
      .from('course_embeddings')
      .select('course_id, content_hash')
      .limit(1);

    if (embError) {
      // Fallback to text search if embeddings not available
      const { data: fallback } = await supabaseAdmin
        .from('courses')
        .select('id,title,description,category,level,price')
        .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        .eq('is_active', true)
        .limit(parseInt(limit));
      return res.json({ results: fallback || [], mode: 'text_fallback', message: 'Semantic search not yet configured — using text search' });
    }

    // For full vector search, this would call:
    // SELECT c.* FROM courses c
    // JOIN course_embeddings ce ON c.id = ce.course_id
    // ORDER BY ce.embedding <-> '[...query_vector...]'
    // LIMIT 10
    // Requires OpenAI API key to generate query embedding

    if (process.env.OPENAI_API_KEY) {
      // TODO: call OpenAI embeddings, then do vector similarity
      return res.json({ results: [], mode: 'vector', message: 'OpenAI embeddings configured but not yet implemented' });
    }

    const { data: results } = await supabaseAdmin
      .from('courses')
      .select('id,title,description,category,level,price,cover_image')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
      .eq('is_active', true)
      .limit(parseInt(limit));

    res.json({ results: results || [], mode: 'text_fallback' });
  } catch (error) {
    res.status(500).json({ error: 'Semantic search failed' });
  }
});

// POST /api/search/index-course — index course for vector search (admin only)
router.post('/index-course', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId required' });

    const { data: course } = await supabaseAdmin.from('courses').select('*').eq('id', courseId).single();
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const contentHash = Buffer.from(course.title + course.description).toString('base64').slice(0, 64);

    // Upsert embedding record (embedding vector to be filled by OpenAI job)
    const { error } = await supabaseAdmin.from('course_embeddings').upsert({
      course_id: courseId,
      content_hash: contentHash,
      created_at: new Date().toISOString()
    }, { onConflict: 'course_id' });

    if (error) throw error;
    res.json({ message: 'Course indexed for semantic search', courseId, contentHash });
  } catch (error) {
    res.status(500).json({ error: 'Indexing failed' });
  }
});

// GET /api/search/categories — list all categories
router.get('/categories', async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('courses').select('category').eq('is_active', true);
    const categories = [...new Set(data?.map(c => c.category).filter(Boolean) || [])].sort();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/search/all?q=&types=course,org,teacher — unified entity search
// across the platform (EDUOS_GAP_ANALYSIS_V2 §19). Public; returns grouped
// results. Each query is sanitized against PostgREST filter injection.
router.get('/all', async (req, res) => {
  try {
    const q = String(req.query.q || '').replace(/[,()*%\\]/g, ' ').trim();
    if (!q) return res.json({ courses: [], organizations: [], teachers: [] });
    const types = String(req.query.types || 'course,org,teacher').split(',');
    const want = t => types.includes(t);
    const lim = Math.min(20, Math.max(1, Number(req.query.limit) || 8));

    const tasks = [];
    tasks.push(want('course')
      ? supabaseAdmin.from('courses').select('id,title,slug,category,cover_image').eq('is_active', true)
          .or(`title.ilike.%${q}%,category.ilike.%${q}%`).limit(lim).then(r => r.data || []).catch(() => [])
      : Promise.resolve([]));
    tasks.push(want('org')
      ? supabaseAdmin.from('organizations').select('id,name,slug,type,category')
          .ilike('name', `%${q}%`).limit(lim).then(r => r.data || []).catch(() => [])
      : Promise.resolve([]));
    tasks.push(want('teacher')
      ? supabaseAdmin.from('jeetmantra_users').select('id,full_name,user_type')
          .in('user_type', ['teacher', 'partner', 'coaching', 'corporate_trainer', 'content_creator'])
          .ilike('full_name', `%${q}%`).limit(lim).then(r => r.data || []).catch(() => [])
      : Promise.resolve([]));

    const [courses, organizations, teachers] = await Promise.all(tasks);
    res.json({ courses, organizations, teachers });
  } catch (e) { res.status(500).json({ error: 'Search failed' }); }
});

module.exports = router;
