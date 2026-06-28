/**
 * ui/screens/CourseStudents.js — Enrollment roster for a course.
 * Replaces openCourseStudents(courseId, title). Helpers that stay in dashboard.html:
 * exportRosterCsv(), openStudentDetail() — called from rendered HTML.
 * afterMount stashes window._lastStudentRoster for the export button.
 * ctx: { courseId, title? }
 */
JM.Screens.register({
  id: 'course-students',
  title: '👥 Students',
  surface: 'modal',
  model: JM.Models.CourseStudents,
  render: function (d) {
    var students = d.students || [];
    if (!students.length) {
      return '<div style="text-align:center;padding:20px;color:var(--jm-text-muted)">No enrolled students yet.</div>';
    }
    var completed = students.filter(function (s) { return s.progress_percentage === 100; }).length;
    var rows = students.map(function (s) {
      var lastDate = s.last_attendance_date
        ? ' · last ' + new Date(s.last_attendance_date).toLocaleDateString() : '';
      var badge = s.progress_percentage === 100 ? 'badge-green' : 'badge-blue';
      return '<div onclick="openStudentDetail(\'' + JM.esc(s.course_id || '') + '\',\'' + JM.esc(s.student_id) + '\')" '
        + 'style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid var(--jm-border);align-items:center;cursor:pointer;border-radius:8px" '
        + 'onmouseover="this.style.background=\'var(--jm-surface-2)\'" onmouseout="this.style.background=\'\'">'
        + '<div style="flex:1">'
        + '<div style="font-weight:600">' + JM.esc(s.full_name) + ' <span style="font-size:11px;color:var(--jm-primary)">→ view</span></div>'
        + '<div style="font-size:11px;color:var(--jm-text-muted)">' + JM.esc(s.email)
        + ' · ' + s.attended_lectures + '/' + s.total_lectures + ' attended' + JM.esc(lastDate) + '</div>'
        + '<div class="progress-bar" style="margin-top:4px;max-width:200px"><div class="progress-fill" style="width:' + s.progress_percentage + '%"></div></div>'
        + '</div>'
        + '<span class="badge ' + badge + '">' + s.progress_percentage + '%</span>'
        + '</div>';
    }).join('');
    return '<div style="display:flex;justify-content:space-between;margin-bottom:10px">'
      + '<div style="font-size:12px;color:var(--jm-text-muted)">' + students.length + ' enrolled · ' + completed + ' completed</div>'
      + '<button class="btn-sm btn-outline" onclick="exportRosterCsv(window._lastStudentRoster&&window._lastStudentRoster.students,window._lastStudentRoster&&window._lastStudentRoster.title)">📥 Export CSV</button>'
      + '</div>' + rows;
  },
  afterMount: function (d, ctx) {
    // Stash for the export button and set dynamic title
    window._lastStudentRoster = { students: d.students || [], title: (d.course && d.course.title) || (ctx && ctx.title) || '' };
    var title = (ctx && ctx.title) || (d.course && d.course.title) || '';
    var h3 = document.querySelector('#jm-generic-modal h3');
    if (h3 && title) h3.textContent = '👥 Students: ' + title;
  }
});
