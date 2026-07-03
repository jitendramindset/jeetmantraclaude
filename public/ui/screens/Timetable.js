/**
 * ui/screens/Timetable.js — teacher's 7-day timetable (live classes + assignments + tests).
 * Replaces inline openTimetable(weekOffset); navigation re-opens with new offset (no global state).
 */
JM.Screens.register({
  id: 'timetable',
  title: '🗓 Timetable',
  surface: 'modal',
  model: JM.Models.Timetable,
  render: function (d) {
    var ICON = { live: '📡', assignment: '📝', test: '✏️' };
    var DOWS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var nav = '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;margin-bottom:14px">'
      + JM.Button({ label: '← Prev', kind: 'ghost', size: 'sm', onClick: "openTimetable(" + (d.offset - 1) + ")" })
      + '<div style="font-weight:700;flex:1;text-align:center;min-width:0">' + d.weekStart.toLocaleDateString() + ' — ' + new Date(d.weekEnd - 1).toLocaleDateString() + '</div>'
      + '<div style="display:flex;gap:6px">'
      +   JM.Button({ label: 'Today', kind: 'ghost', size: 'sm', onClick: "openTimetable(0)" })
      +   JM.Button({ label: 'Next →', kind: 'ghost', size: 'sm', onClick: "openTimetable(" + (d.offset + 1) + ")" })
      + '</div>'
      + '</div>'
      + '<div style="font-size:11px;color:var(--jm-text-muted);margin-bottom:10px">' + d.events.length + ' total events this week</div>';
    var rows = d.days.map(function (day) {
      var k = day.toDateString();
      var items = d.byDay[k] || [];
      var isToday = day.toDateString() === new Date().toDateString();
      var head = '<div style="font-weight:700;font-size:13px;padding:6px 10px;background:'
        + (isToday ? 'var(--jm-primary-tint,rgba(124,58,237,.16))' : 'var(--jm-surface-2,var(--jm-surface-2,#f3f4f6))')
        + ';border-radius:6px">' + DOWS[day.getDay()] + ' · ' + day.toLocaleDateString()
        + (isToday ? ' · Today' : '') + '</div>';
      var body = items.length
        ? items.map(function (e) {
            var time = new Date(e.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            var meta = time + (e.duration ? ' · ' + e.duration + ' min' : '') + (e.course_title ? ' · ' + JM.esc(e.course_title) : '');
            var kind = e.type === 'live' ? 'info' : e.type === 'assignment' ? 'warn' : 'success';
            return '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;padding:8px 12px;border-bottom:1px solid var(--jm-border);align-items:center;gap:6px">'
              + '<div style="min-width:0;flex:1"><div>' + (ICON[e.type] || '•') + ' <strong>' + JM.esc(e.title) + '</strong></div>'
              +   '<div style="font-size:11px;color:var(--jm-text-muted)">' + meta + '</div>'
              + '</div>'
              + JM.Badge({ text: e.type + (e.status ? ' ' + e.status : ''), kind: kind })
              + '</div>';
          }).join('')
        : '<div style="padding:8px 12px;color:var(--jm-text-muted);font-size:12px">Nothing scheduled.</div>';
      return '<div style="margin-bottom:14px">' + head + body + '</div>';
    }).join('');
    return JM.ModalShell({ body: nav + rows });
  }
});
