/**
 * ui/screens/AttendanceReport.js — student attendance overview (takeover-page).
 * Replaces inline openAttendanceReport(); MVC: model = JM.Models.AttendanceReport.
 */
JM.Screens.register({
  id: 'attendance-report',
  title: '🗓 Attendance report',
  crumb: 'Attendance report',
  surface: 'takeover',
  model: JM.Models.AttendanceReport,
  render: function (d) {
    var o = d.overall || {};
    var rep = d.report || [];
    var table = rep.length
      ? '<div class="card"><table style="width:100%;border-collapse:collapse">'
        + '<thead><tr style="text-align:left;color:var(--jm-text-muted);font-size:12px;border-bottom:1px solid var(--jm-border)">'
        +   '<th style="padding:8px">Course</th>'
        +   '<th style="padding:8px;text-align:center">Present</th>'
        +   '<th style="padding:8px;text-align:center">Absent</th>'
        +   '<th style="padding:8px;text-align:center">Late</th>'
        +   '<th style="padding:8px;text-align:center">%</th>'
        + '</tr></thead><tbody>'
        + rep.map(function (c) {
            var col = c.percentage >= 75 ? '#10b981' : c.percentage >= 50 ? '#f59e0b' : '#ef4444';
            return '<tr style="border-bottom:1px solid var(--jm-border)">'
              + '<td style="padding:8px">' + JM.esc(c.course_title) + '</td>'
              + '<td style="padding:8px;text-align:center">' + c.present + '</td>'
              + '<td style="padding:8px;text-align:center">' + c.absent + '</td>'
              + '<td style="padding:8px;text-align:center">' + c.late + '</td>'
              + '<td style="padding:8px;text-align:center"><span style="padding:3px 10px;border-radius:99px;background:' + col + ';color:#fff;font-weight:600;font-size:12px">' + c.percentage + '%</span></td>'
              + '</tr>';
          }).join('')
        + '</tbody></table></div>'
      : JM.EmptyState({ icon: '🗓', title: 'No attendance records yet', msg: 'Mark attendance from your enrolled courses to see your report.' });
    return '<div style="max-width:800px;margin:0 auto">'
      + '<h2 style="margin-bottom:14px">🗓 Attendance report</h2>'
      + JM.KPIGrid([
          { label: 'Overall', value: (o.percentage || 0) + '%', sub: (o.present || 0) + '/' + (o.total || 0) + ' present', accent: '#7c3aed' }
        ])
      + '<div style="margin-top:14px"></div>'
      + table
      + '</div>';
  }
});
