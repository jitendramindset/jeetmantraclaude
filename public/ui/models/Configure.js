/* ui/models/Configure.js — no pre-fetch; _renderConfigurePage() fetches all data lazily in afterMount. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Configure = {
  fetch: async function () { return {}; }
};
