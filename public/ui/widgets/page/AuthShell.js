/**
 * ui/widgets/page/AuthShell.js — page-level widget for auth/login pages.
 *
 *   JM.AuthShell({ title, sub, body, footer })
 *     → returns a complete HTML string with gradient background, centered card,
 *       title/sub, body slot, footer slot.
 *
 *   JM.AuthShell.css()
 *     → returns the shared CSS as a string. Pages render `<style>${JM.AuthShell.css()}</style>`
 *       so they don't have to repeat the same 20 lines.
 *
 * Used by: verify-email.html, forgot-password.html, reset-password.html,
 *          (and any future auth-style page).
 */
window.JM = window.JM || {};
JM.AuthShell = function (opts) {
  opts = opts || {};
  return '<div class="jm-auth-card">'
    + (opts.title ? '<h1 class="jm-auth-title">' + opts.title + '</h1>' : '')
    + (opts.sub ? '<div class="jm-auth-sub">' + opts.sub + '</div>' : '')
    + (opts.body || '')
    + (opts.footer ? '<div class="jm-auth-foot">' + opts.footer + '</div>' : '')
    + '</div>';
};
JM.AuthShell.css = function () {
  return ''
    + ':root{--jm-primary:#7c3aed;--jm-bg:#f8f7fc;--jm-surface:#fff;--jm-border:#e5e3ed;--jm-text:#1a1325;--jm-text-muted:#6b6783}'
    + '*{box-sizing:border-box;margin:0;padding:0}'
    + 'body{font-family:-apple-system,"Segoe UI",sans-serif;background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;color:var(--jm-text)}'
    + '.jm-auth-card{background:#fff;border-radius:16px;padding:36px;max-width:420px;width:100%;box-shadow:0 20px 50px rgba(0,0,0,.18)}'
    + '.jm-auth-title{font-size:24px;margin-bottom:8px}'
    + '.jm-auth-sub{color:var(--jm-text-muted);font-size:14px;margin-bottom:24px}'
    + '.jm-auth-card label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}'
    + '.jm-auth-card input{width:100%;padding:11px 14px;border-radius:8px;border:1.5px solid var(--jm-border);font-size:14px;margin-bottom:16px}'
    + '.jm-auth-card input:focus{outline:0;border-color:var(--jm-primary)}'
    + '.jm-auth-btn{width:100%;padding:12px;border-radius:8px;background:var(--jm-primary);color:#fff;border:0;font-weight:600;cursor:pointer;font-size:15px}'
    + '.jm-auth-btn:disabled{opacity:.6;cursor:not-allowed}'
    + '.jm-auth-msg{padding:10px;border-radius:6px;font-size:13px;margin-bottom:14px;display:none}'
    + '.jm-auth-msg.ok{background:#dcfce7;color:#166534;display:block}'
    + '.jm-auth-msg.err{background:#fee2e2;color:#991b1b;display:block}'
    + '.jm-auth-foot{margin-top:18px;text-align:center}'
    + '.jm-auth-foot a{color:var(--jm-primary);font-size:13px;text-decoration:none}';
};
