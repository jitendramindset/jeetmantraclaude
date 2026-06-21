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
  const empty = msg => `<div class="wg-empty">${esc(msg)}</div>`;

  // ── WIDGET LIBRARY ────────────────────────────────────────────────────────
  // Each manifest: id, title, roles[], capability?, category, size, priority,
  // dataSource(ctx)→data, render(data,ctx)→html, actions?, aiTriggers?.
  const CREATOR = ['teacher', 'coaching', 'school', 'partner', 'corporate_trainer', 'content_creator', 'franchise', 'coach', 'trainer'];

  const WIDGETS = [
    {
      id: 'quick-actions', title: 'Quick Actions', roles: null, category: 'ops', size: 'full', priority: 5,
      render: (_, ctx) => {
        const has = c => (ctx.capabilities || []).includes(c) || (ctx.roles || []).includes('admin');
        const A = [
          has('course.create') && ['＋ New course', 'dashboard.html#create'],
          has('live.schedule') && ['📡 Schedule class', 'dashboard.html#live'],
          has('attendance.mark') && ['✓ Take attendance', 'dashboard.html#attendance'],
          ['🛒 Browse marketplace', 'marketplace.html'],
          ['🤖 Ask AI', 'dashboard.html#ai']
        ].filter(Boolean);
        return `<div class="wg-actions">${A.map(([l, h]) => `<a class="wg-action" href="${h}">${esc(l)}</a>`).join('')}</div>`;
      }
    },
    {
      id: 'streak', title: 'Learning Streak', roles: ['student'], category: 'learning', size: 'small', priority: 10,
      aiTriggers: ['streak', 'my streak'],
      dataSource: () => api('/gamification/streak'),
      render: d => { const s = d?.streak || {}; return `<div class="wg-big">${pct(s.current_streak)}🔥</div><div class="wg-sub">day streak · longest ${pct(s.longest_streak)} · ${pct(s.total_days)} active days</div>`; }
    },
    {
      id: 'continue-learning', title: 'Continue Learning', roles: ['student'], category: 'learning', size: 'medium', priority: 15,
      aiTriggers: ['continue learning', 'resume', 'my courses'],
      dataSource: () => api('/student/continue-learning'),
      render: d => { const it = listOf(d, 'items'); if (!it.length) return empty('No courses in progress — explore the marketplace.'); return it.slice(0, 4).map(c => `<a class="wg-row" href="dashboard.html"><span class="wg-row-t">${esc(c.title || c.course_title || c.course_id)}</span><span class="wg-bar"><i style="width:${pct(c.progress)}%"></i></span><span class="wg-row-x">${pct(c.progress)}%</span></a>`).join(''); }
    },
    {
      id: 'assignments-due', title: 'Assignments Due', roles: ['student'], category: 'learning', size: 'small', priority: 20,
      aiTriggers: ['assignments', 'homework', 'due'],
      dataSource: () => api('/assignments/my'),
      render: d => { const a = listOf(d, 'assignments').filter(x => !x.submitted && !x.submission); if (!a.length) return empty('All caught up 🎉'); return a.slice(0, 5).map(x => `<div class="wg-row"><span class="wg-row-t">${esc(x.title || 'Assignment')}</span><span class="wg-row-x">${x.due_date ? when(x.due_date) : ''}</span></div>`).join(''); }
    },
    {
      id: 'upcoming-classes', title: 'Upcoming Classes', roles: null, category: 'teaching', size: 'medium', priority: 25,
      aiTriggers: ["today's classes", 'upcoming classes', 'schedule', 'open calendar'],
      dataSource: () => api('/live-classes/upcoming'),
      render: d => { const c = listOf(d, 'liveClasses', 'classes', 'upcoming', 'items'); if (!c.length) return empty('No upcoming classes.'); return c.slice(0, 5).map(x => `<div class="wg-row"><span class="wg-row-t">${esc(x.title || x.course_title || 'Class')}</span><span class="wg-row-x">${when(x.scheduled_time || x.start_at || x.starts_at)}</span></div>`).join(''); }
    },
    {
      id: 'pending-eval', title: 'Pending Evaluation', roles: CREATOR, capability: 'assignment.grade', category: 'teaching', size: 'small', priority: 22,
      aiTriggers: ['pending evaluation', 'grade', 'essays to grade'],
      dataSource: () => api('/teacher/essays/pending'),
      render: d => { const it = listOf(d, 'items', 'essays'); if (!it.length) return empty('Nothing to grade.'); return `<div class="wg-big">${it.length}</div><div class="wg-sub">submissions awaiting your grade</div><a class="wg-link" href="dashboard.html#grade">Open grading →</a>`; }
    },
    {
      id: 'revenue', title: 'Revenue', roles: CREATOR.concat(['institute_owner']), capability: 'payment.read', category: 'finance', size: 'medium', priority: 30,
      aiTriggers: ['revenue', 'earnings', 'income', 'show revenue'],
      dataSource: () => api('/teacher/payments'),
      render: d => { const p = listOf(d, 'payments'); const done = p.filter(x => x.status === 'completed'); const total = done.reduce((s, x) => s + (Number(x.amount) || 0), 0); return `<div class="wg-big">${fmtMoney(d?.total ?? total)}</div><div class="wg-sub">${done.length} completed payment${done.length !== 1 ? 's' : ''}</div><a class="wg-link" href="dashboard.html#payments">View payouts →</a>`; }
    },
    {
      id: 'recommended', title: 'Recommended', roles: ['student', 'guest'], category: 'learning', size: 'large', priority: 40,
      aiTriggers: ['recommended', 'trending courses'],
      dataSource: () => api('/marketplace/trending?limit=6'),
      render: d => { const l = listOf(d, 'listings'); if (!l.length) return empty('No recommendations yet.'); return `<div class="wg-cards">${l.slice(0, 6).map(x => { const c = x.courses || {}; return `<a class="wg-mini" href="marketplace.html"><div class="wg-mini-t">${esc(c.title || 'Course')}</div><div class="wg-mini-x">${c.category || ''} · ${x.price ? fmtMoney(x.price) : 'Free'}</div></a>`; }).join('')}</div>`; }
    },
    {
      id: 'notifications', title: 'Notifications', roles: null, category: 'social', size: 'small', priority: 45,
      aiTriggers: ['notifications', 'alerts'],
      dataSource: () => api('/notifications/unread'),
      render: d => { const n = listOf(d, 'notifications'); const total = d?.total ?? n.length; if (!total) return empty('No new notifications.'); return `<div class="wg-big">${total}</div><div class="wg-sub">unread</div>` + n.slice(0, 3).map(x => `<div class="wg-row"><span class="wg-row-t">${esc(x.title || x.message || 'Notification')}</span></div>`).join(''); }
    },
    {
      id: 'ai-tutor', title: 'AI Copilot', roles: null, category: 'ai', size: 'small', priority: 50,
      render: () => `<div class="wg-sub">Ask anything — "show revenue", "today's classes", "create course".</div><a class="wg-action" style="margin-top:10px" href="dashboard.html#ai">🤖 Open Copilot</a>`
    }
  ];

  // ── RESOLVER (audit §1) ─────────────────────────────────────────────────────
  function resolveWidgets(ctx) {
    const roles = new Set(ctx.roles || []);
    const caps = new Set(ctx.capabilities || []);
    const isAdmin = roles.has('admin');
    const adminCfg = ctx.adminWidgets || null;     // org.settings.widgets (W3 hook)
    const prefs = ctx.userPrefs || {};             // add/remove/pin/order (W3 hook)
    const removed = new Set(prefs.removed || []);
    const pinned = new Set(prefs.pinned || []);

    let list = WIDGETS.filter(w => {
      if (w.roles && !isAdmin && !w.roles.some(r => roles.has(r))) return false;        // role gate (null = all)
      if (w.capability && !isAdmin && !caps.has(w.capability)) return false;             // capability gate
      if (adminCfg && adminCfg[w.id] === false) return false;                            // admin disabled
      if (removed.has(w.id)) return false;                                               // user removed
      return true;
    });
    list.forEach(w => { w._pinned = pinned.has(w.id); });
    list.sort((a, b) => (b._pinned ? 1 : 0) - (a._pinned ? 1 : 0) || (a.priority || 50) - (b.priority || 50));
    return list;
  }

  // ── RENDERER ────────────────────────────────────────────────────────────────
  function skeleton() { return '<div class="wg-skel"></div><div class="wg-skel w60"></div>'; }

  async function renderWidget(w, ctx) {
    const card = document.createElement('section');
    card.className = 'wg-card wg-' + (w.size || 'medium') + (w._pinned ? ' wg-pinned' : '');
    card.dataset.widget = w.id;
    card.innerHTML = `<header class="wg-head"><span class="wg-title">${esc(w.title)}</span>${w._pinned ? '<span class="wg-pin">📌</span>' : ''}</header><div class="wg-body">${skeleton()}</div>`;
    const body = card.querySelector('.wg-body');
    try {
      const data = w.dataSource ? await w.dataSource(ctx) : null;
      body.innerHTML = w.render(data, ctx);
    } catch (e) {
      body.innerHTML = empty('Couldn’t load right now.');
    }
    return card;
  }

  async function renderDashboard(mountEl, ctx) {
    const widgets = resolveWidgets(ctx);
    mountEl.innerHTML = '';
    // Render concurrently, keep manifest order.
    const cards = await Promise.all(widgets.map(w => renderWidget(w, ctx)));
    cards.forEach(c => mountEl.appendChild(c));
    return widgets.map(w => w.id);
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

  async function boot(mountEl) {
    if (!token()) { location.href = '/login.html'; return; }
    const ctx = await getContext();
    const ids = await renderDashboard(mountEl, ctx);
    return { ctx, rendered: ids };
  }

  // AI/command-palette hook: phrase → widget id (audit §6).
  function widgetForIntent(phrase) {
    const p = String(phrase || '').toLowerCase();
    for (const w of WIDGETS) if ((w.aiTriggers || []).some(t => p.includes(t))) return w.id;
    return null;
  }

  global.EduOSWidgets = { WIDGETS, resolveWidgets, renderDashboard, boot, getContext, widgetForIntent, api, esc };
})(window);
