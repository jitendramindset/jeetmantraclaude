/* ui/widgets/molecules/KPIGrid.js — JM.KPIGrid([{label,value,sub,accent,icon}]) */
window.JM = window.JM || {};
JM.KPIGrid = function (items, opts) {
  items = items || []; opts = opts || {};
  var min = opts.min || 140;
  return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(' + min + 'px,1fr));gap:10px;margin-bottom:14px">'
    + items.map(function (k) { return JM.KPI(k); }).join('') + '</div>';
};
