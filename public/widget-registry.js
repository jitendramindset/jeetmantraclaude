/**
 * widget-registry.js — EduOS W1 widget engine (the dynamic-dashboard spine).
 *
 * Replaces the 9-way `if(role===X) renderXDash()` switch with ONE composition
 * engine: a manifest-driven library + a resolver (role ∩ capability ∩ admin-cfg
 * ∩ personalization) + a renderer. Per EDUOS_WIDGET_UX_AUDIT §0–§2.
 *
 * The resolution INPUT is GET /api/me/contexts (Phase A) — {roles, capabilities,
 * activeOrgId, locale}. No widget reads `role` directly; the engine decides
 * visibility, the widget just renders its data.
 *
 *   EduOSWidgets.boot(document.getElementById('wgGrid'));
 *
 * Adding a role or a widget never touches this engine — only the WIDGETS array.
 */
(function (global) {
  const API = location.origin + '/api';
  const token = () => localStorage.getItem('jm_token');
  const esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const pct = n => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

  async function api(path) {
    const r = await fetch(API + path, { headers: { Authorization: 'Bearer ' + token() } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  const fmtMoney = n => '₹' + Number(n || 0).toLocaleString('en-IN');
  const when = t => { try { return new Date(t).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
  const listOf = (d, ...keys) => { for (const k of keys) if (Array.isArray(d?.[k])) return d[k]; return Array.isArray(d) ? d : []; };
  // empty(msg) — plain "nothing here" line.
  // empty(msg, { label, onclick }) — game-screen style: inviting CTA so the user
  // can act in one tap instead of staring at a passive empty state. Hover/press
  // styled via .wg-empty-cta (set in widget-styles.css; falls back to inline).
  const empty = (msg, action) => {
    if (!action) return `<div class="wg-empty">${esc(msg)}</div>`;
    const handler = String(action.onclick || '').replace(/"/g, '&quot;');
    return `<div class="wg-empty wg-empty-cta" style="text-align:center;padding:14px 8px">
      <div style="font-size:13px;color:var(--jm-text-muted);margin-bottom:10px">${esc(msg)}</div>
      <button onclick="${handler}" style="background:linear-gradient(135deg,var(--jm-primary),#a855f7);color:#fff;border:0;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(124,58,237,.35);transition:transform .12s,box-shadow .12s" onmouseover="this.style.transform='translateY(-1px)';this.style.boxShadow='0 4px 14px rgba(124,58,237,.45)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(124,58,237,.35)'">${esc(action.label)}</button>
    </div>`;
  };

  // ── WIDGET LIBRARY ────────────────────────────────────────────────────────
  // Each manifest: id, title, roles[], capability?, category, size, priority,
  // dataSource(ctx)→data, render(data,ctx)→html, actions?, aiTriggers?.
  const CREATOR = ['teacher', 'coaching', 'school', 'partner', 'corporate_trainer', 'content_creator', 'franchise', 'coach', 'trainer'];
  const ORG_ADMIN = ['school', 'coaching', 'institute_owner', 'org_admin', 'franchise'];
  const SPORTS = ['coach', 'trainer', 'sports_academy', 'yoga_center', 'dance_academy', 'music_academy', 'institute_owner'];
  // TEACHING = creators who actually run classes (excludes pure sellers partner/
  // content_creator) — keeps grade/attendance/weak-students off seller dashboards.
  const TEACHING = ['teacher', 'coaching', 'school', 'corporate_trainer', 'franchise', 'coach', 'trainer'];
  // SELLERS = roles that list/sell on the marketplace.
  const SELLERS = ['teacher', 'partner', 'coaching', 'school', 'content_creator', 'corporate_trainer', 'franchise'];

  // ── Widget library helpers exposed to external /widgets/<id>.js files.
  // Each extracted widget file destructures from EduOSWidgets._lib and then
  // calls EduOSWidgets.register({...}) to add itself to WIDGETS.
  const _LIB = { esc, pct, api, fmtMoney, when, listOf, empty,
                 CREATOR, ORG_ADMIN, SPORTS, TEACHING, SELLERS };
  function register(w) {
    if (!w || !w.id) return;
    // De-dupe: a re-load of the same id replaces the previous manifest.
    const i = WIDGETS.findIndex(x => x.id === w.id);
    if (i >= 0) WIDGETS[i] = w; else WIDGETS.push(w);
  }

  // WIDGETS is populated by /widgets/<id>.js files via register(). See /widgets/_README.md.
  let WIDGETS = [];

  // ── RESOLVER (audit §1) ─────────────────────────────────────────────────────
  // passesGates: role ∩ + capability + admin-config. `ignoreRemoved` lets the
  // "add widget" tray list widgets the user qualifies for but has hidden.
  function passesGates(w, ctx, ignoreRemoved) {
    const roles = new Set(ctx.roles || []);
    const caps = new Set(ctx.capabilities || []);
    const isAdmin = roles.has('admin');
    const adminCfg = ctx.adminWidgets || null;
    if (w.roles && !isAdmin && !w.roles.some(r => roles.has(r))) return false;
    if (w.capability && !isAdmin && !caps.has(w.capability)) return false;
    if (adminCfg && adminCfg[w.id] === false) return false;
    if (!ignoreRemoved && (ctx.userPrefs?.removed || []).includes(w.id)) return false;
    return true;
  }

  function resolveWidgets(ctx) {
    const pinned = new Set(ctx.userPrefs?.pinned || []);
    const order = ctx.userPrefs?.order || [];
    let list = WIDGETS.filter(w => passesGates(w, ctx, false));
    list.forEach(w => { w._pinned = pinned.has(w.id); });
    list.sort((a, b) => {
      if ((b._pinned ? 1 : 0) !== (a._pinned ? 1 : 0)) return (b._pinned ? 1 : 0) - (a._pinned ? 1 : 0);
      const oa = order.indexOf(a.id), ob = order.indexOf(b.id);            // explicit user order wins
      if (oa !== -1 || ob !== -1) return (oa === -1 ? 999 : oa) - (ob === -1 ? 999 : ob);
      return (a.priority || 50) - (b.priority || 50);
    });
    return list;
  }

  // Widgets the caller qualifies for but has hidden — feeds the "Add widget" tray.
  function hiddenWidgets(ctx) {
    const removed = new Set(ctx.userPrefs?.removed || []);
    return WIDGETS.filter(w => removed.has(w.id) && passesGates(w, ctx, true));
  }

  // ── RENDERER ────────────────────────────────────────────────────────────────
  function skeleton() { return '<div class="wg-skel"></div><div class="wg-skel w60"></div>'; }

  async function renderWidget(w, ctx) {
    const prefs = ctx.userPrefs || {};
    const size = (prefs.sizes || {})[w.id] || w.size || 'medium';
    const collapsed = (prefs.collapsed || []).includes(w.id);
    const accent = (prefs.accents || {})[w.id] || '';
    const card = document.createElement('section');
    card.className = 'wg-card wg-' + size + (w._pinned ? ' wg-pinned' : '') + (collapsed ? ' wg-collapsed' : '');
    card.dataset.widget = w.id;
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', w.title);
    card.tabIndex = 0;
    if (accent) card.style.setProperty('--wg-accent', accent);
    // Per-widget controls: collapse · resize · accent colour · pin · hide.
    const ctrls = `<span class="wg-ctrls">`
      + `<button class="wg-ctrl" title="${collapsed ? 'Expand' : 'Collapse'}" aria-label="Collapse widget" onclick="EduOSWidgets.toggleCollapse('${w.id}')">${collapsed ? '▸' : '▾'}</button>`
      + `<button class="wg-ctrl" title="Resize" aria-label="Resize widget" onclick="EduOSWidgets.cycleSize('${w.id}')">⤢</button>`
      + `<label class="wg-ctrl wg-ctrl-color" title="Accent colour" aria-label="Accent colour">🎨<input type="color" value="${accent || '#7c3aed'}" oninput="EduOSWidgets.setAccent('${w.id}',this.value)"></label>`
      + `<button class="wg-ctrl" title="${w._pinned ? 'Unpin' : 'Pin'}" aria-label="Pin widget" onclick="EduOSWidgets.togglePin('${w.id}')">${w._pinned ? '📌' : '📍'}</button>`
      + `<button class="wg-ctrl" title="Hide widget" aria-label="Hide widget" onclick="EduOSWidgets.removeWidget('${w.id}')">✕</button>`
      + `</span>`;
    card.innerHTML = `<header class="wg-head" title="Drag to reorder"><span class="wg-grip" aria-hidden="true">⠿</span><span class="wg-title">${esc(w.title)}</span>${ctrls}</header><div class="wg-body">${skeleton()}</div>`;
    // Drag-to-reorder — the header is the handle (so inner controls stay clickable).
    const head = card.querySelector('.wg-head');
    head.setAttribute('draggable', 'true');
    head.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', w.id); e.dataTransfer.effectAllowed = 'move'; card.classList.add('wg-dragging'); });
    head.addEventListener('dragend', () => card.classList.remove('wg-dragging'));
    card.addEventListener('dragover', e => { e.preventDefault(); card.classList.add('wg-dragover'); });
    card.addEventListener('dragleave', () => card.classList.remove('wg-dragover'));
    card.addEventListener('drop', e => { e.preventDefault(); card.classList.remove('wg-dragover'); const from = e.dataTransfer.getData('text/plain'); if (from) reorder(from, w.id); });
    const body = card.querySelector('.wg-body');
    // Per-widget data load with isolation: one widget failing never breaks the
    // grid — it shows its own Retry that re-fetches just this widget.
    async function load() {
      try {
        const data = w.dataSource ? await w.dataSource(ctx) : null;
        body.innerHTML = w.render(data, ctx);
      } catch (e) {
        body.innerHTML = (global.JMStates)
          ? JMStates.retryCard({ msg: 'Couldn’t load this widget.', onRetry: function () { body.innerHTML = skeleton(); load(); } })
          : empty('Couldn’t load right now.');
      }
    }
    await load();
    return card;
  }

  let _mount = null, _ctx = null;

  async function renderDashboard(mountEl, ctx) {
    _mount = mountEl; _ctx = ctx;
    const widgets = resolveWidgets(ctx);
    mountEl.innerHTML = '';
    const cards = await Promise.all(widgets.map(w => renderWidget(w, ctx)));
    cards.forEach(c => mountEl.appendChild(c));
    // "Add widget" tray for anything the user hid.
    const hidden = hiddenWidgets(ctx);
    const tray = document.getElementById('wgAddTray');
    if (tray) tray.innerHTML = hidden.length
      ? '<span class="wg-add-label">Add back:</span>' + hidden.map(w => `<button class="wg-add" onclick="EduOSWidgets.addWidget('${w.id}')">＋ ${esc(w.title)}</button>`).join('')
      : '';
    return widgets.map(w => w.id);
  }

  // ── PERSONALIZATION (W3) — mutate prefs, persist, re-render ──────────────────
  function ensurePrefs() {
    if (!_ctx.userPrefs) _ctx.userPrefs = {};
    _ctx.userPrefs.removed = _ctx.userPrefs.removed || [];
    _ctx.userPrefs.pinned = _ctx.userPrefs.pinned || [];
    _ctx.userPrefs.order = _ctx.userPrefs.order || [];
    _ctx.userPrefs.collapsed = _ctx.userPrefs.collapsed || [];   // header-only widgets
    _ctx.userPrefs.sizes = _ctx.userPrefs.sizes || {};            // per-widget size override
    _ctx.userPrefs.accents = _ctx.userPrefs.accents || {};        // per-widget accent colour
    return _ctx.userPrefs;
  }
  function _card(id){ return _mount && _mount.querySelector('[data-widget="' + id + '"]'); }
  async function persistPrefs() {
    try {
      await fetch(API + '/me/widget-prefs', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token() },
        body: JSON.stringify(_ctx.userPrefs)
      });
    } catch (_) {/* best-effort; UI already updated */}
  }
  async function togglePin(id) { const p = ensurePrefs(); const i = p.pinned.indexOf(id); i >= 0 ? p.pinned.splice(i, 1) : p.pinned.push(id); await persistPrefs(); await renderDashboard(_mount, _ctx); }
  // Collapse / resize / accent — applied in-place (no data refetch) for snappy
  // feedback, then persisted best-effort.
  function toggleCollapse(id) {
    const p = ensurePrefs(); const i = p.collapsed.indexOf(id); const on = i < 0;
    on ? p.collapsed.push(id) : p.collapsed.splice(i, 1);
    const card = _card(id); if (card) { card.classList.toggle('wg-collapsed', on); const b = card.querySelector('.wg-ctrl'); if (b) { b.textContent = on ? '▸' : '▾'; b.title = on ? 'Expand' : 'Collapse'; } }
    persistPrefs();
  }
  function cycleSize(id) {
    const sizes = ['small', 'medium', 'large']; const p = ensurePrefs();
    const card = _card(id); const cur = p.sizes[id] || (card && (['small','medium','large'].find(s => card.classList.contains('wg-' + s)))) || 'medium';
    const next = sizes[(sizes.indexOf(cur) + 1) % sizes.length]; p.sizes[id] = next;
    if (card) { card.classList.remove('wg-small', 'wg-medium', 'wg-large'); card.classList.add('wg-' + next); }
    persistPrefs();
  }
  function setAccent(id, color) {
    const p = ensurePrefs(); p.accents[id] = color;
    const card = _card(id); if (card) card.style.setProperty('--wg-accent', color);
    persistPrefs();
  }
  async function reorder(fromId, toId) {
    if (!fromId || fromId === toId) return;
    const ids = resolveWidgets(_ctx).map(w => w.id);
    const from = ids.indexOf(fromId); if (from < 0) return;
    ids.splice(from, 1);
    const at = ids.indexOf(toId); ids.splice(at < 0 ? ids.length : at, 0, fromId);
    const p = ensurePrefs(); p.order = ids; await persistPrefs(); await renderDashboard(_mount, _ctx);
  }
  async function removeWidget(id) { const p = ensurePrefs(); if (!p.removed.includes(id)) p.removed.push(id); await persistPrefs(); await renderDashboard(_mount, _ctx); }
  async function addWidget(id) { const p = ensurePrefs(); const i = p.removed.indexOf(id); if (i >= 0) p.removed.splice(i, 1); await persistPrefs(); await renderDashboard(_mount, _ctx); }

  // ── BOOT — resolve context, then compose ────────────────────────────────────
  async function getContext() {
    try {
      const c = await api('/me/contexts');                // Phase A: roles+caps+locale+activeOrg
      if (c && (c.roles || c.capabilities)) return c;
    } catch (_) {}
    // Fallback: JWT user role + /capabilities/me (works before any org membership).
    try {
      const u = JSON.parse(localStorage.getItem('jm_user') || '{}');
      const caps = await api('/capabilities/me').catch(() => ({ capabilities: [] }));
      return { roles: u.role ? [u.role] : [], capabilities: caps.capabilities || [], locale: 'en' };
    } catch (_) { return { roles: [], capabilities: [] }; }
  }

  // Wait for /widgets/<id>.js files (loaded async by _index.js) to finish
  // self-registering. Polls every 30ms; gives up after ~1.5s so a missing file
  // never blocks boot. The first widget(s) usually arrive within a frame or two.
  async function _waitForWidgets(expectedMin) {
    const target = Math.max(expectedMin || 0, 0);
    const deadline = Date.now() + 1500;
    while (WIDGETS.length < target && Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 30));
    }
  }

  async function boot(mountEl) {
    if (!token()) { location.href = '/login.html'; return; }
    // Widgets self-register from /widgets/<id>.js. Wait briefly so we don't
    // render against an empty registry on fast machines.
    await _waitForWidgets(10);
    const ctx = await getContext();
    // Admin policy (highest authority): merge the platform-wide widget policy
    // into ctx.adminWidgets BEFORE rendering, so passesGates() honours it.
    // global[id]===false → hide from everyone. byRole[<role>][id]===false →
    // hide for that role. Per-user prefs layer on top of what survives.
    try {
      const cfgResp = await api('/admin/widget-config');
      const cfg = (cfgResp && cfgResp.config) || {};
      const adminWidgets = {};
      Object.keys(cfg.global || {}).forEach(id => { if (cfg.global[id] === false) adminWidgets[id] = false; });
      const myRoles = new Set(ctx.roles || []);
      Object.keys(cfg.byRole || {}).forEach(role => {
        if (!myRoles.has(role)) return;
        const block = cfg.byRole[role] || {};
        Object.keys(block).forEach(id => { if (block[id] === false) adminWidgets[id] = false; });
      });
      ctx.adminWidgets = Object.assign({}, ctx.adminWidgets || {}, adminWidgets);
    } catch (_) { /* best-effort; defaults remain */ }
    const ids = await renderDashboard(mountEl, ctx);
    return { ctx, rendered: ids };
  }

  // AI/command-palette hook: phrase → widget id (audit §6).
  function widgetForIntent(phrase) {
    const p = String(phrase || '').toLowerCase();
    for (const w of WIDGETS) if ((w.aiTriggers || []).some(t => p.includes(t))) return w.id;
    return null;
  }

  // Action verbs that navigate/execute rather than surface a widget.
  const ACTION_VERBS = [
    { kw: ['create course', 'new course'], href: 'dashboard.html#create' },
    { kw: ['schedule class', 'new class', 'schedule a class'], href: 'dashboard.html#live' },
    { kw: ['take attendance', 'mark attendance'], href: 'dashboard.html#attendance' },
    { kw: ['generate test', 'create test', 'make a test'], href: 'dashboard.html#tests' },
    { kw: ['open marketplace', 'browse courses', 'marketplace'], href: 'marketplace.html' },
    { kw: ['open calendar', 'my calendar'], href: 'dashboard.html#calendar' }
  ];

  // W4 — handle a natural-language command from the palette or voice:
  // 1) surface the matching widget (add it back if hidden, scroll + flash), or
  // 2) run a matching action verb (navigate). Returns what it did.
  async function handleCommand(phrase) {
    const p = String(phrase || '').toLowerCase().trim();
    if (!p) return { action: 'none' };
    const id = widgetForIntent(p);
    if (id && _mount) {
      if ((_ctx?.userPrefs?.removed || []).includes(id)) await addWidget(id);
      const el = _mount.querySelector(`[data-widget="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { el.animate([{ boxShadow: '0 0 0 3px var(--jm-primary,#7c3aed)' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 1400 }); } catch (_) {}
        el.focus?.();
      }
      return { action: 'widget', id };
    }
    for (const v of ACTION_VERBS) if (v.kw.some(k => p.includes(k))) { location.href = v.href; return { action: 'navigate', href: v.href }; }
    return { action: 'none' };
  }

  // Optional voice entry — Web Speech API, falls back silently if unsupported.
  function listen(onResult) {
    const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
    if (!SR) { return false; }
    const r = new SR();
    r.lang = (_ctx && _ctx.locale === 'hi') ? 'hi-IN' : 'en-IN';
    r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = e => { const t = e.results[0][0].transcript; (onResult || handleCommand)(t); };
    try { r.start(); return true; } catch (_) { return false; }
  }

  global.EduOSWidgets = { WIDGETS, register, _lib: _LIB, resolveWidgets, hiddenWidgets, renderDashboard, boot, getContext, widgetForIntent, handleCommand, listen, togglePin, removeWidget, addWidget, toggleCollapse, cycleSize, setAccent, reorder, api, esc };
})(window);
