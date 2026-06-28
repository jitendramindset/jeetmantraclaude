/* ui/models/StudentDetail.js — per-student deep-dive (progress, assignments, tests, activity, doubts).
   ctx.courseId + ctx.studentId required. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.StudentDetail = {
  fetch: async function (ctx) {
    var cid = ctx && ctx.courseId;
    var sid = ctx && ctx.studentId;
    if (!cid || !sid) return { student: {}, progress: {}, assignments: [], tests: [], activity: [], doubts: [] };
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/courses/' + encodeURIComponent(cid) + '/students/' + encodeURIComponent(sid) + '/detail',
      { headers: { Authorization: 'Bearer ' + t } });
    if (!r.ok) throw new Error('Student detail HTTP ' + r.status);
    var j = await r.json();
    return {
      student: j.student || {},
      progress: j.progress || {},
      assignments: j.assignments || [],
      tests: j.tests || [],
      activity: j.activity || [],
      doubts: j.doubts || []
    };
  }
};
