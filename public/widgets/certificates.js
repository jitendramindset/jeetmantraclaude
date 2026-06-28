/* widgets/certificates.js — earned certificates count + last 3. */
EduOSWidgets.register({
  id: 'certificates', title: 'My Certificates', roles: ['student'],
  category: 'learning', size: 'small', priority: 55,
  aiTriggers: ['certificates', 'my certificates'],
  dataSource: function () { return EduOSWidgets._lib.api('/certificates/my'); },
  render: function (d) {
    var L = EduOSWidgets._lib, c = L.listOf(d, 'certificates');
    if (!c.length) return L.empty('Earn your first certificate by completing a course.', { label: '📚 Resume learning', onclick: "location.hash='#/m/marketplace'" });
    return '<div class="wg-big">' + c.length + '</div><div class="wg-sub">earned</div>'
      + c.slice(0, 3).map(function (x) {
        return '<div class="wg-row"><span class="wg-row-t">' + L.esc(x.course_title || x.title || 'Certificate') + '</span></div>';
      }).join('');
  }
});
