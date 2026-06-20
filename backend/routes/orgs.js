/**
 * orgs.js — Sprint 7 role-org unification read surface.
 *
 * Mount: /api/orgs (plus a couple of helpers mounted at their own paths in
 * server.js: /api/capabilities/me and /api/categories).
 *
 * Read-only / additive for now — the heavy write surface (create org, invite
 * member, transfer ownership) is a later step. This ships the pieces the
 * frontend needs to START driving the new model:
 *   - the caller's resolved capability list (gate the UI)
 *   - the category taxonomy (replace SELECT DISTINCT category)
 *   - the caller's org memberships with role
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, rolesOf } = require('../middleware/auth');
const { fallbackHasCapability } = require('../middleware/requireCapability');

const router = express.Router();

// GET /api/orgs/mine — the caller's organizations + the role they hold in each.
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const { data: assignments } = await supabaseAdmin.from('role_assignments')
      .select('org_id, role, scope').eq('person_id', req.user.id).is('revoked_at', null);
    const orgIds = [...new Set((assignments || []).map(a => a.org_id).filter(Boolean))];
    let orgs = [];
    if (orgIds.length) {
      const { data } = await supabaseAdmin.from('organizations').select('*').in('id', orgIds);
      orgs = data || [];
    }
    // Attach the caller's roles per org.
    const rolesByOrg = {};
    (assignments || []).forEach(a => {
      if (!a.org_id) return;
      (rolesByOrg[a.org_id] = rolesByOrg[a.org_id] || []).push(a.role);
    });
    res.json({
      organizations: orgs.map(o => ({ ...o, my_roles: rolesByOrg[o.id] || [] })),
      platformRoles: (assignments || []).filter(a => !a.org_id).map(a => a.role)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/orgs/:id — single org profile.
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('organizations').select('*').eq('id', req.params.id).maybeSingle();
    if (!data) return res.status(404).json({ error: 'Organization not found' });
    res.json({ organization: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

// ── Standalone helpers (mounted separately in server.js) ──────────────────

// GET /api/capabilities/me — resolved capability list for the active user,
// so the frontend can hide/disable actions the user can't perform.
const capRouter = express.Router();
capRouter.get('/me', authenticateToken, async (req, res) => {
  try {
    const roles = [...rolesOf(req)];
    let caps = new Set();
    let usedFallback = false;
    if (roles.includes('admin')) {
      const { data } = await supabaseAdmin.from('capabilities').select('key');
      if (data) caps = new Set(data.map(c => c.key));
    } else {
      for (const role of roles) {
        try {
          const { data } = await supabaseAdmin.from('role_capabilities').select('capability_key').eq('role', role);
          if (data === null) { usedFallback = true; continue; }
          (data || []).forEach(c => caps.add(c.capability_key));
        } catch (_) { usedFallback = true; }
      }
    }
    // Fallback: derive from the static map if the table wasn't reachable.
    if (usedFallback && caps.size === 0) {
      const ALL = ['course.create','course.edit','course.delete','live.schedule','live.start',
        'attendance.mark','assignment.grade','test.create','certificate.issue','student.manage',
        'booking.manage','payment.read','payout.request','org.member.invite','org.member.manage',
        'org.branding','org.transfer','analytics.read','admin.users','admin.impersonate',
        'admin.moderate','admin.settings'];
      ALL.forEach(c => { if (fallbackHasCapability(new Set(roles), c)) caps.add(c); });
    }
    res.json({ roles, capabilities: [...caps] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/categories — the category + subcategory tree (public; used by the
// course-create form and the marketplace filters). Replaces the legacy
// SELECT DISTINCT category FROM courses.
const catRouter = express.Router();
catRouter.get('/', async (req, res) => {
  try {
    const [{ data: cats }, { data: subs }] = await Promise.all([
      supabaseAdmin.from('course_categories').select('*').order('sort'),
      supabaseAdmin.from('course_subcategories').select('*').order('sort')
    ]);
    const byCat = {};
    (subs || []).forEach(s => { (byCat[s.category_id] = byCat[s.category_id] || []).push(s); });
    const tree = (cats || []).map(c => ({ ...c, subcategories: byCat[c.id] || [] }));
    res.json({ categories: tree });
  } catch (e) {
    // If the taxonomy table isn't migrated, fall back to distinct legacy values.
    try {
      const { data } = await supabaseAdmin.from('courses').select('category');
      const distinct = [...new Set((data || []).map(c => c.category).filter(Boolean))];
      res.json({ categories: distinct.map(c => ({ id: c, name: c, subcategories: [] })), legacy: true });
    } catch (_) { res.status(500).json({ error: e.message }); }
  }
});

module.exports.capRouter = capRouter;
module.exports.catRouter = catRouter;
