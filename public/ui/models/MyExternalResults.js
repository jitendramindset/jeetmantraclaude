/* ui/models/MyExternalResults.js — exam + bhasha-setu results stored locally by external apps. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.MyExternalResults = {
  fetch: async function () {
    var exams = [], bhasha = [];
    try { exams = JSON.parse(localStorage.getItem('jm_exam_results') || '[]'); } catch (_) {}
    try { bhasha = JSON.parse(localStorage.getItem('jm_bhasha_progress') || '[]'); } catch (_) {}
    return {
      exams: Array.isArray(exams) ? exams : [],
      bhasha: Array.isArray(bhasha) ? bhasha : []
    };
  }
};
