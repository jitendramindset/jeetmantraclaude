/* ui/models/TestAnalytics.js — per-test pass-rate distribution + per-question stats.
   ctx.testId required. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.TestAnalytics = {
  fetch: async function (ctx) {
    var testId = ctx && ctx.testId;
    if (!testId) return { test: null, score_distribution: [], per_question: [], totalAttempts: 0, mean_score: 0 };
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/teacher/tests/' + encodeURIComponent(testId) + '/analytics', {
      headers: { Authorization: 'Bearer ' + t }
    });
    if (!r.ok) throw new Error('Analytics HTTP ' + r.status);
    var j = await r.json();
    return {
      test: j.test || null,
      score_distribution: j.score_distribution || [],
      per_question: j.per_question || [],
      totalAttempts: j.totalAttempts || 0,
      mean_score: j.mean_score || 0
    };
  }
};
