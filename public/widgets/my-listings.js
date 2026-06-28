/* widgets/my-listings.js — marketplace listings owned by the caller. */
EduOSWidgets.register({
  id: 'my-listings', title: 'Marketplace Sales',
  roles: EduOSWidgets._lib.SELLERS,
  category: 'finance', size: 'small', priority: 38,
  aiTriggers: ['my listings', 'marketplace sales', 'my sales'],
  dataSource: function () { return EduOSWidgets._lib.api('/marketplace/my/listings'); },
  render: function (d) {
    var L = EduOSWidgets._lib, l = L.listOf(d, 'listings');
    if (!l.length) return L.empty('No listings yet — turn a course into income.', { label: '🛒 List a course', onclick: "location.hash='#/m/marketplace'" });
    var active = l.filter(function (x) { return x.status === 'active' || !x.status; }).length;
    return '<div class="wg-big">' + l.length + '</div>'
      + '<div class="wg-sub">listing' + (l.length !== 1 ? 's' : '') + ' · ' + active + ' active</div>'
      + '<a class="wg-link" href="marketplace.html">Manage listings →</a>';
  }
});
