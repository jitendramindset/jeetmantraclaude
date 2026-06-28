/* ui/models/CourseChat.js — fetches the chat room for a course. ctx: { courseId } */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.CourseChat = {
  fetch: async function (ctx) {
    var courseId = ctx && ctx.courseId;
    if (!courseId) return { room: null };
    var r = await api('/chat/rooms/course/' + courseId, 'GET');
    return { room: r.room || null };
  }
};
