/* ui/widgets/atoms/KPI.js — JM.KPI({label, value, sub, accent, icon, onClick}) */
window.JM = window.JM || {};
JM.KPI = function (p) {
  p = p || {};
  var accent = p.accent || 'var(--jm-primary,#7c3aed)';
  var clk = p.onClick ? ' onclick="' + String(p.onClick).replace(/"/g, '&quot;') + '" style="cursor:pointer"' : '';
  return '<div class="jm-kpi" ' + clk + '>'
    + '<div style="background:var(--jm-surface,#fff);border:1px solid var(--jm-border);border-left:3px solid ' + accent + ';border-radius:10px;padding:14px">'
    + '<div style="font-size:11px;color:var(--jm-text-muted);text-transform:uppercase;letter-spacing:.05em">' + JM.esc(p.label || '') + '</div>'
    + '<div style="font-size:24px;font-weight:800;color:var(--jm-text);margin-top:4px">' + (p.icon ? p.icon + ' ' : '') + JM.esc(String(p.value == null ? '—' : p.value)) + '</div>'
    + (p.sub ? '<div style="font-size:11px;color:var(--jm-text-muted);margin-top:2px">' + JM.esc(p.sub) + '</div>' : '')
    + '</div></div>';
};
