/**
 * ui/screens/StudentDetail.js — per-student deep-dive (modal).
 * Replaces inline openStudentDetail(courseId, studentId).
 * Call: JM.Screens.open('student-detail', { courseId, studentId }).
 * Legacy openDmWith() handler stays in dashboard.html.
 */
JM.Screens.register({
  id: 'student-detail',
  title: '👤 Student Detail',
  surface: 'modal',
  model: JM.Models.StudentDetail,
  render: function (d, ctx) {
    var s = d.student || {}; var p = d.progress || {};
    var name = JM.esc(s.full_name || 'Student');
    var email = JM.esc(s.email || '');
    var sid = (ctx && ctx.studentId) || '';

    var header = '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:14px">'
      + '<div style="width:48px;height:48px;border-radius:50%;background:var(--jm-primary-tint,rgba(124,58,237,.16));display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">👤</div>'
      + '<div style="min-width:0;flex:1"><div style="font-weight:700;font-size:clamp(14px,4vw,16px)">' + name + '</div>'
      +   (email ? '<div style="font-size:clamp(11px,3vw,12px);color:var(--jm-text-muted)">' + email + '</div>' : '')
      + '</div>'
      + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'
      +   JM.Button({ label: '💬 Message', kind: 'primary', size: 'sm', onClick: "openDmWith('" + sid + "','" + name.replace(/'/g, "\\'") + "')" })
      +   '<div style="text-align:center"><div style="font-size:clamp(18px,5vw,24px);font-weight:800;color:var(--jm-primary,var(--jm-primary,#7c3aed))">' + (p.percentage || 0) + '%</div>'
      +     '<div style="font-size:clamp(10px,2.5vw,11px);color:var(--jm-text-muted)">progress</div></div>'
      + '</div>'
      + '</div>';

    var kpiRow = '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px">'
      + '<div style="flex:1;min-width:80px;background:var(--jm-surface-2,var(--jm-surface-2,#f3f4f6));border-radius:8px;padding:10px;text-align:center">'
      +   '<div style="font-size:clamp(15px,4vw,18px);font-weight:800">' + (p.attended_lectures || 0) + '/' + (p.total_lectures || 0) + '</div>'
      +   '<div style="font-size:clamp(10px,2.5vw,11px);color:var(--jm-text-muted)">Lectures attended</div></div>'
      + '<div style="flex:1;min-width:80px;background:var(--jm-surface-2,var(--jm-surface-2,#f3f4f6));border-radius:8px;padding:10px;text-align:center">'
      +   '<div style="font-size:clamp(15px,4vw,18px);font-weight:800">' + d.assignments.length + '</div>'
      +   '<div style="font-size:clamp(10px,2.5vw,11px);color:var(--jm-text-muted)">Submissions</div></div>'
      + '<div style="flex:1;min-width:80px;background:var(--jm-surface-2,var(--jm-surface-2,#f3f4f6));border-radius:8px;padding:10px;text-align:center">'
      +   '<div style="font-size:clamp(15px,4vw,18px);font-weight:800">' + d.tests.length + '</div>'
      +   '<div style="font-size:clamp(10px,2.5vw,11px);color:var(--jm-text-muted)">Tests taken</div></div>'
      + '</div>';

    var gradeChip = function (a) {
      if (a.grade != null) return JM.Badge({ text: String(a.grade), kind: 'success' });
      return JM.Badge({ text: a.status || 'pending', kind: a.status === 'submitted' ? 'warn' : 'info' });
    };
    var asgRows = d.assignments.length
      ? d.assignments.map(function (a) {
          var meta = (a.updated_at ? new Date(a.updated_at).toLocaleDateString() : '')
            + (a.submission_url ? ' · <a href="' + JM.esc(a.submission_url) + '" target="_blank" style="color:var(--jm-primary)">view work</a>' : '');
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--jm-border)">'
            + '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + JM.esc(a.title || 'Assignment') + '</div>'
            +   '<div style="font-size:11px;color:var(--jm-text-muted)">' + meta + '</div></div>'
            + gradeChip(a) + '</div>';
        }).join('')
      : '<div style="color:var(--jm-text-muted);font-size:12px;padding:8px">No submissions yet.</div>';

    var testRows = d.tests.length
      ? d.tests.map(function (t) {
          var passed = t.score >= (t.total_marks * 0.4);
          var scoreText = t.score == null ? '—' : t.score + '/' + t.total_marks;
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--jm-border)">'
            + '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + JM.esc(t.title) + '</div>'
            +   '<div style="font-size:11px;color:var(--jm-text-muted)">' + (t.submitted_at ? new Date(t.submitted_at).toLocaleDateString() : '') + '</div></div>'
            + JM.Badge({ text: scoreText, kind: passed ? 'success' : 'danger' }) + '</div>';
        }).join('')
      : '<div style="color:var(--jm-text-muted);font-size:12px;padding:8px">No tests taken.</div>';

    var actRows = d.activity.length
      ? d.activity.slice(0, 8).map(function (e) {
          return '<div style="font-size:12px;padding:6px 0;border-bottom:1px solid var(--jm-border)">'
            + JM.esc(e.message || e.event_type || '') + '<div style="font-size:10px;color:var(--jm-text-muted)">'
            + new Date(e.created_at).toLocaleString() + '</div></div>';
        }).join('')
      : '<div style="color:var(--jm-text-muted);font-size:12px;padding:8px">No recent activity.</div>';

    var doubtRows = d.doubts.length
      ? d.doubts.map(function (q) {
          return '<div style="font-size:12px;padding:8px;background:var(--jm-surface-2,var(--jm-surface-2,#f3f4f6));border-radius:8px;margin-bottom:6px">'
            + '💬 ' + JM.esc(q.content) + '<div style="font-size:10px;color:var(--jm-text-muted);margin-top:2px">'
            + new Date(q.created_at).toLocaleString() + '</div></div>';
        }).join('')
      : '<div style="color:var(--jm-text-muted);font-size:12px;padding:8px">No questions/doubts posted in course chat.</div>';

    var H = function (icon, label) { return '<div style="font-weight:700;font-size:13px;margin:14px 0 4px">' + icon + ' ' + label + '</div>'; };
    return JM.ModalShell({
      body: header + kpiRow
        + H('📝', 'Assignment submissions') + asgRows
        + H('✏️', 'Test results') + testRows
        + H('📊', 'Recent activity') + actRows
        + H('❓', 'Doubts &amp; questions') + doubtRows
    });
  }
});
