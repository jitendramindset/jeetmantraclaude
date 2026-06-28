/**
 * ui/screens/AttGrid.js — Attendance marking grid (takeover).
 * Replaces openAttGrid(courseId). Uses existing #attGridPage / #att-body DOM.
 * Helpers that stay in dashboard.html: renderAttGrid(), attReload(), attChange(),
 * attSet(), attMarkAll(), attSave(), closeAttGrid() — all write to #att-body
 * and read window._att.
 * afterMount initialises window._att and calls renderAttGrid().
 * ctx: { courseId? }
 */
JM.Screens.register({
  id: 'att-grid',
  title: '📝 Mark Attendance',
  surface: 'takeover',
  pageId: 'attGridPage',
  bodyId: 'att-body',
  crumbId: '__nope__',
  model: JM.Models.AttGrid,
  render: function () {
    return '<div style="text-align:center;padding:40px;color:#888">Loading attendance…</div>';
  },
  afterMount: function (d, ctx) {
    var courses = window._teacherCourses || [];
    if (!courses.length) {
      var body = document.getElementById('att-body');
      if (body) body.innerHTML = '<div class="card" style="max-width:600px;margin:40px auto;padding:24px;text-align:center">'
        + '<div style="font-size:48px">📚</div>'
        + '<div style="font-weight:600;margin-top:10px">No courses yet</div>'
        + '<div style="color:var(--jm-text-muted);margin-top:6px">Create a course first to mark attendance.</div>'
        + '</div>';
      return;
    }
    var today = new Date().toISOString().slice(0, 10);
    var courseId = (ctx && ctx.courseId) || courses[0].id;
    window._att = { courseId: courseId, date: today, roster: [] };
    if (typeof window.renderAttGrid === 'function') window.renderAttGrid();
  }
});
