/**
 * ui/screens/Wallet.js — My Wallet (takeover-page surface, matches live UX).
 * MVC: Model = JM.Models.Wallet  ·  View = render
 * Replaces inline openWallet(); back-compat preserved (legacy walletTopup/applyReferral globals).
 */
JM.Screens.register({
  id: 'wallet',
  title: '💰 My Wallet',
  crumb: 'Wallet',
  surface: 'takeover',
  model: JM.Models.Wallet,
  render: function (d) {
    var txs = d.transactions || [];
    var fmt = function (n) { return '₹' + (Number(n) || 0).toLocaleString('en-IN'); };
    var refCode = (d.referralCode && d.referralCode.code) || d.referralCode || '—';
    var quickTopups = [100, 500, 1000, 2000, 5000].map(function (a) {
      return JM.Button({ label: '+ ₹' + a, kind: 'ghost', size: 'sm', onClick: 'walletTopup(' + a + ')' });
    }).join('') + JM.Button({ label: 'Custom amount', kind: 'primary', size: 'sm', onClick: 'walletTopup(null)' });
    var rowsHtml = txs.length
      ? '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse">'
        + '<thead><tr style="font-size:11px;color:var(--jm-text-muted);text-transform:uppercase;border-bottom:1px solid var(--jm-border)">'
        +   '<th style="text-align:left;padding:10px 14px">Date</th>'
        +   '<th style="text-align:left;padding:10px 14px">Type</th>'
        +   '<th style="text-align:left;padding:10px 14px">Notes</th>'
        +   '<th style="text-align:right;padding:10px 14px">Amount</th>'
        +   '<th style="text-align:right;padding:10px 14px">Balance</th>'
        + '</tr></thead><tbody>'
        + txs.map(function (t) {
            var pos = t.amount >= 0;
            return '<tr style="border-bottom:1px solid var(--jm-border);font-size:13px">'
              + '<td style="padding:10px 14px">' + new Date(t.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) + '</td>'
              + '<td style="padding:10px 14px">' + JM.Badge({ text: t.type, kind: pos ? 'success' : 'danger' }) + '</td>'
              + '<td style="padding:10px 14px;color:var(--jm-text-muted)">' + JM.esc(t.notes || '—') + '</td>'
              + '<td style="padding:10px 14px;text-align:right;font-weight:700;color:' + (pos ? 'var(--jm-success, var(--jm-success,var(--jm-success,#16a34a)))' : 'var(--jm-danger, var(--jm-danger,#ef4444))') + '">' + (pos ? '+' : '') + fmt(t.amount) + '</td>'
              + '<td style="padding:10px 14px;text-align:right;color:var(--jm-text-muted)">' + fmt(t.balance_after || 0) + '</td>'
              + '</tr>';
          }).join('')
        + '</tbody></table></div>'
      : JM.EmptyState({
          icon: '💸', title: 'No transactions yet',
          msg: 'Top up your wallet to unlock paid course purchases & faster checkout.',
          cta: { label: '💳 Top up wallet', onClick: "if(typeof walletTopupOpen==='function')walletTopupOpen();else document.getElementById('wlTopupBtn')?.click()" }
        });

    return '<div style="max-width:900px;margin:0 auto">'
      + '<h2 style="margin-bottom:14px">💰 My Wallet</h2>'
      + JM.KPIGrid([
          { label: 'Balance', value: fmt(d.balance), sub: 'Available', accent: 'var(--jm-success, var(--jm-success,var(--jm-success,#16a34a)))' },
          { label: 'Your referral code', value: refCode, sub: 'Share to earn ₹100', accent: 'var(--jm-accent-purple, var(--jm-primary,#7c3aed))' },
          { label: 'Transactions', value: txs.length, sub: 'Last 30', accent: 'var(--jm-accent-amber, var(--jm-warn,#f59e0b))' }
        ])
      + '<div class="card" style="padding:18px;margin:14px 0">'
      +   '<div style="font-weight:700;margin-bottom:10px">Add money</div>'
      +   '<div style="display:flex;gap:8px;flex-wrap:wrap">' + quickTopups + '</div>'
      + '</div>'
      + '<div class="card" style="padding:18px;margin-bottom:14px">'
      +   '<div style="font-weight:700;margin-bottom:10px">Apply a referral code</div>'
      +   '<div style="display:flex;gap:6px">'
      +     '<input id="ref-code-in" placeholder="e.g. JMABC123" style="flex:1;padding:10px;border:1.5px solid var(--jm-border);border-radius:6px">'
      +     JM.Button({ label: 'Apply', kind: 'primary', size: 'sm', onClick: 'applyReferral()' })
      +   '</div>'
      + '</div>'
      + '<div class="card" style="padding:0;overflow:hidden">'
      +   '<div style="padding:14px 16px;font-weight:700;border-bottom:1px solid var(--jm-border)">Recent transactions</div>'
      +   rowsHtml
      + '</div>'
      + '</div>';
  }
});
