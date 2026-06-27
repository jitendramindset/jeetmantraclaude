/* ui/models/Certificates.js — earned-certificate list. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Certificates = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/certificates/my', { headers: { Authorization: 'Bearer ' + t } });
    if (!r.ok) throw new Error('Certificates HTTP ' + r.status);
    var j = await r.json();
    return { certificates: j.certificates || [] };
  }
};
