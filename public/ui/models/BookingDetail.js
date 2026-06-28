/* ui/models/BookingDetail.js — fetches a single booking. ctx: { bookingId } */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.BookingDetail = {
  fetch: async function (ctx) {
    var bookingId = ctx && ctx.bookingId;
    if (!bookingId) return { booking: {}, student: {}, payment: {} };
    var r = await api('/teacher/bookings/' + bookingId, 'GET');
    return { booking: r.booking || {}, student: r.student || {}, payment: r.payment || {} };
  }
};
