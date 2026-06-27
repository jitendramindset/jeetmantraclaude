/**
 * ui/registry/screens.js — JM.Screens registry.
 *
 * A screen registers itself once with JM.Screens.register({id, model, render})
 * and the rest of the app opens it via JM.Screens.open('id'). The registry
 * handles model.fetch (with loading + error states via JMStates), admin policy
 * gating, and action dispatch.
 */
(function () {
  'use strict';
  var registry = {};
  var SCREEN_KEY = 'admin:widget-config'; // shared with the existing admin policy

  function register(def) {
    if (!def || !def.id) return;
    registry[def.id] = def;
  }

  // Read admin policy (same shape as widgets). Best-effort; failure = open.
  async function loadAdminPolicy() {
    try {
      var r = await fetch('/api/admin/widget-config', { headers: { Authorization: 'Bearer ' + localStorage.getItem('jm_token') } });
      if (!r.ok) return {};
      var j = await r.json();
      return j.config || {};
    } catch (e) { return {}; }
  }

  function visibleForRole(cfg, screenId, role) {
    if (!cfg) return true;
    if (cfg.global && cfg.global[screenId] === false) return false;
    if (cfg.byRole && cfg.byRole[role] && cfg.byRole[role][screenId] === false) return false;
    return true;
  }

  // Open a registered screen. ctx defaults to {role from jm_user}.
  // Open a registered screen. ctx defaults to {role from jm_user}.
  // Surface mode: def.surface === 'takeover' uses JM.TakeoverPage (full-screen),
  // anything else uses showModal (default — backward compatible).
  async function open(id, ctx) {
    var def = registry[id];
    if (!def) { console.warn('JM.Screens.open: unknown screen', id); return; }
    var isTakeover = def.surface === 'takeover';
    if (!isTakeover && typeof showModal !== 'function') { console.warn('showModal missing'); return; }
    if (isTakeover && !(window.JM && JM.TakeoverPage)) { console.warn('JM.TakeoverPage missing'); return; }
    ctx = ctx || {};
    if (!ctx.role) {
      try { ctx.role = JSON.parse(localStorage.getItem('jm_user') || '{}').role || 'student'; } catch (_) { ctx.role = 'student'; }
    }
    // Admin policy gate (skips itself for the screen-admin screen).
    if (def.id !== 'widget-admin') {
      var pol = await loadAdminPolicy();
      if (!visibleForRole(pol, def.id, ctx.role)) {
        var msg = (window.JMStates ? JMStates.empty({ icon: '🔒', title: 'Disabled by admin', msg: 'This screen has been turned off for your role.' })
          : '<div style="padding:20px;text-align:center">Disabled by admin.</div>');
        if (isTakeover) JM.TakeoverPage.open({ crumb: def.title || 'Unavailable', bodyHtml: msg });
        else showModal(def.title || 'Unavailable', msg);
        return;
      }
    }
    var data = null;
    if (isTakeover) {
      JM.TakeoverPage.open({ crumb: def.crumb || (def.title || '').replace(/^\W+\s*/, ''), bodyHtml: '' });
      JM.TakeoverPage.loading();
      try {
        if (def.model && typeof def.model.fetch === 'function') data = await def.model.fetch(ctx);
        JM.TakeoverPage.setBody(def.render(data, ctx) || '');
      } catch (e) { JM.TakeoverPage.error(e.message); }
      if (typeof def.afterMount === 'function') try { def.afterMount(data, ctx, document.getElementById('bk-body')); } catch (e) {}
      return;
    }
    // Modal path (original behaviour).
    var bodyId = 'jms-' + def.id + '-body';
    showModal(def.title || '', '<div id="' + bodyId + '" style="min-height:160px">'
      + (window.JMStates ? JMStates.skeleton({ lines: 4 }) : '<div style="padding:14px;color:var(--jm-text-muted)">Loading…</div>') + '</div>');
    var body = document.getElementById(bodyId);
    if (!body) return;
    try {
      if (def.model && typeof def.model.fetch === 'function') data = await def.model.fetch(ctx);
      body.innerHTML = def.render(data, ctx) || '';
    } catch (e) {
      body.innerHTML = (window.JMStates
        ? JMStates.error({ title: 'Couldn’t load', msg: e.message || 'The screen failed to load.', onRetry: function () { open(id, ctx); }, detail: e.message })
        : '<div style="padding:20px;text-align:center;color:#dc2626">⚠️ ' + (e.message || 'Error') + '</div>');
    }
    if (typeof def.afterMount === 'function') try { def.afterMount(data, ctx, body); } catch (e) {}
  }

  // Action dispatch: screens declare onclick="JM.Screens.action('wallet.topup')";
  // controllers register a handler via JM.Screens.handle('wallet.topup', fn).
  var handlers = {};
  function handle(name, fn) { handlers[name] = fn; }
  function action(name) {
    var args = Array.prototype.slice.call(arguments, 1);
    var fn = handlers[name];
    if (typeof fn === 'function') return fn.apply(null, args);
    JM.bus.emit('action', { name: name, args: args });
  }
  function list() { return Object.keys(registry).sort(); }

  JM.Screens = { register: register, open: open, action: action, handle: handle, list: list, _registry: registry };
})();
