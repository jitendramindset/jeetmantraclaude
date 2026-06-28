/* ui/models/ProctorEvents.js — fetches proctoring events for a session. ctx: { sessionId } */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.ProctorEvents = {
  fetch: async function (ctx) {
    var sessionId = ctx && ctx.sessionId;
    if (!sessionId) return { events: [] };
    var r = await api('/course-content/sessions/' + sessionId + '/proctor-events', 'GET');
    return { events: r.events || [] };
  }
};
