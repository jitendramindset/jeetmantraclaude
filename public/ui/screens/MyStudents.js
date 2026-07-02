/**
 * ui/screens/MyStudents.js — cross-course teacher roster with progress %.
 * Replaces inline openMyStudentsPage(); MVC: model = JM.Models.MyStudents
 */
JM.Screens.register({
  id: 'my-students',
  title: '👨‍🎓 My Students',
  surface: 'takeover',
  crumb: 'My Students',

  model: JM.Models.MyStudents,
  render: function (d) {
    if (!d.courses.length) {
      return JM.ModalShell({
        body: JM.EmptyState({
          icon: '👨‍🎓', title: 'No students yet',
          msg: 'Create a course and share it — enrolled learners will appear here with their progress.',
          cta: { label: '＋ Create a course', onClick: "closeAnyModal(); (typeof openWizard==='function'?openWizard():document.querySelector('.nav-item[data-nav-key=courses]')?.click())" }
        })
      });
    }
    if (!d.students.length) {
      return JM.ModalShell({
        body: JM.EmptyState({
          icon: '👨‍🎓', title: 'No enrollments yet',
          msg: 'Your ' + d.courses.length + ' course' + (d.courses.length > 1 ? 's have' : ' has') + ' no enrolled students yet. Share your course link to get learners in.',
          cta: { label: '📚 View my courses', onClick: "closeAnyModal(); document.querySelector('.nav-item[data-nav-key=courses]')?.click()" }
        })
      });
    }
    var header = '<div style="font-size:12px;color:var(--jm-text-muted);margin-bottom:10px">'
      + d.students.length + ' student' + (d.students.length > 1 ? 's' : '')
      + ' across ' + d.courses.length + ' course' + (d.courses.length > 1 ? 's' : '') + '</div>';
    var rows = d.students.map(function (s) {
      return '<div style="display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--jm-border);border-radius:10px;margin-bottom:8px">'
        + JM.Avatar({ name: s.name || '?', size: 34 })
        + '<div style="flex:1;min-width:0">'
        +   '<div style="font-weight:600;font-size:13px">' + JM.esc(s.name || '—') + '</div>'
        +   '<div style="font-size:11px;color:var(--jm-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + JM.esc(s.courses.join(', ')) + '</div>'
        + '</div>'
        + '<div style="text-align:right"><div style="font-weight:700;font-size:13px">' + s.bestPct + '%</div>'
        +   '<div style="font-size:10px;color:var(--jm-text-muted)">progress</div></div>'
        + '</div>';
    }).join('');
    return JM.ModalShell({ body: header + rows });
  }
});
