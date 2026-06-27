/* ui/models/AiKey.js — AI key + today's usage (two parallel endpoints). */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.AiKey = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var H = { headers: { Authorization: 'Bearer ' + t } };
    var safe = function (p) { return p.then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }); };
    var results = await Promise.all([
      safe(fetch('/api/ai/key', H)),
      safe(fetch('/api/ai/usage', H))
    ]);
    var status = results[0] || {}; var usage = results[1] || {};
    return {
      hasKey: !!status.hasKey,
      provider: status.provider || '',
      todayCalls: usage.todayCalls || 0,
      freeLimit: usage.freeLimit || 5
    };
  }
};
