/* widgets/revenue.js — total completed payments (creators). */
EduOSWidgets.register({
  id: 'revenue', title: 'Revenue',
  roles: EduOSWidgets._lib.CREATOR.concat(['institute_owner']), capability: 'payment.read',
  category: 'finance', size: 'medium', priority: 30,
  aiTriggers: ['revenue', 'earnings', 'income', 'show revenue'],
  dataSource: function () { return EduOSWidgets._lib.api('/teacher/payments'); },
  render: function (d) {
    var L = EduOSWidgets._lib, p = L.listOf(d, 'payments');
    var done = p.filter(function (x) { return x.status === 'completed'; });
    var total = done.reduce(function (s, x) { return s + (Number(x.amount) || 0); }, 0);
    return '<div class="wg-big">' + L.fmtMoney((d && d.total) || total) + '</div>'
      + '<div class="wg-sub">' + done.length + ' completed payment' + (done.length !== 1 ? 's' : '') + '</div>'
      + '<a class="wg-link" href="dashboard.html#payments">View payouts →</a>';
  }
});
