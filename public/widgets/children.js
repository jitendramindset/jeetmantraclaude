/* widgets/children.js — linked children for the parent role. */
EduOSWidgets.register({
  id: 'children', title: 'My Children', roles: ['parent'],
  category: 'learning', size: 'medium', priority: 12,
  aiTriggers: ['my children', 'my child', 'kids'],
  dataSource: function () { return EduOSWidgets._lib.api('/parent/children'); },
  render: function (d) {
    var L = EduOSWidgets._lib, ch = L.listOf(d, 'children', 'students', 'items');
    if (!ch.length) return L.empty('Link a child to see their progress.', { label: '👪 Link child', onclick: "location.hash='#link-child'" });
    return ch.slice(0, 4).map(function (c) {
      return '<a class="wg-row" href="dashboard.html#child"><span class="wg-row-t">' + L.esc(c.full_name || c.name || 'Child') + '</span>'
        + '<span class="wg-row-x">' + (c.class || c.grade || '') + '</span></a>';
    }).join('');
  }
});
