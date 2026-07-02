/* ui/widgets/atoms/Tag.js — JM.Tag({label, color, bg, icon})
 * Pill-shaped inline label. Used for status chips, category badges, pass-rate
 * indicators, plan highlights, and any short highlighted text fragment.
 *
 * p.label   {string}  Text to display (HTML-escaped).
 * p.icon    {string}  Optional leading emoji / icon character (NOT escaped).
 * p.color   {string}  CSS colour for text. Default: var(--jm-primary).
 * p.bg      {string}  CSS colour for background. Default: primary tint.
 * p.bold    {bool}    If false, uses font-weight:600 (default: true = 700).
 * p.size    {string}  'sm' (10px) | 'md' (12px, default) | 'lg' (13px).
 */
window.JM = window.JM || {};
JM.Tag = function (p) {
  p = p || {};
  var color = p.color || 'var(--jm-primary,#7c3aed)';
  var bg    = p.bg    || 'var(--jm-primary-tint,rgba(124,58,237,.10))';
  var fw    = p.bold === false ? '600' : '700';
  var sz    = p.size === 'sm' ? '10px' : p.size === 'lg' ? '13px' : '12px';
  var inner = (p.icon ? p.icon + ' ' : '') + JM.esc(p.label || '');
  return '<span style="display:inline-flex;align-items:center;gap:3px;'
    + 'padding:3px 10px;border-radius:999px;font-size:' + sz + ';'
    + 'font-weight:' + fw + ';background:' + bg + ';color:' + color + ';'
    + 'white-space:nowrap;line-height:1.4">' + inner + '</span>';
};
