/* widgets/recommended.js — trending marketplace courses for students/guests. */
EduOSWidgets.register({
  id: 'recommended', title: 'Recommended', roles: ['student', 'guest'],
  category: 'learning', size: 'large', priority: 40,
  aiTriggers: ['recommended', 'trending courses'],
  dataSource: function () { return EduOSWidgets._lib.api('/marketplace/trending?limit=6'); },
  render: function (d) {
    var L = EduOSWidgets._lib, l = L.listOf(d, 'listings');
    if (!l.length) return L.empty('No recommendations yet.');
    return '<div class="wg-cards">' + l.slice(0, 6).map(function (x) {
      var c = x.courses || {};
      return '<a class="wg-mini" href="marketplace.html"><div class="wg-mini-t">' + L.esc(c.title || 'Course') + '</div>'
        + '<div class="wg-mini-x">' + (c.category || '') + ' · ' + (x.price ? L.fmtMoney(x.price) : 'Free') + '</div></a>';
    }).join('') + '</div>';
  }
});
