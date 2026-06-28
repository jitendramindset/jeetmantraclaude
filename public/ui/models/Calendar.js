/* ui/models/Calendar.js — no pre-fetch; _renderCalendar() fetches lazily in afterMount. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Calendar = {
  fetch: async function () { return {}; }
};
