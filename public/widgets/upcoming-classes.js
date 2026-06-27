/* widgets/upcoming-classes.js — next live classes (universal; CTA adapts to role). */
EduOSWidgets.register({
  id: 'upcoming-classes', title: 'Upcoming Classes', roles: null,
  category: 'teaching', size: 'medium', priority: 25,
  aiTriggers: ["today's classes", 'upcoming classes', 'schedule', 'open calendar'],
  dataSource: function () { return EduOSWidgets._lib.api('/live-classes/upcoming'); },
  render: function (d, ctx) {
    var L = EduOSWidgets._lib, c = L.listOf(d, 'liveClasses', 'classes', 'upcoming', 'items');
    var isStudent = (ctx && (ctx.roles || []).indexOf('student') >= 0);
    if (!c.length) return L.empty('No upcoming classes.', {
      label: isStudent ? '🛒 Browse courses' : '📡 Schedule a class',
      onclick: isStudent ? "location.hash='#/m/marketplace'" : "if(typeof openSchedule==='function')openSchedule();else location.hash='#/m/calendar'"
    });
    return c.slice(0, 5).map(function (x) {
      return '<div class="wg-row"><span class="wg-row-t">' + L.esc(x.title || x.course_title || 'Class') + '</span>'
        + '<span class="wg-row-x">' + L.when(x.scheduled_time || x.start_at || x.starts_at) + '</span></div>';
    }).join('');
  }
});
