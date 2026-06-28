/* ui/widgets/atoms/Avatar.js — JM.Avatar({name, src, size}) */
window.JM = window.JM || {};
JM.Avatar = function (p) {
  p = p || {};
  var size = p.size || 36;
  var s = 'width:' + size + 'px;height:' + size + 'px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;background:var(--jm-primary-tint,rgba(124,58,237,.18));color:var(--jm-primary,#7c3aed);font-size:' + Math.round(size * 0.42) + 'px';
  if (p.src) return '<img src="' + p.src + '" alt="' + JM.esc(p.name || '') + '" style="' + s + ';object-fit:cover">';
  var initial = ((p.name || '?').trim()[0] || '?').toUpperCase();
  return '<span style="' + s + '">' + JM.esc(initial) + '</span>';
};
