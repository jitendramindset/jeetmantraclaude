/* ui/widgets/molecules/ListSection.js — items as Rows + EmptyState fallback.
 * JM.ListSection({ title, items:[{title,sub,right,icon,onClick}], empty:{icon,title,msg,cta} })
 */
window.JM = window.JM || {};
JM.ListSection = function (p) {
  p = p || {};
  var head = p.title ? JM.SectionHeader({ title: p.title, action: p.action }) : '';
  var items = p.items || [];
  if (!items.length) return head + JM.EmptyState(p.empty || { title: 'Nothing yet' });
  return head + items.map(function (it) { return JM.Row(it); }).join('');
};
