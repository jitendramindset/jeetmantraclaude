/**
 * me.js — Phase A (Sprint 9) active-context spine.
 *
 * One call powers the org switcher: every org the caller belongs to, the role
 * they hold in each, the capabilities for the active context, and the locale to
 * render in. Replaces the scattered /api/orgs/mine + /api/institutions/
 * my-institutions + /api/capabilities/me round-trips with a single source.
 *
 * Mount: /api/me
 *   GET  /contexts        — all orgs + roles + active org + capabilities + locale
 *   POST /active-context  — set the active org (persisted), return its caps+locale
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, rolesOf } = require('../middleware/auth');
const { fallbackHasCapability } = require('../middleware/requireCapability');
const { validate } = require('../middleware/validation');

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


const ALL_CAPS = ['course.create','course.edit','course.delete','live.schedule','live.start',
  'attendance.mark','assignment.grade','assignment.manage','test.create','certificate.issue',
  'student.manage','booking.manage','invoice.manage','payment.read','payout.request',
  'org.member.invite','org.member.manage','org.branding','org.transfer','analytics.read',
  'admissions.manage','billing.manage','payroll.manage','hr.manage'];

// Resolve the capability set for a caller in the context of a specific org:
// platform (JWT) roles ∪ the roles held in that org via role_assignments.
async function resolveCaps(req, orgId) {
  const platformRoles = [...rolesOf(req)];
  let orgRoles = [];
  if (orgId) {
    const { data } = await supabaseAdmin.from('role_assignments')
      .select('role').eq('person_id', req.user.id).eq('org_id', orgId).is('revoked_at', null);
    orgRoles = (data || []).map(a => a.role);
  }
  const roles = [...new Set([...platformRoles, ...orgRoles])];
  if (roles.includes('admin')) {
    try {
      const { data } = await supabaseAdmin.from('capabilities').select('key');
      if (data && data.length) return { roles, capabilities: data.map(c => c.key) };
    } catch (_) {}
    return { roles, capabilities: [...ALL_CAPS] };
  }
  const caps = new Set();
  let usedFallback = false;
  for (const role of roles) {
    try {
      const { data } = await supabaseAdmin.from('role_capabilities').select('capability_key').eq('role', role);
      if (data === null) { usedFallback = true; continue; }
      (data || []).forEach(c => caps.add(c.capability_key));
    } catch (_) { usedFallback = true; }
  }
  if (usedFallback && caps.size === 0) {
    ALL_CAPS.forEach(c => { if (fallbackHasCapability(new Set(roles), c)) caps.add(c); });
  }
  return { roles, capabilities: [...caps] };
}

// GET /api/me — basic profile for the calling user.
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: user } = await supabaseAdmin
      .from('jeetmantra_users')
      .select('id,email,full_name,user_type,phone,profile_image,bio,created_at')
      .eq('id', req.user.id).maybeSingle();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { ...user, role: user.user_type } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/me/contexts — everything the switcher needs in one shot.
router.get('/contexts', authenticateToken, async (req, res) => {
  try {
    const { data: assignments } = await supabaseAdmin.from('role_assignments')
      .select('org_id, role, scope').eq('person_id', req.user.id).is('revoked_at', null);
    const orgIds = [...new Set((assignments || []).map(a => a.org_id).filter(Boolean))];
    let orgs = [];
    if (orgIds.length) {
      const { data } = await supabaseAdmin.from('organizations').select('*').in('id', orgIds);
      orgs = data || [];
    }
    const rolesByOrg = {};
    (assignments || []).forEach(a => { if (a.org_id) (rolesByOrg[a.org_id] = rolesByOrg[a.org_id] || []).push(a.role); });

    // Active org: persisted last-active if still a member, else first owned, else first.
    const { data: me } = await supabaseAdmin.from('jeetmantra_users')
      .select('last_active_org_id').eq('id', req.user.id).maybeSingle();
    let activeOrgId = me?.last_active_org_id && orgIds.includes(me.last_active_org_id) ? me.last_active_org_id : null;
    if (!activeOrgId) activeOrgId = orgs.find(o => o.owner_id === req.user.id)?.id || orgs[0]?.id || null;

    const activeOrg = orgs.find(o => o.id === activeOrgId) || null;
    const { roles, capabilities } = await resolveCaps(req, activeOrgId);

    // Widget engine inputs (W3): admin per-role widget config from the active
    // org's settings, and the caller's personal widget prefs.
    const orgWidgets = activeOrg?.settings?.widgets || null; // { role: { widgetId: false } }
    let adminWidgets = null;
    if (orgWidgets) { adminWidgets = {}; for (const r of roles) Object.assign(adminWidgets, orgWidgets[r] || {}); }
    const { data: meRow } = await supabaseAdmin.from('jeetmantra_users')
      .select('widget_prefs').eq('id', req.user.id).maybeSingle();

    res.json({
      person: { id: req.user.id, role: req.user.role },
      contexts: orgs.map(o => ({
        id: o.id, name: o.name, type: o.type, category: o.category,
        is_personal: o.is_personal, status: o.status || 'active',
        my_roles: rolesByOrg[o.id] || [], is_owner: o.owner_id === req.user.id
      })),
      platformRoles: (assignments || []).filter(a => !a.org_id).map(a => a.role),
      activeOrgId,
      locale: activeOrg?.locale_default || 'en',
      allowedLocales: activeOrg?.allowed_locales || null,
      roles,
      capabilities,
      adminWidgets,
      userPrefs: meRow?.widget_prefs || null
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/me/active-context — switch the active org. Persists it and returns
// the capabilities + locale for that context so the UI can re-scope immediately.
router.post('/active-context', authenticateToken, validate('activeContext'), async (req, res) => {
  try {
    const orgId = req.validatedData.orgId;
    // Must be a member (owner or has a role assignment) — admins can switch anywhere.
    const isAdmin = req.user.role === 'admin';
    const { data: org } = await supabaseAdmin.from('organizations').select('*').eq('id', orgId).maybeSingle();
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    if (!isAdmin && org.owner_id !== req.user.id) {
      const { data: ra } = await supabaseAdmin.from('role_assignments')
        .select('id').eq('person_id', req.user.id).eq('org_id', orgId).is('revoked_at', null).maybeSingle();
      if (!ra) return res.status(403).json({ error: 'Not a member of this organization' });
    }
    await supabaseAdmin.from('jeetmantra_users').update({ last_active_org_id: orgId }).eq('id', req.user.id)
      .then(() => {}).catch(() => {});
    const { roles, capabilities } = await resolveCaps(req, orgId);
    res.json({
      activeOrgId: orgId,
      org: { id: org.id, name: org.name, type: org.type, category: org.category },
      locale: org.locale_default || 'en',
      allowedLocales: org.allowed_locales || null,
      roles, capabilities
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/me/widget-prefs — the caller's widget personalization.
router.get('/widget-prefs', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('jeetmantra_users').select('widget_prefs').eq('id', req.user.id).maybeSingle();
    res.json({ prefs: data?.widget_prefs || { removed: [], pinned: [], order: [] } });
  } catch (e) { res.json({ prefs: { removed: [], pinned: [], order: [] } }); }
});

// PUT /api/me/widget-prefs — replace the caller's widget prefs (whole object).
router.put('/widget-prefs', authenticateToken, validate('widgetPrefs'), async (req, res) => {
  try {
    const prefs = {
      removed: req.validatedData.removed || [],
      pinned: req.validatedData.pinned || [],
      order: req.validatedData.order || []
    };
    await supabaseAdmin.from('jeetmantra_users').update({ widget_prefs: prefs }).eq('id', req.user.id)
      .then(() => {}).catch(() => {});
    res.json({ prefs });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
