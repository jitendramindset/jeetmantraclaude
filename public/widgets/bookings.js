/* widgets/bookings.js — sports/yoga/dance/music academy bookings. */
EduOSWidgets.register({
  id: 'bookings', title: 'Bookings',
  roles: EduOSWidgets._lib.SPORTS, capability: 'booking.manage',
  category: 'ops', size: 'medium', priority: 30,
  aiTriggers: ['bookings', 'court bookings', 'slot bookings'],
  dataSource: function () { return EduOSWidgets._lib.api('/bookings/received'); },
  render: function (d) {
    var L = EduOSWidgets._lib, b = L.listOf(d, 'bookings', 'items');
    if (!b.length) return L.empty('No bookings yet.', { label: '📅 Book a resource', onclick: "location.hash='#bookings'" });
    return b.slice(0, 5).map(function (x) {
      return '<div class="wg-row"><span class="wg-row-t">' + L.esc((x.resource && x.resource.title) || x.resource_type || 'Booking') + '</span>'
        + '<span class="wg-row-x">' + L.when(x.start_at) + '</span></div>';
    }).join('');
  }
});
