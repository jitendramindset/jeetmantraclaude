const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
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


const ROLES = ['teacher','student','admin','partner','school','coaching'];

// ── Feature registry ─────────────────────────────────────────────────────────
// Single source of truth for all available features across the platform.
// plan_required: 'free'|'basic'|'pro'|'enterprise'
// defaultRoles: which roles have it enabled by default (or 'all')
const FEATURE_REGISTRY = {
  // Menus
  'menu.dashboard':           { label:'Dashboard',             category:'menu',   defaultRoles:['all'],                              plan:'free'       },
  'menu.courses':             { label:'Courses',               category:'menu',   defaultRoles:['teacher','partner','school','coaching','admin'], plan:'free' },
  'menu.my_courses':          { label:'My Courses',            category:'menu',   defaultRoles:['student'],                          plan:'free'       },
  'menu.live_class':          { label:'Live Classes',          category:'menu',   defaultRoles:['all'],                              plan:'free'       },
  'menu.calendar':            { label:'Calendar',              category:'menu',   defaultRoles:['all'],                              plan:'free'       },
  'menu.students':            { label:'Students',              category:'menu',   defaultRoles:['teacher','partner','school','coaching','admin'], plan:'free' },
  'menu.teachers':            { label:'Teachers',              category:'menu',   defaultRoles:['school','admin'],                   plan:'free'       },
  'menu.attendance':          { label:'Attendance',            category:'menu',   defaultRoles:['teacher','school','coaching'],       plan:'free'       },
  'menu.assignments':         { label:'Assignments',           category:'menu',   defaultRoles:['teacher','student'],                plan:'free'       },
  'menu.homework':            { label:'Homework',              category:'menu',   defaultRoles:['student'],                          plan:'free'       },
  'menu.studio':              { label:'Studio',                category:'menu',   defaultRoles:['teacher','partner','coaching'],      plan:'free'       },
  'menu.wallet':              { label:'Wallet',                category:'menu',   defaultRoles:['all'],                              plan:'free'       },
  'menu.earnings':            { label:'Earnings',              category:'menu',   defaultRoles:['teacher','partner','school','coaching'], plan:'free'  },
  'menu.payments':            { label:'Payments',              category:'menu',   defaultRoles:['admin'],                            plan:'free'       },
  'menu.marketplace':         { label:'Marketplace',           category:'menu',   defaultRoles:['all'],                              plan:'free'       },
  'menu.certificates':        { label:'Certificates',          category:'menu',   defaultRoles:['all'],                              plan:'basic'      },
  'menu.timetable':           { label:'Timetable',             category:'menu',   defaultRoles:['teacher','school','coaching'],       plan:'free'       },
  'menu.analytics':           { label:'Analytics',             category:'menu',   defaultRoles:['teacher','partner','school','coaching','admin'], plan:'pro' },
  'menu.reports':             { label:'Reports',               category:'menu',   defaultRoles:['school','admin'],                   plan:'pro'        },
  'menu.ai_tools':            { label:'AI Tools',              category:'menu',   defaultRoles:['teacher','admin'],                  plan:'pro'        },
  'menu.bhasha_setu':         { label:'Bhasha Setu',           category:'menu',   defaultRoles:['teacher','student','school'],        plan:'basic'      },
  'menu.ai_tutor':            { label:'AI Tutor',              category:'menu',   defaultRoles:['student'],                          plan:'pro'        },
  'menu.gamification':        { label:'Gamification',          category:'menu',   defaultRoles:['student'],                          plan:'free'       },
  'menu.bookings':            { label:'Bookings',              category:'menu',   defaultRoles:['coaching','admin'],                  plan:'free'       },
  'menu.users':               { label:'Users',                 category:'menu',   defaultRoles:['admin'],                            plan:'free'       },
  'menu.settings':            { label:'Settings',              category:'menu',   defaultRoles:['admin'],                            plan:'free'       },
  'menu.platform_os':         { label:'Platform OS',           category:'menu',   defaultRoles:['admin'],                            plan:'free'       },
  'menu.permissions':         { label:'Permissions',           category:'menu',   defaultRoles:['admin'],                            plan:'free'       },
  'menu.notifications':       { label:'Notifications',         category:'menu',   defaultRoles:['admin'],                            plan:'free'       },
  // Widgets
  'widget.quick_actions':     { label:'Quick Actions',         category:'widget', defaultRoles:['teacher','partner','school','coaching'], plan:'free'  },
  'widget.my_courses':        { label:'My Courses Widget',     category:'widget', defaultRoles:['teacher','partner','school','coaching'], plan:'free'  },
  'widget.enrolled_courses':  { label:'Enrolled Courses',      category:'widget', defaultRoles:['student'],                          plan:'free'       },
  'widget.calendar':          { label:'Calendar Widget',       category:'widget', defaultRoles:['all'],                              plan:'free'       },
  'widget.upcoming_classes':  { label:'Upcoming Classes',      category:'widget', defaultRoles:['all'],                              plan:'free'       },
  'widget.earnings':          { label:'Earnings Widget',       category:'widget', defaultRoles:['teacher','partner','school','coaching'], plan:'free'  },
  'widget.attendance':        { label:'Attendance Widget',     category:'widget', defaultRoles:['teacher','school'],                 plan:'free'       },
  'widget.students_help':     { label:'Students Needing Help', category:'widget', defaultRoles:['teacher'],                          plan:'free'       },
  'widget.streak':            { label:'Streak & XP',           category:'widget', defaultRoles:['student'],                          plan:'free'       },
  'widget.homework':          { label:'Homework Widget',       category:'widget', defaultRoles:['student'],                          plan:'free'       },
  'widget.certificates':      { label:'Certificates Widget',   category:'widget', defaultRoles:['student'],                          plan:'basic'      },
  'widget.announcements':     { label:'Announcements',         category:'widget', defaultRoles:['all'],                              plan:'free'       },
  'widget.ai_insights':       { label:'AI Insights',           category:'widget', defaultRoles:['teacher','admin'],                  plan:'pro'        },
  'widget.profile':           { label:'Profile Card',          category:'widget', defaultRoles:['all'],                              plan:'free'       },
  // Actions
  'action.create_course':     { label:'Create Course',         category:'action', defaultRoles:['teacher','partner','school','coaching'], plan:'free'  },
  'action.schedule_class':    { label:'Schedule Class',        category:'action', defaultRoles:['teacher','partner','school','coaching'], plan:'free'  },
  'action.take_attendance':   { label:'Take Attendance',       category:'action', defaultRoles:['teacher','school'],                 plan:'free'       },
  'action.go_live':           { label:'Go Live',               category:'action', defaultRoles:['teacher','partner','school','coaching'], plan:'basic' },
  'action.issue_certificate': { label:'Issue Certificate',     category:'action', defaultRoles:['teacher','admin','school'],          plan:'basic'      },
  'action.enroll':            { label:'Enroll in Course',      category:'action', defaultRoles:['student'],                          plan:'free'       },
  'action.submit_assignment': { label:'Submit Assignment',     category:'action', defaultRoles:['student'],                          plan:'free'       },
  'action.join_live':         { label:'Join Live Class',       category:'action', defaultRoles:['student'],                          plan:'free'       },
  'action.download_material': { label:'Download Material',     category:'action', defaultRoles:['student'],                          plan:'basic'      },
  'action.bulk_enroll':       { label:'Bulk Enroll',           category:'action', defaultRoles:['admin','school'],                   plan:'pro'        },
  'action.impersonate':       { label:'Impersonate User',      category:'action', defaultRoles:['admin'],                            plan:'enterprise' },
  'action.export_data':       { label:'Export Data',           category:'action', defaultRoles:['admin','school'],                   plan:'pro'        },
};

// Build defaults from registry (used as fallback when DB table missing)
function buildDefaults() {
  const rows = [];
  for (const [key, meta] of Object.entries(FEATURE_REGISTRY)) {
    const roles = meta.defaultRoles.includes('all') ? ROLES : meta.defaultRoles;
    for (const r of roles) {
      rows.push({ scope:'role', role:r, feature_key:key, enabled:true, plan_required:meta.plan });
    }
  }
  return rows;
}

// ── Admin: full registry ─────────────────────────────────────────────────────
router.get('/registry', authenticateToken, authorizeRole(['admin']), (req, res) => {
  res.json({ features: FEATURE_REGISTRY, roles: ROLES });
});

// ── Admin: read permissions (role / org / user scope) ────────────────────────
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { scope, role, org_id, user_id } = req.query;
    let q = supabaseAdmin.from('feature_permissions').select('*');
    if (scope)  q = q.eq('scope', scope);
    if (role)   q = q.eq('role', role);
    if (org_id) q = q.eq('org_id', org_id);
    if (user_id)q = q.eq('user_id', user_id);
    const { data, error } = await q.order('role').order('feature_key');
    if (error) return res.json({ permissions: buildDefaults(), source: 'defaults' });
    // If DB empty, return built-in defaults
    if (!data || data.length === 0) return res.json({ permissions: buildDefaults(), source: 'defaults' });
    res.json({ permissions: data, source: 'db' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Admin: bulk upsert ───────────────────────────────────────────────────────
router.post('/bulk', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || !updates.length) return res.status(400).json({ error: 'updates[] required' });
    const rows = updates.map(u => ({
      scope: u.scope || 'role',
      role: u.role || null,
      org_id: u.org_id || null,
      user_id: u.user_id || null,
      feature_key: u.feature_key,
      enabled: !!u.enabled,
      plan_required: u.plan_required || 'free',
      created_by: req.user.id,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabaseAdmin.from('feature_permissions')
      .upsert(rows, { onConflict: 'scope,role,org_id,user_id,feature_key' });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, count: rows.length });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── Admin: patch single feature ──────────────────────────────────────────────
router.patch('/:feature_key', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { feature_key } = req.params;
    const { scope='role', role, org_id, user_id, enabled, plan_required } = req.body;
    const row = {
      scope, role: role||null, org_id: org_id||null, user_id: user_id||null,
      feature_key, enabled: !!enabled, plan_required: plan_required||'free',
      created_by: req.user.id, updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin.from('feature_permissions')
      .upsert(row, { onConflict: 'scope,role,org_id,user_id,feature_key' });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// ── All roles: GET /api/permissions/my ───────────────────────────────────────
// Returns effective permission map for the calling user (role defaults + user overrides)
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const role = req.user.role || (req.user.roles && req.user.roles[0]) || 'student';
    const { data: rolePerms } = await supabaseAdmin.from('feature_permissions')
      .select('feature_key,enabled,plan_required')
      .eq('scope','role').eq('role', role);
    const { data: userPerms } = await supabaseAdmin.from('feature_permissions')
      .select('feature_key,enabled,plan_required')
      .eq('scope','user').eq('user_id', req.user.id);
    // Merge: user-level overrides role-level
    const map = {};
    (rolePerms||[]).forEach(p => { map[p.feature_key] = { enabled:p.enabled, plan:p.plan_required }; });
    (userPerms||[]).forEach(p => { map[p.feature_key] = { enabled:p.enabled, plan:p.plan_required }; });
    res.json({ role, permissions: map });
  } catch(e) {
    // Graceful fallback — frontend treats missing key as enabled
    res.json({ role: req.user.role||'student', permissions: {}, source:'fallback' });
  }
});

module.exports = router;
module.exports.FEATURE_REGISTRY = FEATURE_REGISTRY;
module.exports.ROLES = ROLES;
