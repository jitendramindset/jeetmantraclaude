/* ui/models/Coupons.js — teacher's discount coupons + (window-injected) course list for the picker. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Coupons = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var coupons = [];
    try {
      var r = await fetch('/api/payments/coupons', { headers: { Authorization: 'Bearer ' + t } });
      if (r.ok) { var j = await r.json(); coupons = j.coupons || []; }
    } catch (_) { /* swallow — render empty list */ }
    // Course list for the picker — dashboard.html stashes _teacherCourses globally.
    var courses = (window._teacherCourses || []).map(function (c) {
      return { id: c.id, title: c.title || 'Course' };
    });
    return { coupons: coupons, courses: courses };
  }
};
