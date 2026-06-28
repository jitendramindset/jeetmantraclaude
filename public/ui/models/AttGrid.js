/* ui/models/AttGrid.js — no pre-fetch; renderAttGrid()/attReload() fetch lazily in afterMount. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.AttGrid = {
  fetch: async function () { return {}; }
};
