/* ui/models/Recordings.js — list recordings; group by course → topic. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Recordings = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/live-classes/recordings/list', { headers: { Authorization: 'Bearer ' + t } });
    if (!r.ok) throw new Error('Recordings HTTP ' + r.status);
    var j = await r.json();
    var recs = j.recordings || [];
    var byCourse = {};
    recs.forEach(function (rc) {
      var c = rc.course_title || 'Course';
      (byCourse[c] = byCourse[c] || []).push(rc);
    });
    return { recordings: recs, byCourse: byCourse };
  }
};
