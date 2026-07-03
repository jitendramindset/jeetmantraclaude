/**
 * ui/screens/LiveRoster.js — live-class attendee roster (teacher view).
 * Replaces inline openLiveRoster(classId).
 * Call site: JM.Screens.open('live-roster', { classId: '...' }).
 */
JM.Screens.register({
  id: 'live-roster',
  title: '👥 Live class roster',
  surface: 'modal',
  model: JM.Models.LiveRoster,
  render: function (d, ctx) {
    if (!ctx.classId) {
      return JM.ModalShell({ body: JM.EmptyState({ icon: '⚠️', title: 'No class id', msg: 'Open this from a class card.' }) });
    }
    if (!d.attendees.length) {
      return JM.ModalShell({ body: JM.EmptyState({ icon: '👥', title: 'No one has joined yet', msg: 'Attendees will appear here as they join.' }) });
    }
    var header = '<div style="margin-bottom:10px;font-size:13px;color:var(--jm-text-muted)">'
      + JM.esc(d.class && d.class.title || 'Live class') + ' · <strong>' + d.attendees.length + '</strong> joined</div>';
    var rows = d.attendees.map(function (a) {
      var name = JM.esc(a.full_name || a.email || (a.student_id || '').slice(0, 8));
      var email = JM.esc(a.email || '');
      var joined = a.joined_at ? new Date(a.joined_at).toLocaleTimeString() : '';
      return '<div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid var(--jm-border);gap:8px;align-items:center">'
        + '<div style="min-width:0;flex:1"><div style="font-weight:600">' + name + '</div>'
        +   (email ? '<div style="font-size:11px;color:var(--jm-text-muted)">' + email + '</div>' : '')
        + '</div>'
        + '<div style="font-size:11px;color:var(--jm-text-muted);white-space:nowrap">' + (joined ? 'Joined ' + joined : '') + '</div>'
        + '</div>';
    }).join('');
    return JM.ModalShell({ body: header + rows });
  }
});
