/**
 * ui/screens/Analytics.js — teacher analytics aggregate (KPIs + per-course table).
 * Replaces inline openAnalyticsPage(); MVC: model = JM.Models.Analytics
 */
JM.Screens.register({
  id: 'analytics',
  title: '📊 Analytics',
  surface: 'takeover',
  crumb: 'Analytics',

  model: JM.Models.Analytics,
  render: function (d) {
    if (!d.courses.length) {
      return JM.ModalShell({
        body: JM.EmptyState({
          icon: '📊', title: 'No data yet',
          msg: 'Once you create courses and enroll students, your analytics will appear here.',
          cta: { label: '＋ Create a course', onClick: "closeAnyModal(); (typeof openWizard==='function'?openWizard():document.querySelector('.nav-item[data-nav-key=courses]')?.click())" }
        })
      });
    }
    var kpis = JM.KPIGrid([
      { label: 'Courses',        value: d.courses.length },
      { label: 'Total students', value: d.totals.students, accent: 'var(--jm-accent-cyan, var(--jm-accent-cyan,#0ea5e9))' },
      { label: 'Avg completion', value: d.totals.avgCompletion + '%', accent: 'var(--jm-accent-green, var(--jm-success,#16a34a))' },
      { label: 'Revenue',        value: '₹' + d.totals.revenue.toLocaleString('en-IN'), accent: 'var(--jm-accent-amber, var(--jm-warn,#f59e0b))' }
    ]);
    var table =
      '<div style="font-weight:700;font-size:13px;margin-bottom:8px">Per course</div>'
      + '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-size:13px">'
      + '<thead><tr style="color:var(--jm-text-muted);font-size:11px;text-align:left">'
      + '<th style="padding:6px 8px">Course</th>'
      + '<th style="padding:6px 8px;text-align:right">Students</th>'
      + '<th style="padding:6px 8px;text-align:right">Done</th>'
      + '<th style="padding:6px 8px;text-align:right">Revenue</th></tr></thead>'
      + '<tbody>' + d.perCourse.map(function (p) {
          return '<tr style="border-top:1px solid var(--jm-border)">'
            + '<td style="padding:8px;font-weight:600">' + JM.esc(p.title) + '</td>'
            + '<td style="padding:8px;text-align:right">' + p.students + '</td>'
            + '<td style="padding:8px;text-align:right">' + p.completion + '%</td>'
            + '<td style="padding:8px;text-align:right">₹' + (p.revenue || 0).toLocaleString('en-IN') + '</td>'
            + '</tr>';
        }).join('') + '</tbody></table></div>';
    return JM.ModalShell({ body: kpis + table });
  }
});
