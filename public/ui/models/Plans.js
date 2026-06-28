/* ui/models/Plans.js — SaaS plans + the user's current subscription. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Plans = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var H = { headers: { Authorization: 'Bearer ' + t } };
    var safe = function (p) { return p.then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); };
    var results = await Promise.all([
      safe(fetch('/api/wallet/plans', H)),
      safe(fetch('/api/wallet/subscription', H))
    ]);
    var plans = (results[0] && results[0].plans) || [];
    var current = results[1] && results[1].subscription;
    return { plans: plans, current: current };
  }
};
