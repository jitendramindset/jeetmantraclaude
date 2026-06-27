/* widgets/my-courses.js — courses owned by the caller. */
EduOSWidgets.register({
  id: 'my-courses', title: 'My Courses',
  roles: EduOSWidgets._lib.CREATOR, capability: 'course.edit',
  category: 'teaching', size: 'medium', priority: 18,
  aiTriggers: ['my courses', 'manage courses', 'course list'],
  dataSource: function () { return EduOSWidgets._lib.api('/courses?mine=1'); },
  render: function (d) {
    var L = EduOSWidgets._lib, c = L.listOf(d, 'courses');
    if (!c.length) return L.empty('No courses yet — create your first.', { label: '➕ Create a course', onclick: "if(typeof openCourseCreator==='function')openCourseCreator();else location.hash='#create'" });
    var rows = c.slice(0, 4).map(function (x) {
      return '<a class="wg-row" href="dashboard.html#course"><span class="wg-row-t">' + L.esc(x.title || 'Course') + '</span>'
        + '<span class="wg-row-x">' + (x.is_active === false ? 'draft' : (x.category || '')) + '</span></a>';
    }).join('');
    return rows + (c.length > 4 ? '<a class="wg-link" href="dashboard.html#courses">+' + (c.length - 4) + ' more →</a>' : '');
  }
});
