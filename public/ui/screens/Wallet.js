/**
 * ui/screens/Wallet.js — Wallet screen. Pure composition of atoms + molecules.
 * MVC: Model = JM.Models.Wallet  ·  Controller = JM.Controllers.Wallet  ·  View = render
 */
JM.Screens.register({
  id: 'wallet',
  title: '💳 My Wallet',
  model: JM.Models.Wallet,
  render: function (d, ctx) {
    var kpis = JM.KPIGrid([
      { label: 'Balance', value: '₹' + d.balance.toLocaleString('en-IN'), sub: 'Available', accent: 'var(--jm-primary,#7c3aed)' },
      { label: 'Referral code', value: d.referralCode || '—', sub: 'Share to earn ₹100', accent: '#f59e0b' },
      { label: 'Transactions', value: d.txCount30, sub: 'Last 30 days', accent: '#06b6d4' }
    ]);
    var actions = JM.ActionToolbar({
      max: 3,
      actions: [
        { label: '+₹100',  kind: 'ghost', onClick: "JM.Screens.action('wallet.topup',100)" },
        { label: '+₹500',  kind: 'ghost', onClick: "JM.Screens.action('wallet.topup',500)" },
        { label: '+₹1000', kind: 'ghost', onClick: "JM.Screens.action('wallet.topup',1000)" },
        { label: '+₹2000', kind: 'ghost', onClick: "JM.Screens.action('wallet.topup',2000)" },
        { label: '+₹5000', kind: 'ghost', onClick: "JM.Screens.action('wallet.topup',5000)" },
        { label: 'Custom amount', kind: 'primary', onClick: "JM.Screens.action('wallet.topup')" }
      ]
    });
    var rows = (d.transactions || []).slice(0, 8).map(function (t) {
      return {
        title: t.description || t.type || 'Transaction',
        sub: t.created_at ? new Date(t.created_at).toLocaleString('en-IN') : '',
        right: (t.amount < 0 ? '-' : '+') + '₹' + Math.abs(Number(t.amount || 0)).toLocaleString('en-IN')
      };
    });
    var list = JM.ListSection({
      title: 'Recent transactions',
      items: rows,
      empty: { icon: '💸', title: 'No transactions yet',
        msg: 'Top up your wallet to unlock paid course purchases & faster checkout.',
        cta: { label: '💳 Top up wallet', onClick: "JM.Screens.action('wallet.topup')" } }
    });
    return JM.ModalShell({
      body: kpis + JM.SectionHeader({ title: 'Add money' }) + actions + list
    });
  }
});
