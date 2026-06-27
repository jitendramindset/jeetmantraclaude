/* widgets/assignments-due.js — student's pending assignments. */
EduOSWidgets.register({
  id: 'assignments-due', title: 'Assignments Due', roles: ['student'],
  category: 'learning', size: 'small', priority: 20,
  aiTriggers: ['assignments', 'homework', 'due'],
  dataSource: function () { return EduOSWidgets._lib.api('/assignments/my'); },
  render: function (d) {
    var L = EduOSWidgets._lib, a = L.listOf(d, 'assignments').filter(function (x) { return !x.submitted && !x.submission; });
    if (!a.length) return L.empty('All caught up 🎉');
    return a.slice(0, 5).map(function (x) {
      return '<div class="wg-row"><span class="wg-row-t">' + L.esc(x.title || 'Assignment') + '</span>'
        + '<span class="wg-row-x">' + (x.due_date ? L.when(x.due_date) : '') + '</span></div>';
    }).join('');
  }
});
