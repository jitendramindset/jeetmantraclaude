/* widgets/timetable.js — institute timetable templates. */
EduOSWidgets.register({
  id: 'timetable', title: 'Timetable',
  roles: EduOSWidgets._lib.ORG_ADMIN, capability: 'live.schedule',
  category: 'ops', size: 'medium', priority: 26,
  aiTriggers: ['timetable', 'class schedule', 'weekly schedule'],
  dataSource: function () { return EduOSWidgets._lib.api('/timetable/templates'); },
  render: function (d) {
    var L = EduOSWidgets._lib, t = L.listOf(d, 'templates');
    if (!t.length) return L.empty('No timetable templates yet.', { label: '📅 Create timetable', onclick: "location.hash='#timetable'" });
    return t.slice(0, 4).map(function (x) {
      return '<div class="wg-row"><span class="wg-row-t">' + L.esc(x.name || 'Timetable') + '</span></div>';
    }).join('') + '<a class="wg-link" href="dashboard.html#timetable">Manage →</a>';
  }
});
