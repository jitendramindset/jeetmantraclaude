/* widgets/weak-students.js — analytics shortcut for low-progress students. */
EduOSWidgets.register({
  id: 'weak-students', title: 'Students Needing Help',
  roles: EduOSWidgets._lib.TEACHING, capability: 'analytics.read',
  category: 'teaching', size: 'small', priority: 28,
  aiTriggers: ['weak students', 'at risk', 'students needing help'],
  render: function () {
    return '<div class="wg-sub">Spot low-progress / low-attendance students from course analytics.</div>'
      + '<a class="wg-action" style="margin-top:10px" href="dashboard.html#analytics">📉 Open analytics</a>';
  }
});
