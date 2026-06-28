/* ui/models/LiveRoster.js — attendees for a live class (teacher view).
   ctx must include classId; the inline caller previously set _modalCtx={classId}. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.LiveRoster = {
  fetch: async function (ctx) {
    var classId = ctx && ctx.classId;
    if (!classId) return { class: null, attendees: [] };
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/live-classes/' + encodeURIComponent(classId) + '/attendees', {
      headers: { Authorization: 'Bearer ' + t }
    });
    if (!r.ok) throw new Error('Roster HTTP ' + r.status);
    var j = await r.json();
    return { class: j.class || null, attendees: j.attendees || [] };
  }
};
