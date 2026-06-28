/* ui/models/Wizard.js — no pre-fetch; wizard state is in window._wiz, renderWizard() draws steps. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Wizard = {
  fetch: async function () { return {}; }
};
