/* ============================================================================
   JMStates — global UI states (Phase 3)
   ----------------------------------------------------------------------------
   Reusable, dependency-free helpers so no screen ever shows a blank area, an
   infinite spinner, or a raw error: Skeleton, EmptyState, ErrorState, RetryCard,
   OfflineBanner, LoadingOverlay. String-based (works with innerHTML) via a tiny
   callback registry. Treats backend instability as a normal production case.
   ============================================================================ */
(function (global) {
  'use strict';
  var _cbs = {}, _n = 0;
  function _reg(fn) { if (typeof fn !== 'function') return ''; var id = 'js' + (++_n); _cbs[id] = fn; return id; }
  function run(id) { var f = _cbs[id]; if (f) try { f(); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  /* ── Skeleton: shimmer placeholder lines / a block ─────────────────────── */
  function skeleton(opts) {
    opts = opts || {};
    if (opts.block) return '<div class="jm-skel" style="height:' + (opts.height || 120) + 'px;border-radius:10px"></div>';
    var lines = opts.lines || 3, out = '';
    for (var i = 0; i < lines; i++) out += '<div class="jm-skel" style="height:12px;margin:8px 0;width:' + (i === lines - 1 ? 60 : 100 - i * 8) + '%"></div>';
    return '<div class="jm-skel-wrap" aria-busy="true" aria-label="Loading">' + out + '</div>';
  }

  /* ── Empty: a contextual, inviting empty state with an optional CTA ─────── */
  function empty(o) {
    o = o || {};
    var btn = (o.actionLabel) ? '<button class="jm-state-cta" onclick="JMStates.run(\'' + _reg(o.onAction) + '\')">' + esc(o.actionLabel) + '</button>' : '';
    return '<div class="jm-state jm-state-empty">'
      + '<div class="jm-state-icon">' + (o.icon || '✨') + '</div>'
      + '<div class="jm-state-title">' + esc(o.title || 'Nothing here yet') + '</div>'
      + (o.msg ? '<div class="jm-state-msg">' + esc(o.msg) + '</div>' : '')
      + btn + '</div>';
  }

  /* ── Error: friendly message + Retry + expandable technical detail ─────── */
  function error(o) {
    o = o || {};
    var retry = (o.onRetry) ? '<button class="jm-state-cta" onclick="JMStates.run(\'' + _reg(o.onRetry) + '\')">↻ Retry</button>' : '';
    var refresh = (o.refresh !== false) ? '<button class="jm-state-btn" onclick="location.reload()">⟳ Refresh</button>' : '';
    var detail = o.detail ? '<details class="jm-state-detail"><summary>Technical details</summary><pre>' + esc(o.detail) + '</pre></details>' : '';
    return '<div class="jm-state jm-state-error">'
      + '<div class="jm-state-icon">⚠️</div>'
      + '<div class="jm-state-title">' + esc(o.title || 'Something went wrong') + '</div>'
      + '<div class="jm-state-msg">' + esc(o.msg || 'We couldn’t load this right now. Please try again.') + '</div>'
      + '<div class="jm-state-actions">' + retry + refresh + '</div>'
      + (o.supportEmail !== false ? '<a class="jm-state-support" href="mailto:support@mantravat.cloud">Contact support</a>' : '')
      + detail + '</div>';
  }

  /* ── A compact in-card retry (e.g. one failed widget) ──────────────────── */
  function retryCard(o) {
    o = o || {};
    return '<div class="jm-retry"><span>' + esc(o.msg || 'Couldn’t load.') + '</span>'
      + '<button class="jm-state-btn" onclick="JMStates.run(\'' + _reg(o.onRetry) + '\')">↻ Retry</button></div>';
  }

  /* ── Loading overlay on top of an element ──────────────────────────────── */
  function loadingOverlay(el, label) {
    if (!el) return function () {};
    var prev = getComputedStyle(el).position; if (prev === 'static') el.style.position = 'relative';
    var ov = document.createElement('div'); ov.className = 'jm-overlay';
    ov.innerHTML = '<div class="jm-spinner" role="status" aria-label="' + esc(label || 'Loading') + '"></div>';
    el.appendChild(ov);
    return function () { ov.remove(); };
  }

  /* ── Offline banner: auto show/hide; fires jm-reconnect on return ──────── */
  function _ensureBanner() {
    var b = document.getElementById('jm-offline-banner');
    if (!b) {
      b = document.createElement('div'); b.id = 'jm-offline-banner';
      b.innerHTML = '<span>📴 You’re offline — showing what we have. Reconnecting…</span>';
      (document.body || document.documentElement).appendChild(b);
    }
    return b;
  }
  function _syncOnline() {
    var on = navigator.onLine, b = _ensureBanner();
    b.classList.toggle('show', !on);
    document.documentElement.classList.toggle('jm-offline', !on);
  }
  function initOfflineBanner() {
    if (initOfflineBanner._done) return; initOfflineBanner._done = true;
    window.addEventListener('online', function () { _syncOnline(); try { window.dispatchEvent(new CustomEvent('jm-reconnect')); } catch (e) {} });
    window.addEventListener('offline', _syncOnline);
    if (document.body) _syncOnline(); else document.addEventListener('DOMContentLoaded', _syncOnline);
  }

  global.JMStates = { run: run, esc: esc, skeleton: skeleton, empty: empty, error: error, retryCard: retryCard, loadingOverlay: loadingOverlay, initOfflineBanner: initOfflineBanner };
  initOfflineBanner();
})(window);
