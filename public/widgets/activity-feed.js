/* widgets/activity-feed.js — recent activity stream (logins, submissions, payments). */
EduOSWidgets.register({
  id: 'activity-feed',
  title: 'Activity Feed',
  description: 'What happened recently across your account.',
  icon: '📰',
  roles: null,                       // universal
  category: 'social',
  size: 'medium',
  defaultSize: 'medium',
  supportedSizes: ['medium', 'large'],
  priority: 60,
  aiTriggers: ['activity', 'feed', 'recent', 'whats happening'],
  dataSource: function () {
    return EduOSWidgets._lib.api('/activity/recent')
      .catch(function () { return { events: [] }; });
  },
  render: function (d) {
    var L = EduOSWidgets._lib;
    var list = L.listOf(d, 'events', 'activity', 'items').slice(0, 8);
    if (!list.length) return L.empty('No activity yet.');
    var ICON = {
      login: '🔑', submission: '📝', payment: '💳', enrollment: '🎓',
      message: '💬', certificate: '🏆', class: '📡', booking: '🎟', refund: '↩'
    };
    var rows = list.map(function (e) {
      var kind = (e.kind || e.type || 'event').toLowerCase();
      var ic = ICON[kind] || '•';
      var who = L.esc(e.actor || e.user || '');
      var verb = L.esc(e.verb || e.message || e.title || kind);
      var ago = e.at || e.created_at || e.ts;
      return '<div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--jm-border)">'
        + '<div style="font-size:14px;flex-shrink:0">' + ic + '</div>'
        + '<div style="flex:1;min-width:0">'
        +   '<div style="font-size:12px;line-height:1.4">' + (who ? '<b>' + who + '</b> ' : '') + verb + '</div>'
        +   (ago ? '<div style="font-size:10px;color:var(--jm-text-muted);margin-top:1px">' + L.when(ago) + '</div>' : '')
        + '</div>'
        + '</div>';
    }).join('');
    return rows;
  }
});
