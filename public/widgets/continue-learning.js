/* widgets/continue-learning.js — resume in-progress courses (student). */
EduOSWidgets.register({
  id: 'continue-learning', title: 'Continue Learning', roles: ['student'],
  category: 'learning', size: 'medium', priority: 15,
  aiTriggers: ['continue learning', 'resume', 'my courses'],
  dataSource: function () { return EduOSWidgets._lib.api('/student/continue-learning'); },
  render: function (d) {
    var L = EduOSWidgets._lib, it = L.listOf(d, 'items');
    if (!it.length) return L.empty('No courses in progress yet.', { label: '🛒 Browse marketplace', onclick: "location.hash='#/m/marketplace'" });
    return it.slice(0, 4).map(function (c) {
      return '<a class="wg-row" href="dashboard.html"><span class="wg-row-t">' + L.esc(c.title || c.course_title || c.course_id)
        + '</span><span class="wg-bar"><i style="width:' + L.pct(c.progress) + '%"></i></span>'
        + '<span class="wg-row-x">' + L.pct(c.progress) + '%</span></a>';
    }).join('');
  }
});
