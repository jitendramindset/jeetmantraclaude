/**
 * ui/screens/WidgetAdmin.js — admin widget × role matrix.
 * Replaces the inline openWidgetAdmin() in dashboard.html (kept for back-compat).
 */
JM.Screens.register({
  id: 'widget-admin',
  title: '🎛 Widget Management',
  model: JM.Models.WidgetAdmin,
  render: function (d) {
    var ROLES = ['student', 'teacher', 'coach', 'parent', 'institute', 'school', 'partner', 'admin'];
    var widgets = d.widgets || []; var cfg = d.config || { global: {}, byRole: {} };
    function on(scope, id, role) {
      if (scope === 'global') return cfg.global[id] !== false;
      var r = cfg.byRole[role] || {}; return r[id] !== false;
    }
    var hdr = '<tr><th style="text-align:left;padding:8px;font-size:11px;text-transform:uppercase;color:var(--jm-text-muted)">Widget</th>'
      + '<th style="padding:8px;font-size:11px;text-transform:uppercase;color:var(--jm-text-muted)">Global</th>'
      + ROLES.map(function (r) { return '<th style="padding:8px;font-size:11px;text-transform:uppercase;color:var(--jm-text-muted)">' + r.charAt(0).toUpperCase() + r.slice(1) + '</th>'; }).join('') + '</tr>';
    var rows = widgets.map(function (w) {
      var roleHint = w.roles ? '<span style="font-size:11px;color:var(--jm-text-muted)">' + w.roles.join(', ') + '</span>'
                             : '<span style="font-size:11px;color:var(--jm-success,#16a34a)">all roles</span>';
      var gChk = '<input type="checkbox" data-w="' + w.id + '" data-scope="global" ' + (on('global', w.id) ? 'checked' : '') + ' style="width:18px;height:18px;cursor:pointer">';
      var rChks = ROLES.map(function (r) {
        return '<input type="checkbox" data-w="' + w.id + '" data-scope="role" data-role="' + r + '" ' + (on('role', w.id, r) ? 'checked' : '') + ' style="width:18px;height:18px;cursor:pointer">';
      }).join('</td><td style="text-align:center;padding:6px">');
      return '<tr style="border-top:1px solid var(--jm-border)">'
        + '<td style="padding:10px 8px"><div style="font-weight:700;font-size:13px">' + JM.esc(w.title) + '</div>'
        + '<div style="font-size:11px;color:var(--jm-text-muted)">' + JM.esc(w.id) + ' · ' + roleHint + '</div></td>'
        + '<td style="text-align:center;padding:6px">' + gChk + '</td>'
        + '<td style="text-align:center;padding:6px">' + rChks + '</td></tr>';
    }).join('') || '<tr><td colspan="10" style="padding:20px;text-align:center;color:var(--jm-text-muted)">No widgets registered.</td></tr>';
    var footer = JM.ActionToolbar({
      max: 2,
      actions: [
        { label: 'Save policy', icon: '💾', kind: 'primary', onClick: "JM.Screens.action('widget-admin.save')" },
        { label: 'Reload', icon: '↻', kind: 'ghost', onClick: "JM.Screens.open('widget-admin')" }
      ]
    }) + ' <span id="wa2-status" style="font-size:12px;color:var(--jm-text-muted);margin-left:auto"></span>';
    return JM.ModalShell({
      body: '<div style="margin-bottom:12px;color:var(--jm-text-muted);font-size:13px">Highest-authority policy. Unchecking <strong>Global</strong> hides a widget everywhere; per-role boxes restrict it for that role. Users can still pin/collapse/resize/recolour widgets they can see.</div>'
        + '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--jm-border);border-radius:10px;max-height:60vh;overflow-y:auto">'
        + '<table id="wa2-grid" style="width:100%;border-collapse:collapse;font-size:13px"><thead style="position:sticky;top:0;background:var(--jm-surface)">' + hdr + '</thead>'
        + '<tbody>' + rows + '</tbody></table></div>',
      footer: footer
    });
  }
});
// Action handler — reads the rendered grid, posts via the model.
if (window.JM && JM.Screens) {
  JM.Screens.handle('widget-admin.save', async function () {
    var grid = document.getElementById('wa2-grid'); if (!grid) return;
    var cfg = { global: {}, byRole: {}, order: {}, sizes: {} };
    [].forEach.call(grid.querySelectorAll('input[type=checkbox]'), function (cb) {
      var id = cb.dataset.w; if (!id) return;
      if (cb.dataset.scope === 'global') { if (!cb.checked) cfg.global[id] = false; }
      else if (cb.dataset.scope === 'role') {
        var role = cb.dataset.role;
        if (!cb.checked) { cfg.byRole[role] = cfg.byRole[role] || {}; cfg.byRole[role][id] = false; }
      }
    });
    var s = document.getElementById('wa2-status');
    if (s) { s.style.color = 'var(--jm-text-muted)'; s.textContent = 'Saving…'; }
    try {
      await JM.Models.WidgetAdmin.save(cfg);
      if (s) { s.style.color = 'var(--jm-success,#16a34a)'; s.textContent = '✓ Saved · takes effect on next dashboard load'; }
    } catch (e) {
      if (s) { s.style.color = 'var(--jm-danger,#ef4444)'; s.textContent = '⚠️ ' + (e.message || 'Save failed'); }
    }
  });
}
