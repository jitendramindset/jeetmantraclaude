/**
 * requireCapability.js — Sprint 7 capability-based authorization (ADDITIVE).
 *
 * The five-axis model (EDUOS_ROLE_ORG_UNIFICATION.md §3) moves authorization
 * from "is the caller's role in this list?" to "does the caller hold this
 * capability?". This middleware is the new gate. It coexists with the existing
 * authorizeRole() — routes opt in one at a time; nothing is force-migrated.
 *
 *   router.post('/x', authenticateToken, requireCapability('course.create'), handler)
 *
 * Resolution:
 *   1. Gather the caller's roles (JWT primary role + roles[] union, same as
 *      Sprint 1 rolesOf).
 *   2. Look up role_capabilities for those roles.
 *   3. If any grants the required capability → allow.
 *   4. admin always passes (defense-in-depth; admin holds every capability via
 *      the seed anyway).
 *
 * Graceful degrade: if the role_capabilities table isn't migrated yet, fall
 * back to a built-in CAPABILITY_FALLBACK map mirroring today's role-set
 * behaviour, so the gate works before the migration is applied.
 */
const { supabaseAdmin } = require('../config/supabase');
const { rolesOf } = require('./auth');

// Mirror of the SQL seed — used when role_capabilities isn't present yet.
const CREATOR_CAPS = new Set([
  'course.create', 'course.edit', 'course.delete', 'live.schedule', 'live.start',
  'attendance.mark', 'assignment.grade', 'test.create', 'certificate.issue',
  'student.manage', 'booking.manage', 'payment.read', 'payout.request', 'analytics.read'
]);
const INSTITUTION_EXTRA = new Set(['org.member.invite', 'org.member.manage', 'org.branding', 'analytics.read', 'org.transfer']);
// franchise is a course-owning umbrella too — give it the creator caps in the
// fallback so a franchise owner isn't denied (consistent with it owning an org).
const CREATOR_ROLES = new Set(['teacher', 'partner', 'coaching', 'school', 'corporate_trainer', 'content_creator', 'franchise']);
const INSTITUTION_ROLES = new Set(['school', 'coaching', 'franchise']);

// The 3 distinct permission tiers from Sprint 8 (org-scoped roles), mirrored
// so requireCapability works before migration-s8 is applied.
const TIER_CAPS = {
  org_admin: new Set(['org.member.invite', 'org.member.manage', 'org.branding', 'analytics.read', 'student.manage', 'payment.read', 'certificate.issue']),
  assistant_teacher: new Set(['attendance.mark', 'assignment.grade', 'student.manage', 'live.start']),
  viewer: new Set(['analytics.read'])
};

function fallbackHasCapability(roles, cap) {
  for (const r of roles) {
    if (r === 'admin') return true;
    if (CREATOR_ROLES.has(r) && CREATOR_CAPS.has(cap)) return true;
    if (INSTITUTION_ROLES.has(r) && INSTITUTION_EXTRA.has(cap)) return true;
    if (TIER_CAPS[r] && TIER_CAPS[r].has(cap)) return true;
  }
  return false;
}

// In-process cache of role → Set(capabilities) (5-min TTL) to avoid a DB hit
// on every gated request. Keyed by role name.
const _cache = new Map();
const TTL_MS = 5 * 60 * 1000;

async function capsForRole(role) {
  const cached = _cache.get(role);
  if (cached && (Date.now() - cached.at) < TTL_MS) return cached.set;
  try {
    const { data } = await supabaseAdmin.from('role_capabilities').select('capability_key').eq('role', role);
    if (!data) return null; // table missing → signal fallback
    const set = new Set(data.map(r => r.capability_key));
    _cache.set(role, { set, at: Date.now() });
    return set;
  } catch (_) {
    return null;
  }
}

function requireCapability(capability) {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    const roles = rolesOf(req);
    if (roles.has('admin')) return next();

    let tableMissing = false;
    for (const role of roles) {
      const set = await capsForRole(role);
      if (set === null) { tableMissing = true; continue; }
      if (set.has(capability)) return next();
    }
    // If the table wasn't reachable for any role, use the static fallback.
    if (tableMissing && fallbackHasCapability(roles, capability)) return next();

    return res.status(403).json({
      error: 'Missing capability',
      required: capability,
      roles: [...roles]
    });
  };
}

module.exports = { requireCapability, fallbackHasCapability };
