/**
 * ui/screens/QuestionBank.js — Saved question bank (modal).
 * Replaces openQuestionBank(). Helpers that stay in dashboard.html:
 * _qbRenderList(), _qbShowCreate(), _qbTypeChange(), _qbSave(),
 * _qbDelete(), _qbAttach(), _qbLoadTests(), _qbDoAttach() —
 * all write to #qb-body and call _qbRenderList() to refresh.
 * afterMount calls _qbRenderList() to do the initial fetch+render.
 */
JM.Screens.register({
  id: 'question-bank',
  title: '📚 Question Bank',
  surface: 'modal',
  model: JM.Models.QuestionBank,
  render: function () {
    return '<div id="qb-body"><div style="text-align:center;padding:30px;color:#888">Loading…</div></div>';
  },
  afterMount: function () {
    if (typeof window._qbRenderList === 'function') window._qbRenderList();
  }
});
