/**
 * TakeoverPage — molecule that owns the full-screen "bookingsPage" takeover surface.
 *
 *   JM.TakeoverPage.open({ crumb, bodyHtml })   — show & paint
 *   JM.TakeoverPage.setBody(bodyHtml)           — update body without flicker
 *   JM.TakeoverPage.loading(text?)              — show loading state in body
 *   JM.TakeoverPage.error(message)              — show error state in body
 *   JM.TakeoverPage.close()                     — hide & restore role section / topbar
 *
 * Reuses the dashboard's existing #bookingsPage / #bk-body / #bk-crumb DOM, so
 * the visual UX is unchanged from the legacy `openWallet`/`openRecordings` etc.
 * Screens that previously inlined this 4-line setup now just call
 * `JM.TakeoverPage.open({...})`.
 */
window.JM = window.JM || {};
JM.TakeoverPage = {
  open: function (opts) {
    opts = opts || {};
    var page = document.getElementById('bookingsPage');
    if (!page) return false;
    page.classList.add('active');
    document.querySelectorAll('.role-section').forEach(function (s) { s.style.visibility = 'hidden'; });
    document.querySelectorAll('.topbar').forEach(function (s) { s.style.display = 'none'; });
    var crumb = document.getElementById('bk-crumb'); if (crumb && opts.crumb) crumb.textContent = opts.crumb;
    var body = document.getElementById('bk-body'); if (body && opts.bodyHtml != null) body.innerHTML = opts.bodyHtml;
    return true;
  },
  setBody: function (html) {
    var body = document.getElementById('bk-body');
    if (body) body.innerHTML = html;
  },
  loading: function (text) {
    this.setBody('<div style="text-align:center;padding:40px;color:#888">' + (text || 'Loading…') + '</div>');
  },
  error: function (message) {
    this.setBody('<div style="color:#b91c1c;padding:20px">' + JM.esc(message || 'Something went wrong') + '</div>');
  },
  close: function () {
    var page = document.getElementById('bookingsPage'); if (page) page.classList.remove('active');
    document.querySelectorAll('.role-section').forEach(function (s) { s.style.visibility = ''; });
    document.querySelectorAll('.sidebar, .topbar').forEach(function (s) { s.style.display = ''; });
  }
};
