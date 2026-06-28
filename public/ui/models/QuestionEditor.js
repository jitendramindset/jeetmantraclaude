/* ui/models/QuestionEditor.js — no pre-fetch; _renderQuestionEditor() fetches lazily in afterMount. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.QuestionEditor = {
  fetch: async function () { return {}; }
};
