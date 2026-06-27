/* ui/models/Profile.js — user's own profile (editable). */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Profile = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/users/profile', { headers: { Authorization: 'Bearer ' + t } });
    if (!r.ok) throw new Error('Profile HTTP ' + r.status);
    var j = await r.json();
    return j.user || j || {};
  }
};
