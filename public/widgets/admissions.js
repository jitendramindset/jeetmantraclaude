/* widgets/admissions.js — recent EduOS admissions counter. */
EduOSWidgets.register({
  id: 'admissions', title: 'Admissions',
  roles: EduOSWidgets._lib.ORG_ADMIN, capability: 'admissions.manage',
  category: 'ops', size: 'small', priority: 32,
  aiTriggers: ['admissions', 'new admissions', 'enrollment intake'],
  dataSource: function () { return EduOSWidgets._lib.api('/eduos/admissions'); },
  render: function (d) {
    var L = EduOSWidgets._lib, a = L.listOf(d, 'admissions', 'items');
    return '<div class="wg-big">' + a.length + '</div>'
      + '<div class="wg-sub">recent admissions · <a class="wg-link" href="dashboard.html#admissions">Manage →</a></div>';
  }
});
