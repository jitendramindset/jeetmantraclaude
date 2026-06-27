/**
 * ui/widgets/page/Sidebar.js — grouped sidebar navigation.
 *
 *   JM.Sidebar({
 *     groups: [
 *       { title: 'Platform', items: [
 *         { id: 'overview', icon: '📊', label: 'Overview', active: true },
 *         { id: 'tenants', icon: '🏫', label: 'Tenants & Institutes' }
 *       ]},
 *       { title: 'Operations', items: [...] }
 *     ],
 *     itemAttr: 'data-section'    // legacy attribute for click handlers (default: data-section)
 *   })
 *     → returns the sidebar HTML.
 *
 *   JM.Sidebar.setActive(id) — switches the active item by id.
 *   JM.Sidebar.css() — shared CSS string.
 *
 * Used by: admin-os.html (4 groups, 17 items); reusable on any admin/settings page.
 */
window.JM = window.JM || {};
JM.Sidebar = function (opts) {
  opts = opts || {};
  var attr = opts.itemAttr || 'data-section';
  var groups = opts.groups || [];
  // classNames lets the host page reuse its own CSS (admin-os keeps .nav-item etc.).
  var cls = Object.assign({
    root: 'jm-sidebar', groupTitle: 'jm-nav-group-title',
    item: 'jm-nav-item', ic: 'jm-nav-ic', badge: 'jm-nav-badge'
  }, opts.classNames || {});
  return '<div class="' + cls.root + '">'
    + groups.map(function (g) {
        return '<div class="' + cls.groupTitle + '">' + g.title + '</div>'
          + (g.items || []).map(function (it) {
              var badge = it.badgeId ? '<span class="' + cls.badge + '" id="' + it.badgeId + '" style="display:none">0</span>' : '';
              return '<div class="' + cls.item + (it.active ? ' active' : '') + '" ' + attr + '="' + it.id + '">'
                + '<span class="' + cls.ic + '">' + (it.icon || '•') + '</span>' + it.label + badge
                + '</div>';
            }).join('');
      }).join('')
    + '</div>';
};
JM.Sidebar.setActive = function (id, attr, itemClass) {
  attr = attr || 'data-section';
  document.querySelectorAll('.' + (itemClass || 'jm-nav-item')).forEach(function (el) {
    el.classList.toggle('active', el.getAttribute(attr) === id);
  });
};
JM.Sidebar.css = function () {
  return ''
    + '.jm-sidebar{background:var(--jm-surface,#fff);border-right:1px solid var(--jm-border,#e5e7eb);padding:8px 6px;overflow-y:auto}'
    + '.jm-nav-group-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--jm-text-muted,#6b7280);padding:14px 10px 6px}'
    + '.jm-nav-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--jm-text,#1a1325);transition:all .1s;position:relative}'
    + '.jm-nav-item:hover{background:var(--jm-primary-tint,rgba(124,58,237,.08))}'
    + '.jm-nav-item.active{background:var(--jm-primary,#7c3aed);color:#fff}'
    + '.jm-nav-ic{font-size:14px;width:18px;text-align:center}'
    + '.jm-nav-badge{margin-left:auto;background:#ef4444;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:10px;min-width:18px;text-align:center}'
    + '@media(max-width:760px){.jm-sidebar{display:flex;flex-direction:row;align-items:center;gap:6px;overflow-x:auto;overflow-y:hidden;padding:6px 8px;border-right:0;border-bottom:1px solid var(--jm-border,#e5e7eb)}.jm-nav-group-title{display:none}.jm-nav-item{padding:6px 10px;flex:0 0 auto;white-space:nowrap}}';
};
