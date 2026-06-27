/* ui/models/AttendanceLog.js — per-course attendance log. Caller passes ctx.courseId. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.AttendanceLog = {
  fetch: async function (ctx) {
    var courseId = ctx && ctx.courseId;
    if (!courseId) return { summary: {}, log: [] };
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/attendance/log/' + encodeURIComponent(courseId), {
      headers: { Authorization: 'Bearer ' + t }
    });
    if (!r.ok) throw new Error('Attendance HTTP ' + r.status);
    var j = await r.json();
    return { summary: j.summary || {}, log: j.log || [] };
  }
};
