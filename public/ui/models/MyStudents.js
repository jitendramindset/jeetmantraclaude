/* ui/models/MyStudents.js — merge roster across the teacher's courses, sorted by best progress. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.MyStudents = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var courses = window._teacherCourses || [];
    if (!courses.length) return { courses: [], students: [] };
    var byStudent = {};
    await Promise.all(courses.map(async function (c) {
      try {
        var r = await fetch('/api/courses/' + c.id + '/students', { headers: { Authorization: 'Bearer ' + t } });
        if (!r.ok) return;
        var j = await r.json();
        (j.students || []).forEach(function (s) {
          var k = s.student_id || s.email;
          if (!byStudent[k]) byStudent[k] = { name: s.full_name, email: s.email, courses: [], bestPct: 0 };
          byStudent[k].courses.push(c.title);
          byStudent[k].bestPct = Math.max(byStudent[k].bestPct, s.progress_percentage || 0);
        });
      } catch (e) { /* ignore single-course failures */ }
    }));
    var list = Object.values(byStudent).sort(function (a, b) { return b.bestPct - a.bestPct; });
    return { courses: courses, students: list };
  }
};
