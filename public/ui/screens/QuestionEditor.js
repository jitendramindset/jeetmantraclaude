/**
 * ui/screens/QuestionEditor.js — Question Editor modal (📝 Questions).
 * Replaces openQuestionEditor(testId, testTitle). All helpers stay in dashboard.html:
 * _renderQuestionEditor, _renderQeSectionsBar, _renderQeRow, _renderQeAddForm,
 * qeBindType, qeSelectType, qeUploadImage, qeAdd, qeAddSection, qeDelSection,
 * qeSaveToBank, qeOpenBank, qeCopyFromBank, qeDeleteBank, qeAiSuggest,
 * qeOpenSettings — they write to #qe-body and call _renderQuestionEditor() to refresh.
 * afterMount sets window globals _qeTestId/_qeCourseId then fires _renderQuestionEditor().
 * ctx: { testId, testTitle, courseId? }
 */
JM.Screens.register({
  id: 'question-editor',
  title: '📝 Questions',
  surface: 'modal',
  model: JM.Models.QuestionEditor,
  render: function () {
    return '<div id="qe-body" style="min-height:200px"><div style="text-align:center;padding:30px;color:#888">Loading questions…</div></div>';
  },
  afterMount: function (d, ctx) {
    var testId = ctx && ctx.testId;
    if (!testId) return;
    // Set globals the helpers read
    window._qeTestId = testId;
    window._qeCourseId = (ctx && ctx.courseId) || window._cfgCourseId || null;
    // Resolve courseId from the test row if not supplied (mirrors original code path)
    if (!window._qeCourseId) {
      api('/course-content/tests/' + testId, 'GET').catch(function () { return null; }).then(function (r) {
        window._qeCourseId = (r && r.test && r.test.course_id) || null;
      });
    }
    // Update the modal title with the specific test name.
    var testTitle = (ctx && ctx.testTitle) || 'Test';
    var h3 = document.querySelector('#jm-generic-modal h3');
    if (h3) h3.textContent = '📝 Questions: ' + testTitle;
    if (typeof window._renderQuestionEditor === 'function') window._renderQuestionEditor();
  }
});
