/**
 * ui/screens/Configure.js — Course editor takeover (via #configurePage / #cfg-body).
 * Replaces inline openConfigure(courseId). The full render engine (_renderConfigurePage
 * and all its tab/topic/assignment/RAG helpers) stays in dashboard.html — it's ~500 lines
 * of complex async DOM manipulation. afterMount delegates to it, passing ctx.courseId.
 *
 * Context: { courseId: string }
 * Usage:   JM.Screens.open('configure', { courseId: '...' })
 *          openConfigure(courseId)  →  delegator below
 */
JM.Screens.register({
  id: 'configure',
  title: '⚙️ Configure Course',
  surface: 'takeover',
  pageId: 'configurePage',
  bodyId: 'cfg-body',
  crumbId: 'cfg-crumb-title',
  model: JM.Models.Configure,
  render: function () {
    return '<div style="text-align:center;padding:40px;color:#888">Loading course…</div>';
  },
  afterMount: function (d, ctx) {
    // Store courseId globally so closeConfigurePage() can clear it and
    // _reopenConfigure() can access it without extra state threading.
    var courseId = ctx && ctx.courseId;
    if (!courseId) return;
    window._cfgCourseId = courseId;
    if (typeof window._renderConfigurePage === 'function') {
      window._renderConfigurePage(courseId);
    }
  }
});
