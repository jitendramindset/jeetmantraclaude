/* ui/models/Downloads.js — IndexedDB-backed offline course library + online flag. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Downloads = {
  fetch: async function () {
    var list = [];
    if (typeof window._idbAll === 'function') { try { list = await window._idbAll(); } catch (e) {} }
    return { courses: list, online: navigator.onLine };
  }
};
