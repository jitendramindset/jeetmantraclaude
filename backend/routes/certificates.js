/**
 * certificates.js — Sprint 6 cert issuance + public verification.
 *
 * Mount: /api/certificates
 *
 *   POST   /issue                    — admin/teacher issues a cert (eligibility
 *                                       enforced server-side)
 *   GET    /my                       — caller's own certs (student/holder view)
 *   GET    /:id                      — single cert (owner / admin / public if
 *                                       requested with ?token=verify_token)
 *   GET    /verify/:token            — PUBLIC endpoint. Third parties verify a
 *                                       certificate URL without an account.
 *   POST   /:id/revoke               — admin only; sets revoked_at + reason
 *   GET    /templates                — list templates (auth)
 *   POST   /templates                — admin/INSTITUTION_ROLES create template
 *
 * Replaces the ephemeral HTML-only cert at courses.js GET /:id/certificate.
 * That endpoint still works for back-compat; the new /issue produces a real
 * persisted row with a verify URL.
 */
const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { CREATOR_ROLES, INSTITUTION_ROLES } = require('../config/roles');
const { requireCapability } = require('../middleware/requireCapability');
const { awardForEvent } = require('../services/award');

const router = express.Router();

// Human-readable serial like EDU-2026-A4F2C0
function generateSerial() {
  const year = new Date().getFullYear();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `EDU-${year}-${rand}`;
}

function generateVerifyToken() {
  return crypto.randomBytes(24).toString('base64url'); // ~32 chars URL-safe
}

// POST /api/certificates/issue — admin or course owner. Body:
//   { type, studentId, courseId?, resourceId?, templateId?, title?, metadata? }
// Eligibility checks:
//   - course_completion: caller is the course teacher OR admin; student must
//     have a >=80% progress enrollment on the course.
//   - other types: caller is admin OR the owner of the referenced course/resource.
router.post('/issue', authenticateToken, requireCapability('certificate.issue'), validate('certificateIssue'), async (req, res) => {
  try {
    const b = req.validatedData;
    const studentId = b.studentId;
    const type = b.type;

    // Owner / admin gate
    let allowed = req.user.role === 'admin';
    if (!allowed && b.courseId) {
      const { data: c } = await supabaseAdmin.from('courses').select('teacher_id, institution_id, title').eq('id', b.courseId).maybeSingle();
      if (c && c.teacher_id === req.user.id) allowed = true;
    }
    if (!allowed && b.resourceId) {
      const { data: r } = await supabaseAdmin.from('resources').select('owner_id, institution_id, title').eq('id', b.resourceId).maybeSingle();
      if (r && r.owner_id === req.user.id) allowed = true;
    }
    if (!allowed) return res.status(403).json({ error: 'Not authorized to issue this certificate' });

    // course_completion eligibility — at least 80% progress
    if (type === 'course_completion' && b.courseId) {
      const { data: enr } = await supabaseAdmin.from('enrollments')
        .select('progress_percentage, progress')
        .eq('student_id', studentId).eq('course_id', b.courseId).maybeSingle();
      const pct = enr?.progress_percentage ?? enr?.progress ?? 0;
      if (pct < 80) return res.status(400).json({ error: 'Student has not completed enough of the course (need >= 80% progress)', progress: pct });

      // Reject duplicate (the unique partial index catches it too, but better message).
      const { data: existing } = await supabaseAdmin.from('certificates')
        .select('id, serial').eq('student_id', studentId).eq('course_id', b.courseId)
        .eq('type', type).is('revoked_at', null).maybeSingle();
      if (existing) return res.status(409).json({ error: 'Certificate already issued for this student/course', existing });
    }

    // Snapshot the holder name so the displayed name is stable even if the
    // student renames later.
    const { data: student } = await supabaseAdmin.from('jeetmantra_users').select('full_name, email').eq('id', studentId).maybeSingle();

    const insert = {
      id: uuidv4(),
      serial: generateSerial(),
      verify_token: generateVerifyToken(),
      type,
      template_id: b.templateId || null,
      student_id: studentId,
      course_id: b.courseId || null,
      resource_id: b.resourceId || null,
      tenant_id: req.headers['x-active-institution'] || null,
      title: b.title || 'Certificate',
      metadata: { holder_name: student?.full_name || '', ...(b.metadata || {}) }
    };
    const { data: cert, error } = await supabaseAdmin.from('certificates').insert(insert).select().single();
    if (error) return res.status(400).json({ error: error.message });

    // Audit log + XP nudge for the student.
    try {
      await supabaseAdmin.from('audit_log').insert({
        id: uuidv4(), actor_id: req.user.id, action: 'certificate.issue',
        target_id: cert.id, metadata: { student_id: studentId, type, course_id: b.courseId, serial: cert.serial },
        occurred_at: new Date().toISOString()
      });
    } catch (_) {}
    awardForEvent({ userId: studentId, eventType: 'course_completed', refTable: 'certificates', refId: cert.id, metadata: { type } }).catch(() => {});

    res.status(201).json({ certificate: cert, verifyUrl: '/verify/' + cert.verify_token });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/certificates/my — caller's own certs
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { data } = await supabaseAdmin.from('certificates')
      .select('*').eq('student_id', req.user.id).is('revoked_at', null)
      .order('issued_at', { ascending: false });
    res.json({ certificates: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/certificates/verify/:token — PUBLIC. Returns a redacted view
// suitable for showing to a third-party employer / verifier.
router.get('/verify/:token', async (req, res) => {
  try {
    const { data: c } = await supabaseAdmin.from('certificates').select('*').eq('verify_token', req.params.token).maybeSingle();
    if (!c) return res.status(404).json({ valid: false, reason: 'Certificate not found' });
    if (c.revoked_at) return res.json({ valid: false, reason: 'Revoked', revoked_at: c.revoked_at });
    // Hydrate course title only (no PII beyond holder_name).
    let courseTitle = null;
    if (c.course_id) {
      const { data: cr } = await supabaseAdmin.from('courses').select('title').eq('id', c.course_id).maybeSingle();
      courseTitle = cr?.title || null;
    }
    res.json({
      valid: true,
      certificate: {
        serial: c.serial,
        type: c.type,
        title: c.title,
        holder_name: c.metadata?.holder_name || null,
        course_title: courseTitle,
        issued_at: c.issued_at
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Templates ─────────────────────────────────────────────────────────────
// MUST come BEFORE GET /:id, otherwise '/templates' is matched by the literal
// route as id="templates".
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    let q = supabaseAdmin.from('certificate_templates').select('*').eq('is_active', true);
    if (type) q = q.eq('type', type);
    const { data } = await q.order('created_at', { ascending: false });
    res.json({ templates: data || [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/templates', authenticateToken, authorizeRole([...INSTITUTION_ROLES, 'admin']), validate('certificateTemplateCreate'), async (req, res) => {
  try {
    const b = req.validatedData;
    const { data, error } = await supabaseAdmin.from('certificate_templates').insert({
      id: uuidv4(), type: b.type, title: b.title,
      tenant_id: b.tenantId || req.user.id,
      html_template: b.htmlTemplate || null,
      css_template: b.cssTemplate || null,
      signature_url: b.signatureUrl || null,
      logo_url: b.logoUrl || null,
      created_by: req.user.id
    }).select().single();
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ template: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/certificates/:id — owner or admin (or PUBLIC if ?token= matches)
router.get('/:id', async (req, res) => {
  try {
    const { data: c } = await supabaseAdmin.from('certificates').select('*').eq('id', req.params.id).maybeSingle();
    if (!c) return res.status(404).json({ error: 'Certificate not found' });
    const publicToken = req.query.token;
    if (publicToken && publicToken === c.verify_token) {
      return res.json({ certificate: c });
    }
    // Auth required if no token supplied
    const auth = req.headers['authorization'];
    if (!auth) return res.status(401).json({ error: 'Auth required, or include ?token=' });
    // Defer to authenticateToken-style verification inline
    const jwt = require('jsonwebtoken');
    let user;
    try { user = jwt.verify(auth.split(' ')[1] || '', process.env.JWT_SECRET); }
    catch (_) { return res.status(403).json({ error: 'Invalid token' }); }
    const isHolder = c.student_id === user.id;
    const isAdmin  = user.role === 'admin';
    if (!isHolder && !isAdmin) return res.status(403).json({ error: 'Not your certificate' });
    res.json({ certificate: c });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/revoke', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { reason } = req.body || {};
    const { data, error } = await supabaseAdmin.from('certificates')
      .update({ revoked_at: new Date().toISOString(), revoke_reason: reason || null })
      .eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ error: 'Not found' });
    try {
      await supabaseAdmin.from('audit_log').insert({
        id: uuidv4(), actor_id: req.user.id, action: 'certificate.revoke',
        target_id: req.params.id, metadata: { reason, serial: data.serial },
        occurred_at: new Date().toISOString()
      });
    } catch (_) {}
    res.json({ certificate: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
