/* ui/widgets/molecules/ActionToolbar.js — responsive button row with overflow menu.
 * JM.ActionToolbar({ actions:[{label,icon,onClick,kind}], primary: idxIntoActions, max: int })
 * On narrow screens, extras collapse into a … menu so main content stays focused.
 */
window.JM = window.JM || {};
JM.ActionToolbar = function (p) {
  p = p || {};
  var acts = p.actions || []; var max = p.max || 3;
  var visible = acts.slice(0, max);
  var hidden  = acts.slice(max);
  var bar = visible.map(function (a) { return JM.Button(a); }).join(' ');
  if (hidden.length) {
    var menuId = 'jm-more-' + Math.random().toString(36).slice(2, 7);
    bar += ' <span style="position:relative;display:inline-block">'
      + JM.Button({ label: '⋯', kind: 'ghost', onClick: "var m=document.getElementById('" + menuId + "');m.style.display=(m.style.display==='block'?'none':'block');" })
      + '<div id="' + menuId + '" style="display:none;position:absolute;right:0;top:calc(100% + 6px);min-width:180px;background:var(--jm-surface,#fff);border:1px solid var(--jm-border);border-radius:10px;box-shadow:0 10px 28px rgba(0,0,0,.18);padding:6px;z-index:50">'
      + hidden.map(function (a) {
          return '<button onclick="' + String(a.onClick || '').replace(/"/g, '&quot;') + ';document.getElementById(\'' + menuId + '\').style.display=\'none\'" style="display:block;width:100%;text-align:left;background:none;border:0;padding:8px 10px;font-size:13px;cursor:pointer;border-radius:6px;color:var(--jm-text)" onmouseover="this.style.background=\'var(--jm-surface-2,#f3f4f6)\'" onmouseout="this.style.background=\'\'">' + (a.icon ? a.icon + ' ' : '') + JM.esc(a.label) + '</button>';
        }).join('')
      + '</div></span>';
  }
  return '<div class="jm-toolbar" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' + bar + '</div>';
};
