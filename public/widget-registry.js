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
    // P1 gap closure: archived widgets are filtered out of the main grid.
    // They survive in ctx.userPrefs.archived and surface via an Archive tray.
    if (!ignoreRemoved && (ctx.userPrefs?.archived || []).includes(w.id)) return false;
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
    const favorited = (prefs.favorites || []).includes(w.id);
    // P2: per-widget theme override (light|dark|auto). Auto = inherit page theme.
    const theme = (prefs.themes || {})[w.id] || '';
    // P2: track hidden sections (consumer widgets honor via ctx.hiddenSections).
    const hiddenSections = (prefs.hiddenSections || {})[w.id] || [];
    // P3: user-edited title overrides the manifest title; typeSize cycles type.
    const userTitle = (prefs.titles || {})[w.id] || '';
    const displayTitle = userTitle || w.title;
    const typeSize = (prefs.typeSize || {})[w.id] || '';
    // P3: animation type (manifest w.animation: 'slide'|'fade'|'scale'); default = grid's wgUp.
    const animClass = w.animation ? ' wg-anim-' + w.animation : '';
    const card = document.createElement('section');
    card.className = 'wg-card wg-' + size + (w._pinned ? ' wg-pinned' : '') + (collapsed ? ' wg-collapsed' : '') + (favorited ? ' wg-favorite' : '') + (theme ? ' wg-theme-' + theme : '') + (typeSize ? ' wg-type-' + typeSize : '') + animClass;
    card.dataset.widget = w.id;
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', displayTitle);
    card.tabIndex = 0;
    if (accent) card.style.setProperty('--wg-accent', accent);
    // P1 gap closure: Action overflow — when more than 5 controls would render,
    // primary actions stay visible and the rest fold into a "More …" menu.
    // For now we keep the 5 primary inline (collapse/resize/accent/pin/hide) and
    // surface favorite + archive in a "..." menu so the header stays clean.
    const ctrls = `<span class="wg-ctrls">`
      + `<button class="wg-ctrl" title="${collapsed ? 'Expand' : 'Collapse'}" aria-label="Collapse widget" onclick="EduOSWidgets.toggleCollapse('${w.id}')">${collapsed ? '▸' : '▾'}</button>`
      + `<button class="wg-ctrl" title="Resize" aria-label="Resize widget" onclick="EduOSWidgets.cycleSize('${w.id}')">⤢</button>`
      + `<label class="wg-ctrl wg-ctrl-color" title="Accent colour" aria-label="Accent colour">🎨<input type="color" value="${accent || '#7c3aed'}" oninput="EduOSWidgets.setAccent('${w.id}',this.value)"></label>`
      + `<button class="wg-ctrl" title="${w._pinned ? 'Unpin' : 'Pin'}" aria-label="Pin widget" onclick="EduOSWidgets.togglePin('${w.id}')">${w._pinned ? '📌' : '📍'}</button>`
      + `<button class="wg-ctrl" data-wg-action="favorite" title="${favorited ? 'Unfavorite' : 'Favorite'}" aria-label="Favorite widget" onclick="EduOSWidgets.toggleFavorite('${w.id}')">${favorited ? '⭐' : '☆'}</button>`
      + `<details class="wg-ctrl wg-ctrl-more" style="display:inline-block;position:relative"><summary title="More" aria-label="More actions" style="cursor:pointer;list-style:none">⋯</summary>`
      +   `<div class="wg-more-menu" style="position:absolute;right:0;top:100%;background:var(--jm-surface,#fff);border:1px solid var(--jm-border,#e5e7eb);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);padding:6px;z-index:10;min-width:140px;display:flex;flex-direction:column;gap:2px">`
      +     `<button class="wg-more-item" style="background:none;border:0;padding:6px 10px;text-align:left;font-size:12px;border-radius:6px;cursor:pointer" onclick="EduOSWidgets.cycleTypeSize('${w.id}');this.closest('details').open=false">🔤 Type size</button>`
      +     `<button class="wg-more-item" style="background:none;border:0;padding:6px 10px;text-align:left;font-size:12px;border-radius:6px;cursor:pointer" onclick="EduOSWidgets.toggleArchive('${w.id}');this.closest('details').open=false">🗄 Archive</button>`
      +     `<button class="wg-more-item" style="background:none;border:0;padding:6px 10px;text-align:left;font-size:12px;border-radius:6px;cursor:pointer" onclick="EduOSWidgets.removeWidget('${w.id}');this.closest('details').open=false">✕ Hide</button>`
      +   `</div></details>`
      + `</span>`;
    card.innerHTML = `<header class="wg-head" title="Drag to reorder"><span class="wg-grip" aria-hidden="true">⠿</span><span class="wg-title" title="Double-click to rename" ondblclick="EduOSWidgets._editTitle(event,'${w.id}')">${esc(displayTitle)}</span>${ctrls}</header><div class="wg-body">${skeleton()}</div>`;
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
        // P2: pass per-widget hidden-section list as ctx.hiddenSections so the
        // widget's render() can opt-out of sections the user turned off.
        const widgetCtx = Object.assign({}, ctx, { hiddenSections: hiddenSections });
        body.innerHTML = w.render(data, widgetCtx);
      } catch (e) {
        body.innerHTML = (global.JMStates)
          ? JMStates.retryCard({ msg: 'Couldn’t load this widget.', onRetry: function () { body.innerHTML = skeleton(); load(); } })
          : empty('Couldn’t load right now.');
      }
    }
    await load();
    // P1 gap closure: per-widget refresh frequency. A manifest can declare
    // refreshMs:30000 to auto-poll. Interval is owned by the card so it's
    // cleared automatically when the card is replaced by renderDashboard.
    if (w.refreshMs && Number(w.refreshMs) > 1000) {
      const handle = setInterval(load, Number(w.refreshMs));
      card._jmRefresh = handle;
      // Stop polling when the card LEAVES the DOM after first being mounted.
      // The card is detached at renderWidget-time (it's appended later by
      // renderDashboard), so we wait until it's mounted before watching for
      // removal — otherwise the observer fires once and kills the interval.
      let wasMounted = false;
      const obs = new MutationObserver(() => {
        const inDom = document.body.contains(card);
        if (inDom) { wasMounted = true; return; }
        if (wasMounted) { clearInterval(handle); obs.disconnect(); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
    }
    return card;
  }

  let _mount = null, _ctx = null;

  async function renderDashboard(mountEl, ctx) {
    _mount = mountEl; _ctx = ctx;
    const widgets = resolveWidgets(ctx);
    // P2: apply grid-wide density class from prefs (compact|comfortable).
    const density = (ctx.userPrefs && ctx.userPrefs.density) || 'comfortable';
    mountEl.classList.toggle('wg-density-compact', density === 'compact');
    mountEl.innerHTML = '';
    const cards = await Promise.all(widgets.map(w => renderWidget(w, ctx)));
    // P3 final: opt-in groups. If no widget declares `group`, render flat grid (legacy).
    // Otherwise bucket by group name, emit a collapsible <section> per group.
    const declaresAnyGroup = widgets.some(w => w.group);
    if (!declaresAnyGroup) {
      cards.forEach(c => mountEl.appendChild(c));
    } else {
      const collapsedGroups = (ctx.userPrefs && ctx.userPrefs.collapsedGroups) || [];
      const buckets = new Map();
      widgets.forEach((w, i) => {
        const g = w.group || 'General';
        if (!buckets.has(g)) buckets.set(g, []);
        buckets.get(g).push(cards[i]);
      });
      buckets.forEach((cardsForGroup, groupId) => {
        const isCollapsed = collapsedGroups.includes(groupId);
        const section = document.createElement('section');
        section.className = 'wg-group' + (isCollapsed ? ' wg-group-collapsed' : '');
        section.dataset.group = groupId;
        section.innerHTML = '<header class="wg-group-head" onclick="EduOSWidgets.toggleGroup(\'' + esc(groupId).replace(/'/g, '\\\'') + '\')">'
          + '<button class="wg-group-toggle" aria-label="Toggle group">' + (isCollapsed ? '▸' : '▾') + '</button>'
          + '<span class="wg-group-title">' + esc(groupId) + '</span>'
          + '<span class="wg-group-count">' + cardsForGroup.length + '</span>'
          + '</header>'
          + '<div class="wg-group-body wg-grid"></div>';
        const body = section.querySelector('.wg-group-body');
        cardsForGroup.forEach(c => body.appendChild(c));
        mountEl.appendChild(section);
      });
    }
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
    // P1 gap closure (per WIDGET_AUDIT.md): favorites + archived are separate
    // from pinned/removed. Favorite = "star" (visual only, never auto-hidden);
    // archive = soft-removed (gone from grid but kept in a separate Archive tray
    // — distinct from Hide which means "I don't want this right now").
    _ctx.userPrefs.favorites = _ctx.userPrefs.favorites || [];
    _ctx.userPrefs.archived = _ctx.userPrefs.archived || [];
    // P2 gap closure: density (compact|comfortable) is grid-wide; themes is
    // per-widget {id: 'light'|'dark'|'auto'}; hiddenSections is per-widget
    // {id: [sectionId,...]} for widgets that declare opt-in sections.
    _ctx.userPrefs.density = _ctx.userPrefs.density || 'comfortable';
    _ctx.userPrefs.themes = _ctx.userPrefs.themes || {};
    _ctx.userPrefs.hiddenSections = _ctx.userPrefs.hiddenSections || {};
    // P3 gap closure: typeSize {id: 'sm'|'md'|'lg'|'xl'} per widget;
    // titles {id: 'My custom title'} for user-edited names.
    _ctx.userPrefs.typeSize = _ctx.userPrefs.typeSize || {};
    _ctx.userPrefs.titles = _ctx.userPrefs.titles || {};
    // P3 final closure: widget groups + saved layouts. collapsedGroups is
    // an array of group-ids the user has folded. savedLayouts is a map of
    // {layoutName: <userPrefs snapshot>}.
    _ctx.userPrefs.collapsedGroups = _ctx.userPrefs.collapsedGroups || [];
    _ctx.userPrefs.savedLayouts = _ctx.userPrefs.savedLayouts || {};
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
    // P1 gap closure: add explicit 'full' (row-spanning) size to the rotation.
    // A widget's manifest can opt out via supportedSizes:[…] (checked here).
    const ALL = ['small', 'medium', 'large', 'full'];
    const p = ensurePrefs();
    const card = _card(id);
    const w = WIDGETS.find(x => x.id === id);
    const allowed = (w && Array.isArray(w.supportedSizes) && w.supportedSizes.length) ? w.supportedSizes : ALL;
    const cur = p.sizes[id] || (card && ALL.find(s => card.classList.contains('wg-' + s))) || 'medium';
    // Find next size in the allowed list, starting from cur+1.
    const idx = allowed.indexOf(cur);
    const next = allowed[(idx + 1) % allowed.length];
    p.sizes[id] = next;
    if (card) { ALL.forEach(s => card.classList.remove('wg-' + s)); card.classList.add('wg-' + next); }
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
  // P1 gap closure: Favorite & Archive (separate from pin/hide per WIDGET_AUDIT.md).
  // Favorite = visual star — no effect on visibility or order (Pin already covers sorting).
  // Archive = soft-remove — disappears from grid; can be brought back from an Archive tray.
  function toggleFavorite(id) {
    const p = ensurePrefs(); const i = p.favorites.indexOf(id); const on = i < 0;
    on ? p.favorites.push(id) : p.favorites.splice(i, 1);
    const card = _card(id); if (card) {
      card.classList.toggle('wg-favorite', on);
      const btn = card.querySelector('[data-wg-action="favorite"]');
      if (btn) { btn.textContent = on ? '⭐' : '☆'; btn.title = on ? 'Unfavorite' : 'Favorite'; }
    }
    persistPrefs();
  }
  async function toggleArchive(id) {
    const p = ensurePrefs(); const i = p.archived.indexOf(id); const on = i < 0;
    on ? p.archived.push(id) : p.archived.splice(i, 1);
    await persistPrefs();
    await renderDashboard(_mount, _ctx);
  }
  // P2 gap closure: density (grid-wide) toggles tighter spacing/typography.
  function setDensity(mode) {
    const p = ensurePrefs(); p.density = (mode === 'compact') ? 'compact' : 'comfortable';
    if (_mount) {
      _mount.classList.toggle('wg-density-compact', p.density === 'compact');
    }
    persistPrefs();
  }
  // P2 gap closure: per-widget theme override (light | dark | auto).
  function setTheme(id, mode) {
    const p = ensurePrefs();
    if (!mode || mode === 'auto') { delete p.themes[id]; } else { p.themes[id] = mode; }
    const card = _card(id);
    if (card) {
      card.classList.remove('wg-theme-light', 'wg-theme-dark');
      if (p.themes[id]) card.classList.add('wg-theme-' + p.themes[id]);
    }
    persistPrefs();
  }
  // P2 gap closure: section-level show/hide for widgets that declare
  // sections in their manifest. Hidden sections are removed from the
  // rendered body on the next renderWidget pass.
  async function toggleSection(widgetId, sectionId) {
    const p = ensurePrefs();
    p.hiddenSections[widgetId] = p.hiddenSections[widgetId] || [];
    const list = p.hiddenSections[widgetId];
    const i = list.indexOf(sectionId);
    if (i >= 0) list.splice(i, 1); else list.push(sectionId);
    await persistPrefs();
    await renderDashboard(_mount, _ctx);
  }
  // P3 gap closure: typography size cycle (sm | md | lg | xl). Applied via class.
  function cycleTypeSize(id) {
    const STEPS = ['sm', 'md', 'lg', 'xl'];
    const p = ensurePrefs();
    const cur = p.typeSize[id] || 'md';
    const next = STEPS[(STEPS.indexOf(cur) + 1) % STEPS.length];
    p.typeSize[id] = next;
    const card = _card(id);
    if (card) { STEPS.forEach(s => card.classList.remove('wg-type-' + s)); card.classList.add('wg-type-' + next); }
    persistPrefs();
  }
  // P3 gap closure: user-editable widget titles. Renamed name persists; reset to '' restores manifest title.
  // P3 final closure: widget groups. A widget declares group:'Money' in its
  // manifest to land in the "Money" section; widgets without a group go to
  // the implicit "" bucket. If no widget declares any group, the engine
  // renders a single flat grid (current behaviour).
  function toggleGroup(groupId) {
    const p = ensurePrefs(); const i = p.collapsedGroups.indexOf(groupId); const on = i < 0;
    on ? p.collapsedGroups.push(groupId) : p.collapsedGroups.splice(i, 1);
    // Toggle in-place — no full re-render.
    if (_mount) {
      const sec = _mount.querySelector('.wg-group[data-group="' + CSS.escape(groupId) + '"]');
      if (sec) {
        sec.classList.toggle('wg-group-collapsed', on);
        const btn = sec.querySelector('.wg-group-toggle');
        if (btn) btn.textContent = on ? '▸' : '▾';
      }
    }
    persistPrefs();
  }
  // P3 final closure: layout save/load/reset/export/import.
  async function saveLayout(name) {
    if (!name) return;
    const p = ensurePrefs();
    // Snapshot prefs EXCEPT savedLayouts itself (avoid recursion).
    const { savedLayouts, ...snap } = p;
    p.savedLayouts[name] = JSON.parse(JSON.stringify(snap));
    await persistPrefs();
    return name;
  }
  async function loadLayout(name) {
    const p = ensurePrefs();
    const snap = p.savedLayouts[name];
    if (!snap) return false;
    // Keep savedLayouts; restore everything else from the snapshot.
    const layouts = p.savedLayouts;
    _ctx.userPrefs = Object.assign({}, snap, { savedLayouts: layouts });
    await persistPrefs();
    await renderDashboard(_mount, _ctx);
    return true;
  }
  async function resetLayout() {
    // Keep savedLayouts so the user can still recover; clear everything else.
    const layouts = (_ctx.userPrefs && _ctx.userPrefs.savedLayouts) || {};
    _ctx.userPrefs = { savedLayouts: layouts };
    await persistPrefs();
    await renderDashboard(_mount, _ctx);
  }
  function exportLayout() {
    const p = ensurePrefs();
    return JSON.stringify(p, null, 2);
  }
  async function importLayout(json) {
    let parsed = null;
    try { parsed = (typeof json === 'string') ? JSON.parse(json) : json; }
    catch (e) { throw new Error('Invalid layout JSON: ' + e.message); }
    if (!parsed || typeof parsed !== 'object') throw new Error('Layout must be an object');
    _ctx.userPrefs = parsed;
    await persistPrefs();
    await renderDashboard(_mount, _ctx);
    return true;
  }
  function setTitle(id, newTitle) {
    const p = ensurePrefs();
    const clean = String(newTitle || '').trim().slice(0, 80);
    if (!clean) { delete p.titles[id]; } else { p.titles[id] = clean; }
    const card = _card(id);
    const titleEl = card && card.querySelector('.wg-title');
    if (titleEl) {
      const w = WIDGETS.find(x => x.id === id);
      titleEl.textContent = clean || (w && w.title) || id;
    }
    persistPrefs();
  }

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

  // P3: in-place title editor. Replaces the title with a contentEditable span,
  // commits on blur or Enter, cancels on Esc.
  function _editTitle(ev, widgetId) {
    if (ev) { ev.stopPropagation(); ev.preventDefault?.(); }
    const card = _card(widgetId);
    const titleEl = card && card.querySelector('.wg-title');
    if (!titleEl || titleEl.dataset.editing === '1') return;
    titleEl.dataset.editing = '1';
    const original = titleEl.textContent;
    titleEl.contentEditable = 'true';
    titleEl.style.outline = '2px solid var(--jm-primary,#7c3aed)';
    titleEl.style.borderRadius = '4px';
    titleEl.style.padding = '0 4px';
    titleEl.focus();
    // Select all text.
    const sel = window.getSelection(); const range = document.createRange();
    range.selectNodeContents(titleEl); sel.removeAllRanges(); sel.addRange(range);
    const commit = () => {
      titleEl.contentEditable = 'false';
      titleEl.style.outline = ''; titleEl.style.padding = '';
      titleEl.removeAttribute('data-editing');
      setTitle(widgetId, titleEl.textContent);
      titleEl.removeEventListener('blur', commit);
      titleEl.removeEventListener('keydown', keys);
    };
    const keys = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
      if (e.key === 'Escape') { titleEl.textContent = original; titleEl.blur(); }
    };
    titleEl.addEventListener('blur', commit);
    titleEl.addEventListener('keydown', keys);
  }

  global.EduOSWidgets = { WIDGETS, register, _lib: _LIB, resolveWidgets, hiddenWidgets, renderDashboard, boot, getContext, widgetForIntent, handleCommand, listen, togglePin, removeWidget, addWidget, toggleCollapse, cycleSize, setAccent, reorder, toggleFavorite, toggleArchive, setDensity, setTheme, toggleSection, cycleTypeSize, setTitle, _editTitle, toggleGroup, saveLayout, loadLayout, resetLayout, exportLayout, importLayout, api, esc };
})(window);
