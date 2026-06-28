/* ui/models/Submissions.js — assignment submission list. ctx.assignmentId required. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Submissions = {
  fetch: async function (ctx) {
    var aid = ctx && ctx.assignmentId;
    if (!aid) return { submissions: [] };
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/assignments/' + encodeURIComponent(aid) + '/submissions', {
      headers: { Authorization: 'Bearer ' + t }
    });
    if (!r.ok) throw new Error('Submissions HTTP ' + r.status);
    var j = await r.json();
    return { submissions: j.submissions || [] };
  }
};
