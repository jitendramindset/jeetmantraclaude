/* ui/models/Billing.js — fetch invoice list + summary for the billing takeover. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Billing = {
  fetch: async function () {
    var r = await api('/teacher/invoices', 'GET');
    return { summary: r.summary || {}, invoices: r.invoices || [] };
  }
};
