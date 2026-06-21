/**
 * calendar.js — Unified timetable endpoint (Sprint 2 Track A).
 *
 * One endpoint replaces three previously-divergent merge functions:
 *   - /api/teacher/timetable (teacherExtras.js:23)
 *   - /api/teacher/calendar  (teacherExtras.js:478)
 *   - /api/student/calendar  (studentExtras.js:384)
 * which all UNIONed live_classes + assignments + course_tests in slightly
 * different ways (Sprint 1 fixed the student test-date inconsistency; this
 * fix collapses the three into one canonical source).
 *
 *   GET /api/calendar?view=day|week|month|agenda|timeline&from=ISO&to=ISO
 *
 *     view      — drives default windowing if from/to omitted; the response
 *                 shape is the same flat events array for every view (the
 *                 frontend renders day/week/month/agenda/timeline differently)
 *     from, to  — ISO timestamps; bound the window
 *     types     — optional comma-list filter (live,assignment,test,booking…)
 *
 * Authorization: authenticateToken. The role drives the scope:
 *   - student        → events from enrolled courses
 *   - teacher/creator→ events from owned courses, optionally institution-scoped
 *                      via X-Active-Institution (the Sprint 0a switcher)
 *   - admin          → all events (paginated if needed downstream)
 *
 * Response: { view, from, to, events: [{
 *   id, type, title, start, end, all_day, course_id, course_title,
 *   institution_id, source_table, source_id, status?, duration?, venue?,
 *   is_online?, ...minimal type-specific extras
 * }] }
 *
 * Designed to be extended: when Sprint 4 lands the unified booking engine,
 * just add a fourth UNION block here for resource bookings. When Sprint 2
 * Track C adds a real calendar_events cache table, swap the implementation
 * keeping the contract.
 */
const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken, rolesOf } = require('../middleware/auth');
const { resolveInstitution } = require('../middleware/resolveInstitution');

const router = express.Router();

const CREATOR_ROLE_SET = new Set([
  'teacher', 'partner', 'school', 'coaching', 'admin',
  'corporate_trainer', 'content_creator'
]);

// Window default: ±7 days for day/week, current month for month/agenda,
// ±30 days for timeline. View is purely advisory — the caller can override
// with explicit from/to.
function windowFor(view, fromQ, toQ) {
  if (fromQ && toQ) return { from: new Date(fromQ), to: new Date(toQ) };
  const now = new Date();
  let from, to;
  switch (view) {
    case 'day':      from = new Date(now); from.setHours(0,0,0,0); to = new Date(from); to.setDate(to.getDate()+1); break;
    case 'week':     from = new Date(now); from.setDate(now.getDate() - now.getDay()); from.setHours(0,0,0,0); to = new Date(from); to.setDate(to.getDate()+7); break;
    case 'month':    from = new Date(now.getFullYear(), now.getMonth(), 1); to = new Date(now.getFullYear(), now.getMonth()+1, 1); break;
    case 'agenda':   from = new Date(now); from.setHours(0,0,0,0); to = new Date(from); to.setDate(to.getDate()+14); break;
    case 'timeline': from = new Date(now); from.setDate(now.getDate()-7); to = new Date(now); to.setDate(now.getDate()+30); break;
    default:         from = new Date(now); from.setDate(now.getDate()-1); to = new Date(now); to.setDate(now.getDate()+7);
  }
  return { from, to };
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const view = (req.query.view || 'agenda').toLowerCase();
    const { from, to } = windowFor(view, req.query.from, req.query.to);
    const typeFilter = req.query.types
      ? new Set(String(req.query.types).split(',').map(s => s.trim()).filter(Boolean))
      : null;
    const wantType = t => !typeFilter || typeFilter.has(t);

    const userId = req.user.id;
    const roles = rolesOf(req);
    const isCreator = [...roles].some(r => CREATOR_ROLE_SET.has(r));
    const isStudent = roles.has('student');

    // ── Resolve the relevant course set per role
    let courseIds = [];
    let courseTitleById = {};
    let institutionScope = null;

    if (isCreator) {
      institutionScope = await resolveInstitution(req);
      let q = supabaseAdmin.from('courses').select('id, title, institution_id').eq('teacher_id', userId);
      if (institutionScope && institutionScope !== 'all') q = q.eq('institution_id', institutionScope);
      const { data: owned } = await q;
      (owned || []).forEach(c => { courseIds.push(c.id); courseTitleById[c.id] = c.title; });
    }
    if (isStudent || (!isCreator && !roles.has('admin'))) {
      // Student or "anything else" — show enrolled courses
      const { data: enrolled } = await supabaseAdmin.from('enrollments')
        .select('course_id, courses(title)').eq('student_id', userId);
      (enrolled || []).forEach(e => {
        if (e.course_id && !courseTitleById[e.course_id]) {
          courseIds.push(e.course_id);
          courseTitleById[e.course_id] = e.courses?.title;
        }
      });
    }
    // Admin sees everything — leave courseIds empty + treat the queries below
    // as "all rows in window" instead of "filtered by course_id".
    const isAdmin = roles.has('admin');

    if (!isAdmin && !courseIds.length) {
      return res.json({ view, from, to, events: [] });
    }

    const fromIso = from.toISOString();
    const toIso = to.toISOString();

    // ── Three concurrent reads — live classes, assignments, tests
    const liveQ = (() => {
      let q = supabaseAdmin.from('live_classes')
        .select('id, title, scheduled_time, duration, status, course_id, is_online, venue, recording_url')
        .gte('scheduled_time', fromIso).lte('scheduled_time', toIso);
      if (!isAdmin) q = q.in('course_id', courseIds);
      return q;
    })();
    const assignQ = (() => {
      let q = supabaseAdmin.from('assignments')
        .select('id, title, due_date, course_id, student_id')
        .gte('due_date', fromIso).lte('due_date', toIso)
        .is('student_id', null); // template rows, not per-student copies
      if (!isAdmin) q = q.in('course_id', courseIds);
      return q;
    })();
    // Tests: scheduled_for primary, due_date fallback (matches the Sprint 1 fix).
    const testScheduledQ = (() => {
      let q = supabaseAdmin.from('course_tests')
        .select('id, title, scheduled_for, duration_minutes, course_id')
        .not('scheduled_for', 'is', null)
        .gte('scheduled_for', fromIso).lte('scheduled_for', toIso);
      if (!isAdmin) q = q.in('course_id', courseIds);
      return q;
    })();
    const testDueQ = (() => {
      // tests with no scheduled session but a deadline in range
      let q = supabaseAdmin.from('course_tests')
        .select('id, title, due_date, course_id')
        .is('scheduled_for', null)
        .gte('due_date', fromIso.slice(0,10)).lte('due_date', toIso.slice(0,10));
      if (!isAdmin) q = q.in('course_id', courseIds);
      return q;
    })();

    const [live, assigns, tSch, tDue] = await Promise.all([
      wantType('live')       ? liveQ.then(r => r.data || []).catch(() => []) : Promise.resolve([]),
      wantType('assignment') ? assignQ.then(r => r.data || []).catch(() => []) : Promise.resolve([]),
      wantType('test')       ? testScheduledQ.then(r => r.data || []).catch(() => []) : Promise.resolve([]),
      wantType('test')       ? testDueQ.then(r => r.data || []).catch(() => []) : Promise.resolve([])
    ]);

    // ── Hydrate course titles for admin (or when course wasn't in our owned/enrolled set)
    if (isAdmin) {
      const missing = [...new Set([...live, ...assigns, ...tSch, ...tDue]
        .map(r => r.course_id).filter(id => id && !courseTitleById[id]))];
      if (missing.length) {
        const { data: titles } = await supabaseAdmin.from('courses').select('id, title').in('id', missing);
        (titles || []).forEach(c => { courseTitleById[c.id] = c.title; });
      }
    }

    // ── Normalize all four streams to one event shape
    const events = [];
    live.forEach(l => events.push({
      id: l.id,
      type: 'live',
      title: l.title || 'Live class',
      start: l.scheduled_time,
      end: l.scheduled_time && l.duration
        ? new Date(new Date(l.scheduled_time).getTime() + (l.duration || 60) * 60000).toISOString()
        : null,
      all_day: false,
      course_id: l.course_id,
      course_title: courseTitleById[l.course_id] || null,
      status: l.status,
      duration: l.duration || 60,
      is_online: l.is_online !== false,
      venue: l.venue || null,
      has_recording: !!l.recording_url,
      source_table: 'live_classes',
      source_id: l.id
    }));
    assigns.forEach(a => events.push({
      id: a.id,
      type: 'assignment',
      title: a.title || 'Assignment due',
      start: a.due_date,
      end: a.due_date,
      all_day: true,
      course_id: a.course_id,
      course_title: courseTitleById[a.course_id] || null,
      source_table: 'assignments',
      source_id: a.id
    }));
    tSch.forEach(t => events.push({
      id: t.id,
      type: 'test',
      title: t.title || 'Test',
      start: t.scheduled_for,
      end: t.scheduled_for && t.duration_minutes
        ? new Date(new Date(t.scheduled_for).getTime() + (t.duration_minutes || 60) * 60000).toISOString()
        : null,
      all_day: false,
      course_id: t.course_id,
      course_title: courseTitleById[t.course_id] || null,
      duration: t.duration_minutes || 60,
      source_table: 'course_tests',
      source_id: t.id
    }));
    tDue.forEach(t => events.push({
      id: t.id,
      type: 'test',
      title: t.title || 'Test due',
      start: t.due_date + 'T00:00:00Z',
      end: t.due_date + 'T23:59:59Z',
      all_day: true,
      course_id: t.course_id,
      course_title: courseTitleById[t.course_id] || null,
      source_table: 'course_tests',
      source_id: t.id
    }));

    // Stable order — by start ascending. The frontend renders day/week/month/
    // agenda/timeline differently, but they all want ascending time.
    events.sort((a, b) => String(a.start || '').localeCompare(String(b.start || '')));

    res.json({ view, from, to, events });
  } catch (e) {
    console.error('[calendar] error:', e);
    res.status(500).json({ error: 'Failed to load calendar', detail: e.message });
  }
});

module.exports = router;
