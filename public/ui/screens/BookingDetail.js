/**
 * ui/screens/BookingDetail.js — Single booking detail modal.
 * Replaces openBookingDetail(bookingId). Helpers that stay in dashboard.html:
 * bookingSave(id), bookingCancel(id) — updated to call closeAnyModal().
 * ctx: { bookingId }
 */
JM.Screens.register({
  id: 'booking-detail',
  title: '📅 Booking',
  surface: 'modal',
  model: JM.Models.BookingDetail,
  render: function (d, ctx) {
    var b = d.booking || {};
    var s = d.student || {};
    var p = d.payment || {};
    var bookingId = b.id || (ctx && ctx.bookingId) || '';
    var reschedVal = b.scheduled_for
      ? new Date(b.scheduled_for).toISOString().slice(0, 16) : '';
    var statusBadge = b.status === 'confirmed' ? 'badge-green'
      : b.status === 'cancelled' ? 'badge-red' : 'badge-yellow';
    var payBadge = p.status === 'paid' ? 'badge-green' : 'badge-yellow';
    var txn = p.transaction_id
      ? '<div style="font-family:monospace;font-size:11px;color:var(--jm-text-muted)">' + JM.esc(p.transaction_id) + '</div>' : '';

    return '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:13px">'
      + '<tr><td style="padding:6px;color:var(--jm-text-muted);width:35%">Student</td>'
      + '<td style="padding:6px;font-weight:600">' + JM.esc(s.full_name || '—')
      + '<div style="font-size:11px;color:var(--jm-text-muted)">' + JM.esc(s.email || '')
      + (s.phone ? ' · ' + JM.esc(s.phone) : '') + '</div></td></tr>'
      + '<tr><td style="padding:6px;color:var(--jm-text-muted)">Course</td>'
      + '<td style="padding:6px">' + JM.esc(b.course_title || '—') + '</td></tr>'
      + '<tr><td style="padding:6px;color:var(--jm-text-muted)">Status</td>'
      + '<td style="padding:6px"><span class="badge ' + statusBadge + '">' + JM.esc(b.status || 'pending') + '</span></td></tr>'
      + '<tr><td style="padding:6px;color:var(--jm-text-muted)">Amount</td>'
      + '<td style="padding:6px">' + (b.amount ? (typeof fmt === 'function' ? fmt(b.amount) : '₹' + b.amount) : '—') + '</td></tr>'
      + '<tr><td style="padding:6px;color:var(--jm-text-muted)">Payment</td>'
      + '<td style="padding:6px">'
      + (p.status ? '<span class="badge ' + payBadge + '">' + JM.esc(p.status) + '</span>' : '—')
      + txn + '</td></tr>'
      + '<tr><td style="padding:6px;color:var(--jm-text-muted)">Booked</td>'
      + '<td style="padding:6px">' + (b.created_at ? new Date(b.created_at).toLocaleString() : '—') + '</td></tr>'
      + '</table></div>'
      + '<div class="form-row"><label>Reschedule (optional)</label>'
      + '<input id="bk-resch" type="datetime-local" value="' + reschedVal + '"></div>'
      + '<div class="form-row"><label>Status</label><select id="bk-status">'
      + ['pending', 'confirmed', 'completed', 'cancelled'].map(function (st) {
        return '<option value="' + st + '"' + (b.status === st ? ' selected' : '') + '>' + st + '</option>';
      }).join('')
      + '</select></div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'
      + '<button class="btn-sm btn-primary" onclick="bookingSave(\'' + JM.esc(bookingId) + '\')">💾 Save</button>'
      + '<button class="btn-sm btn-outline" onclick="bookingCancel(\'' + JM.esc(bookingId) + '\')" style="color:var(--jm-danger,#ef4444)">❌ Cancel + refund</button>'
      + '</div>';
  }
});
