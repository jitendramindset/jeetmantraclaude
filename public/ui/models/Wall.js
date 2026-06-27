/* ui/models/Wall.js — activity feed for a scope (own activity or per-course).
   ctx.scope: 'course' → /activity/course/{id}; anything else → /activity/me. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Wall = {
  fetch: async function (ctx) {
    var t = localStorage.getItem('jm_token');
    var path = (ctx && ctx.scope === 'course' && ctx.id)
      ? '/api/activity/course/' + encodeURIComponent(ctx.id)
      : '/api/activity/me';
    var r = await fetch(path, { headers: { Authorization: 'Bearer ' + t } });
    if (!r.ok) throw new Error('Wall HTTP ' + r.status);
    var j = await r.json();
    return { feed: j.feed || [] };
  }
};
