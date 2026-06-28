/* ui/models/QuestionBank.js — no pre-fetch; _qbRenderList() fetches lazily in afterMount. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.QuestionBank = {
  fetch: async function () { return {}; }
};
