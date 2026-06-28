/* widgets/quick-actions.js — capability-aware action grid (universal). */
EduOSWidgets.register({
  id: 'quick-actions', title: 'Quick Actions', roles: null,
  category: 'ops', size: 'full', priority: 5,
  render: function (_, ctx) {
    var L = EduOSWidgets._lib;
    var has = function (c) { return (ctx.capabilities || []).indexOf(c) >= 0 || (ctx.roles || []).indexOf('admin') >= 0; };
    var A = [
      has('course.create') && ['＋ New course', 'dashboard.html#create'],
      has('live.schedule') && ['📡 Schedule class', 'dashboard.html#live'],
      has('attendance.mark') && ['✓ Take attendance', 'dashboard.html#attendance'],
      ['🛒 Browse marketplace', 'marketplace.html'],
      ['🤖 Ask AI', 'dashboard.html#ai']
    ].filter(Boolean);
    return '<div class="wg-actions">' + A.map(function (p) { return '<a class="wg-action" href="' + p[1] + '">' + L.esc(p[0]) + '</a>'; }).join('') + '</div>';
  }
});
