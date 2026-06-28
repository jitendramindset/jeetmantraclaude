/* widgets/notifications.js — unread notifications counter (universal). */
EduOSWidgets.register({
  id: 'notifications', title: 'Notifications', roles: null,
  category: 'social', size: 'small', priority: 45,
  aiTriggers: ['notifications', 'alerts'],
  dataSource: function () { return EduOSWidgets._lib.api('/notifications/unread'); },
  render: function (d) {
    var L = EduOSWidgets._lib, n = L.listOf(d, 'notifications');
    var total = (d && d.total != null) ? d.total : n.length;
    if (!total) return L.empty('All caught up — no new notifications.', { label: '🔔 Open notifications', onclick: "if(typeof toggleNotifs==='function')toggleNotifs(event);else location.hash='#/m/notifications'" });
    return '<div class="wg-big" style="cursor:pointer" onclick="if(typeof toggleNotifs===\'function\')toggleNotifs(event)">' + total + '</div>'
      + '<div class="wg-sub">unread — tap to open</div>'
      + n.slice(0, 3).map(function (x) { return '<div class="wg-row"><span class="wg-row-t">' + L.esc(x.title || x.message || 'Notification') + '</span></div>'; }).join('');
  }
});
