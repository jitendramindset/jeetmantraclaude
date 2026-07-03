/**
 * ui/screens/MoneyPage.js — Bookings & Payments takeover (via #bookingsPage / #bk-body).
 * Replaces openBookings() and openPayments() — both delegate to JM.Screens.open('money-page', {kind}).
 * ctx.kind: 'bookings' | 'payments'
 */
JM.Screens.register({
  id: 'money-page',
  title: '💰 Payments & Bookings',
  surface: 'takeover',
  pageId: 'bookingsPage',
  bodyId: 'bk-body',
  crumbId: 'bk-crumb',
  model: JM.Models.MoneyPage,
  render: function (d) {
    var E = JM.esc;

    function fmt(n) {
      return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    if (d.kind === 'payments') {
      var s = d.summary;
      var earningsRows = d.earnings.length
        ? d.earnings.map(function (e) {
            return '<tr style="border-bottom:1px solid var(--jm-border)">'
              + '<td style="padding:8px">' + (e.date ? new Date(e.date).toLocaleDateString() : '—') + '</td>'
              + '<td style="padding:8px">' + E(e.source || '—') + '</td>'
              + '<td style="padding:8px;text-align:right;font-weight:600;color:var(--jm-success)">' + fmt(e.amount) + '</td>'
              + '</tr>';
          }).join('')
        : null;

      var pmtRows = d.payments.length
        ? d.payments.map(function (p) {
            var ok = p.status === 'paid' || p.status === 'completed';
            return '<tr style="border-bottom:1px solid var(--jm-border)">'
              + '<td style="padding:8px">' + (p.created_at ? new Date(p.created_at).toLocaleDateString() : '—') + '</td>'
              + '<td style="padding:8px;font-family:monospace;font-size:11px">' + E((p.id || '').slice(0, 12)) + '</td>'
              + '<td style="padding:8px"><span class="badge ' + (ok ? 'badge-green' : 'badge-yellow') + '">' + (p.status || 'pending') + '</span></td>'
              + '<td style="padding:8px;text-align:right;font-weight:600">' + fmt(p.amount) + '</td>'
              + '</tr>';
          }).join('')
        : null;

      return '<div style="max-width:1180px;margin:0 auto">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">'
        +   '<h2 style="margin:0">💰 Payments &amp; Earnings</h2>'
        +   '<div class="row-actions">'
        +     '<button class="btn-sm btn-outline" onclick="downloadExport(\'earnings\')">⬇ Earnings CSV</button>'
        +     '<button class="btn-sm btn-outline" onclick="downloadExport(\'grades\')">⬇ Grades CSV</button>'
        +     '<button class="btn-sm btn-outline" onclick="downloadExport(\'attendance\')">⬇ Attendance CSV</button>'
        +   '</div>'
        + '</div>'
        + '<div class="stats-grid" style="margin-bottom:18px">'
        +   '<div class="stat-card"><div class="label">Total Earned</div><div class="value">' + fmt(s.totalEarned) + '</div><div class="sub">All time</div></div>'
        +   '<div class="stat-card"><div class="label">Paid Out</div><div class="value">' + fmt(s.paid) + '</div><div class="sub">Cleared</div></div>'
        +   '<div class="stat-card"><div class="label">Pending</div><div class="value">' + fmt(s.pending) + '</div><div class="sub">Processing</div></div>'
        +   '<div class="stat-card"><div class="label">Transactions</div><div class="value">' + d.payments.length + '</div><div class="sub">All time</div></div>'
        + '</div>'
        + '<div class="section"><div class="section-title">💸 Earnings (' + d.earnings.length + ')</div>'
        +   '<div class="card">' + (earningsRows
              ? '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse"><thead><tr style="text-align:left;color:var(--jm-text-muted);font-size:12px;border-bottom:1px solid var(--jm-border)"><th style="padding:8px">Date</th><th style="padding:8px">Source</th><th style="padding:8px;text-align:right">Amount</th></tr></thead><tbody>' + earningsRows + '</tbody></table></div>'
              : '<div class="empty-state"><div class="icon">💸</div>No earnings yet.</div>')
        +   '</div></div>'
        + '<div class="section"><div class="section-title">🏦 Payment Transactions (' + d.payments.length + ')</div>'
        +   '<div class="card">' + (pmtRows
              ? '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse"><thead><tr style="text-align:left;color:var(--jm-text-muted);font-size:12px;border-bottom:1px solid var(--jm-border)"><th style="padding:8px">Date</th><th style="padding:8px">Reference</th><th style="padding:8px">Status</th><th style="padding:8px;text-align:right">Amount</th></tr></thead><tbody>' + pmtRows + '</tbody></table></div>'
              : '<div class="empty-state"><div class="icon">🏦</div>No transactions.</div>')
        +   '</div></div>'
        + '</div>';
    }

    // bookings
    var bookings = d.bookings;
    function stat(k) { return bookings.filter(function (b) { return b.status === k; }).length; }

    var bookingRows = bookings.length
      ? bookings.map(function (b) {
          var cls = b.status === 'confirmed' ? 'badge-green' : b.status === 'cancelled' ? 'badge-red' : 'badge-yellow';
          return '<tr style="border-bottom:1px solid var(--jm-border);cursor:pointer"'
            + ' onclick="openBookingDetail(\'' + b.id + '\')"'
            + ' onmouseover="this.style.background=\'var(--jm-primary-tint)\'"'
            + ' onmouseout="this.style.background=\'\'">'
            + '<td style="padding:10px">' + (b.created_at ? new Date(b.created_at).toLocaleDateString() : '—') + '</td>'
            + '<td style="padding:10px"><div style="font-weight:600">' + E(b.student_name) + '</div>'
            +   '<div style="font-size:11px;color:var(--jm-text-muted)">' + E(b.student_email || '') + (b.student_phone ? ' · ' + E(b.student_phone) : '') + '</div></td>'
            + '<td style="padding:10px">' + E(b.course_title) + '</td>'
            + '<td style="padding:10px"><span class="badge ' + cls + '">' + (b.status || 'pending') + '</span></td>'
            + '<td style="padding:10px;text-align:right;font-weight:600">' + (b.amount ? fmt(b.amount) : '—') + '</td>'
            + '</tr>';
        }).join('')
      : null;

    return '<div style="max-width:1180px;margin:0 auto">'
      + '<h2 style="margin-bottom:14px">📅 Bookings (' + bookings.length + ')</h2>'
      + '<div class="stats-grid" style="margin-bottom:18px">'
      +   '<div class="stat-card"><div class="label">Total</div><div class="value">' + bookings.length + '</div><div class="sub">All bookings</div></div>'
      +   '<div class="stat-card"><div class="label">Confirmed</div><div class="value">' + stat('confirmed') + '</div><div class="sub">Active</div></div>'
      +   '<div class="stat-card"><div class="label">Pending</div><div class="value">' + stat('pending') + '</div><div class="sub">Awaiting</div></div>'
      +   '<div class="stat-card"><div class="label">Cancelled</div><div class="value">' + stat('cancelled') + '</div><div class="sub">Refunded</div></div>'
      + '</div>'
      + '<div class="card">' + (bookingRows
          ? '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse">'
            + '<thead><tr style="text-align:left;color:var(--jm-text-muted);font-size:12px;border-bottom:1px solid var(--jm-border)">'
            + '<th style="padding:10px">Date</th><th style="padding:10px">Student</th><th style="padding:10px">Course</th><th style="padding:10px">Status</th><th style="padding:10px;text-align:right">Amount</th>'
            + '</tr></thead><tbody>' + bookingRows + '</tbody></table></div>'
          : '<div class="empty-state" style="text-align:center;padding:32px">'
            + '<div class="icon" style="font-size:44px">📅</div>'
            + '<div style="font-weight:600;margin:8px 0">No bookings yet.</div>'
            + '<div style="color:var(--jm-text-muted);font-size:13px;margin-bottom:14px">Students book your time once a paid course is listed. Get started:</div>'
            + '<button onclick="openEmbed(\'/marketplace.html?embed=1\',\'🛒 Marketplace\')" style="background:linear-gradient(135deg,var(--jm-primary),var(--jm-accent-purple,#a855f7));color:#fff;border:0;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(124,58,237,.35)">🛒 List a course</button>'
            + '</div>')
      + '</div>'
      + '</div>';
  },
  afterMount: function (d) {
    var el = document.getElementById('bk-crumb');
    if (el) el.textContent = d.kind === 'payments' ? 'Payments' : 'Bookings';
  }
});
