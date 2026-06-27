/* ui/models/MyInstitutions.js — fetch institution memberships for the current user. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.MyInstitutions = {
  fetch: async function () {
    var r = await api('/institutions/my-institutions', 'GET');
    return {
      institutions: r.institutions || r.links || [],
      active: localStorage.getItem('jm_active_institution') || ''
    };
  }
};
