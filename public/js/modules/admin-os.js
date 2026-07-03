(function(g) {
var _CSS = [
  ':root { color-scheme: light dark; }',
  '* { box-sizing: border-box; }',
  'html, body { margin: 0; padding: 0; background: var(--jm-bg, #f6f7f9); color: var(--jm-text, #111); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; height: 100%; }',
  '.shell { display: grid; grid-template-columns: 240px 1fr; grid-template-rows: 56px 1fr; height: 100vh; min-height: 100vh; }',
  '.topbar { grid-column: 1/3; display: flex; align-items: center; gap: 12px; padding: 0 16px; background: var(--jm-surface, var(--jm-text-inv,#fff)); border-bottom: 1px solid var(--jm-border, #e5e7eb); position: sticky; top: 0; z-index: 20; }',
  '.topbar .brand { font-weight: 800; letter-spacing: -0.02em; font-size: 15px; }',
  '.topbar .brand .pill { background: linear-gradient(135deg, var(--jm-primary,#7c3aed), var(--jm-accent-pink,#ec4899)); color: var(--jm-text-inv,#fff); padding: 1px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px; vertical-align: 2px; }',
  '.topbar .grow { flex: 1; }',
  '.cmdk { width: 360px; max-width: 40vw; position: relative; }',
  '.cmdk input { width: 100%; padding: 7px 30px 7px 10px; background: var(--jm-surface-2, #f3f4f6); border: 1px solid var(--jm-border, #e5e7eb); border-radius: 6px; color: inherit; font-size: 13px; }',
  '.cmdk .kbd { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 10px; color: var(--jm-text-muted, #999); background: var(--jm-surface, var(--jm-text-inv,#fff)); padding: 1px 5px; border: 1px solid var(--jm-border, #e5e7eb); border-radius: 3px; }',
  '.tenant-switcher { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; background: var(--jm-surface-2, #f3f4f6); border: 1px solid var(--jm-border, #e5e7eb); border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
  '.status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 99px; font-size: 11px; font-weight: 700; background: #ecfdf5; color: var(--jm-success,#16a34a); }',
  '.status-pill.degraded { background: #fffbeb; color: #b45309; }',
  '.status-pill.down { background: #fef2f2; color: var(--jm-danger,var(--jm-danger,#ef4444)); }',
  '.status-pill .dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }',
  '.icon-btn { background: none; border: none; cursor: pointer; padding: 5px; border-radius: 6px; font-size: 16px; }',
  '.icon-btn:hover { background: var(--jm-surface-2, #f3f4f6); }',
  '.sidebar { background: var(--jm-surface, var(--jm-text-inv,#fff)); border-right: 1px solid var(--jm-border, #e5e7eb); padding: 8px 6px; overflow-y: auto; }',
  '.nav-item { display: flex; align-items: center; gap: 9px; padding: 7px 10px; border-radius: 6px; cursor: pointer; color: var(--jm-text-strong, #111); font-size: 13px; font-weight: 500; user-select: none; position: relative; }',
  '.nav-item:hover { background: var(--jm-surface-2, #f3f4f6); }',
  '.nav-item.active { background: color-mix(in oklab, var(--jm-primary, var(--jm-primary,#7c3aed)) 12%, transparent); color: var(--jm-primary, var(--jm-primary,#7c3aed)); font-weight: 600; }',
  '.nav-item .ic { font-size: 15px; width: 18px; text-align: center; }',
  '.nav-item .badge { margin-left: auto; background: var(--jm-danger,#ef4444); color: var(--jm-text-inv,#fff); font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 999px; }',
  '.nav-group-title { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--jm-text-muted, #888); padding: 12px 12px 4px; }',
  '.content { overflow-y: auto; padding: 18px 22px; }',
  '.page-title { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 4px; }',
  '.page-sub { color: var(--jm-text-muted, #6b7280); font-size: 13px; margin: 0 0 18px; }',
  '.kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 18px; }',
  '.kpi { background: var(--jm-surface, var(--jm-text-inv,#fff)); border: 1px solid var(--jm-border, #e5e7eb); border-radius: 10px; padding: 14px; position: relative; overflow: hidden; }',
  '.kpi::before { content: \'\'; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--sc,#7c3aed); }',
  '.kpi .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--jm-text-muted, #6b7280); }',
  '.kpi .value { font-size: 24px; font-weight: 800; margin-top: 4px; letter-spacing: -0.02em; }',
  '.kpi .sub { font-size: 11px; color: var(--jm-text-muted, #6b7280); margin-top: 2px; }',
  '.row { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }',
  '@media (max-width: 1024px) { .row { grid-template-columns: 1fr; } }',
  '@media (max-width: 768px) {',
  '  .shell { grid-template-columns: minmax(0, 1fr); grid-template-rows: 56px auto 1fr; }',
  '  .topbar { grid-column: 1 / -1; min-width: 0; }',
  '  .sidebar { display: flex; flex-direction: row; align-items: center; gap: 6px; min-width: 0; max-width: 100vw; overflow-x: auto; overflow-y: hidden; white-space: nowrap; border-right: 0; border-bottom: 1px solid var(--jm-border, #e5e7eb); padding: 6px 8px; }',
  '  .sidebar .nav-group-title { display: none; }',
  '  .nav-item { flex: 0 0 auto; }',
  '  .nav-item .badge { margin-left: 6px; }',
  '  .content { padding: 14px; min-width: 0; }',
  '  .cmdk { display: none; }',
  '}',
  '.card { background: var(--jm-surface, var(--jm-text-inv,#fff)); border: 1px solid var(--jm-border, #e5e7eb); border-radius: 10px; padding: 14px; }',
  '.card h3 { margin: 0 0 10px; font-size: 14px; font-weight: 700; letter-spacing: -0.01em; display: flex; align-items: center; gap: 6px; }',
  '.card h3 .accent { color: var(--jm-text-muted, #888); font-weight: 400; font-size: 11px; margin-left: auto; }',
  'table.list { width: 100%; border-collapse: collapse; font-size: 13px; }',
  'table.list th { text-align: left; padding: 8px 10px; background: var(--jm-surface-2, #f9fafb); font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--jm-text-muted, #6b7280); border-bottom: 1px solid var(--jm-border, #e5e7eb); }',
  'table.list td { padding: 9px 10px; border-bottom: 1px solid var(--jm-border, #e5e7eb); }',
  'table.list tr:last-child td { border-bottom: none; }',
  'table.list tr.row-hover:hover { background: var(--jm-surface-2, #f9fafb); cursor: pointer; }',
  '.spark { width: 100%; height: 60px; display: block; }',
  '.spark path { fill: none; stroke: var(--jm-primary, var(--jm-primary,#7c3aed)); stroke-width: 2; }',
  '.spark .area { fill: color-mix(in oklab, var(--jm-primary, var(--jm-primary,#7c3aed)) 14%, transparent); stroke: none; }',
  '.inbox-tile { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; background: var(--jm-surface-2, #f9fafb); margin-bottom: 8px; cursor: pointer; }',
  '.inbox-tile:hover { background: color-mix(in oklab, var(--jm-primary, var(--jm-primary,#7c3aed)) 8%, var(--jm-surface-2, #f9fafb)); }',
  '.inbox-tile .ic { font-size: 18px; }',
  '.inbox-tile .count { margin-left: auto; font-weight: 800; font-size: 18px; color: var(--jm-primary, var(--jm-primary,#7c3aed)); }',
  '.inbox-tile .count.zero { color: var(--jm-text-muted, #888); }',
  '.status-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }',
  '.status-card { padding: 10px 12px; border-radius: 8px; background: var(--jm-surface-2, #f9fafb); }',
  '.status-card .name { font-size: 11px; text-transform: uppercase; color: var(--jm-text-muted, #6b7280); }',
  '.status-card .val  { font-weight: 700; font-size: 13px; margin-top: 2px; }',
  '.status-card.up   { border-left: 3px solid var(--jm-success,#16a34a); }',
  '.status-card.degraded { border-left: 3px solid var(--jm-warn,#f59e0b); }',
  '.status-card.down { border-left: 3px solid var(--jm-danger,#ef4444); }',
  '.coming { text-align: center; padding: 60px 20px; color: var(--jm-text-muted, #888); }',
  '.coming .em { font-size: 38px; margin-bottom: 8px; }',
  '.skel { background: linear-gradient(90deg, var(--jm-surface-2, #f3f4f6) 0%, var(--jm-border, #e5e7eb) 50%, var(--jm-surface-2, #f3f4f6) 100%); background-size: 200% 100%; animation: skel 1.4s linear infinite; border-radius: 4px; }',
  '@keyframes skel { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }'
].join('\n');

var _HTML = [
  '<div class="shell">',
  '  <div class="topbar">',
  '    <div class="brand" data-embed-hide>⚡ EduOS<span class="pill">Platform OS</span></div>',
  '    <div class="cmdk">',
  '      <input id="cmdk-input" placeholder="Search users, courses, payments… (Cmd-K)">',
  '      <span class="kbd">⌘K</span>',
  '    </div>',
  '    <div class="grow"></div>',
  '    <div class="tenant-switcher" id="tenantSwitcher" title="Active tenant">🏫 <span id="tenantName">All tenants</span> ▾</div>',
  '    <div class="status-pill" id="statusPill" title="System status"><span class="dot"></span><span id="statusText">checking…</span></div>',
  '    <button class="icon-btn" title="Notifications">🔔</button>',
  '    <button class="icon-btn" title="Admin" onclick="window.location.href=\'/app\'">👤</button>',
  '  </div>',
  '  <div class="sidebar" id="adminOsSidebar">',
  '    <div class="nav-group-title">Platform</div>',
  '    <div class="nav-item active" data-section="overview"><span class="ic">📊</span> Overview</div>',
  '    <div class="nav-item" data-section="tenants"><span class="ic">🏫</span> Tenants &amp; Institutes</div>',
  '    <div class="nav-item" data-section="people"><span class="ic">👥</span> People</div>',
  '    <div class="nav-item" data-section="catalog"><span class="ic">📚</span> Catalog</div>',
  '    <div class="nav-group-title">Operations</div>',
  '    <div class="nav-item" data-section="live"><span class="ic">📡</span> Live &amp; Recordings</div>',
  '    <div class="nav-item" data-section="revenue"><span class="ic">💳</span> Revenue</div>',
  '    <div class="nav-item" data-section="bookings"><span class="ic">🎟️</span> Bookings &amp; Venues</div>',
  '    <div class="nav-item" data-section="growth"><span class="ic">📈</span> Growth &amp; CRM</div>',
  '    <div class="nav-item" data-section="support"><span class="ic">🎧</span> Support<span class="badge" id="badge-support" style="display:none"></span></div>',
  '    <div class="nav-group-title">Intelligence</div>',
  '    <div class="nav-item" data-section="automations"><span class="ic">🤖</span> Automations</div>',
  '    <div class="nav-item" data-section="aitrans"><span class="ic">🧠</span> AI &amp; Translations</div>',
  '    <div class="nav-item" data-section="analytics"><span class="ic">📉</span> Analytics</div>',
  '    <div class="nav-group-title">Org</div>',
  '    <div class="nav-item" data-section="franchise"><span class="ic">🌐</span> Franchise</div>',
  '    <div class="nav-item" data-section="widgets"><span class="ic">🧩</span> Widgets</div>',
  '    <div class="nav-item" data-section="integrations"><span class="ic">🔌</span> Integrations</div>',
  '    <div class="nav-item" data-section="system"><span class="ic">⚙️</span> System</div>',
  '  </div>',
  '  <div class="content" id="content"></div>',
  '</div>'
].join('\n');

function _init(container) {
  var _container = container;

  function el(id) { return _container.querySelector('#' + id) || document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function(c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function fmtMoney(n) { return '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }); }
  function fmtDate(s) { try { return new Date(s).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }); } catch(_) { return ''; } }

  var API = '/api';
  var STATE = { token: '', section: 'overview', activeInst: '' };

  async function api(path, opts) {
    opts = opts || {};
    var r = await fetch(API + path, Object.assign({}, opts, {
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + STATE.token
      }, STATE.activeInst ? { 'X-Active-Institution': STATE.activeInst } : {}, opts.headers || {})
    }));
    if (r.status === 401) { window.location.href = '/login.html'; throw new Error('auth'); }
    var ct = r.headers.get('content-type') || '';
    return ct.includes('application/json') ? r.json() : r.text();
  }

  // AUTH gate
  (function gate() {
    STATE.token = localStorage.getItem('jm_token') || '';
    var user = JSON.parse(localStorage.getItem('jm_user') || '{}');
    var role = user.user_type || user.role;
    if (!STATE.token || role !== 'admin') {
      window.location.href = '/login.html?next=/admin-os.html';
      return;
    }
    STATE.activeInst = localStorage.getItem('jm_active_institution') || '';
    if (STATE.activeInst === 'all') STATE.activeInst = '';
  })();

  async function loadTenantName() {
    var t = el('tenantName');
    if (!STATE.activeInst) { t.textContent = 'All tenants'; return; }
    try {
      var r = await api('/institutions/my-institutions');
      var links = r.institutions || r.links || [];
      var found = links.find(function(l) { return (l.institution_id || l.id) === STATE.activeInst; });
      t.textContent = found ? (found.name || found.institution_name || 'Tenant') : 'All tenants';
    } catch(_) { t.textContent = 'All tenants'; }
  }

  el('tenantSwitcher').onclick = async function() {
    var r = await api('/institutions/my-institutions').catch(function() { return { institutions: [] }; });
    var links = r.institutions || r.links || [];
    if (!links.length) { alert('No tenants linked'); return; }
    var choice = prompt('Switch to (0 = All tenants):\n' +
      ['All tenants'].concat(links.map(function(l) { return l.name || l.institution_name || 'Tenant'; }))
        .map(function(n, i) { return i + '. ' + n; }).join('\n'));
    var idx = parseInt(choice, 10);
    if (isNaN(idx)) return;
    if (idx === 0) { localStorage.removeItem('jm_active_institution'); STATE.activeInst = ''; }
    else if (links[idx - 1]) {
      var id = links[idx - 1].institution_id || links[idx - 1].id;
      localStorage.setItem('jm_active_institution', id);
      STATE.activeInst = id;
    }
    loadTenantName();
    render(STATE.section);
  };

  async function loadStatus() {
    try {
      var s = await api('/admin/system/status');
      var pill = el('statusPill');
      var text = el('statusText');
      pill.className = 'status-pill ' + (s.overall === 'up' ? '' : s.overall);
      text.textContent = s.overall === 'up' ? 'All systems normal' : s.overall === 'degraded' ? 'Degraded' : 'Outage';
    } catch (_) {
      el('statusPill').className = 'status-pill down';
      el('statusText').textContent = 'Unreachable';
    }
  }

  function sparkline(series, accentVar) {
    if (!series || !series.length) return '<div class="spark"></div>';
    var vals = series.map(function(p) { return Number(p.amount || p.value || 0); });
    var max = Math.max.apply(null, vals.concat([1]));
    var min = Math.min.apply(null, vals.concat([0]));
    var range = max - min || 1;
    var w = 100, h = 100;
    var stepX = w / Math.max(1, series.length - 1);
    var pts = vals.map(function(v, i) { return (i * stepX).toFixed(2) + ',' + (h - ((v - min) / range) * h).toFixed(2); });
    var line = 'M ' + pts.join(' L ');
    var area = line + ' L ' + w + ',' + h + ' L 0,' + h + ' Z';
    return '<svg class="spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none"><path class="area" d="' + area + '"></path><path d="' + line + '"></path></svg>';
  }

  var SECTIONS = {
    overview: renderOverview,
    tenants:  renderTenants,
    people:   renderPeople,
    catalog:  renderCatalog,
    live:     renderLive,
    revenue:  renderRevenue,
    bookings: renderBookings,
    growth:   function() { renderComingSoon('Growth & CRM', '📈', 'Leads · Admissions · Campaigns. Reuses /api/eduos/admissions.'); },
    support:  renderSupport,
    automations: function() { renderComingSoon('Automations', '🤖', 'n8n webhooks · Delivery health · Scheduled jobs · Templates. Reuses /api/n8n.'); },
    aitrans:  function() { renderComingSoon('AI & Translations', '🧠', 'Provider keys · Usage/spend by tenant · Quotas · Translation queue. Sprint 5.'); },
    analytics: renderAnalytics,
    franchise: function() { renderComingSoon('Franchise', '🌐', 'Branches · Network revenue · Per-branch KPIs. Reuses /api/eduos/franchise.'); },
    widgets:  renderWidgetsConfig,
    integrations: renderIntegrations,
    system:   renderSystem
  };

  _container.querySelectorAll('.nav-item').forEach(function(item) {
    item.onclick = function() {
      _container.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
      item.classList.add('active');
      render(item.dataset.section);
    };
  });

  function render(section) {
    STATE.section = section;
    var fn = SECTIONS[section] || SECTIONS.overview;
    fn();
  }

  async function renderOverview() {
    el('content').innerHTML = '<h1 class="page-title">Platform Overview</h1>' +
      '<p class="page-sub">Snapshot of the entire EduOS platform — KPIs, system status, and the operations action inbox.</p>' +
      '<div class="kpi-grid" id="kpiGrid">' +
      ['MAU', 'WAU', 'DAU', 'Users', 'Signups 30d', 'Revenue 30d'].map(function(l) {
        return '<div class="kpi" style="--sc:var(--jm-primary,#7c3aed)"><div class="label">' + l + '</div><div class="value"><div class="skel" style="width:60px;height:24px"></div></div></div>';
      }).join('') + '</div>' +
      '<div class="row">' +
      '<div class="card"><h3>💸 Revenue · last 30 days <span class="accent" id="rev30Total"></span></h3><div id="revSpark"><div class="skel" style="height:60px"></div></div></div>' +
      '<div class="card"><h3>📥 Action inbox</h3><div id="inbox"><div class="skel" style="height:30px;margin-bottom:8px"></div><div class="skel" style="height:30px;margin-bottom:8px"></div><div class="skel" style="height:30px"></div></div></div>' +
      '</div>' +
      '<div style="height:14px"></div>' +
      '<div class="row">' +
      '<div class="card"><h3>🛰 System status</h3><div id="sysStatus" class="status-grid"><div class="skel" style="height:48px"></div></div></div>' +
      '<div class="card"><h3>📜 Recent admin actions</h3><div id="recentAudit"><div class="skel" style="height:30px;margin-bottom:6px"></div><div class="skel" style="height:30px;margin-bottom:6px"></div></div></div>' +
      '</div>';

    Promise.allSettled([
      api('/admin/analytics/overview'),
      api('/admin/actions/inbox'),
      api('/admin/system/status'),
      api('/admin/audit?limit=8')
    ]).then(function(results) {
      var ov = results[0], inbox = results[1], sys = results[2], audit = results[3];
      if (ov.status === 'fulfilled') paintKpis(ov.value);
      if (inbox.status === 'fulfilled') paintInbox(inbox.value.inbox || {});
      if (sys.status === 'fulfilled') paintStatus(sys.value);
      if (audit.status === 'fulfilled') paintAudit(audit.value.events || []);
    });
  }

  function paintKpis(d) {
    var cards = [
      { sc: 'var(--jm-primary,#7c3aed)', label: 'MAU',         value: d.activity && d.activity.mau != null ? d.activity.mau : 0,   sub: 'Active in last 30d' },
      { sc: 'var(--jm-accent-cyan,#0ea5e9)', label: 'WAU',         value: d.activity && d.activity.wau != null ? d.activity.wau : 0,   sub: 'Active in last 7d' },
      { sc: 'var(--jm-success,#16a34a)', label: 'DAU',         value: d.activity && d.activity.dau != null ? d.activity.dau : 0,   sub: 'Active in last 24h' },
      { sc: 'var(--jm-warn,#f59e0b)', label: 'Users',       value: d.users && d.users.total != null ? d.users.total : 0,    sub: 'Total accounts' },
      { sc: 'var(--jm-accent-pink,#ec4899)', label: 'Signups 30d', value: d.users && d.users.signups30 != null ? d.users.signups30 : 0, sub: 'New this month' },
      { sc: '#6366f1', label: 'Revenue 30d', value: fmtMoney(d.revenue && d.revenue.last30Total || 0), sub: 'Completed payments' }
    ];
    el('kpiGrid').innerHTML = cards.map(function(k) {
      return '<div class="kpi" style="--sc:' + k.sc + '"><div class="label">' + k.label + '</div><div class="value">' + esc(k.value) + '</div><div class="sub">' + k.sub + '</div></div>';
    }).join('');
    el('revSpark').innerHTML = sparkline(d.revenue && d.revenue.series || []);
    el('rev30Total').textContent = fmtMoney(d.revenue && d.revenue.last30Total || 0);
  }

  function paintInbox(inbox) {
    var items = [
      { ic: '✅', name: 'Approvals', key: 'approvals' },
      { ic: '💸', name: 'Payouts',   key: 'payouts' },
      { ic: '🎧', name: 'Support tickets', key: 'tickets' },
      { ic: '🚩', name: 'Content reports', key: 'reports' }
    ];
    el('inbox').innerHTML = items.map(function(i) {
      var n = inbox[i.key] || 0;
      return '<div class="inbox-tile"><span class="ic">' + i.ic + '</span><span>' + i.name + '</span><span class="count ' + (n === 0 ? 'zero' : '') + '">' + n + '</span></div>';
    }).join('');
    var supBadge = el('badge-support');
    if (supBadge && inbox.tickets > 0) { supBadge.style.display = 'inline-block'; supBadge.textContent = inbox.tickets; }
  }

  function paintStatus(s) {
    var svc = s.services || [];
    el('sysStatus').innerHTML = svc.map(function(v) {
      return '<div class="status-card ' + v.status + '"><div class="name">' + esc(v.name) + '</div><div class="val">' + esc(v.status) + ' · ' + v.latency_ms + 'ms</div></div>';
    }).join('');
  }

  function paintAudit(events) {
    if (!events.length) { el('recentAudit').innerHTML = '<div style="color:var(--jm-text-muted);font-size:13px">No admin actions recorded yet.</div>'; return; }
    el('recentAudit').innerHTML = events.slice(0, 8).map(function(e) {
      return '<div style="padding:7px 0;border-bottom:1px solid var(--jm-border);font-size:12px"><strong>' + esc(e.action) + '</strong> · ' + esc(String(e.target_id || '').slice(0, 8)) + '<div style="color:var(--jm-text-muted);font-size:10px">' + (e.occurred_at ? new Date(e.occurred_at).toLocaleString() : '') + '</div></div>';
    }).join('');
  }

  async function renderTenants() {
    el('content').innerHTML = '<h1 class="page-title">Tenants &amp; Institutes</h1>' +
      '<p class="page-sub">Every institution on the platform — schools, coaching centers, franchises. Click a row for the per-tenant page (Sprint 2 follow-up).</p>' +
      '<div class="card" style="padding:0;overflow:hidden"><table class="list" id="tenantsTable"><thead><tr><th>Name</th><th>Type</th><th>Teachers</th><th>Students</th><th>Courses</th><th>Created</th><th>Status</th></tr></thead><tbody><tr><td colspan="7" style="padding:24px;text-align:center;color:var(--jm-text-muted)">Loading…</td></tr></tbody></table></div>';
    try {
      var r = await api('/admin/institutes?limit=50');
      var rows = r.institutes || [];
      var tbody = el('tenantsTable').querySelector('tbody');
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="padding:24px;text-align:center;color:var(--jm-text-muted)">No institutes registered yet</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map(function(t) {
        return '<tr class="row-hover" data-id="' + esc(t.id) + '"><td><strong>' + esc(t.name || '—') + '</strong><div style="color:var(--jm-text-muted);font-size:11px">' + esc(t.email || '') + '</div></td><td><span style="text-transform:capitalize">' + esc(t.type) + '</span></td><td>' + t.teacher_count + '</td><td>' + t.student_count + '</td><td>' + t.course_count + '</td><td>' + fmtDate(t.created_at) + '</td><td><span style="color:' + (t.is_active ? 'var(--jm-success,#16a34a)' : 'var(--jm-danger,var(--jm-danger,#ef4444))') + ';font-weight:700">' + (t.is_active ? 'Active' : 'Blocked') + '</span></td></tr>';
      }).join('');
    } catch (e) {
      el('tenantsTable').querySelector('tbody').innerHTML = '<tr><td colspan="7" style="padding:24px;text-align:center;color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</td></tr>';
    }
  }

  async function renderBookings() {
    el('content').innerHTML = '<h1 class="page-title">Bookings &amp; Venues</h1>' +
      '<p class="page-sub">Every booking across the unified booking engine — sports / mentor / room / workshop / event. Powered by GET /api/admin/bookings.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<select id="bk-status" onchange="renderBookings()" style="padding:5px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit"><option value="">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option><option value="no_show">No-show</option></select>' +
      '<select id="bk-type" onchange="renderBookings()" style="padding:5px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit"><option value="">All resources</option><option>course</option><option>ground</option><option>court</option><option>room</option><option>teacher</option><option>mentor</option><option>workshop</option><option>event</option><option>equipment</option></select>' +
      '</div>' +
      '<div class="card" style="padding:0;overflow:hidden"><table class="list" id="bookingsTable"><thead><tr><th>Resource</th><th>Type</th><th>Booker</th><th>Start</th><th>Party</th><th>Amount</th><th>Status</th></tr></thead><tbody><tr><td colspan="7" style="padding:24px;text-align:center;color:var(--jm-text-muted)">Loading…</td></tr></tbody></table></div>';
    try {
      var status = el('bk-status') ? el('bk-status').value : '';
      var type   = el('bk-type') ? el('bk-type').value : '';
      var qs = [];
      if (status) qs.push('status=' + encodeURIComponent(status));
      if (type)   qs.push('resource_type=' + encodeURIComponent(type));
      qs.push('limit=50');
      var r = await api('/admin/bookings?' + qs.join('&'));
      var rows = r.bookings || [];
      var tbody = el('bookingsTable').querySelector('tbody');
      if (!rows.length) { tbody.innerHTML = '<tr><td colspan="7" style="padding:24px;text-align:center;color:var(--jm-text-muted)">No bookings yet</td></tr>'; return; }
      var statusColor = function(s) { return ({pending:'#b45309',confirmed:'var(--jm-success,#16a34a)',cancelled:'#6b7280',completed:'#1d4ed8',no_show:'var(--jm-danger,var(--jm-danger,#ef4444))'})[s] || '#6b7280'; };
      tbody.innerHTML = rows.map(function(b) {
        return '<tr><td><strong>' + esc(b.resource && b.resource.title || b.resource_id || '—') + '</strong>' + (b.resource && b.resource.venue_name ? '<div style="font-size:11px;color:var(--jm-text-muted)">' + esc(b.resource.venue_name) + '</div>' : '') + '</td><td><span style="text-transform:capitalize">' + esc(b.resource_type) + '</span></td><td>' + esc(b.booker && b.booker.full_name || b.booker_id || '—') + '<div style="font-size:11px;color:var(--jm-text-muted)">' + esc(b.booker && b.booker.email || '') + '</div></td><td>' + new Date(b.start_at).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) + '</td><td>' + (b.party_size || 1) + '</td><td>' + (b.amount ? fmtMoney(b.amount) : '—') + '</td><td><span style="color:' + statusColor(b.status) + ';font-weight:700;text-transform:uppercase;font-size:11px">' + esc(b.status) + '</span></td></tr>';
      }).join('');
    } catch (e) {
      el('bookingsTable').querySelector('tbody').innerHTML = '<tr><td colspan="7" style="padding:24px;text-align:center;color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</td></tr>';
    }
  }

  async function renderPeople() {
    el('content').innerHTML = '<h1 class="page-title">People</h1>' +
      '<p class="page-sub">Every account on the platform — students, teachers, partners, institutions, staff. Powered by GET /api/admin/users.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<select id="pp-role" onchange="renderPeople()" style="padding:5px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit"><option value="">All roles</option><option>student</option><option>teacher</option><option>partner</option><option>school</option><option>coaching</option><option>franchise</option><option>corporate_trainer</option><option>content_creator</option><option>parent</option><option>admin</option></select>' +
      '<select id="pp-status" onchange="renderPeople()" style="padding:5px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit"><option value="">All statuses</option><option value="active">Active</option><option value="blocked">Blocked</option></select>' +
      '</div>' +
      '<div class="card" style="padding:0;overflow:hidden"><table class="list" id="peopleTable"><thead><tr><th>Name</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead><tbody><tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-text-muted)">Loading…</td></tr></tbody></table></div>';
    try {
      var role = el('pp-role') ? el('pp-role').value : '';
      var status = el('pp-status') ? el('pp-status').value : '';
      var qs = ['limit=50'];
      if (role) qs.push('role=' + encodeURIComponent(role));
      if (status) qs.push('status=' + encodeURIComponent(status));
      var r = await api('/admin/users?' + qs.join('&'));
      var rows = r.users || [];
      var tbody = el('peopleTable').querySelector('tbody');
      if (!rows.length) { tbody.innerHTML = '<tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-text-muted)">No users match</td></tr>'; return; }
      tbody.innerHTML = rows.map(function(u) {
        return '<tr><td><strong>' + esc(u.full_name || '—') + '</strong><div style="font-size:11px;color:var(--jm-text-muted)">' + esc(u.email || '') + '</div></td><td><span style="text-transform:capitalize">' + esc(u.user_type || '—') + '</span></td><td>' + fmtDate(u.created_at) + '</td><td><span style="color:' + (u.is_active === false ? 'var(--jm-danger,var(--jm-danger,#ef4444))' : 'var(--jm-success,#16a34a)') + ';font-weight:700">' + (u.is_active === false ? 'Blocked' : 'Active') + '</span></td></tr>';
      }).join('');
    } catch (e) {
      el('peopleTable').querySelector('tbody').innerHTML = '<tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</td></tr>';
    }
  }

  async function renderRevenue() {
    el('content').innerHTML = '<h1 class="page-title">Revenue</h1>' +
      '<p class="page-sub">Every payment across the platform — orders, completions, refunds. Powered by GET /api/admin/payments.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<select id="rv-status" onchange="renderRevenue()" style="padding:5px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit"><option value="">All statuses</option><option>created</option><option>completed</option><option>failed</option><option>refunded</option></select>' +
      '<input id="rv-q" placeholder="Search id / txn / user" onkeydown="if(event.key===\'Enter\')renderRevenue()" style="padding:5px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit">' +
      '</div>' +
      '<div class="card" style="padding:0;overflow:hidden"><table class="list" id="revenueTable"><thead><tr><th>Payment</th><th>Payer</th><th>Method</th><th>Amount</th><th>When</th><th>Status</th></tr></thead><tbody><tr><td colspan="6" style="padding:24px;text-align:center;color:var(--jm-text-muted)">Loading…</td></tr></tbody></table></div>';
    try {
      var status = el('rv-status') ? el('rv-status').value : '';
      var q = el('rv-q') && el('rv-q').value ? el('rv-q').value.trim() : '';
      var qs = ['limit=50'];
      if (status) qs.push('status=' + encodeURIComponent(status));
      if (q) qs.push('q=' + encodeURIComponent(q));
      var r = await api('/admin/payments?' + qs.join('&'));
      var rows = r.payments || [];
      var tbody = el('revenueTable').querySelector('tbody');
      if (!rows.length) { tbody.innerHTML = '<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--jm-text-muted)">No payments match</td></tr>'; return; }
      var statusColor = function(s) { return ({created:'#b45309',completed:'var(--jm-success,#16a34a)',failed:'var(--jm-danger,var(--jm-danger,#ef4444))',refunded:'#6b7280'})[s] || '#6b7280'; };
      tbody.innerHTML = rows.map(function(p) {
        return '<tr><td><strong style="font-size:12px">' + esc(p.transaction_id || p.id || '—') + '</strong></td><td>' + esc(p.payer_name || p.user_id || '—') + '<div style="font-size:11px;color:var(--jm-text-muted)">' + esc(p.payer_email || '') + '</div></td><td><span style="text-transform:capitalize">' + esc(p.payment_method || '—') + '</span></td><td>' + (p.amount != null ? fmtMoney(p.amount) : '—') + '</td><td>' + fmtDate(p.created_at) + '</td><td><span style="color:' + statusColor(p.status) + ';font-weight:700;text-transform:uppercase;font-size:11px">' + esc(p.status || '—') + '</span></td></tr>';
      }).join('');
    } catch (e) {
      el('revenueTable').querySelector('tbody').innerHTML = '<tr><td colspan="6" style="padding:24px;text-align:center;color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</td></tr>';
    }
  }

  async function renderSupport() {
    el('content').innerHTML = '<h1 class="page-title">Support</h1>' +
      '<p class="page-sub">Every support ticket + content abuse report across the platform. Powered by GET /api/support/tickets + /api/reports.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<select id="sp-status" onchange="renderSupport()" style="padding:5px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit"><option value="">All statuses</option><option>open</option><option>pending</option><option>resolved</option><option>closed</option></select>' +
      '<select id="sp-priority" onchange="renderSupport()" style="padding:5px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit"><option value="">All priorities</option><option>low</option><option>normal</option><option>high</option><option>urgent</option></select>' +
      '</div>' +
      '<h3 style="margin:4px 0 8px">🎧 Tickets</h3>' +
      '<div class="card" style="padding:0;overflow:hidden;margin-bottom:18px"><table class="list" id="ticketsTable"><thead><tr><th>Subject</th><th>Priority</th><th>Opened</th><th>Status</th></tr></thead><tbody><tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-text-muted)">Loading…</td></tr></tbody></table></div>' +
      '<h3 style="margin:4px 0 8px">🚩 Content reports</h3>' +
      '<div class="card" style="padding:0;overflow:hidden"><table class="list" id="reportsTable"><thead><tr><th>Target</th><th>Reason</th><th>Reported</th><th>Status</th></tr></thead><tbody><tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-text-muted)">Loading…</td></tr></tbody></table></div>';
    var status = el('sp-status') ? el('sp-status').value : '';
    var priority = el('sp-priority') ? el('sp-priority').value : '';
    try {
      var qs = [];
      if (status) qs.push('status=' + encodeURIComponent(status));
      if (priority) qs.push('priority=' + encodeURIComponent(priority));
      var r = await api('/support/tickets' + (qs.length ? '?' + qs.join('&') : ''));
      var rows = r.tickets || [];
      var tbody = el('ticketsTable').querySelector('tbody');
      if (!rows.length) { tbody.innerHTML = '<tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-text-muted)">No tickets</td></tr>'; }
      else {
        var sc = function(s) { return ({open:'#b45309',pending:'#1d4ed8',resolved:'var(--jm-success,#16a34a)',closed:'#6b7280'})[s] || '#6b7280'; };
        tbody.innerHTML = rows.map(function(t) {
          return '<tr><td><strong>' + esc(t.subject || '—') + '</strong></td><td><span style="text-transform:capitalize">' + esc(t.priority || 'normal') + '</span></td><td>' + fmtDate(t.created_at) + '</td><td><span style="color:' + sc(t.status) + ';font-weight:700;text-transform:uppercase;font-size:11px">' + esc(t.status || '—') + '</span></td></tr>';
        }).join('');
      }
    } catch (e) {
      el('ticketsTable').querySelector('tbody').innerHTML = '<tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</td></tr>';
    }
    try {
      var r2 = await api('/reports' + (status ? '?status=' + encodeURIComponent(status) : ''));
      var rows2 = r2.reports || [];
      var tbody2 = el('reportsTable').querySelector('tbody');
      if (!rows2.length) { tbody2.innerHTML = '<tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-text-muted)">No reports</td></tr>'; return; }
      tbody2.innerHTML = rows2.map(function(rr) {
        return '<tr><td><strong>' + esc(rr.target_type || '—') + '</strong> <span style="font-size:11px;color:var(--jm-text-muted)">' + esc(rr.target_id || '') + '</span></td><td>' + esc(rr.reason || '—') + '</td><td>' + fmtDate(rr.created_at) + '</td><td><span style="font-weight:700;text-transform:uppercase;font-size:11px">' + esc(rr.status || 'pending') + '</span></td></tr>';
      }).join('');
    } catch (e) {
      el('reportsTable').querySelector('tbody').innerHTML = '<tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</td></tr>';
    }
  }

  async function renderSystem() {
    el('content').innerHTML = '<h1 class="page-title">System</h1>' +
      '<p class="page-sub">Platform audit trail + database migrations. Powered by /api/admin/audit and /api/admin/migrations.</p>' +
      '<div class="card" style="padding:16px;margin-bottom:16px"><h3 style="margin:0 0 8px;font-size:14px">🗄️ Database migrations</h3>' +
      '<div style="font-size:11px;color:var(--jm-text-muted);margin-bottom:12px">Run pending SQL migrations against your Supabase instance via the /pg/query endpoint. Idempotent — safe to re-run.</div>' +
      '<div style="display:flex;gap:10px;align-items:center">' +
      '<select id="migFile" style="padding:8px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit;font-size:13px">' +
      '<option value="001_rls_policies.sql">001_rls_policies.sql — RLS on all tables</option>' +
      '<option value="002_indexes.sql">002_indexes.sql — Performance indexes (50+ columns)</option>' +
      '</select>' +
      '<button onclick="runMigration()" id="migBtn" style="padding:8px 16px;border:none;border-radius:6px;background:var(--jm-primary,#7c3aed);color:var(--jm-text-inv,#fff);font-weight:700;cursor:pointer">Run migration</button>' +
      '<span id="migMsg" style="font-size:13px;font-weight:700"></span></div></div>' +
      '<div class="card" style="padding:0;overflow:hidden"><table class="list" id="auditTable"><thead><tr><th>Action</th><th>Actor</th><th>Target</th><th>When</th></tr></thead><tbody><tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-text-muted)">Loading…</td></tr></tbody></table></div>';
    try {
      var r = await api('/admin/audit?limit=100');
      var rows = r.events || [];
      var tbody = el('auditTable').querySelector('tbody');
      if (!rows.length) { tbody.innerHTML = '<tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-text-muted)">No audit events yet</td></tr>'; return; }
      tbody.innerHTML = rows.map(function(a) {
        return '<tr><td><strong style="font-size:12px">' + esc(a.action || '—') + '</strong></td><td style="font-size:12px">' + esc(a.actor_id || a.actor_email || '—') + '</td><td style="font-size:12px">' + esc([a.target_type, a.target_id].filter(Boolean).join(' · ') || '—') + '</td><td>' + fmtDate(a.occurred_at || a.created_at) + '</td></tr>';
      }).join('');
    } catch (e) {
      el('auditTable').querySelector('tbody').innerHTML = '<tr><td colspan="4" style="padding:24px;text-align:center;color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</td></tr>';
    }
  }

  async function renderCatalog() {
    el('content').innerHTML = '<h1 class="page-title">Catalog</h1>' +
      '<p class="page-sub">Every published course / program across the platform. Powered by GET /api/marketplace.</p>' +
      '<div class="card" style="padding:0;overflow:hidden"><table class="list" id="catalogTable"><thead><tr><th>Course</th><th>Category</th><th>Creator</th><th>Price</th><th>Students</th></tr></thead><tbody><tr><td colspan="5" style="padding:24px;text-align:center;color:var(--jm-text-muted)">Loading…</td></tr></tbody></table></div>';
    try {
      var r = await api('/marketplace?limit=50');
      var rows = r.courses || r.items || r.data || [];
      var tbody = el('catalogTable').querySelector('tbody');
      if (!rows.length) { tbody.innerHTML = '<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--jm-text-muted)">No published courses</td></tr>'; return; }
      tbody.innerHTML = rows.map(function(c) {
        return '<tr><td><strong>' + esc(c.title || '—') + '</strong></td><td><span style="text-transform:capitalize">' + esc(c.category || c.category_id || '—') + '</span></td><td>' + esc(c.creator_name || c.instructor_name || c.teacher_id || '—') + '</td><td>' + (c.price ? fmtMoney(c.price) : 'Free') + '</td><td>' + (c.enrolled_count != null ? c.enrolled_count : c.students_count != null ? c.students_count : '—') + '</td></tr>';
      }).join('');
    } catch (e) {
      el('catalogTable').querySelector('tbody').innerHTML = '<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</td></tr>';
    }
  }

  async function renderLive() {
    el('content').innerHTML = '<h1 class="page-title">Live &amp; Recordings</h1>' +
      '<p class="page-sub">Every live class across the platform — scheduled, running, completed. Powered by GET /api/admin/live-classes.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
      '<select id="lv-status" onchange="renderLive()" style="padding:5px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit"><option value="">All statuses</option><option>scheduled</option><option>live</option><option>completed</option><option>cancelled</option></select>' +
      '</div>' +
      '<div class="card" style="padding:0;overflow:hidden"><table class="list" id="liveTable"><thead><tr><th>Title</th><th>Course</th><th>Host</th><th>When</th><th>Status</th></tr></thead><tbody><tr><td colspan="5" style="padding:24px;text-align:center;color:var(--jm-text-muted)">Loading…</td></tr></tbody></table></div>';
    try {
      var status = el('lv-status') ? el('lv-status').value : '';
      var r = await api('/admin/live-classes?limit=50' + (status ? '&status=' + encodeURIComponent(status) : ''));
      var rows = r.classes || [];
      var tbody = el('liveTable').querySelector('tbody');
      if (!rows.length) { tbody.innerHTML = '<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--jm-text-muted)">No live classes</td></tr>'; return; }
      var sc = function(s) { return ({scheduled:'#b45309',live:'var(--jm-danger,var(--jm-danger,#ef4444))',completed:'var(--jm-success,#16a34a)',cancelled:'#6b7280'})[s] || '#6b7280'; };
      tbody.innerHTML = rows.map(function(c) {
        return '<tr><td><strong>' + esc(c.title || '—') + '</strong></td><td>' + esc(c.course_title || '—') + '</td><td>' + esc(c.host_name || '—') + '</td><td>' + (c.scheduled_time ? fmtDate(c.scheduled_time) : '—') + '</td><td><span style="color:' + sc(c.status) + ';font-weight:700;text-transform:uppercase;font-size:11px">' + esc(c.status || '—') + '</span></td></tr>';
      }).join('');
    } catch (e) {
      el('liveTable').querySelector('tbody').innerHTML = '<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</td></tr>';
    }
  }

  async function renderAnalytics() {
    el('content').innerHTML = '<h1 class="page-title">Analytics</h1>' +
      '<p class="page-sub">Platform trends — 30-day revenue and active-user breakdown. Powered by GET /api/admin/analytics/overview.</p>' +
      '<div id="anaBody"><div class="card coming"><div class="em">📉</div><div>Loading…</div></div></div>';
    try {
      var d = await api('/admin/analytics/overview');
      var series = d.revenue && d.revenue.series || [];
      var maxVal = Math.max.apply(null, [1].concat(series.map(function(s) { return s.amount; })));
      var bars = series.map(function(s) {
        var h = Math.round((s.amount / maxVal) * 100);
        return '<div title="' + esc(s.date) + ': ' + fmtMoney(s.amount) + '" style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:140px"><div style="height:' + h + '%;min-height:2px;background:var(--jm-primary,#6366f1);border-radius:3px 3px 0 0"></div></div>';
      }).join('');
      el('anaBody').innerHTML = '<div class="card" style="margin-bottom:16px"><h3 style="margin:0 0 4px">💸 Revenue · last 30 days <span class="accent" style="float:right">' + fmtMoney(d.revenue && d.revenue.last30Total || 0) + '</span></h3><div style="display:flex;gap:2px;align-items:flex-end;margin-top:12px">' + (bars || '<div style="color:var(--jm-text-muted)">No data</div>') + '</div></div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px">' +
        [['DAU', d.activity && d.activity.dau],['WAU', d.activity && d.activity.wau],['MAU', d.activity && d.activity.mau],['Total users', d.users && d.users.total],['Signups 30d', d.users && d.users.signups30]].map(function(pair) {
          return '<div class="card" style="text-align:center"><div style="font-size:26px;font-weight:800">' + (pair[1] != null ? pair[1] : 0) + '</div><div style="color:var(--jm-text-muted);font-size:12px">' + pair[0] + '</div></div>';
        }).join('') + '</div>';
    } catch (e) {
      el('anaBody').innerHTML = '<div class="card" style="color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</div>';
    }
  }

  var WG_ROLES = ['student','teacher','coaching','school','parent','coach','partner','institute_owner'];
  var _wgOrgId = null, _wgSettings = {};

  async function renderWidgetsConfig() {
    el('content').innerHTML = '<h1 class="page-title">Widget Configuration</h1>' +
      '<p class="page-sub">Enable / disable dashboard widgets per role for an organization. Saved to the org\'s settings; the widget engine honors it live via GET /api/me/contexts.</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px">' +
      '<select id="wgcOrg" onchange="loadWidgetConfig()" style="padding:6px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit"><option value="">Loading orgs…</option></select>' +
      '<select id="wgcRole" onchange="paintWidgetMatrix()" style="padding:6px 10px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit">' + WG_ROLES.map(function(r) { return '<option value="' + r + '">' + r + '</option>'; }).join('') + '</select>' +
      '<button id="wgcSave" onclick="saveWidgetConfig()" disabled style="padding:6px 16px;border:none;border-radius:6px;background:var(--jm-primary,#6366f1);color:var(--jm-text-inv,#fff);font-weight:700;cursor:pointer">Save</button>' +
      '</div>' +
      '<div class="card" id="wgcMatrix" style="padding:16px"><div style="color:var(--jm-text-muted)">Pick an organization to configure its widgets.</div></div>';
    try {
      var r = await api('/admin/institutes?limit=100');
      var orgs = r.institutes || [];
      el('wgcOrg').innerHTML = '<option value="">Select organization…</option>' + orgs.map(function(o) { return '<option value="' + esc(o.id) + '">' + esc(o.name || o.id) + '</option>'; }).join('');
    } catch(e) { el('wgcOrg').innerHTML = '<option value="">Failed to load orgs</option>'; }
  }

  async function loadWidgetConfig() {
    _wgOrgId = el('wgcOrg').value;
    if (!_wgOrgId) { el('wgcMatrix').innerHTML = '<div style="color:var(--jm-text-muted)">Pick an organization.</div>'; el('wgcSave').disabled = true; return; }
    el('wgcMatrix').innerHTML = 'Loading…';
    try {
      var r = await api('/orgs/' + _wgOrgId + '/settings');
      _wgSettings = (r.settings && r.settings.settings) || {};
      el('wgcSave').disabled = false;
      paintWidgetMatrix();
    } catch(e) { el('wgcMatrix').innerHTML = '<div style="color:var(--jm-danger,var(--jm-danger,#ef4444))">Error: ' + esc(e.message) + '</div>'; el('wgcSave').disabled = true; }
  }

  function paintWidgetMatrix() {
    var widgets = (window.EduOSWidgets && window.EduOSWidgets.WIDGETS) || [];
    var role = el('wgcRole').value;
    var cfg = (_wgSettings.widgets || {})[role] || {};
    var applicable = widgets.filter(function(w) { return !w.roles || w.roles.includes(role) || (w.roles && role === 'institute_owner' && w.roles.includes('school')); });
    el('wgcMatrix').innerHTML = applicable.length ? applicable.map(function(w) {
      var on = cfg[w.id] !== false;
      return '<label style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--jm-border);cursor:pointer"><input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="wgcToggle(\'' + w.id + '\',this.checked)" style="width:16px;height:16px"><span style="flex:1"><strong>' + esc(w.title) + '</strong> <span style="font-size:11px;color:var(--jm-text-muted)">' + esc(w.category) + ' · ' + esc(w.size) + '</span></span></label>';
    }).join('') : '<div style="color:var(--jm-text-muted)">No widgets apply to this role.</div>';
  }

  function wgcToggle(wid, on) {
    var role = el('wgcRole').value;
    _wgSettings.widgets = _wgSettings.widgets || {};
    _wgSettings.widgets[role] = _wgSettings.widgets[role] || {};
    if (on) delete _wgSettings.widgets[role][wid]; else _wgSettings.widgets[role][wid] = false;
  }

  async function saveWidgetConfig() {
    if (!_wgOrgId) return;
    var btn = el('wgcSave'); btn.disabled = true; btn.textContent = 'Saving…';
    try {
      await api('/orgs/' + _wgOrgId + '/settings', { method: 'PUT', body: JSON.stringify({ settings: _wgSettings }) });
      btn.textContent = 'Saved ✓';
      setTimeout(function() { btn.textContent = 'Save'; btn.disabled = false; }, 1500);
    } catch(e) { btn.textContent = 'Save'; btn.disabled = false; alert('Save failed: ' + e.message); }
  }

  var WG_INT_FIELDS = [
    { group: '📧 Email (SMTP)', hint: 'Gmail: enable 2FA → create an App Password → use it as the password.', rows: [
      ['smtp_host', 'SMTP host', 'smtp.gmail.com', 'text'],
      ['smtp_port', 'SMTP port', '587', 'text'],
      ['smtp_user', 'SMTP user / from email', 'you@gmail.com', 'text'],
      ['smtp_pass', 'SMTP password (App Password)', '••••••••', 'password'],
      ['smtp_from', 'From display', 'JeetMantra <you@gmail.com>', 'text'] ] },
    { group: '📱 SMS / OTP', hint: 'Use a webhook (n8n → SMS gateway) OR Twilio. Webhook wins if both set.', rows: [
      ['sms_webhook_url', 'SMS webhook URL', 'https://n8n.../webhook/sms', 'text'],
      ['sms_webhook_secret', 'SMS webhook secret', '••••••••', 'password'],
      ['twilio_sid', 'Twilio SID', 'ACxxxx…', 'text'],
      ['twilio_token', 'Twilio token', '••••••••', 'password'],
      ['twilio_from', 'Twilio from number', '+1xxxxxxxxxx', 'text'] ] },
    { group: '🤖 AI generation', hint: 'Used by Exam Platform + AI tutor.', rows: [
      ['ai_webhook_url', 'AI endpoint URL', 'https://n8n.../webhook/ai', 'text'],
      ['ai_webhook_key', 'AI key', '••••••••', 'password'] ] },
    { group: '🔗 Automation', hint: '', rows: [
      ['n8n_secret', 'n8n sync secret', '••••••••', 'password'] ] },
    { group: '🔍 Error monitoring', hint: 'Sentry DSN — paste your project DSN. Takes effect on next server restart (startup setting).', rows: [
      ['sentry_dsn', 'Sentry DSN', 'https://key@oXXX.ingest.sentry.io/project', 'text'] ] }
  ];

  async function renderIntegrations() {
    el('content').innerHTML = '<h1 class="page-title">Integrations</h1>' +
      '<p class="page-sub">Map email, SMS and AI providers here — stored in platform settings and used by the backend immediately (overrides server .env). Powered by /api/admin/settings.</p>' +
      '<div id="intForm"><div class="card" style="padding:16px;color:var(--jm-text-muted)">Loading…</div></div>';
    var cur = {};
    try { var rs = await api('/admin/settings'); cur = rs.settings || {}; } catch (e) {}
    var fieldHtml = function(key, label, ph, type) {
      var v = cur[key] || '';
      var masked = type === 'password' && v ? '' : v;
      var note = type === 'password' && v ? '<span style="font-size:11px;color:#16a34a">● set — leave blank to keep</span>' : '';
      return '<div style="margin-bottom:12px"><label style="display:block;font-size:12px;font-weight:700;margin-bottom:4px">' + esc(label) + ' ' + note + '</label><input id="int_' + key + '" type="' + type + '" value="' + esc(masked) + '" placeholder="' + esc(ph) + '" autocomplete="off" style="width:100%;padding:8px 11px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit;font-size:13px"></div>';
    };
    el('intForm').innerHTML = WG_INT_FIELDS.map(function(g) {
      return '<div class="card" style="padding:16px;margin-bottom:14px"><h3 style="margin:0 0 2px;font-size:14px">' + g.group + '</h3>' +
        (g.hint ? '<div style="font-size:11px;color:var(--jm-text-muted);margin-bottom:12px">' + esc(g.hint) + '</div>' : '<div style="height:8px"></div>') +
        g.rows.map(function(r) { return fieldHtml(r[0], r[1], r[2], r[3]); }).join('') + '</div>';
    }).join('') +
      '<div style="display:flex;gap:10px;align-items:center">' +
      '<button id="intSave" onclick="saveIntegrations()" style="padding:9px 18px;border:none;border-radius:6px;background:var(--jm-primary,#6366f1);color:var(--jm-text-inv,#fff);font-weight:700;cursor:pointer">Save integrations</button>' +
      '<button onclick="testIntegrationEmail()" style="padding:9px 16px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit;font-weight:700;cursor:pointer">Send test email to me</button>' +
      '<span id="intMsg" style="font-size:13px;font-weight:700"></span></div>' +
      '<div class="card" style="padding:16px;margin-top:20px"><h3 style="margin:0 0 6px;font-size:14px">💾 Database backup</h3>' +
      '<div style="font-size:11px;color:var(--jm-text-muted);margin-bottom:12px">Exports all tables via the Supabase REST API, compresses and AES-encrypts, saves to <code>backups/</code>. Configure <code>BACKUP_ENCRYPT_KEY</code> and optionally <code>BACKUP_S3_BUCKET</code> in .env or the server environment.</div>' +
      '<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px">' +
      '<button onclick="triggerBackup()" id="backupBtn" style="padding:8px 16px;border:none;border-radius:6px;background:#0f766e;color:var(--jm-text-inv,#fff);font-weight:700;cursor:pointer">Run backup now</button>' +
      '<button onclick="loadBackupList()" style="padding:8px 14px;border:1px solid var(--jm-border);border-radius:6px;background:var(--jm-surface);color:inherit;font-weight:700;cursor:pointer">Refresh list</button>' +
      '<span id="backupMsg" style="font-size:13px;font-weight:700"></span></div>' +
      '<div id="backupList" style="font-size:12px;color:var(--jm-text-muted)">Click "Refresh list" to see saved backups.</div></div>';
  }

  async function saveIntegrations() {
    var payload = {};
    WG_INT_FIELDS.reduce(function(acc, g) { return acc.concat(g.rows); }, []).forEach(function(row) {
      var key = row[0];
      var v = el('int_' + key) ? el('int_' + key).value : '';
      var isSecret = /pass|secret|token|key/i.test(key);
      if (isSecret && v === '') return;
      payload[key] = v;
    });
    var btn = el('intSave'); btn.disabled = true; btn.textContent = 'Saving…';
    try {
      await api('/admin/settings', { method: 'PUT', body: JSON.stringify(payload) });
      el('intMsg').textContent = '✓ Saved & applied'; el('intMsg').style.color = '#16a34a';
    } catch (e) { el('intMsg').textContent = 'Error: ' + e.message; el('intMsg').style.color = 'var(--jm-danger,var(--jm-danger,#ef4444))'; }
    btn.disabled = false; btn.textContent = 'Save integrations';
    setTimeout(function() { el('intMsg').textContent = ''; }, 3000);
  }

  async function testIntegrationEmail() {
    el('intMsg').textContent = 'Sending…'; el('intMsg').style.color = 'var(--jm-text-muted)';
    try {
      var r = await api('/admin/test-email', { method: 'POST', body: '{}' });
      el('intMsg').textContent = r.sent ? '✓ Sent — check your inbox' : '⚠ ' + (r.note || 'Not sent (configure SMTP first)');
      el('intMsg').style.color = r.sent ? '#16a34a' : '#b45309';
    } catch (e) { el('intMsg').textContent = 'Error: ' + e.message; el('intMsg').style.color = 'var(--jm-danger,var(--jm-danger,#ef4444))'; }
  }

  async function triggerBackup() {
    var btn = el('backupBtn'); btn.disabled = true; btn.textContent = 'Starting…';
    el('backupMsg').textContent = ''; el('backupMsg').style.color = 'var(--jm-text-muted)';
    try {
      var r = await api('/admin/backup/trigger', { method: 'POST', body: '{}' });
      el('backupMsg').textContent = '✓ Backup running (pid ' + r.pid + ') — refresh list in ~30s';
      el('backupMsg').style.color = '#16a34a';
      setTimeout(function() { loadBackupList(); }, 35000);
    } catch (e) {
      el('backupMsg').textContent = 'Error: ' + e.message;
      el('backupMsg').style.color = 'var(--jm-danger,var(--jm-danger,#ef4444))';
    }
    btn.disabled = false; btn.textContent = 'Run backup now';
  }

  async function loadBackupList() {
    var div = el('backupList');
    div.textContent = 'Loading…';
    try {
      var r = await api('/admin/backup/list');
      if (!r.backups || r.backups.length === 0) {
        div.textContent = 'No backups found. Run one above or enable the --profile backup service.';
        return;
      }
      div.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="text-align:left;border-bottom:1px solid var(--jm-border)"><th style="padding:4px 8px">File</th><th style="padding:4px 8px">Size</th><th style="padding:4px 8px">Created</th></tr></thead><tbody>' +
        r.backups.map(function(b) {
          return '<tr style="border-bottom:1px solid var(--jm-border)"><td style="padding:4px 8px;font-family:monospace">' + esc(b.name) + '</td><td style="padding:4px 8px">' + b.sizeMB + ' MB</td><td style="padding:4px 8px">' + new Date(b.createdAt).toLocaleString() + '</td></tr>';
        }).join('') + '</tbody></table><div style="margin-top:6px;color:var(--jm-text-muted)">Stored in: <code>' + esc(r.dir) + '</code></div>';
    } catch (e) { div.textContent = 'Error: ' + e.message; }
  }

  async function runMigration() {
    var file = el('migFile') ? el('migFile').value : null;
    if (!file) return;
    var btn = el('migBtn'); btn.disabled = true; btn.textContent = 'Running…';
    el('migMsg').textContent = ''; el('migMsg').style.color = 'var(--jm-text-muted)';
    try {
      var r = await api('/admin/migrations/run', { method: 'POST', body: JSON.stringify({ file: file }) });
      var errs = r.errors || [];
      if (errs.length) {
        el('migMsg').textContent = '⚠ ' + r.statements + ' statements, ' + errs.length + ' errors';
        el('migMsg').style.color = '#b45309';
        console.error('[migration errors]', errs);
      } else {
        el('migMsg').textContent = '✓ ' + r.statements + ' statements applied';
        el('migMsg').style.color = '#16a34a';
      }
    } catch (e) {
      el('migMsg').textContent = 'Error: ' + e.message;
      el('migMsg').style.color = 'var(--jm-danger,var(--jm-danger,#ef4444))';
    }
    btn.disabled = false; btn.textContent = 'Run migration';
  }

  function renderComingSoon(name, emoji, blurb) {
    el('content').innerHTML = '<h1 class="page-title">' + name + '</h1><p class="page-sub">' + blurb + '</p><div class="card coming"><div class="em">' + emoji + '</div><div style="font-weight:700;font-size:16px;margin-bottom:6px">' + name + '</div><div style="font-size:13px;max-width:540px;margin:0 auto">Shell ready — this surface lights up in the next sprint. The sidebar IA is locked so Sprint 3+ can fill content without restructuring.</div></div>';
  }

  var cmdkInput = el('cmdk-input');
  if (cmdkInput) {
    cmdkInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var q = e.target.value.trim();
        if (!q) return;
        alert('Global search "' + q + '" — lands in Sprint 4 (cross-tenant search via /api/admin/search).');
      }
    });
  }
  window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      var inp = el('cmdk-input');
      if (inp) inp.focus();
    }
  });

  // Embed mode
  (function(){
    try {
      if (new URLSearchParams(location.search).get('embed') !== '1') return;
      document.documentElement.classList.add('embed');
      var s = document.createElement('style');
      s.textContent = 'html.embed a[href$="/dashboard.html"],html.embed a[href="/app"],html.embed [data-embed-hide]{display:none!important}';
      (document.head || document.documentElement).appendChild(s);
      var hide = function() {
        _container.querySelectorAll('[onclick]').forEach(function(elem) {
          var o = elem.getAttribute('onclick') || '';
          if (o.indexOf('dashboard.html') > -1 || /['"]\/app['"]/.test(o)) elem.style.display = 'none';
        });
      };
      if (document.readyState !== 'loading') hide(); else document.addEventListener('DOMContentLoaded', hide);
    } catch(e) {}
  })();

  // Boot
  loadTenantName();
  loadStatus();
  render('overview');
  if (g._adminOsInterval) clearInterval(g._adminOsInterval);
  g._adminOsInterval = setInterval(loadStatus, 30000);
}

function mount(container) {
  if (!document.getElementById('jm-mod-admin-os-css')) {
    var s = document.createElement('style');
    s.id = 'jm-mod-admin-os-css';
    s.textContent = _CSS;
    document.head.appendChild(s);
  }
  container.innerHTML = _HTML;
  try { _init(container); } catch(e) { console.warn('admin-os init error:', e); }
}

function unmount(c) {
  if (g._adminOsInterval) { clearInterval(g._adminOsInterval); g._adminOsInterval = null; }
  if (c) c.innerHTML = '';
}

g.JM = g.JM || {};
g.JM.Modules = g.JM.Modules || {};
g.JM.Modules['adminOs'] = { mount: mount, unmount: unmount };
})(window);
