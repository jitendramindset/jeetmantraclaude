const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const router = express.Router();

const ADMIN_ROLES = ['admin'];
const EDITOR_ROLES = ['admin', 'teacher', 'partner'];

// Slug generator
function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── LIST posts (public for published, admin sees all) ─────────────────────────
router.get('/posts', async (req, res) => {
  try {
    const { type, status, featured, limit = 20, offset = 0, search, tag } = req.query;
    let q = supabaseAdmin.from('cms_posts').select(
      'id,type,title,slug,excerpt,cover_image,status,featured,tags,event_start,event_end,event_location,author_id,published_at,created_at,views,likes,allow_comments'
    );
    // Public sees only published; admin/editor sees all
    const token = req.headers.authorization?.replace('Bearer ','');
    let isAdmin = false;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (ADMIN_ROLES.includes(decoded.role) || EDITOR_ROLES.includes(decoded.role)) isAdmin = true;
      } catch {}
    }
    if (!isAdmin) q = q.eq('status','published');
    else if (status) q = q.eq('status', status);

    if (type) q = q.eq('type', type);
    if (featured === 'true') q = q.eq('featured', true);
    if (search) q = q.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    if (tag) q = q.contains('tags', [tag]);
    q = q.order('published_at', { ascending: false, nullsFirst: false })
         .order('created_at', { ascending: false })
         .range(Number(offset), Number(offset) + Number(limit) - 1);
    const { data, error, count } = await q;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ posts: data || [], count });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── GET single post ───────────────────────────────────────────────────────────
router.get('/posts/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isUuid = /^[0-9a-f-]{36}$/.test(idOrSlug);
    let q = supabaseAdmin.from('cms_posts').select('*');
    q = isUuid ? q.eq('id', idOrSlug) : q.eq('slug', idOrSlug);
    const { data, error } = await q.maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Not found' });
    // Increment views (fire-and-forget)
    supabaseAdmin.from('cms_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then(()=>{});
    // Load comments
    const { data: comments } = await supabaseAdmin.from('cms_comments')
      .select('id,parent_id,author_id,author_name,body,likes,created_at')
      .eq('post_id', data.id).eq('status','approved').order('created_at');
    res.json({ post: data, comments: comments || [] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── CREATE post ───────────────────────────────────────────────────────────────
router.post('/posts', authenticateToken, authorizeRole(EDITOR_ROLES), async (req, res) => {
  try {
    const { title, type='post', excerpt, body, cover_image, status='draft', featured=false,
            tags=[], meta={}, references=[], attachments=[],
            event_start, event_end, event_location, event_url, event_capacity, allow_comments=true } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    let slug = toSlug(title);
    // Ensure unique slug
    const { data: existing } = await supabaseAdmin.from('cms_posts').select('id').eq('slug', slug).maybeSingle();
    if (existing) slug = slug + '-' + Date.now().toString(36);
    const published_at = status === 'published' ? new Date().toISOString() : null;
    const { data, error } = await supabaseAdmin.from('cms_posts').insert({
      title, type, slug, excerpt, body, cover_image, status, featured, tags, meta,
      references, attachments, allow_comments,
      event_start: event_start||null, event_end: event_end||null,
      event_location: event_location||null, event_url: event_url||null,
      event_capacity: event_capacity||null,
      author_id: req.user.id, published_at,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ post: data });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── UPDATE post ───────────────────────────────────────────────────────────────
router.put('/posts/:id', authenticateToken, authorizeRole(EDITOR_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    // If publishing now, stamp published_at
    if (updates.status === 'published') {
      const { data: cur } = await supabaseAdmin.from('cms_posts').select('published_at').eq('id',id).maybeSingle();
      if (!cur?.published_at) updates.published_at = new Date().toISOString();
    }
    delete updates.id; delete updates.author_id; delete updates.created_at; delete updates.views; delete updates.likes;
    const { data, error } = await supabaseAdmin.from('cms_posts').update(updates).eq('id', id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ post: data });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── DELETE post ───────────────────────────────────────────────────────────────
router.delete('/posts/:id', authenticateToken, authorizeRole(ADMIN_ROLES), async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('cms_posts').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── MEDIA library ─────────────────────────────────────────────────────────────
router.get('/media', authenticateToken, async (req, res) => {
  try {
    const { folder, limit=50, offset=0 } = req.query;
    let q = supabaseAdmin.from('cms_media').select('*');
    if (folder) q = q.eq('folder', folder);
    q = q.order('created_at', { ascending: false }).range(Number(offset), Number(offset)+Number(limit)-1);
    const { data, error } = await q;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ media: data || [] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/media', authenticateToken, authorizeRole(EDITOR_ROLES), async (req, res) => {
  try {
    const { url, filename, original_name, mime_type, size_bytes, width, height, alt_text, caption, folder='general' } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    const { data, error } = await supabaseAdmin.from('cms_media').insert({
      url, filename: filename||original_name||url.split('/').pop(), original_name, mime_type,
      size_bytes, width, height, alt_text, caption, folder, uploaded_by: req.user.id,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ media: data });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.delete('/media/:id', authenticateToken, authorizeRole(ADMIN_ROLES), async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('cms_media').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── COMMENTS ──────────────────────────────────────────────────────────────────
router.get('/posts/:postId/comments', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('cms_comments')
      .select('id,parent_id,author_id,author_name,body,likes,created_at')
      .eq('post_id', req.params.postId).eq('status','approved').order('created_at');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ comments: data || [] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { body, parent_id } = req.body;
    if (!body?.trim()) return res.status(400).json({ error: 'body required' });
    const { data: post } = await supabaseAdmin.from('cms_posts').select('allow_comments').eq('id', req.params.postId).maybeSingle();
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!post.allow_comments) return res.status(403).json({ error: 'Comments disabled on this post' });
    const { data, error } = await supabaseAdmin.from('cms_comments').insert({
      post_id: req.params.postId, parent_id: parent_id||null, body,
      author_id: req.user.id, author_name: req.user.full_name||req.user.email,
      status: 'approved',
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ comment: data });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin: moderate comments
router.patch('/comments/:id', authenticateToken, authorizeRole(ADMIN_ROLES), async (req, res) => {
  try {
    const { status } = req.body; // 'approved'|'spam'|'trash'
    const { data, error } = await supabaseAdmin.from('cms_comments').update({ status, updated_at: new Date().toISOString() }).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json({ comment: data });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin: list ALL comments for moderation
router.get('/comments', authenticateToken, authorizeRole(ADMIN_ROLES), async (req, res) => {
  try {
    const { status, limit=50, offset=0 } = req.query;
    let q = supabaseAdmin.from('cms_comments').select('*');
    if (status) q = q.eq('status', status);
    q = q.order('created_at', { ascending: false }).range(Number(offset), Number(offset)+Number(limit)-1);
    const { data, error } = await q;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ comments: data || [] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── CATEGORIES ────────────────────────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('cms_categories').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    res.json({ categories: data || [] });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

router.post('/categories', authenticateToken, authorizeRole(ADMIN_ROLES), async (req, res) => {
  try {
    const { name, description, parent_id, post_type='blog' } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const slug = toSlug(name) + '-' + Date.now().toString(36);
    const { data, error } = await supabaseAdmin.from('cms_categories').insert({ name, slug, description, parent_id: parent_id||null, post_type }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ category: data });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── STATS (admin dashboard) ───────────────────────────────────────────────────
router.get('/stats', authenticateToken, authorizeRole(ADMIN_ROLES), async (req, res) => {
  try {
    const [posts, comments, media] = await Promise.all([
      supabaseAdmin.from('cms_posts').select('type,status,views,likes', { count: 'exact' }),
      supabaseAdmin.from('cms_comments').select('status', { count: 'exact' }),
      supabaseAdmin.from('cms_media').select('id', { count: 'exact' }),
    ]);
    const byType = {};
    (posts.data||[]).forEach(p => { byType[p.type] = (byType[p.type]||0)+1; });
    const pendingComments = (comments.data||[]).filter(c=>c.status==='pending').length;
    const totalViews = (posts.data||[]).reduce((s,p)=>s+(p.views||0),0);
    res.json({
      totalPosts: posts.count || 0,
      byType,
      pendingComments,
      totalMedia: media.count || 0,
      totalViews,
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
