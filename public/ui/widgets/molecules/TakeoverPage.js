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
  _trigger: null,
  _keyHandler: null,
  open: function (opts) {
    opts = opts || {};
    var pageId  = opts.pageId  || 'bookingsPage';
    var bodyId  = opts.bodyId  || 'bk-body';
    var crumbId = opts.crumbId || 'bk-crumb';
    var page = document.getElementById(pageId);
    if (!page) return false;
    this._last = { pageId: pageId, bodyId: bodyId };

    // Save trigger element for focus restoration on close
    this._trigger = document.activeElement;

    page.classList.add('active');

    // Apply ARIA dialog attributes
    page.setAttribute('role', 'dialog');
    page.setAttribute('aria-modal', 'true');
    page.setAttribute('aria-labelledby', 'tp-title');

    document.querySelectorAll('.role-section').forEach(function (s) { s.style.visibility = 'hidden'; });
    // Do NOT hide .topbar — configure-page is position:fixed;z-index:60 which already
    // covers the sticky topbar (z-index:50). Hiding it inline causes stuck-nav bugs.
    var crumb = document.getElementById(crumbId);
    if (crumb && opts.crumb) {
      crumb.textContent = opts.crumb;
      // Ensure the crumb/title element has the labelledby id
      crumb.id = crumb.id || crumbId;
      crumb.setAttribute('id', 'tp-title');
    }
    var body = document.getElementById(bodyId);
    if (body && opts.bodyHtml != null) body.innerHTML = opts.bodyHtml;

    // Ensure an aria-live region exists inside the overlay for dynamic content
    var liveRegion = page.querySelector('[data-tp-live]');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'false');
      liveRegion.setAttribute('data-tp-live', '');
      liveRegion.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap';
      page.insertBefore(liveRegion, page.firstChild);
    }

    // Focus sentinel pattern: redirect Tab to stay inside overlay
    var sentinelStart = page.querySelector('[data-tp-sentinel-start]');
    var sentinelEnd   = page.querySelector('[data-tp-sentinel-end]');
    if (!sentinelStart) {
      sentinelStart = document.createElement('div');
      sentinelStart.setAttribute('tabindex', '0');
      sentinelStart.setAttribute('data-tp-sentinel-start', '');
      sentinelStart.setAttribute('aria-hidden', 'true');
      sentinelStart.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;outline:none';
      page.insertBefore(sentinelStart, page.firstChild);
    }
    if (!sentinelEnd) {
      sentinelEnd = document.createElement('div');
      sentinelEnd.setAttribute('tabindex', '0');
      sentinelEnd.setAttribute('data-tp-sentinel-end', '');
      sentinelEnd.setAttribute('aria-hidden', 'true');
      sentinelEnd.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;outline:none';
      page.appendChild(sentinelEnd);
    }

    // Tab-trap: keep focus inside the overlay
    var self = this;
    if (this._keyHandler) page.removeEventListener('keydown', this._keyHandler);
    this._keyHandler = function (e) {
      if (e.key !== 'Tab') return;
      var focusable = Array.prototype.slice.call(
        page.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter(function (el) {
        return !el.hasAttribute('data-tp-sentinel-start') && !el.hasAttribute('data-tp-sentinel-end') && el.offsetParent !== null;
      });
      if (!focusable.length) { e.preventDefault(); return; }
      var first = focusable[0];
      var last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === sentinelStart) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || document.activeElement === sentinelEnd) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    page.addEventListener('keydown', this._keyHandler);

    // Move focus to first focusable element inside overlay
    var firstFocusable = page.querySelector('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      setTimeout(function () { firstFocusable.focus(); }, 50);
    }

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
    var page = document.getElementById(id);
    if (page) {
      page.classList.remove('active');
      // Remove ARIA dialog attributes
      page.removeAttribute('role');
      page.removeAttribute('aria-modal');
      page.removeAttribute('aria-labelledby');
      // Remove tab-trap listener
      if (this._keyHandler) {
        page.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = null;
      }
    }
    document.querySelectorAll('.role-section').forEach(function (s) { s.style.visibility = ''; });
    document.querySelectorAll('.sidebar, .topbar').forEach(function (s) { s.style.display = ''; });
    // Restore focus to the element that triggered the open
    if (this._trigger && typeof this._trigger.focus === 'function') {
      this._trigger.focus();
      this._trigger = null;
    }
  }
};
