/* ============================================================
   JeetMantra global theme applier.
   Reads the CRM config saved by the dashboard (localStorage key
   `jm_crm`) and applies Accent colour, Typography and Logo across
   EVERY page that includes this script (login, signup, marketplace,
   admin, liveRoom, dashboard…). Pure, dependency-free, runs on load
   and re-applies whenever the config changes in another tab.
   Safe to include anywhere — degrades silently if no config exists.
   ============================================================ */
(function () {
  var DEFAULTS = {
    accentColor: '#7c3aed',
    font: 'Plus Jakarta Sans',
    logo: '',
    bgTheme: 'midnight'
  };

  function readCrm() {
    try {
      return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem('jm_crm') || '{}'));
    } catch (_) { return Object.assign({}, DEFAULTS); }
  }

  // Lighten/darken a hex colour by pct (-100..100) for hover/tint derivations.
  function shade(hex, pct) {
    try {
      var h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var n = parseInt(h, 16);
      var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      var f = pct / 100;
      r = Math.round(r + (f < 0 ? r : 255 - r) * f);
      g = Math.round(g + (f < 0 ? g : 255 - g) * f);
      b = Math.round(b + (f < 0 ? b : 255 - b) * f);
      return '#' + [r, g, b].map(function (x) { return ('0' + Math.max(0, Math.min(255, x)).toString(16)).slice(-2); }).join('');
    } catch (_) { return hex; }
  }

  function hexToRgba(hex, a) {
    try {
      var h = hex.replace('#', '');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var n = parseInt(h, 16);
      return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    } catch (_) { return hex; }
  }

  function apply() {
    var c = readCrm();
    var root = document.documentElement;
    if (c.accentColor) {
      // Cover every accent token used across the various pages.
      ['--jm-primary', '--or', '--jm-primary-color', '--accent', '--primary'].forEach(function (v) {
        root.style.setProperty(v, c.accentColor);
      });
      root.style.setProperty('--jm-primary-2', shade(c.accentColor, -12));
      root.style.setProperty('--jm-primary-tint', hexToRgba(c.accentColor, 0.10));
      root.style.setProperty('--jm-primary-glow', hexToRgba(c.accentColor, 0.35));
    }
    if (c.font) {
      root.style.setProperty('--jm-font', c.font);
      // Apply to body without clobbering a page's own family list if it has one.
      if (document.body) document.body.style.fontFamily = "'" + c.font + "', system-ui, -apple-system, 'Segoe UI', sans-serif";
    }
    // Swap brand logos: any element tagged for the brand picks up the custom logo.
    if (c.logo) {
      document.querySelectorAll('img.js-logo, img.jm-logo, [data-jm-logo]').forEach(function (img) {
        if (img.tagName === 'IMG') img.src = c.logo;
        else img.style.backgroundImage = 'url(' + c.logo + ')';
      });
    }
    window.__jmTheme = c;
  }

  // Apply ASAP (before paint where possible) then again on DOMContentLoaded so
  // body / logo elements that weren't parsed yet still get themed.
  apply();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  }
  // Live-update when the dashboard saves new settings in another tab.
  window.addEventListener('storage', function (e) { if (e.key === 'jm_crm') apply(); });
  // Expose a manual hook so the dashboard can re-apply in the same tab.
  window.jmApplyTheme = apply;
})();
