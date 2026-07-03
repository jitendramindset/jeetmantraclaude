/**
 * JeetMantra Offline-First layer  (window.JMOffline)
 * ---------------------------------------------------
 * Lets a signed-in user keep working with no internet:
 *   • offline LOGIN against a locally-cached credential verifier
 *     (a SHA-256 hash — the plaintext password is NEVER stored),
 *   • offline READ from the last cached GET responses,
 *   • offline WRITES buffered into an outbox and replayed on reconnect.
 *
 * Security: we store SHA-256(email:password) only, plus the last user
 * object + JWT, all in localStorage. No plaintext password is ever
 * persisted. The cached JWT is used solely for local read access; the
 * server still re-validates it the moment the device is back online
 * (an expired token bounces the user to a normal online sign-in).
 */
(function () {
  'use strict';
  var CRED = 'jm_offline_cred';
  var OUTBOX = 'jm_outbox';
  var GET = 'jm_get::';

  async function sha256(s) {
    var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function uid() {
    try { return (JSON.parse(localStorage.getItem('jm_user') || '{}').id) || 'anon'; }
    catch (e) { return 'anon'; }
  }
  function norm(e) { return String(e || '').trim().toLowerCase(); }

  // ── Credentials ──────────────────────────────────────────────────────────
  // Call after ANY successful ONLINE login so future offline sign-ins work.
  async function rememberCredential(email, password, user, token) {
    try {
      var hash = await sha256(norm(email) + ':' + password);
      localStorage.setItem(CRED, JSON.stringify({
        email: norm(email), hash: hash, user: user || {}, token: token || '', savedAt: Date.now()
      }));
    } catch (e) { /* private mode / no crypto → offline login just won't be offered */ }
  }
  // Verify entered credentials against the cached verifier; on match, restore
  // the saved session so the rest of the app behaves as if logged in.
  async function offlineLogin(email, password) {
    var c;
    try { c = JSON.parse(localStorage.getItem(CRED) || 'null'); } catch (e) { c = null; }
    if (!c) throw new Error('No offline profile yet — connect to the internet and sign in once to enable offline access.');
    if (norm(email) !== c.email) throw new Error('No offline profile saved for this email. Connect once online first.');
    var hash = await sha256(norm(email) + ':' + password);
    if (hash !== c.hash) throw new Error('Incorrect password for offline sign-in.');
    localStorage.setItem('jm_token', c.token || '');
    localStorage.setItem('jm_user', JSON.stringify(c.user || {}));
    return { token: c.token, user: c.user, offline: true };
  }
  function hasOfflineProfile(email) {
    try {
      var c = JSON.parse(localStorage.getItem(CRED) || 'null');
      return !!c && (!email || norm(email) === c.email);
    } catch (e) { return false; }
  }

  // ── GET response cache (read-through) ────────────────────────────────────
  function cacheGet(path, json) {
    try { localStorage.setItem(GET + uid() + '::' + path, JSON.stringify({ t: Date.now(), v: json })); }
    catch (e) { /* quota — ignore, it's just a cache */ }
  }
  function readGet(path) {
    try {
      var r = JSON.parse(localStorage.getItem(GET + uid() + '::' + path) || 'null');
      return r ? r.v : undefined;
    } catch (e) { return undefined; }
  }

  // ── Write outbox (buffer + replay) ───────────────────────────────────────
  function outbox() {
    try { return JSON.parse(localStorage.getItem(OUTBOX) || '[]'); } catch (e) { return []; }
  }
  function enqueue(item) {
    var q = outbox();
    q.push({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      path: item.path, method: item.method, body: item.body, ts: Date.now()
    });
    localStorage.setItem(OUTBOX, JSON.stringify(q));
    notify();
    return q.length;
  }
  // Replay queued writes oldest-first. Keeps items that still fail on a network
  // error or a server (5xx) error; drops items the server rejects (4xx) since
  // replaying them won't help. Returns {sent, kept}.
  async function flush(apiBase) {
    if (!navigator.onLine) return { sent: 0, kept: outbox().length };
    var q = outbox();
    if (!q.length) return { sent: 0, kept: 0 };
    var token = localStorage.getItem('jm_token');
    var kept = [], sent = 0;
    for (var i = 0; i < q.length; i++) {
      var it = q[i];
      try {
        var r = await fetch(apiBase + it.path, {
          method: it.method,
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
          body: it.body ? JSON.stringify(it.body) : undefined
        });
        if (r.ok) { sent++; }
        else if (r.status >= 500) { kept.push(it); }   // transient → retry later
        else {
          // 4xx — server rejected the write; it won't succeed on retry.
          // Surface the failure so the user knows their data wasn't saved.
          try {
            var errBody = await r.json().catch(function() { return {}; });
            window.dispatchEvent(new CustomEvent('jm-outbox-rejected', {
              detail: { path: it.path, status: r.status, error: errBody.error || errBody.message || 'Request rejected' }
            }));
          } catch (e) {}
          // Keep the item so the user can inspect it — do NOT silently drop.
          kept.push(it);
        }
      } catch (e) { kept.push(it); }                    // still offline → keep
    }
    localStorage.setItem(OUTBOX, JSON.stringify(kept));
    notify();
    return { sent: sent, kept: kept.length };
  }
  function notify() {
    try { window.dispatchEvent(new CustomEvent('jm-outbox-change', { detail: outbox().length })); } catch (e) {}
  }

  // Auto-flush whenever connectivity returns.
  window.addEventListener('online', function () {
    try { flush('/api'); } catch (e) {}
  });

  window.JMOffline = {
    rememberCredential: rememberCredential,
    offlineLogin: offlineLogin,
    hasOfflineProfile: hasOfflineProfile,
    cacheGet: cacheGet,
    readGet: readGet,
    enqueue: enqueue,
    outbox: outbox,
    flush: flush
  };
})();
