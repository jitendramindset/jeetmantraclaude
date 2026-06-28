/* ui/widgets/atoms/Button.js — JM.Button({label, kind, icon, onClick, href, size}) */
window.JM = window.JM || {};
JM.Button = function (p) {
  p = p || {};
  var kind = p.kind || 'primary';        // primary | secondary | ghost | danger
  var size = p.size || 'md';             // sm | md | lg
  var icon = p.icon ? p.icon + ' ' : '';
  var label = JM.esc(p.label || '');
  var onClick = p.onClick ? ' onclick="' + String(p.onClick).replace(/"/g, '&quot;') + '"' : '';
  var style = 'background:' + (kind === 'primary' ? 'linear-gradient(135deg,var(--jm-primary,#7c3aed),#a855f7);color:#fff;border:0;' :
                               kind === 'danger'  ? '#dc2626;color:#fff;border:0;' :
                               kind === 'ghost'   ? 'transparent;color:var(--jm-text);border:1px solid var(--jm-border);' :
                                                    'var(--jm-surface-2,#f3f4f6);color:var(--jm-text);border:1px solid var(--jm-border);');
  var pad = size === 'lg' ? '11px 22px' : size === 'sm' ? '6px 12px' : '9px 18px';
  var fz  = size === 'lg' ? '14px' : size === 'sm' ? '11px' : '13px';
  style += 'padding:' + pad + ';border-radius:8px;font-size:' + fz + ';font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(124,58,237,.25);transition:transform .12s,box-shadow .12s';
  var tag = p.href ? 'a' : 'button';
  var href = p.href ? ' href="' + p.href + '"' : '';
  return '<' + tag + ' class="jm-btn jm-btn--' + kind + ' jm-btn--' + size + '" style="' + style + '"' + onClick + href + '>' + icon + label + '</' + tag + '>';
};
