/* ui/models/MoneyPage.js — fetches bookings or payments based on ctx.kind. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.MoneyPage = {
  fetch: async function (ctx) {
    var kind = (ctx && ctx.kind) || 'bookings';
    var role = '';
    try { role = (JSON.parse(localStorage.getItem('jm_user') || '{}')).user_type || 'student'; } catch (_) {}
    var isCreator = ['teacher', 'partner', 'school', 'coaching', 'admin'].includes(role);

    if (kind === 'payments') {
      var r = isCreator
        ? await api('/teacher/payments', 'GET')
        : await api('/payments/my', 'GET').then(function (d) {
            var pmts = d.payments || [];
            return {
              payments: pmts,
              earnings: [],
              summary: {
                totalEarned: 0,
                paid: pmts.filter(function (p) { return p.status === 'paid' || p.status === 'completed'; })
                  .reduce(function (s, p) { return s + parseFloat(p.amount || 0); }, 0),
                pending: pmts.filter(function (p) { return p.status === 'pending'; })
                  .reduce(function (s, p) { return s + parseFloat(p.amount || 0); }, 0)
              }
            };
          });
      return { kind: 'payments', isCreator: isCreator, payments: r.payments || [], earnings: r.earnings || [], summary: r.summary || {} };
    } else {
      var rb = await api('/teacher/bookings', 'GET');
      return { kind: 'bookings', bookings: rb.bookings || [] };
    }
  }
};
