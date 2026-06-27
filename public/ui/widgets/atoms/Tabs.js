/* ui/widgets/atoms/Tabs.js — JM.Tabs({tabs:[{id,label}], active, onChange}) */
window.JM = window.JM || {};
JM.Tabs = function (p) {
  p = p || {};
  var tabs = p.tabs || []; var active = p.active || (tabs[0] && tabs[0].id);
  return '<div role="tablist" style="display:flex;gap:4px;border-bottom:1px solid var(--jm-border);margin-bottom:14px;overflow-x:auto">'
    + tabs.map(function (t) {
      var on = t.id === active;
      var color = on ? 'var(--jm-primary,#7c3aed)' : 'var(--jm-text-muted)';
      var border = on ? '2px solid var(--jm-primary,#7c3aed)' : '2px solid transparent';
      var click = p.onChange ? ' onclick="' + String(p.onChange).replace(/"/g, '&quot;') + '(\'' + t.id + '\')"' : '';
      return '<button role="tab" aria-selected="' + on + '"' + click + ' style="background:none;border:0;padding:10px 14px;border-bottom:' + border + ';color:' + color + ';font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap">' + JM.esc(t.label) + '</button>';
    }).join('') + '</div>';
};
