/* ui/models/RagTrainer.js — no pre-fetch; ragRefresh() fetches lazily in afterMount. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.RagTrainer = {
  fetch: async function () { return {}; }
};
