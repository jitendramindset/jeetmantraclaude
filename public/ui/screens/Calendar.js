/**
 * ui/screens/Calendar.js — Calendar takeover (via #calendarPage / #cal-body).
 * Replaces inline openCalendar(). The full rendering engine (_renderCalendar,
 * _calFetchRange, _calMonthHtml, _calWeekHtml, _calAgendaHtml, _calDayHtml,
 * calSetView, calToday, calPrev, calNext, _calShift, local-event helpers) stays
 * in dashboard.html — too stateful to move. afterMount initialises the globals
 * and triggers the first render exactly as the inline version did.
 */
JM.Screens.register({
  id: 'calendar',
  title: '📅 Calendar',
  surface: 'takeover',
  pageId: 'calendarPage',
  bodyId: 'cal-body',
  crumbId: '__nope__',
  model: JM.Models.Calendar,
  render: function () {
    return '<div style="text-align:center;padding:40px;color:#888">Loading calendar…</div>';
  },
  afterMount: function (d, ctx, bodyEl) {
    // calToday() sets the module-level _calRef closure variable (not window._calRef),
    // then calls _renderCalendar(). calSetView restores the persisted view preference.
    var saved = localStorage.getItem('jm_calView') || 'month';
    if (typeof window.calToday === 'function') window.calToday();
    if (saved !== 'month' && typeof window.calSetView === 'function') window.calSetView(saved);
  }
});
