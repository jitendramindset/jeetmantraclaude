/**
 * ui/screens/Downloads.js — saved offline courses (IndexedDB) + Offline AI launcher.
 * Replaces inline openDownloads(); MVC: model = JM.Models.Downloads
 */
JM.Screens.register({
  id: 'downloads',
  title: '📥 Offline Downloads',
  surface: 'takeover',
  crumb: 'Downloads',

  model: JM.Models.Downloads,
  render: function (d) {
    var header =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">'
      + '<div style="font-size:12px;color:var(--jm-text-muted)">'
        + (d.online ? '🟢 Online' : '🔴 Offline — reading from saved copies')
        + ' · ' + d.courses.length + ' course' + (d.courses.length === 1 ? '' : 's') + ' saved'
      + '</div>'
      + JM.Button({ label: '🧠 Offline AI', kind: 'primary', size: 'sm', onClick: 'openOfflineAI()' })
      + '</div>';
    if (!d.courses.length) {
      return JM.ModalShell({ body: header + JM.EmptyState({
        icon: '📥', title: 'No downloads yet',
        msg: 'Tap ⬇ on any course to save it for offline study.'
      }) });
    }
    var rows = d.courses.map(function (r) {
      var chapters = (r.full && r.full.topics || []).length;
      var lectures = (r.full && r.full.lectures || []).length;
      var meta = '<div style="display:flex;align-items:center;gap:10px">'
        + '<div style="width:40px;height:40px;border-radius:8px;background:var(--jm-primary-tint,rgba(124,58,237,.18));display:flex;align-items:center;justify-content:center;flex-shrink:0">📚</div>'
        + '<div style="flex:1;min-width:0">'
        +   '<div style="font-weight:600;font-size:14px">' + JM.esc(r.title) + '</div>'
        +   '<div style="font-size:11px;color:var(--jm-text-muted)">' + chapters + ' chapters · ' + lectures + ' lectures · saved ' + new Date(r.savedAt).toLocaleDateString() + '</div>'
        + '</div>'
        + '<div style="display:flex;gap:6px;flex-shrink:0">'
        + JM.Button({ label: '📖 Read', kind: 'primary', size: 'sm', onClick: "openReader('" + r.courseId + "','" + JM.esc(r.title).replace(/'/g, "\\'") + "')" })
        + JM.Button({ label: '🗑', kind: 'ghost', size: 'sm', onClick: "removeDownload('" + r.courseId + "')" })
        + '</div>'
        + '</div>';
      return JM.Card({ body: meta, padding: '10px' });
    }).join('');
    return JM.ModalShell({ body: header + rows });
  }
});
