/* ui/widgets/atoms/Badge.js — JM.Badge({text, kind}) */
window.JM = window.JM || {};
JM.Badge = function (p) {
  p = p || {};
  var k = p.kind || 'default';
  var palette = {
    'default': { bg: 'var(--jm-surface-2,#f3f4f6)', fg: 'var(--jm-text)' },
    'success': { bg: '#d1fae5', fg: '#065f46' },
    'warn':    { bg: '#fef3c7', fg: '#92400e' },
    'danger':  { bg: '#fee2e2', fg: '#991b1b' },
    'info':    { bg: '#dbeafe', fg: '#1e40af' }
  };
  var c = palette[k] || palette['default'];
  return '<span style="display:inline-block;background:' + c.bg + ';color:' + c.fg + ';font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px">' + JM.esc(p.text || '') + '</span>';
};
