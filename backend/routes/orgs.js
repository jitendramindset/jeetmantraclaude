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
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, rolesOf } = require('../middleware/auth');
const { requireCapability, fallbackHasCapability } = require('../middleware/requireCapability');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Does the caller hold ANY role in this org (member), or is admin?
async function isOrgMember(userId, orgId, role) {
  const { data: org } = await supabaseAdmin.from('organizations').select('owner_id').eq('id', orgId).maybeSingle();
  if (org && org.owner_id === userId) return true;
  let q = supabaseAdmin.from('role_assignments').select('id').eq('person_id', userId).eq('org_id', orgId).is('revoked_at', null);
  if (role) q = q.eq('role', role);
  const { data } = await q.maybeSingle();
  return !!data;
}
async function isOrgOwner(userId, orgId) {
  const { data: org } = await supabaseAdmin.from('organizations').select('owner_id').eq('id', orgId).maybeSingle();
  return !!org && org.owner_id === userId;
}

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

// ── WRITE endpoints (Sprint 8) ────────────────────────────────────────────

// POST /api/orgs — create a non-personal org. Any creator can spin up an
// academy/center. The creator becomes owner + gets a platform-style owner role
// assignment in the new org.
router.post('/', authenticateToken, requireCapability('course.create'), validate('orgCreate'), async (req, res) => {
  try {
    const b = req.validatedData;
    const id = uuidv4();
    const { data: org, error } = await supabaseAdmin.from('organizations').insert({
      id, owner_id: req.user.id, name: b.name, type: b.type,
      category: b.category || null, is_personal: !!b.isPersonal
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    // Owner role assignment so they show up in /mine and pass org gates.
    await supabaseAdmin.from('role_assignments').insert({
      id: uuidv4(), person_id: req.user.id, org_id: id, role: 'org_admin', scope: 'org', granted_by: req.user.id
    }).then(() => {}).catch(() => {});
    res.status(201).json({ organization: org });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/orgs/:id — update name/category/branding. Capability org.branding
// + must be a member (owner or org_admin).
router.patch('/:id', authenticateToken, requireCapability('org.branding'), validate('orgUpdate'), async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(await isOrgMember(req.user.id, req.params.id))) {
      return res.status(403).json({ error: 'Not a member of this organization' });
    }
    const b = req.validatedData;
    const updates = { updated_at: new Date().toISOString() };
    if (b.name !== undefined) updates.name = b.name;
    if (b.category !== undefined) updates.category = b.category;
    if (b.branding !== undefined) updates.branding = b.branding;
    const { data, error } = await supabaseAdmin.from('organizations').update(updates).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ error: 'Organization not found' });
    res.json({ organization: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/orgs/:id/members — roster with role per member.
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(await isOrgMember(req.user.id, req.params.id))) {
      return res.status(403).json({ error: 'Not a member of this organization' });
    }
    const { data: assignments } = await supabaseAdmin.from('role_assignments')
      .select('person_id, role, granted_at').eq('org_id', req.params.id).is('revoked_at', null);
    const ids = [...new Set((assignments || []).map(a => a.person_id))];
    let users = {};
    if (ids.length) {
      const { data } = await supabaseAdmin.from('jeetmantra_users').select('id, full_name, email').in('id', ids);
      users = Object.fromEntries((data || []).map(u => [u.id, u]));
    }
    const byPerson = {};
    (assignments || []).forEach(a => {
      const u = byPerson[a.person_id] = byPerson[a.person_id] || { person_id: a.person_id, ...(users[a.person_id] || {}), roles: [] };
      u.roles.push(a.role);
    });
    res.json({ members: Object.values(byPerson) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/orgs/:id/members — invite a person with a role. Capability
// org.member.invite + member of the org.
router.post('/:id/members', authenticateToken, requireCapability('org.member.invite'), validate('orgMemberInvite'), async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(await isOrgMember(req.user.id, req.params.id))) {
      return res.status(403).json({ error: 'Not a member of this organization' });
    }
    const b = req.validatedData;
    let personId = b.personId;
    if (!personId && b.email) {
      const { data: u } = await supabaseAdmin.from('jeetmantra_users').select('id').eq('email', b.email).maybeSingle();
      if (!u) return res.status(404).json({ error: 'No user with that email' });
      personId = u.id;
    }
    const { data, error } = await supabaseAdmin.from('role_assignments').insert({
      id: uuidv4(), person_id: personId, org_id: req.params.id, role: b.role, scope: 'org', granted_by: req.user.id
    }).select().single();
    if (error) {
      if (/duplicate|unique/i.test(error.message)) return res.status(409).json({ error: 'Already a member with that role' });
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json({ membership: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/orgs/:id/members/:personId — change a member's role.
router.patch('/:id/members/:personId', authenticateToken, requireCapability('org.member.manage'), validate('orgMemberUpdate'), async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(await isOrgMember(req.user.id, req.params.id))) {
      return res.status(403).json({ error: 'Not a member of this organization' });
    }
    // Revoke existing org role rows, add the new one (simplest "set role").
    await supabaseAdmin.from('role_assignments').update({ revoked_at: new Date().toISOString() })
      .eq('org_id', req.params.id).eq('person_id', req.params.personId).is('revoked_at', null);
    const { data, error } = await supabaseAdmin.from('role_assignments').insert({
      id: uuidv4(), person_id: req.params.personId, org_id: req.params.id, role: req.validatedData.role, scope: 'org', granted_by: req.user.id
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ membership: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/orgs/:id/members/:personId — revoke (soft). Can't remove the owner.
router.delete('/:id/members/:personId', authenticateToken, requireCapability('org.member.manage'), async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(await isOrgMember(req.user.id, req.params.id))) {
      return res.status(403).json({ error: 'Not a member of this organization' });
    }
    if (await isOrgOwner(req.params.personId, req.params.id)) {
      return res.status(400).json({ error: "Can't remove the owner — transfer ownership first" });
    }
    await supabaseAdmin.from('role_assignments').update({ revoked_at: new Date().toISOString() })
      .eq('org_id', req.params.id).eq('person_id', req.params.personId).is('revoked_at', null);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/orgs/:id/transfer — transfer ownership. Owner or admin only.
router.post('/:id/transfer', authenticateToken, requireCapability('org.transfer'), validate('orgTransfer'), async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(await isOrgOwner(req.user.id, req.params.id))) {
      return res.status(403).json({ error: 'Only the owner can transfer this organization' });
    }
    const newOwnerId = req.validatedData.newOwnerId;
    const { data: target } = await supabaseAdmin.from('jeetmantra_users').select('id').eq('id', newOwnerId).maybeSingle();
    if (!target) return res.status(404).json({ error: 'New owner not found' });
    const { data, error } = await supabaseAdmin.from('organizations')
      .update({ owner_id: newOwnerId, updated_at: new Date().toISOString() })
      .eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ error: 'Organization not found' });
    // Ensure the new owner has an org_admin assignment.
    await supabaseAdmin.from('role_assignments').insert({
      id: uuidv4(), person_id: newOwnerId, org_id: req.params.id, role: 'org_admin', scope: 'org', granted_by: req.user.id
    }).then(() => {}).catch(() => {});
    res.json({ organization: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/orgs/:id/settings — full settings blob (member-gated).
router.get('/:id/settings', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(await isOrgMember(req.user.id, req.params.id))) {
      return res.status(403).json({ error: 'Not a member of this organization' });
    }
    const { data } = await supabaseAdmin.from('organizations')
      .select('id, name, type, category, plan, status, slug, domain, locale_default, allowed_locales, seo, branding, settings')
      .eq('id', req.params.id).maybeSingle();
    if (!data) return res.status(404).json({ error: 'Organization not found' });
    res.json({ settings: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/orgs/:id/settings — update settings (org.branding capability + member).
router.put('/:id/settings', authenticateToken, requireCapability('org.branding'), validate('orgSettings'), async (req, res) => {
  try {
    if (req.user.role !== 'admin' && !(await isOrgMember(req.user.id, req.params.id))) {
      return res.status(403).json({ error: 'Not a member of this organization' });
    }
    const b = req.validatedData;
    const updates = { updated_at: new Date().toISOString() };
    ['slug', 'domain', 'locale_default', 'allowed_locales', 'seo', 'branding', 'settings', 'plan'].forEach(k => {
      if (b[k] !== undefined) updates[k] = b[k];
    });
    const { data, error } = await supabaseAdmin.from('organizations').update(updates).eq('id', req.params.id).select().single();
    if (error) {
      if (/duplicate|unique/i.test(error.message)) return res.status(409).json({ error: 'That slug is already taken' });
      return res.status(400).json({ error: error.message });
    }
    if (!data) return res.status(404).json({ error: 'Organization not found' });
    res.json({ settings: data });
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
