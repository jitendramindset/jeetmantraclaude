/**
 * ui/widgets/page/PageNav.js — sticky top-bar nav for standalone pages.
 *
 *   JM.PageNav({ logo: 'Jeet<b>Mantra</b>', actions: [{ label: '← Dashboard', href: '/dashboard.html' }] })
 *     → returns <nav> HTML string with the brand logo + right-aligned action links.
 *
 *   JM.PageNav.css() → returns the shared CSS so pages don't repeat it.
 *
 * Used by: settings.html (and any future standalone page that needs a top nav).
 */
window.JM = window.JM || {};
JM.PageNav = function (opts) {
  opts = opts || {};
  var actions = (opts.actions || []).map(function (a) {
    return '<a href="' + (a.href || '#') + '" class="jm-nav-action">' + a.label + '</a>';
  }).join('');
  return '<nav class="jm-page-nav" data-embed-hide>'
    + '<a href="/" class="jm-nav-logo">' + (opts.logo || 'Jeet<b>Mantra</b>') + '</a>'
    + '<div style="flex:1"></div>'
    + actions
    + '</nav>';
};
JM.PageNav.css = function () {
  return ''
    + '.jm-page-nav{background:var(--jm-surface,#fff);border-bottom:1px solid var(--jm-border,#e5e3ed);padding:14px 28px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:40;box-shadow:var(--jm-shadow-sm,0 1px 3px rgba(0,0,0,.04))}'
    + '.jm-nav-logo{font-size:20px;font-weight:800;text-decoration:none;color:var(--jm-text,#1a1325);letter-spacing:-.02em}'
    + '.jm-nav-logo b{color:var(--jm-primary,#7c3aed)}'
    + '.jm-nav-action{font-size:13px;font-weight:600;color:var(--jm-text-strong,#1a1325);text-decoration:none}'
    + '.jm-nav-action:hover{color:var(--jm-primary,#7c3aed)}';
};
