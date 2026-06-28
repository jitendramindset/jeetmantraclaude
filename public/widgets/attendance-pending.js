/* widgets/attendance-pending.js — quick attendance CTA (teachers/coaches). */
EduOSWidgets.register({
  id: 'attendance-pending', title: 'Attendance',
  roles: EduOSWidgets._lib.TEACHING, capability: 'attendance.mark',
  category: 'teaching', size: 'small', priority: 24,
  aiTriggers: ['attendance', 'take attendance', 'mark attendance'],
  render: function () {
    return '<div class="wg-sub">Mark today\'s roster across your batches.</div>'
      + '<a class="wg-action" style="margin-top:10px" href="dashboard.html#attendance">✓ Take attendance</a>';
  }
});
