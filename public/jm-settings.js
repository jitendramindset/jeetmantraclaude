/**
 * jm-settings.js — one central place for platform-wide config.
 *
 * The exam platform and Bhasha Setu each carried their own settings (webhook,
 * branding, language) so the same things had to be configured per-app. This
 * unifies them: edit once in settings.html, and JMSettings.applyToApps() fans
 * the values OUT to each app's own storage keys — so the apps stay untouched but
 * read centrally-set values.
 *
 *   JMSettings.get() / .set(patch) / .applyTheme() / .applyToApps()
 *
 * Source of truth: localStorage 'jm_settings'. Mirrors to:
 *   - examforge_ai_url / examforge_ai_key  (exam-platform reads these)
 *   - bs_config.{webhook,primary,accent,defaultLang,appName,orgName,dark}  (bhasha)
 *   - jm_lang  (global UI language)
 */
(function (global) {
  var KEY = 'jm_settings';
  var DEFAULTS = {
    orgName: 'JeetMantra',
    appName: 'JeetMantra',
    logoEmoji: '📚',
    primary: '#7c3aed',
    accent: '#f5a623',
    dark: false,
    fontScale: 1,
    language: 'en',
    n8nWebhook: '',       // automation / results webhook
    aiWebhookUrl: '',     // AI generation endpoint
    aiWebhookKey: ''      // AI key (stored locally only)
  };

  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function get() { return Object.assign({}, DEFAULTS, read()); }
  function set(patch) {
    var next = Object.assign(get(), patch || {});
    localStorage.setItem(KEY, JSON.stringify(next));
    applyTheme(next); applyToApps(next);
    return next;
  }

  // Apply theme tokens + dark + font scale to the current document (best-effort —
  // pages that use theme.css tokens pick these up immediately).
  function applyTheme(s) {
    s = s || get();
    try {
      var r = document.documentElement;
      if (s.primary) r.style.setProperty('--jm-primary', s.primary);
      if (s.accent) r.style.setProperty('--jm-accent', s.accent);
      r.setAttribute('data-theme', s.dark ? 'dark' : 'light');
      if (s.fontScale) r.style.setProperty('--jm-font-scale', String(s.fontScale));
    } catch (e) {}
  }

  // Fan values OUT to the per-app storage keys the satellite apps already read.
  function applyToApps(s) {
    s = s || get();
    try {
      if (s.aiWebhookUrl != null) localStorage.setItem('examforge_ai_url', s.aiWebhookUrl);
      if (s.aiWebhookKey != null) localStorage.setItem('examforge_ai_key', s.aiWebhookKey);
      if (s.language) localStorage.setItem('jm_lang', s.language);
      // Bhasha Setu config (bs_config) — overlay the shared fields, keep the rest.
      var bs = {}; try { bs = JSON.parse(localStorage.getItem('bs_config') || '{}'); } catch (e) {}
      bs.webhook = s.n8nWebhook || bs.webhook || '';
      if (s.primary) bs.primary = s.primary;
      if (s.accent) bs.accent = s.accent;
      if (s.appName) bs.appName = s.appName;
      if (s.orgName) bs.orgName = s.orgName;
      if (s.language) bs.defaultLang = s.language;
      if (typeof s.dark === 'boolean') bs.dark = s.dark;
      if (s.fontScale) bs.fontScale = s.fontScale;
      localStorage.setItem('bs_config', JSON.stringify(bs));
    } catch (e) {}
  }

  // Push to the backend org settings when signed in (so it persists + the
  // dashboard/admin can manage it). Best-effort; ignores failures.
  async function syncToOrg() {
    var token = localStorage.getItem('jm_token');
    if (!token) return { ok: false, reason: 'not-signed-in' };
    try {
      var ctx = await (await fetch('/api/me/contexts', { headers: { Authorization: 'Bearer ' + token } })).json();
      var orgId = ctx && ctx.activeOrgId;
      if (!orgId) return { ok: false, reason: 'no-active-org' };
      var s = get();
      var body = { settings: { app: { appName: s.appName, logoEmoji: s.logoEmoji, n8nWebhook: s.n8nWebhook, aiWebhookUrl: s.aiWebhookUrl } },
        branding: { primary: s.primary, accent: s.accent, dark: s.dark }, locale_default: s.language };
      var r = await fetch('/api/orgs/' + orgId + '/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(body)
      });
      return { ok: r.ok };
    } catch (e) { return { ok: false, reason: e.message }; }
  }

  global.JMSettings = { get: get, set: set, applyTheme: applyTheme, applyToApps: applyToApps, syncToOrg: syncToOrg, DEFAULTS: DEFAULTS };
  // On load, mirror current settings to apps so a fresh page sees them.
  try { applyTheme(); applyToApps(); } catch (e) {}
})(window);
