/* ui/widgets/atoms/Button.js — JM.Button({label, kind, icon, onClick, href, size}) */
window.JM = window.JM || {};
JM.Button = function (p) {
  p = p || {};
  var kind = p.kind || 'primary';        // primary | secondary | ghost | danger | disabled
  var size = p.size || 'md';             // sm | md | lg
  var isDisabled = p.disabled || kind === 'disabled';
  // Wrap icon in a span with aria-hidden so screen readers skip decorative icons
  var icon = p.icon ? '<span aria-hidden="true">' + p.icon + '</span> ' : '';
  var label = JM.esc(p.label || '');
  var onClick = (!isDisabled && p.onClick) ? ' onclick="' + String(p.onClick).replace(/"/g, '&quot;') + '"' : '';
  var style = 'background:' + (kind === 'primary'  ? 'linear-gradient(135deg,var(--jm-primary,#7c3aed),var(--jm-accent-purple,#a855f7));color:#fff;border:0;' :
                               kind === 'danger'   ? 'var(--jm-danger,#ef4444);color:#fff;border:0;' :
                               kind === 'ghost'    ? 'transparent;color:var(--jm-text);border:1px solid var(--jm-border);' :
                               kind === 'disabled' ? 'var(--jm-surface-2,#f3f4f6);color:var(--jm-text-subtle,#94a3b8);border:1px solid var(--jm-border);' :
                                                     'var(--jm-surface-2,#f3f4f6);color:var(--jm-text);border:1px solid var(--jm-border);');
  var pad = size === 'lg' ? '11px 22px' : size === 'sm' ? '6px 12px' : '9px 18px';
  var fz  = size === 'lg' ? '14px' : size === 'sm' ? '11px' : '13px';
  style += 'padding:' + pad + ';border-radius:8px;font-size:' + fz + ';font-weight:700;cursor:' + (isDisabled ? 'not-allowed' : 'pointer') + ';box-shadow:0 2px 8px rgba(124,58,237,.25);transition:transform .12s,box-shadow .12s';
  var tag = p.href ? 'a' : 'button';
  var href = p.href ? ' href="' + p.href + '"' : '';
  // Always include type="button" for <button> elements to prevent accidental form submission
  var typeAttr = (tag === 'button') ? ' type="button"' : '';
  var disabledAttr = isDisabled ? (tag === 'button' ? ' disabled aria-disabled="true"' : ' aria-disabled="true" tabindex="-1"') : '';
  return '<' + tag + ' class="jm-btn jm-btn--' + kind + ' jm-btn--' + size + '" style="' + style + '"' + typeAttr + onClick + href + disabledAttr + '>' + icon + label + '</' + tag + '>';
};
