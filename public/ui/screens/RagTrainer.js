/**
 * ui/screens/RagTrainer.js — Train Course AI modal.
 * Replaces openRagTrainer(courseId). Helpers ragRefresh(), ragIndexText(),
 * ragClear() stay in dashboard.html — they write directly to #rag-body and
 * call ragRefresh(courseId) to refresh. afterMount calls ragRefresh(courseId).
 * ctx: { courseId }
 */
JM.Screens.register({
  id: 'rag-trainer',
  title: '🧠 Train Course AI',
  surface: 'modal',
  model: JM.Models.RagTrainer,
  render: function () {
    return '<div id="rag-body"><div style="color:var(--jm-text-muted)">Loading index status…</div></div>';
  },
  afterMount: function (d, ctx) {
    var courseId = ctx && ctx.courseId;
    if (!courseId) return;
    if (typeof window.ragRefresh === 'function') window.ragRefresh(courseId);
  }
});
