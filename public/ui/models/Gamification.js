/* ui/models/Gamification.js — streak / XP / badges (3 concurrent endpoints, each best-effort). */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Gamification = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var H = { headers: { Authorization: 'Bearer ' + t } };
    var safe = function (p) { return p.then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); };
    var results = await Promise.all([
      safe(fetch('/api/gamification/streak', H)),
      safe(fetch('/api/gamification/xp', H)),
      safe(fetch('/api/gamification/badges', H))
    ]);
    var s = results[0] || {}; var xp = results[1] || {}; var b = results[2] || {};
    return {
      streak: s.streak || { current_streak: 0, longest_streak: 0 },
      xp: { total: xp.total || 0, level: xp.level || 1, nextLevelAt: xp.nextLevelAt || 100 },
      badges: b.badges || [],
      earnedCount: b.earnedCount || 0,
      totalCount: b.totalCount || 0
    };
  }
};
