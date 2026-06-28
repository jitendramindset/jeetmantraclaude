/**
 * ui/screens/Wall.js — activity feed wall (own activity or per-course).
 * Replaces inline openWall(scope, id).
 * Call: JM.Screens.open('wall', { scope: 'course'|'me', id: '...' }).
 */
JM.Screens.register({
  id: 'wall',
  title: '📣 Activity wall',
  model: JM.Models.Wall,
  render: function (d) {
    if (!d.feed.length) {
      return JM.ModalShell({ body: JM.EmptyState({ icon: '📣', title: 'No activity yet', msg: 'New posts and class updates will appear here.' }) });
    }
    var rows = d.feed.map(function (e) {
      var msg = e.message || e.event_type || '';
      // Use the first emoji-ish char as the icon, fallback to a bullet.
      var icon = (msg.match(/^\S+/) || ['•'])[0];
      var actor = e.actor_name ? JM.esc(e.actor_name) + ' · ' : '';
      var when = e.created_at ? new Date(e.created_at).toLocaleString() : '';
      return '<div style="padding:12px;border-bottom:1px solid var(--jm-border);display:flex;gap:12px">'
        + '<div style="font-size:20px">' + icon + '</div>'
        + '<div style="flex:1">'
        +   '<div style="font-size:13px">' + JM.esc(msg) + '</div>'
        +   '<div style="font-size:11px;color:var(--jm-text-muted);margin-top:2px">' + actor + when + '</div>'
        + '</div></div>';
    }).join('');
    return JM.ModalShell({ body: rows });
  }
});
