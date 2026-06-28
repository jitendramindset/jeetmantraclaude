/**
 * ui/screens/ProctorEvents.js — Proctoring event list for a live session (modal).
 * Replaces openProctorEvents(sessionId). ctx: { sessionId }
 */
JM.Screens.register({
  id: 'proctor-events',
  title: '📷 Proctoring Events',
  surface: 'modal',
  model: JM.Models.ProctorEvents,
  render: function (d) {
    var ev = d.events || [];
    var h3 = document.querySelector('#jm-generic-modal h3');
    if (h3) h3.textContent = '📷 Proctoring events (' + ev.length + ')';
    if (!ev.length) {
      return '<div class="empty-state"><div class="icon">✅</div>No suspicious events — clean session.</div>';
    }
    return ev.map(function (e) {
      var badge = e.event_type && e.event_type.includes('block') ? 'badge-yellow'
        : e.event_type && e.event_type.includes('tab') ? 'badge-red' : 'badge-muted';
      var time = e.occurred_at ? new Date(e.occurred_at).toLocaleTimeString() : '';
      return '<div style="padding:8px;border-bottom:1px solid var(--jm-border);font-size:13px;display:flex;justify-content:space-between;gap:8px">'
        + '<span><span class="badge ' + badge + '">' + JM.esc(e.event_type || '') + '</span></span>'
        + '<span style="color:var(--jm-text-muted);font-size:11px">' + JM.esc(time) + '</span>'
        + '</div>';
    }).join('');
  }
});
