/* widgets/pending-eval.js — essays awaiting teacher grading. */
EduOSWidgets.register({
  id: 'pending-eval', title: 'Pending Evaluation',
  roles: EduOSWidgets._lib.TEACHING, capability: 'assignment.grade',
  category: 'teaching', size: 'small', priority: 22,
  aiTriggers: ['pending evaluation', 'grade', 'essays to grade'],
  dataSource: function () { return EduOSWidgets._lib.api('/teacher/essays/pending'); },
  render: function (d) {
    var L = EduOSWidgets._lib, it = L.listOf(d, 'items', 'essays');
    if (!it.length) return L.empty('Inbox zero — nothing to grade.', { label: '📝 Create an assignment', onclick: "if(typeof openAssignmentEditor==='function')openAssignmentEditor();else location.hash='#/m/tests'" });
    return '<div class="wg-big">' + it.length + '</div><div class="wg-sub">submissions awaiting your grade</div>'
      + '<a class="wg-link" href="dashboard.html#grade">Open grading →</a>';
  }
});
