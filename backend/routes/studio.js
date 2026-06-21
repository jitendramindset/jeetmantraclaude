/**
 * studio.js — Phase D (Sprint 11) Smart Studio persistence.
 *
 * EDUOS_GAP_ANALYSIS_V2 §8: studio.html had a full frontend (whiteboard, layout,
 * recording) but ZERO backend — nothing persisted or published. This adds scene
 * save/load and a publish hook that links a scene to a course.
 *
 * Mount: /api/studio. All owner-scoped.
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// GET /api/studio/scenes — the caller's saved scenes (no heavy data blob).
router.get('/scenes', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('studio_scenes')
      .select('id, title, thumbnail, course_id, created_at, updated_at')
      .eq('owner_id', req.user.id).order('updated_at', { ascending: false });
    if (error) return res.json({ scenes: [] });
    res.json({ scenes: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/studio/scenes — create or update (pass id to update).
router.post('/scenes', authenticateToken, validate('studioScene'), async (req, res) => {
  try {
    const b = req.validatedData;
    if (b.id) {
      const { data: existing } = await supabaseAdmin.from('studio_scenes').select('owner_id').eq('id', b.id).maybeSingle();
      if (!existing) return res.status(404).json({ error: 'Scene not found' });
      if (existing.owner_id !== req.user.id) return res.status(403).json({ error: 'Not your scene' });
      const { data, error } = await supabaseAdmin.from('studio_scenes')
        .update({ title: b.title, data: b.data, thumbnail: b.thumbnail || null, updated_at: new Date().toISOString() })
        .eq('id', b.id).select().single();
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ scene: data });
    }
    const { data, error } = await supabaseAdmin.from('studio_scenes').insert({
      id: uuidv4(), owner_id: req.user.id, title: b.title || 'Untitled scene',
      data: b.data, thumbnail: b.thumbnail || null
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ scene: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/studio/scenes/:id — full scene (with data blob).
router.get('/scenes/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('studio_scenes').select('*').eq('id', req.params.id).maybeSingle();
    if (error || !data) return res.status(404).json({ error: 'Scene not found' });
    if (data.owner_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your scene' });
    res.json({ scene: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/studio/scenes/:id/publish — link the scene to a course (the §8
// publish hook). Marks course_id; the recorded output pipeline can attach later.
router.post('/scenes/:id/publish', authenticateToken, validate('studioPublish'), async (req, res) => {
  try {
    const { data: scene } = await supabaseAdmin.from('studio_scenes').select('owner_id').eq('id', req.params.id).maybeSingle();
    if (!scene) return res.status(404).json({ error: 'Scene not found' });
    if (scene.owner_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your scene' });
    const { data, error } = await supabaseAdmin.from('studio_scenes')
      .update({ course_id: req.validatedData.courseId, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ scene: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/studio/scenes/:id
router.delete('/scenes/:id', authenticateToken, async (req, res) => {
  try {
    const { data: scene } = await supabaseAdmin.from('studio_scenes').select('owner_id').eq('id', req.params.id).maybeSingle();
    if (scene && scene.owner_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your scene' });
    await supabaseAdmin.from('studio_scenes').delete().eq('id', req.params.id);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
