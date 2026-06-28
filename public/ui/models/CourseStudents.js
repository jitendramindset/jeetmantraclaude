/* ui/models/CourseStudents.js — enrollment roster for a course. ctx: { courseId } */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.CourseStudents = {
  fetch: async function (ctx) {
    var courseId = ctx && ctx.courseId;
    if (!courseId) return { students: [], course: null };
    var r = await api('/courses/' + courseId + '/students', 'GET');
    return { students: r.students || [], course: r.course || null };
  }
};
