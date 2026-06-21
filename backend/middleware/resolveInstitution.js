/**
 * resolveInstitution — shared multi-institute scoping helper.
 *
 * A teacher can belong to multiple institutions (schools / coaching / academies)
 * via the `institution_teachers` link table; students via `institution_students`.
 * The frontend stores the chosen institution and `api()` forwards it as the
 * `X-Active-Institution` header (or `?inst=` query param). This helper resolves
 * that into a trusted scope value used by route queries:
 *
 *   - missing                → null   (no scoping; caller shows everything it owns)
 *   - 'all'                  → 'all'  (combined view; caller aggregates, no filter)
 *   - a specific institution → the id, ONLY if the caller is a verified member;
 *                              otherwise null (header is ignored, never trusted blind)
 *
 * `institution_id` on `institution_teachers`/`institution_students` is the
 * institution USER's id (an institution is itself a jeetmantra_users row of
 * type school/coaching), matching `courses.institution_id` (both VARCHAR).
 */
const { supabaseAdmin } = require('../config/supabase');

// opts.requireTeacher — when true, ONLY teaching membership counts (used for
// teacher-authority actions like tagging a course to an institution; a user
// merely enrolled as a student there must not pass).
async function resolveInstitution(req, opts = {}) {
  const raw = req.headers['x-active-institution'] || req.query.inst;
  if (!raw) return null;
  if (raw === 'all') return 'all';
  const userId = req.user && req.user.id;
  if (!userId) return null;
  if (opts.requireTeacher) {
    const { data: t } = await supabaseAdmin.from('institution_teachers').select('id')
      .eq('institution_id', raw).eq('teacher_id', userId).maybeSingle();
    return t ? raw : null;
  }
  const [{ data: t }, { data: s }] = await Promise.all([
    supabaseAdmin.from('institution_teachers').select('id')
      .eq('institution_id', raw).eq('teacher_id', userId).maybeSingle(),
    supabaseAdmin.from('institution_students').select('id')
      .eq('institution_id', raw).eq('student_id', userId).maybeSingle()
  ]);
  return (t || s) ? raw : null;
}

// Express middleware form — attaches req.activeInstitution for downstream routes.
async function attachInstitution(req, res, next) {
  try { req.activeInstitution = await resolveInstitution(req); }
  catch (e) { req.activeInstitution = null; }
  next();
}

module.exports = { resolveInstitution, attachInstitution };
