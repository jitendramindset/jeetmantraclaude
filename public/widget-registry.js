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
      render: d => { const it = listOf(d, 'items'); if (!it.length) return empty('No courses in progress yet.', { label: '🛒 Browse marketplace', onclick: "location.hash='#/m/marketplace'" }); return it.slice(0, 4).map(c => `<a class="wg-row" href="dashboard.html"><span class="wg-row-t">${esc(c.title || c.course_title || c.course_id)}</span><span class="wg-bar"><i style="width:${pct(c.progress)}%"></i></span><span class="wg-row-x">${pct(c.progress)}%</span></a>`).join(''); }
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
      render: (d, ctx) => { const c = listOf(d, 'liveClasses', 'classes', 'upcoming', 'items'); const isStudent = (ctx && (ctx.roles||[]).includes('student')); if (!c.length) return empty('No upcoming classes.', { label: isStudent?'🛒 Browse courses':'📡 Schedule a class', onclick: isStudent?"location.hash='#/m/marketplace'":"if(typeof openSchedule==='function')openSchedule();else location.hash='#/m/calendar'" }); return c.slice(0, 5).map(x => `<div class="wg-row"><span class="wg-row-t">${esc(x.title || x.course_title || 'Class')}</span><span class="wg-row-x">${when(x.scheduled_time || x.start_at || x.starts_at)}</span></div>`).join(''); }
    },
    {
      id: 'pending-eval', title: 'Pending Evaluation', roles: TEACHING, capability: 'assignment.grade', category: 'teaching', size: 'small', priority: 22,
      aiTriggers: ['pending evaluation', 'grade', 'essays to grade'],
      dataSource: () => api('/teacher/essays/pending'),
      render: d => { const it = listOf(d, 'items', 'essays'); if (!it.length) return empty('Inbox zero — nothing to grade.', { label: '📝 Create an assignment', onclick: "if(typeof openAssignmentEditor==='function')openAssignmentEditor();else location.hash='#/m/tests'" }); return `<div class="wg-big">${it.length}</div><div class="wg-sub">submissions awaiting your grade</div><a class="wg-link" href="dashboard.html#grade">Open grading →</a>`; }
    },
    {
      id: 'revenue', title: 'Revenue', roles: CREATOR.concat(['institute_owner']), capability: 'payment.read', category: 'finance', size: 'medium', priority: 30,
      aiTriggers: ['revenue', 'earnings', 'income', 'show revenue'],
      dataSource: () => api('/teacher/payments'),
      render: d => { const p = listOf(d, 'payments'); const done = p.filter(x => x.status === 'completed'); const total = done.reduce((s, x) => s + (Number(x.amount) || 0), 0); return `<div class="wg-big">${fmtMoney(d?.total ?? total)}</div><div class="wg-sub">${done.length} completed payment${done.length !== 1 ? 's' : ''}</div><a class="wg-link" href="dashboard.html#payments">View payouts →</a>`; }
    },
    {
      id: 'my-courses', title: 'My Courses', roles: CREATOR, capability: 'course.edit', category: 'teaching', size: 'medium', priority: 18,
      aiTriggers: ['my courses', 'manage courses', 'course list'],
      dataSource: () => api('/courses?mine=1'),
      render: d => { const c = listOf(d, 'courses'); if (!c.length) return empty('No courses yet — create your first.', { label: '➕ Create a course', onclick: "if(typeof openCourseCreator==='function')openCourseCreator();else location.hash='#create'" }); return c.slice(0, 4).map(x => `<a class="wg-row" href="dashboard.html#course"><span class="wg-row-t">${esc(x.title || 'Course')}</span><span class="wg-row-x">${x.is_active === false ? 'draft' : (x.category || '')}</span></a>`).join('') + (c.length > 4 ? `<a class="wg-link" href="dashboard.html#courses">+${c.length - 4} more →</a>` : ''); }
    },
    {
      id: 'my-listings', title: 'Marketplace Sales', roles: SELLERS, category: 'finance', size: 'small', priority: 38,
      aiTriggers: ['my listings', 'marketplace sales', 'my sales'],
      dataSource: () => api('/marketplace/my/listings'),
      render: d => { const l = listOf(d, 'listings'); if (!l.length) return empty('No listings yet — turn a course into income.', { label: '🛒 List a course', onclick: "location.hash='#/m/marketplace'" }); const active = l.filter(x => x.status === 'active' || !x.status).length; return `<div class="wg-big">${l.length}</div><div class="wg-sub">listing${l.length !== 1 ? 's' : ''} · ${active} active</div><a class="wg-link" href="marketplace.html">Manage listings →</a>`; }
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
      render: d => { const n = listOf(d, 'notifications'); const total = d?.total ?? n.length; if (!total) return empty('All caught up — no new notifications.', { label: '🔔 Open notifications', onclick: "if(typeof toggleNotifs==='function')toggleNotifs(event);else location.hash='#/m/notifications'" }); return `<div class="wg-big" style="cursor:pointer" onclick="if(typeof toggleNotifs==='function')toggleNotifs(event)">${total}</div><div class="wg-sub">unread — tap to open</div>` + n.slice(0, 3).map(x => `<div class="wg-row"><span class="wg-row-t">${esc(x.title || x.message || 'Notification')}</span></div>`).join(''); }
    },
    {
      id: 'leaderboard', title: 'Leaderboard', roles: ['student'], category: 'learning', size: 'small', priority: 35,
      aiTriggers: ['leaderboard', 'rank', 'my rank'],
      dataSource: () => api('/gamification/summary'),
      render: d => { const s = d?.summary || d || {}; const xp = s.xp ?? s.total_xp ?? 0; const lvl = s.level ?? 1; return `<div class="wg-big">Lv ${pct(lvl)}</div><div class="wg-sub">${pct(xp)} XP${s.rank ? ' · rank #' + pct(s.rank) : ''}</div>`; }
    },
    {
      id: 'certificates', title: 'My Certificates', roles: ['student'], category: 'learning', size: 'small', priority: 55,
      aiTriggers: ['certificates', 'my certificates'],
      dataSource: () => api('/certificates/my'),
      render: d => { const c = listOf(d, 'certificates'); if (!c.length) return empty('Earn your first certificate by completing a course.', { label: '📚 Resume learning', onclick: "location.hash='#/m/marketplace'" }); return `<div class="wg-big">${c.length}</div><div class="wg-sub">earned</div>` + c.slice(0, 3).map(x => `<div class="wg-row"><span class="wg-row-t">${esc(x.course_title || x.title || 'Certificate')}</span></div>`).join(''); }
    },
    {
      id: 'messages', title: 'Messages', roles: null, category: 'social', size: 'small', priority: 46,
      aiTriggers: ['messages', 'unread messages', 'chat'],
      dataSource: () => api('/chat/unread'),
      render: d => { const total = d?.total ?? d?.unread ?? (listOf(d, 'rooms', 'threads').length); if (!total) return empty('No unread messages.'); return `<div class="wg-big">${pct(total)}</div><div class="wg-sub">unread · <a class="wg-link" href="dashboard.html#messages">Open inbox →</a></div>`; }
    },
    {
      id: 'attendance-pending', title: 'Attendance', roles: TEACHING, capability: 'attendance.mark', category: 'teaching', size: 'small', priority: 24,
      aiTriggers: ['attendance', 'take attendance', 'mark attendance'],
      render: () => `<div class="wg-sub">Mark today's roster across your batches.</div><a class="wg-action" style="margin-top:10px" href="dashboard.html#attendance">✓ Take attendance</a>`
    },
    {
      id: 'weak-students', title: 'Students Needing Help', roles: TEACHING, capability: 'analytics.read', category: 'teaching', size: 'small', priority: 28,
      aiTriggers: ['weak students', 'at risk', 'students needing help'],
      render: () => `<div class="wg-sub">Spot low-progress / low-attendance students from course analytics.</div><a class="wg-action" style="margin-top:10px" href="dashboard.html#analytics">📉 Open analytics</a>`
    },
    {
      id: 'timetable', title: 'Timetable', roles: ORG_ADMIN, capability: 'live.schedule', category: 'ops', size: 'medium', priority: 26,
      aiTriggers: ['timetable', 'class schedule', 'weekly schedule'],
      dataSource: () => api('/timetable/templates'),
      render: d => { const t = listOf(d, 'templates'); if (!t.length) return empty('No timetable templates yet.', { label: '📅 Create timetable', onclick: "location.hash='#timetable'" }); return t.slice(0, 4).map(x => `<div class="wg-row"><span class="wg-row-t">${esc(x.name || 'Timetable')}</span></div>`).join('') + `<a class="wg-link" href="dashboard.html#timetable">Manage →</a>`; }
    },
    {
      id: 'admissions', title: 'Admissions', roles: ORG_ADMIN, capability: 'admissions.manage', category: 'ops', size: 'small', priority: 32,
      aiTriggers: ['admissions', 'new admissions', 'enrollment intake'],
      dataSource: () => api('/eduos/admissions'),
      render: d => { const a = listOf(d, 'admissions', 'items'); return `<div class="wg-big">${a.length}</div><div class="wg-sub">recent admissions · <a class="wg-link" href="dashboard.html#admissions">Manage →</a></div>`; }
    },
    {
      id: 'fees', title: 'Fees', roles: ORG_ADMIN, capability: 'billing.manage', category: 'finance', size: 'small', priority: 34,
      aiTriggers: ['fees', 'fee invoices', 'pending fees'],
      dataSource: () => api('/eduos/fees/invoices'),
      render: d => { const inv = listOf(d, 'invoices', 'items'); const due = inv.filter(x => x.status !== 'paid'); return `<div class="wg-big">${due.length}</div><div class="wg-sub">unpaid invoices · <a class="wg-link" href="dashboard.html#fees">Collect →</a></div>`; }
    },
    {
      id: 'bookings', title: 'Bookings', roles: SPORTS, capability: 'booking.manage', category: 'ops', size: 'medium', priority: 30,
      aiTriggers: ['bookings', 'court bookings', 'slot bookings'],
      dataSource: () => api('/bookings/received'),
      render: d => { const b = listOf(d, 'bookings', 'items'); if (!b.length) return empty('No bookings yet.', { label: '📅 Book a resource', onclick: "location.hash='#bookings'" }); return b.slice(0, 5).map(x => `<div class="wg-row"><span class="wg-row-t">${esc(x.resource?.title || x.resource_type || 'Booking')}</span><span class="wg-row-x">${when(x.start_at)}</span></div>`).join(''); }
    },
    {
      id: 'children', title: 'My Children', roles: ['parent'], category: 'learning', size: 'medium', priority: 12,
      aiTriggers: ['my children', 'my child', 'kids'],
      dataSource: () => api('/parent/children'),
      render: d => { const ch = listOf(d, 'children', 'students', 'items'); if (!ch.length) return empty('Link a child to see their progress.', { label: '👪 Link child', onclick: "location.hash='#link-child'" }); return ch.slice(0, 4).map(c => `<a class="wg-row" href="dashboard.html#child"><span class="wg-row-t">${esc(c.full_name || c.name || 'Child')}</span><span class="wg-row-x">${c.class || c.grade || ''}</span></a>`).join(''); }
    },
    {
      id: 'network', title: 'Network', roles: ['partner', 'franchise'], category: 'finance', size: 'small', priority: 36,
      aiTriggers: ['network', 'branches', 'franchise'],
      render: () => `<div class="wg-sub">Track branches, network revenue and per-branch KPIs.</div><a class="wg-action" style="margin-top:10px" href="dashboard.html#network">🌐 Open network</a>`
    },
    {
      id: 'ai-tutor', title: 'AI Copilot', roles: null, category: 'ai', size: 'small', priority: 60,
      render: () => `<div class="wg-sub">Ask anything — "show revenue", "today's classes", "create course".</div><a class="wg-action" style="margin-top:10px" href="dashboard.html#ai">🤖 Open Copilot</a>`
    }
  ];

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

  async function boot(mountEl) {
    if (!token()) { location.href = '/login.html'; return; }
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

  global.EduOSWidgets = { WIDGETS, resolveWidgets, hiddenWidgets, renderDashboard, boot, getContext, widgetForIntent, handleCommand, listen, togglePin, removeWidget, addWidget, toggleCollapse, cycleSize, setAccent, reorder, api, esc };
})(window);
