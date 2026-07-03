/**
 * ui/screens/Billing.js — Billing & Invoices takeover (via #billingPage / #bl-body).
 * Replaces inline openBilling() + _renderBilling().
 *
 * Sub-form helpers (blOpenNew, blRenderItems, blRenderTotals, blSubmit,
 * blMarkPaid, blOpenPdf) stay in dashboard.html — they write directly to
 * #bl-body and call window._renderBilling() to refresh. afterMount exposes
 * that refresh function on window so they can still reach it.
 */
JM.Screens.register({
  id: 'billing',
  title: '🧾 Billing & Invoices',
  surface: 'takeover',
  pageId: 'billingPage',
  bodyId: 'bl-body',
  crumbId: '__nope__',
  model: JM.Models.Billing,
  render: function (d) {
    var s = d.summary, rows = d.invoices;

    var statsGrid = '<div class="stats-grid" style="margin-bottom:18px">'
      + '<div class="stat-card" style="--sc:var(--jm-success,var(--jm-success,#16a34a))"><div class="label">Collected</div><div class="value">' + fmt(s.paidAmount || 0) + '</div><div class="sub">' + (s.paid || 0) + ' paid</div></div>'
      + '<div class="stat-card" style="--sc:var(--jm-warn,#f59e0b)"><div class="label">Pending</div><div class="value">' + fmt(s.pendingAmount || 0) + '</div><div class="sub">' + (s.pending || 0) + ' invoices</div></div>'
      + '<div class="stat-card" style="--sc:var(--jm-danger,#ef4444)"><div class="label">Overdue</div><div class="value">' + (s.overdue || 0) + '</div><div class="sub">past due date</div></div>'
      + '<div class="stat-card" style="--sc:var(--jm-primary,#7c3aed)"><div class="label">Total invoices</div><div class="value">' + (s.total || 0) + '</div><div class="sub">All time</div></div>'
      + '</div>';

    var tableOrEmpty;
    if (rows.length) {
      var rows_html = rows.map(function (inv) {
        var statusCls = inv.status === 'paid' ? 'badge-green' : inv.status === 'cancelled' ? 'badge-red' : 'badge-yellow';
        var paidBtn = inv.status !== 'paid'
          ? '<button class="btn-sm btn-primary" onclick="blMarkPaid(\'' + inv.id + '\')">✓ Paid</button>'
          : '';
        return '<tr style="border-bottom:1px solid var(--jm-border)">'
          + '<td style="padding:12px 14px;font-family:monospace;font-size:12px;font-weight:600">' + JM.esc(inv.invoice_number || '') + '</td>'
          + '<td style="padding:12px 14px"><div style="font-weight:600">' + JM.esc(inv.client_name || '—') + '</div>'
          +   '<div style="font-size:11px;color:var(--jm-text-muted)">' + JM.esc(inv.client_email || '') + '</div></td>'
          + '<td style="padding:12px 14px;font-size:12px">' + (inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : '') + '</td>'
          + '<td style="padding:12px 14px;font-size:12px">' + (inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '—') + '</td>'
          + '<td style="padding:12px 14px"><span class="badge ' + statusCls + '">' + JM.esc(inv.status || 'pending') + '</span></td>'
          + '<td style="padding:12px 14px;text-align:right;font-weight:700">' + fmt(inv.total || inv.amount || 0) + '</td>'
          + '<td style="padding:12px 14px;text-align:right">'
          +   '<button class="btn-sm btn-outline" onclick="blOpenPdf(\'' + inv.id + '\')">📄 PDF</button> '
          +   paidBtn
          + '</td>'
          + '</tr>';
      }).join('');

      tableOrEmpty = '<div class="card" style="padding:0">'
        + '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse">'
        + '<thead><tr style="text-align:left;color:var(--jm-text-muted);font-size:11px;text-transform:uppercase;border-bottom:1px solid var(--jm-border)">'
        + '<th style="padding:12px 14px">#</th><th style="padding:12px 14px">Client</th>'
        + '<th style="padding:12px 14px">Issued</th><th style="padding:12px 14px">Due</th>'
        + '<th style="padding:12px 14px">Status</th><th style="padding:12px 14px;text-align:right">Total</th>'
        + '<th style="padding:12px 14px;text-align:right">Actions</th>'
        + '</tr></thead><tbody>' + rows_html + '</tbody></table></div></div>';
    } else {
      tableOrEmpty = '<div class="empty-state" style="text-align:center;padding:32px">'
        + '<div class="icon" style="font-size:44px">🧾</div>'
        + '<div style="font-weight:600;margin:8px 0">No invoices yet</div>'
        + '<div style="color:var(--jm-text-muted);font-size:13px;margin-bottom:14px">Issue an invoice to a student or org — payments tracked automatically.</div>'
        + '<button onclick="blOpenNew()" style="background:linear-gradient(135deg,var(--jm-primary),var(--jm-accent-purple,#a855f7));color:#fff;border:0;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(124,58,237,.35)">➕ New invoice</button>'
        + '</div>';
    }

    return '<div style="max-width:1180px;margin:0 auto">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:8px;flex-wrap:wrap">'
      +   '<h2 style="margin:0">🧾 Billing &amp; Invoices</h2>'
      +   '<button class="btn-sm btn-primary" onclick="blOpenNew()">➕ New invoice</button>'
      + '</div>'
      + statsGrid + tableOrEmpty
      + '</div>';
  },
  afterMount: function (d, ctx, bodyEl) {
    // Expose refresh so blMarkPaid() can call window._renderBilling() after marking paid.
    window._renderBilling = function () {
      if (window.JM && JM.Screens) JM.Screens.open('billing');
    };
  }
});
