/* ui/models/Analytics.js — aggregate analytics across the teacher's courses. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Analytics = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var courses = window._teacherCourses || [];
    if (!courses.length) return { courses: [], totals: { students: 0, revenue: 0, avgCompletion: 0 }, perCourse: [] };
    var perCourse = [];
    var totStudents = 0, totRevenue = 0, pctSum = 0, pctCount = 0;
    await Promise.all(courses.map(async function (c) {
      try {
        var r = await fetch('/api/courses/' + c.id + '/analytics', { headers: { Authorization: 'Bearer ' + t } });
        var a = r.ok ? await r.json() : {};
        var s = a.students || a.student_count || 0, rev = a.revenue || 0, comp = a.completion_rate || 0;
        totStudents += s; totRevenue += rev; if (s) { pctSum += comp; pctCount++; }
        perCourse.push({ title: c.title, students: s, revenue: rev, completion: comp });
      } catch (e) { perCourse.push({ title: c.title, students: 0, revenue: 0, completion: 0 }); }
    }));
    return {
      courses: courses,
      totals: { students: totStudents, revenue: totRevenue, avgCompletion: pctCount ? Math.round(pctSum / pctCount) : 0 },
      perCourse: perCourse
    };
  }
};
