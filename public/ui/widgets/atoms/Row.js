/* ui/widgets/atoms/Row.js — JM.Row({title, sub, right, icon, onClick}) */
window.JM = window.JM || {};
JM.Row = function (p) {
  p = p || {};
  var clk = p.onClick ? ' onclick="' + String(p.onClick).replace(/"/g, '&quot;') + '" style="cursor:pointer"' : '';
  var ic = p.icon ? '<div style="font-size:18px;flex:0 0 auto">' + p.icon + '</div>' : '';
  return '<div class="jm-row" ' + clk + ' style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--jm-border);border-radius:10px;margin-bottom:6px;background:var(--jm-surface,#fff)">'
    + ic
    + '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;color:var(--jm-text)">' + JM.esc(p.title || '') + '</div>'
    + (p.sub ? '<div style="font-size:11px;color:var(--jm-text-muted)">' + JM.esc(p.sub) + '</div>' : '') + '</div>'
    + (p.right ? '<div style="font-size:12px;color:var(--jm-text-muted)">' + JM.esc(p.right) + '</div>' : '') + '</div>';
};
