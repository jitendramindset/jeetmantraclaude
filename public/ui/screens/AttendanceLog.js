/**
 * ui/screens/AttendanceLog.js — per-course attendance log.
 * Replaces inline openAttendanceLog(courseId, courseTitle).
 * Call: JM.Screens.open('attendance-log', { courseId, courseTitle }).
 */
JM.Screens.register({
  id: 'attendance-log',
  title: '🗓 Attendance log',
  surface: 'modal',
  model: JM.Models.AttendanceLog,
  render: function (d, ctx) {
    var s = d.summary || {};
    var courseTitle = (ctx && ctx.courseTitle) || 'Course';
    var summary = '<div style="background:var(--jm-primary-tint,rgba(124,58,237,.16));padding:14px;border-radius:8px;margin-bottom:14px;font-size:13px">'
      + '<div style="font-weight:700;margin-bottom:4px">' + JM.esc(courseTitle) + '</div>'
      + '<div>' + (s.total || 0) + ' records · ' + (s.present || 0) + ' present · '
        + (s.absent || 0) + ' absent · ' + (s.late || 0) + ' late · <strong>'
        + (s.percentage || 0) + '%</strong> overall</div>'
      + '</div>';
    var body;
    if (!d.log.length) {
      body = JM.EmptyState({ icon: '🗓', title: 'No attendance records yet', msg: 'Mark attendance to populate this log.' });
    } else {
      body = d.log.map(function (row) {
        var statusClass = row.status === 'present' ? 'success'
          : row.status === 'late' ? 'warn' : 'danger';
        return '<div style="display:flex;justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--jm-border)">'
          + '<div><strong>' + JM.esc(row.student_name || 'You') + '</strong>'
          +   '<div style="font-size:11px;color:var(--jm-text-muted)">' + new Date(row.date).toLocaleDateString() + '</div>'
          + '</div>'
          + JM.Badge({ text: row.status, kind: statusClass })
          + '</div>';
      }).join('');
    }
    return JM.ModalShell({ body: summary + body });
  }
});
