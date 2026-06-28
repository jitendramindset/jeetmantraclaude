/* ui/models/EssayInbox.js — pending essay submissions awaiting teacher grading. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.EssayInbox = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/teacher/essays/pending', { headers: { Authorization: 'Bearer ' + t } });
    if (!r.ok) throw new Error('Essays HTTP ' + r.status);
    var j = await r.json();
    return { items: j.items || [] };
  }
};
