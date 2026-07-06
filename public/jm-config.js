/**
 * jm-config.js — single source of truth for the API base URL.
 * Must load BEFORE app-shell / modules / widget-registry.
 *
 * Resolution order:
 *   1. localStorage 'jm_api_base'      — runtime override (Settings / QA switch)
 *   2. native shell (Capacitor)        — window.JM_DEFAULT_API, else prod URL
 *   3. web                             — same origin the page was served from
 *
 * On the web this reproduces the old `window.location.origin + '/api'` exactly,
 * so browser behaviour is unchanged. In a Capacitor APK/IPA the web-view origin
 * is capacitor://localhost (or https://localhost), which can't reach the API —
 * so we fall back to an absolute backend URL that the build (or the user, via
 * the localStorage override) configures.
 */
(function (w) {
  var PROD_API = 'https://api.mantravat.cloud/api'; // default backend for native builds

  function isNative() {
    try {
      if (w.Capacitor && typeof w.Capacitor.isNativePlatform === 'function') {
        return w.Capacitor.isNativePlatform();
      }
    } catch (e) { /* ignore */ }
    var p = (w.location && w.location.protocol) || '';
    return p === 'capacitor:' || p === 'ionic:';
  }

  function normalize(u) { return String(u || '').replace(/\/+$/, ''); }

  function resolve() {
    try {
      var override = w.localStorage && w.localStorage.getItem('jm_api_base');
      if (override) return normalize(override);
    } catch (e) { /* private mode / no storage */ }

    if (isNative()) return normalize(w.JM_DEFAULT_API || PROD_API);

    return normalize(w.location.origin) + '/api';
  }

  w.JM_API_BASE = resolve();

  // Native-only fetch shim: legacy code fetches relative '/api/...' paths,
  // which inside a Capacitor web-view hit the local shell and get HTML back
  // (the "not valid JSON" login error). Rewrite them to JM_API_BASE so every
  // module works in the APK without per-file edits. Web is untouched.
  if (isNative() && typeof w.fetch === 'function') {
    var _fetch = w.fetch.bind(w);
    w.fetch = function (input, init) {
      try {
        var url = (typeof input === 'string') ? input : (input && input.url);
        if (url && url.indexOf('/api/') === 0) {
          var rewritten = w.JM_API_BASE + url.slice(4); // '/api/x' -> BASE + '/x'
          if (typeof input === 'string') return _fetch(rewritten, init);
          return _fetch(new Request(rewritten, input), init);
        }
      } catch (e) { /* fall through to original */ }
      return _fetch(input, init);
    };
  }

  // Helper so QA can repoint the app without a rebuild: JM.setApiBase('https://host/api')
  w.JM = w.JM || {};
  w.JM.setApiBase = function (url) {
    try { w.localStorage.setItem('jm_api_base', normalize(url)); } catch (e) {}
    w.JM_API_BASE = normalize(url);
    return w.JM_API_BASE;
  };
})(window);
