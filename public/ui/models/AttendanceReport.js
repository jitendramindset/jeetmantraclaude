/* ui/models/AttendanceReport.js — student attendance report (overall + per-course). */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.AttendanceReport = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/student/attendance-report', { headers: { Authorization: 'Bearer ' + t } });
    if (!r.ok) throw new Error('Attendance HTTP ' + r.status);
    var j = await r.json();
    return { report: j.report || [], overall: j.overall || {} };
  }
};
