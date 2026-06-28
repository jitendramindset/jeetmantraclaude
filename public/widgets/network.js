/* widgets/network.js — partner/franchise branch network shortcut. */
EduOSWidgets.register({
  id: 'network', title: 'Network', roles: ['partner', 'franchise'],
  category: 'finance', size: 'small', priority: 36,
  aiTriggers: ['network', 'branches', 'franchise'],
  render: function () {
    return '<div class="wg-sub">Track branches, network revenue and per-branch KPIs.</div>'
      + '<a class="wg-action" style="margin-top:10px" href="dashboard.html#network">🌐 Open network</a>';
  }
});
