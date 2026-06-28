/* widgets/messages.js — unread chat counter (universal). */
EduOSWidgets.register({
  id: 'messages', title: 'Messages', roles: null,
  category: 'social', size: 'small', priority: 46,
  aiTriggers: ['messages', 'unread messages', 'chat'],
  dataSource: function () { return EduOSWidgets._lib.api('/chat/unread'); },
  render: function (d) {
    var L = EduOSWidgets._lib;
    var total = (d && d.total != null) ? d.total : ((d && d.unread != null) ? d.unread : L.listOf(d, 'rooms', 'threads').length);
    if (!total) return L.empty('No unread messages.');
    return '<div class="wg-big">' + L.pct(total) + '</div>'
      + '<div class="wg-sub">unread · <a class="wg-link" href="dashboard.html#messages">Open inbox →</a></div>';
  }
});
