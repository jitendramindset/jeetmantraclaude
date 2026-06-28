/* ui/widgets/atoms/EmptyState.js — JM.EmptyState({icon, title, msg, cta}) */
window.JM = window.JM || {};
JM.EmptyState = function (p) {
  p = p || {};
  var cta = '';
  if (p.cta && p.cta.label) {
    cta = '<button onclick="' + String(p.cta.onClick || '').replace(/"/g, '&quot;') + '" style="background:linear-gradient(135deg,var(--jm-primary,#7c3aed),#a855f7);color:#fff;border:0;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(124,58,237,.35)">' + JM.esc(p.cta.label) + '</button>';
  }
  return '<div style="text-align:center;padding:32px 16px">'
    + '<div style="font-size:44px;line-height:1">' + (p.icon || '✨') + '</div>'
    + '<div style="font-weight:700;font-size:15px;margin:10px 0 4px">' + JM.esc(p.title || 'Nothing here yet') + '</div>'
    + (p.msg ? '<div style="font-size:13px;color:var(--jm-text-muted);margin-bottom:14px;line-height:1.55;max-width:360px;margin-left:auto;margin-right:auto">' + JM.esc(p.msg) + '</div>' : '')
    + cta + '</div>';
};
