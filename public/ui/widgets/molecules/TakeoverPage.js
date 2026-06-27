/**
 * TakeoverPage — molecule that owns full-screen "takeover" surfaces.
 *
 *   JM.TakeoverPage.open({ crumb, bodyHtml, pageId, bodyId, crumbId })
 *     — pageId  defaults to 'bookingsPage' (the bookings/wallet/recordings shell)
 *     — bodyId  defaults to 'bk-body'
 *     — crumbId defaults to 'bk-crumb'
 *   Other screens like ProfilePage have their own pre-existing DOM scaffold
 *   (#profilePage + #pf-body) and just pass the right ids.
 *
 *   JM.TakeoverPage.setBody(html, [bodyId])     — paint body without flicker
 *   JM.TakeoverPage.loading([text], [bodyId])
 *   JM.TakeoverPage.error(message, [bodyId])
 *   JM.TakeoverPage.close([pageId])             — hide & restore role section / topbar
 */
window.JM = window.JM || {};
JM.TakeoverPage = {
  _last: { pageId: 'bookingsPage', bodyId: 'bk-body' },
  open: function (opts) {
    opts = opts || {};
    var pageId  = opts.pageId  || 'bookingsPage';
    var bodyId  = opts.bodyId  || 'bk-body';
    var crumbId = opts.crumbId || 'bk-crumb';
    var page = document.getElementById(pageId);
    if (!page) return false;
    this._last = { pageId: pageId, bodyId: bodyId };
    page.classList.add('active');
    document.querySelectorAll('.role-section').forEach(function (s) { s.style.visibility = 'hidden'; });
    document.querySelectorAll('.topbar').forEach(function (s) { s.style.display = 'none'; });
    var crumb = document.getElementById(crumbId); if (crumb && opts.crumb) crumb.textContent = opts.crumb;
    var body = document.getElementById(bodyId); if (body && opts.bodyHtml != null) body.innerHTML = opts.bodyHtml;
    return true;
  },
  setBody: function (html, bodyId) {
    var body = document.getElementById(bodyId || this._last.bodyId || 'bk-body');
    if (body) body.innerHTML = html;
  },
  loading: function (text, bodyId) {
    this.setBody('<div style="text-align:center;padding:40px;color:#888">' + (text || 'Loading…') + '</div>', bodyId);
  },
  error: function (message, bodyId) {
    this.setBody('<div style="color:#b91c1c;padding:20px">' + JM.esc(message || 'Something went wrong') + '</div>', bodyId);
  },
  close: function (pageId) {
    var id = pageId || this._last.pageId || 'bookingsPage';
    var page = document.getElementById(id); if (page) page.classList.remove('active');
    document.querySelectorAll('.role-section').forEach(function (s) { s.style.visibility = ''; });
    document.querySelectorAll('.sidebar, .topbar').forEach(function (s) { s.style.display = ''; });
  }
};
