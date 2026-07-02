/**
 * ui/screens/Submissions.js — assignment submissions list (modal).
 * Replaces inline openSubmissions(assignmentId, title).
 * The legacy openGradeSubmission(sid) handler stays in dashboard.html.
 *
 * Side effect preserved: window._pendingSubmissions is populated so the legacy
 * onclick of "Grade" can fetch the submission record by id (matches old behavior).
 */
JM.Screens.register({
  id: 'submissions',
  title: '📥 Submissions',
  surface: 'modal',
  model: JM.Models.Submissions,
  render: function (d, ctx) {
    var subs = d.submissions || [];
    var assignmentTitle = (ctx && ctx.title) || 'Assignment';
    // Back-compat: rebuild the id-keyed map the legacy Grade-button handler reads from.
    window._pendingSubmissions = subs.reduce(function (m, s) { m[s.id] = s; return m; }, {});

    if (!subs.length) {
      return JM.ModalShell({
        body: '<div style="font-weight:600;font-size:14px;margin-bottom:6px">📥 ' + JM.esc(assignmentTitle) + '</div>'
          + JM.EmptyState({ icon: '📥', title: 'No submissions yet', msg: 'Students who submit will appear here.' })
      });
    }
    var rows = subs.map(function (s) {
      var kind = s.status === 'graded' ? 'success'
        : s.status === 'submitted' ? 'info' : 'warn';
      var statusText = s.status + (s.grade != null ? ': ' + s.grade : '');
      var name = JM.esc(s.full_name || s.email || 'Student');
      var email = JM.esc(s.email || '');
      var fileLink = s.submission_url
        ? '<div style="margin-top:4px"><a href="' + JM.esc(s.submission_url) + '" target="_blank">📎 View</a></div>' : '';
      return '<div style="display:flex;justify-content:space-between;padding:12px;border-bottom:1px solid var(--jm-border);align-items:center">'
        + '<div><div style="font-weight:600">' + name + '</div>'
        +   (email ? '<div style="font-size:11px;color:var(--jm-text-muted)">' + email + '</div>' : '')
        +   fileLink
        + '</div>'
        + '<div style="display:flex;gap:8px;align-items:center">'
        +   JM.Badge({ text: statusText, kind: kind })
        +   JM.Button({ label: 'Grade', kind: 'primary', size: 'sm', onClick: "openGradeSubmission('" + s.id + "')" })
        + '</div>'
        + '</div>';
    }).join('');
    return JM.ModalShell({
      body: '<div style="font-weight:600;font-size:14px;margin-bottom:10px">📥 ' + JM.esc(assignmentTitle) + ' · ' + subs.length + ' submission' + (subs.length !== 1 ? 's' : '') + '</div>'
        + rows
    });
  }
});
