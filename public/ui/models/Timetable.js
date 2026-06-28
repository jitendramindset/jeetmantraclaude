/* ui/models/Timetable.js — week of upcoming live classes / assignments / tests.
   ctx.weekOffset (default 0): -1 = last week, +1 = next week.
   Returns {events, weekStart, weekEnd, byDay, days}. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Timetable = {
  fetch: async function (ctx) {
    var offset = (ctx && Number(ctx.weekOffset)) || 0;
    var t = localStorage.getItem('jm_token');
    var start = new Date(); var dow = start.getDay();
    start.setDate(start.getDate() - dow + (offset * 7));
    start.setHours(0, 0, 0, 0);
    var end = new Date(start); end.setDate(end.getDate() + 7);
    var days = Array.from({ length: 7 }, function (_, i) {
      var d = new Date(start); d.setDate(d.getDate() + i); return d;
    });
    var byDay = {}; days.forEach(function (d) { byDay[d.toDateString()] = []; });
    var events = [];
    try {
      var r = await fetch('/api/teacher/timetable?from=' + start.toISOString() + '&to=' + end.toISOString(),
        { headers: { Authorization: 'Bearer ' + t } });
      if (r.ok) { var j = await r.json(); events = j.events || []; }
    } catch (_) { /* empty week on failure */ }
    events.forEach(function (e) {
      var k = new Date(e.start).toDateString();
      if (byDay[k]) byDay[k].push(e);
    });
    return { events: events, weekStart: start, weekEnd: end, byDay: byDay, days: days, offset: offset };
  }
};
