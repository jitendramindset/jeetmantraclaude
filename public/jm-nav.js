/**
 * jm-nav.js — JeetMantra unified navigation drawer.
 *
 * One shared, role-aware app menu injected identically on every page, so the
 * satellite apps (exam, bhasha-setu, marketplace, website, studio) stop feeling
 * disintegrated and you can move between every surface the same way everywhere.
 *
 * Drop-in: <script src="/jm-nav.js" defer></script>
 * - Injects a fixed top-right "▦ Menu" launcher + a slide-out drawer (right).
 * - Reads jm_token / jm_user for auth state + role; shows role-appropriate items.
 * - Highlights the current page. Closes on overlay click / Esc.
 * - Positioned top-RIGHT so it never collides with a page's own left hamburger.
 * - Suppress on a page with: window.JM_NAV = false (before this script).
 */
(function () {
  if (window.JM_NAV === false || window.__jmNavMounted) return;
  window.__jmNavMounted = true;

  function user() { try { return JSON.parse(localStorage.getItem('jm_user') || 'null'); } catch { return null; } }
  function roleOf(u) { return (u && (u.user_type || u.role)) || ''; }
  var CREATORS = ['teacher', 'coaching', 'school', 'partner', 'corporate_trainer', 'content_creator', 'franchise', 'coach', 'trainer', 'institute_owner'];
  var esc = function (s) { return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) { return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]; }); };

  // Unified menu model — identical everywhere. `show(u)` gates by auth/role.
  function menu(u) {
    var role = roleOf(u);
    var isCreator = CREATORS.indexOf(role) >= 0;
    var isAdmin = role === 'admin';
    return [
      { group: 'Explore', items: [
        { icon: '🏠', label: 'Home', href: '/' },
        { icon: '🛒', label: 'Marketplace', href: '/marketplace.html' },
        { icon: '📍', label: 'Find Teachers', href: '/marketplace.html#teachers' }
      ] },
      { group: 'Workspace', show: !!u, items: [
        { icon: '📊', label: 'Dashboard', href: '/app' },
        { icon: '📝', label: 'Exams', href: '/app#/m/tests' },
        { icon: '🗣️', label: 'Languages', href: '/app#/m/learn' },
        { icon: '🎬', label: 'Studio', href: '/app#/m/studio', show: isCreator },
        { icon: '🛡️', label: 'Platform OS', href: '/app#/m/admin', show: isAdmin }
      ] },
      { group: 'Account', show: !!u, items: [
        { icon: '⚙️', label: 'Settings', href: '/settings.html' },
        { icon: '👤', label: 'Profile', href: '/dashboard.html#profile' },
        { icon: '🚪', label: 'Log out', action: 'logout' }
      ] },
      { group: 'Account', show: !u, items: [
        { icon: '🔑', label: 'Log in', href: '/login.html' },
        { icon: '✨', label: 'Sign up', href: '/signup.html' }
      ] }
    ];
  }

  var here = location.pathname.replace(/\/$/, '') || '/';
  function isActive(href) {
    var p = href.split('#')[0].replace(/\/$/, '') || '/';
    return p === here || (p !== '/' && here.indexOf(p) === 0);
  }

  function logout() { ['jm_token', 'jm_user'].forEach(function (k) { localStorage.removeItem(k); }); location.href = '/login.html'; }

  // ── Styles (scoped, theme-token aware with fallbacks) ──────────────────────
  var css = '' +
    '#jmnav-btn{position:fixed;top:14px;right:14px;z-index:9998;display:flex;align-items:center;gap:6px;font:600 13px/1 system-ui,sans-serif;background:var(--jm-surface,#fff);color:var(--jm-text-strong,#1f2937);border:1px solid var(--jm-border,#e5e7eb);border-radius:10px;padding:8px 12px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.08)}' +
    '#jmnav-btn:hover{border-color:var(--jm-primary,#7c3aed);color:var(--jm-primary,#7c3aed)}' +
    '#jmnav-ov{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:9998;opacity:0;visibility:hidden;transition:opacity .2s}' +
    '#jmnav-ov.open{opacity:1;visibility:visible}' +
    '#jmnav-dr{position:fixed;top:0;right:0;height:100%;width:280px;max-width:86vw;background:var(--jm-surface,#fff);z-index:9999;box-shadow:-8px 0 30px rgba(0,0,0,.18);transform:translateX(100%);transition:transform .22s ease;display:flex;flex-direction:column;overflow-y:auto}' +
    '#jmnav-dr.open{transform:none}' +
    '.jmnav-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid var(--jm-border,#eee)}' +
    '.jmnav-brand{font:800 17px/1 system-ui,sans-serif;color:var(--jm-text,#111);letter-spacing:-.02em}.jmnav-brand b{color:var(--jm-primary,#7c3aed)}' +
    '.jmnav-x{background:none;border:none;font-size:20px;cursor:pointer;color:var(--jm-text-muted,#6b7280);line-height:1}' +
    '.jmnav-who{padding:12px 18px;border-bottom:1px solid var(--jm-border,#eee);font-size:12px;color:var(--jm-text-muted,#6b7280)}' +
    '.jmnav-who b{display:block;font-size:14px;color:var(--jm-text-strong,#1f2937);font-weight:700}' +
    '.jmnav-grp{padding:14px 18px 4px;font:700 11px/1 system-ui;letter-spacing:.06em;text-transform:uppercase;color:var(--jm-text-muted,#9ca3af)}' +
    '.jmnav-i{display:flex;align-items:center;gap:12px;padding:11px 18px;text-decoration:none;color:var(--jm-text-strong,#1f2937);font:600 14px/1 system-ui;cursor:pointer;border:none;background:none;width:100%;text-align:left}' +
    '.jmnav-i:hover{background:var(--jm-surface-2,#f3f4f6)}' +
    '.jmnav-i.active{color:var(--jm-primary,#7c3aed);background:var(--jm-primary-tint,#f5f3ff);box-shadow:inset 3px 0 0 var(--jm-primary,#7c3aed)}' +
    '.jmnav-i .ic{font-size:17px;width:22px;text-align:center}' +
    '@media(max-width:480px){#jmnav-btn{top:auto;bottom:14px}}';

  function build() {
    var u = user();
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var btn = document.createElement('button');
    btn.id = 'jmnav-btn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = '▦ <span>Menu</span>';

    var ov = document.createElement('div'); ov.id = 'jmnav-ov';
    var dr = document.createElement('aside'); dr.id = 'jmnav-dr'; dr.setAttribute('role', 'navigation'); dr.setAttribute('aria-label', 'App menu');

    var who = u ? '<div class="jmnav-who"><b>' + esc(u.fullName || u.full_name || u.email || 'You') + '</b>' + esc(roleOf(u) || 'member') + '</div>' : '';
    var body = menu(u).filter(function (g) { return g.show !== false; }).map(function (g) {
      var items = g.items.filter(function (i) { return i.show !== false; }).map(function (i) {
        var cls = 'jmnav-i' + (i.href && isActive(i.href) ? ' active' : '');
        if (i.action === 'logout') return '<button class="' + cls + '" data-action="logout"><span class="ic">' + i.icon + '</span>' + esc(i.label) + '</button>';
        return '<a class="' + cls + '" href="' + i.href + '"><span class="ic">' + i.icon + '</span>' + esc(i.label) + '</a>';
      }).join('');
      return '<div class="jmnav-grp">' + esc(g.group) + '</div>' + items;
    }).join('');

    dr.innerHTML = '<div class="jmnav-head"><span class="jmnav-brand">Jeet<b>Mantra</b></span><button class="jmnav-x" aria-label="Close">✕</button></div>' + who + body;

    document.body.appendChild(btn); document.body.appendChild(ov); document.body.appendChild(dr);

    function open() { ov.classList.add('open'); dr.classList.add('open'); }
    function close() { ov.classList.remove('open'); dr.classList.remove('open'); }
    btn.onclick = open; ov.onclick = close;
    dr.querySelector('.jmnav-x').onclick = close;
    dr.querySelectorAll('[data-action="logout"]').forEach(function (b) { b.onclick = logout; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
