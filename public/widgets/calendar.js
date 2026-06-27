/* widgets/calendar.js — mini month calendar with event dots (universal). */
EduOSWidgets.register({
  id: 'calendar',
  title: 'Calendar',
  description: 'This month at a glance — classes, exams, bookings.',
  icon: '📅',
  roles: null,                       // universal
  category: 'planning',
  size: 'large',
  defaultSize: 'large',
  supportedSizes: ['medium', 'large', 'full'],
  priority: 35,
  aiTriggers: ['calendar', 'this month', 'schedule'],
  dataSource: function () {
    return EduOSWidgets._lib.api('/calendar')
      .catch(function () { return { events: [] }; });
  },
  render: function (d) {
    var L = EduOSWidgets._lib;
    var events = L.listOf(d, 'events', 'items');
    // Build a map of YYYY-MM-DD → event count for the current month.
    var now = new Date();
    var Y = now.getFullYear(), M = now.getMonth();
    var byDate = {};
    events.forEach(function (e) {
      var dt = e.date || e.start || e.starts_at; if (!dt) return;
      var d2 = new Date(dt); if (d2.getFullYear() !== Y || d2.getMonth() !== M) return;
      var key = d2.toISOString().slice(0, 10);
      byDate[key] = (byDate[key] || 0) + 1;
    });
    var firstDow = new Date(Y, M, 1).getDay(); // 0=Sun
    var lastDay = new Date(Y, M + 1, 0).getDate();
    var today = now.getDate();
    var dows = ['S','M','T','W','T','F','S'];
    var head = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;font-size:10px;font-weight:700;color:var(--jm-text-muted);text-transform:uppercase;margin-bottom:4px">'
      + dows.map(function (d) { return '<div>' + d + '</div>'; }).join('') + '</div>';
    var cells = '';
    for (var i = 0; i < firstDow; i++) cells += '<div></div>';
    for (var day = 1; day <= lastDay; day++) {
      var key = Y + '-' + String(M + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
      var n = byDate[key] || 0;
      var isToday = day === today;
      cells += '<div style="aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;font-size:11px;cursor:pointer;'
        + (isToday ? 'background:var(--jm-primary,#7c3aed);color:#fff;font-weight:700' : 'color:var(--jm-text)')
        + '" title="' + key + (n ? ' · ' + n + ' event' + (n > 1 ? 's' : '') : '') + '">'
        + day
        + (n ? '<div style="display:flex;gap:1px;margin-top:1px">' + Array(Math.min(n, 3)).fill('<span style="width:4px;height:4px;border-radius:50%;background:' + (isToday ? '#fff' : 'var(--jm-primary,#7c3aed)') + '"></span>').join('') + '</div>' : '')
        + '</div>';
    }
    var monthLabel = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    return '<div style="font-weight:700;font-size:13px;margin-bottom:8px;text-align:center">' + monthLabel + '</div>'
      + head
      + '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px">' + cells + '</div>'
      + '<div class="wg-sub" style="margin-top:8px;text-align:center"><a class="wg-link" href="dashboard.html#calendar">Open calendar →</a></div>';
  }
});
