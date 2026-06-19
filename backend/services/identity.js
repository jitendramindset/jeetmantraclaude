/**
 * identity.js — shared helpers for the multi-role identity model (Sprint 2).
 *
 * Two responsibilities:
 *   - mintToken(user): sign a JWT that carries the user's PRIMARY role
 *     (back-compat `role` claim) AND the full role array from user_roles
 *     (`roles` claim). authorizeRole reads the union.
 *   - provisionPersonalInstitute(userId, role): on first signup as a creator
 *     role, add the user as a member of themselves in institution_teachers.
 *     Every course they create is then auto-tagged institution_id = self,
 *     killing the null-institution legacy path Phase A had to work around.
 *
 * Both functions degrade gracefully if the new schema (user_roles table,
 * institution_teachers backfill) hasn't been applied yet — so the API keeps
 * working before the migration is run, just without the new behavior.
 */
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');

const CREATOR_ROLES_FOR_PROVISION = new Set([
  'teacher', 'partner', 'school', 'coaching',
  'corporate_trainer', 'content_creator'
]);

// Read every role this user holds. Always at least includes user_type so the
// union is a superset of the legacy single-role logic.
async function loadUserRoles(userId, primaryRole) {
  const out = new Set();
  if (primaryRole) out.add(primaryRole);
  try {
    const { data } = await supabaseAdmin
      .from('user_roles').select('role')
      .eq('user_id', userId);
    (data || []).forEach(r => { if (r && r.role) out.add(r.role); });
  } catch (_) { /* table absent → fall back to primary-role-only */ }
  return [...out];
}

// Sign a JWT containing { id, email, role, roles[] }. Older code that reads
// `role` keeps working; new code reads `roles` for the union.
async function mintToken(user, { expiresIn = '24h' } = {}) {
  const primary = user.user_type || user.role || user.primaryRole;
  const roles = await loadUserRoles(user.id, primary);
  return jwt.sign(
    { id: user.id, email: user.email, role: primary, roles },
    process.env.JWT_SECRET,
    { expiresIn }
  );
}

// Add the user to institution_teachers as a member of themselves. The
// institution-scoping middleware (resolveInstitution) accepts the resulting
// (self, self) row, so X-Active-Institution: <self> resolves and every course
// they create is institution-scoped automatically.
async function provisionPersonalInstitute(userId, role) {
  if (!userId || !CREATOR_ROLES_FOR_PROVISION.has(role)) return;
  try {
    // Skip if a personal row already exists (re-runs on existing users)
    const { data: existing } = await supabaseAdmin
      .from('institution_teachers').select('id')
      .eq('institution_id', userId).eq('teacher_id', userId).maybeSingle();
    if (existing) return;
    await supabaseAdmin.from('institution_teachers').insert({
      id: uuidv4(),
      institution_id: userId,
      teacher_id: userId,
      subject: 'Personal Workspace',
      is_active: true
    });
  } catch (e) {
    // Don't fail signup over this — backfill SQL handles any gaps. Just log.
    console.warn('[identity] personal institute provision skipped:', e.message);
  }
}

// Mirror the user_type into user_roles on first signup so the new table stays
// authoritative. Safe to call when the table doesn't exist yet.
async function ensureRoleRow(userId, role, institutionId = null) {
  if (!userId || !role) return;
  try {
    await supabaseAdmin.from('user_roles').insert({
      id: uuidv4(), user_id: userId, role, institution_id: institutionId
    });
  } catch (_) { /* unique-conflict or table-absent: ignore */ }
}

module.exports = { mintToken, provisionPersonalInstitute, ensureRoleRow, loadUserRoles };
