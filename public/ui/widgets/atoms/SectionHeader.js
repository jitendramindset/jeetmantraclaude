/* ui/widgets/atoms/SectionHeader.js — JM.SectionHeader({title, sub, action}) */
window.JM = window.JM || {};
JM.SectionHeader = function (p) {
  p = p || {};
  var act = p.action ? '<div style="margin-left:auto">' + (typeof p.action === 'string' ? p.action : JM.Button(p.action)) + '</div>' : '';
  return '<div style="display:flex;align-items:center;gap:10px;margin:14px 0 10px">'
    + '<div><div style="font-weight:700;font-size:14px;color:var(--jm-text)">' + JM.esc(p.title || '') + '</div>'
    + (p.sub ? '<div style="font-size:11px;color:var(--jm-text-muted)">' + JM.esc(p.sub) + '</div>' : '') + '</div>'
    + act + '</div>';
};
