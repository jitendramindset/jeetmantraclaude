/* ui/models/CrmConfig.js — reads localStorage via the global _crm() helper (dashboard.html). */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.CrmConfig = {
  fetch: async function () {
    var crm = window._crm ? window._crm() : {};
    var lastInv = Number(localStorage.getItem('jm_invoice_seq') || 28);
    return { crm: crm, lastInv: lastInv };
  }
};
