/* widgets/fees.js — unpaid fee invoices counter. */
EduOSWidgets.register({
  id: 'fees', title: 'Fees',
  roles: EduOSWidgets._lib.ORG_ADMIN, capability: 'billing.manage',
  category: 'finance', size: 'small', priority: 34,
  aiTriggers: ['fees', 'fee invoices', 'pending fees'],
  dataSource: function () { return EduOSWidgets._lib.api('/eduos/fees/invoices'); },
  render: function (d) {
    var L = EduOSWidgets._lib, inv = L.listOf(d, 'invoices', 'items');
    var due = inv.filter(function (x) { return x.status !== 'paid'; });
    return '<div class="wg-big">' + due.length + '</div>'
      + '<div class="wg-sub">unpaid invoices · <a class="wg-link" href="dashboard.html#fees">Collect →</a></div>';
  }
});
