/**
 * ui/screens/Recordings.js — class recordings (takeover-page surface).
 * Replaces inline openRecordings(); MVC: model = JM.Models.Recordings.
 */
JM.Screens.register({
  id: 'recordings',
  title: '📹 Class Recordings',
  crumb: 'Recordings',
  surface: 'takeover',
  model: JM.Models.Recordings,
  render: function (d) {
    var recs = d.recordings || [];
    if (!recs.length) {
      return '<div class="card" style="max-width:600px;margin:40px auto;padding:24px;text-align:center">'
        + JM.EmptyState({
            icon: '📹', title: 'No recordings yet',
            msg: 'Recorded live classes appear here. Open Studio to record now.',
            cta: { label: '🎥 Open Studio', onClick: "location.hash='#/m/studio'" }
          })
        + '</div>';
    }
    var card = function (rc) {
      return '<div class="card" style="padding:14px">'
        + '<video src="' + JM.esc(rc.recording_url) + '" controls preload="metadata" style="width:100%;border-radius:8px;background:#000;max-height:200px"></video>'
        + '<div style="font-weight:600;margin-top:8px">' + JM.esc(rc.title || 'Live Class') + '</div>'
        + '<div style="font-size:12px;color:var(--jm-text-muted)">'
        +   (rc.topic_title ? '📁 ' + JM.esc(rc.topic_title) + ' · ' : '')
        +   (rc.recording_uploaded_at ? new Date(rc.recording_uploaded_at).toLocaleString() : '')
        + '</div>'
        + '<a href="' + JM.esc(rc.recording_url) + '" download style="text-decoration:none;display:inline-block;margin-top:8px;background:var(--jm-surface-2,var(--jm-surface-2,#f3f4f6));color:var(--jm-text);border:1px solid var(--jm-border);padding:6px 12px;border-radius:8px;font-size:11px;font-weight:700">⬇ Download</a>'
        + '</div>';
    };
    var courseBlocks = Object.keys(d.byCourse).sort().map(function (course) {
      var list = d.byCourse[course];
      var byTopic = {};
      list.forEach(function (rc) { var t = rc.topic_title || 'General'; (byTopic[t] = byTopic[t] || []).push(rc); });
      return '<div style="margin-bottom:22px">'
        + '<div style="font-weight:800;font-size:15px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--jm-primary)">📚 ' + JM.esc(course) + '</div>'
        + Object.keys(byTopic).sort().map(function (topic) {
            return '<div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--jm-text-muted);margin:10px 0 8px">📁 ' + JM.esc(topic) + ' <span style="opacity:.6">(' + byTopic[topic].length + ')</span></div>'
              + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr));gap:16px">' + byTopic[topic].map(card).join('') + '</div>';
          }).join('')
        + '</div>';
    }).join('');
    return '<div style="max-width:1180px;margin:0 auto">'
      + '<h2 style="margin-bottom:14px">📹 Class Recordings (' + recs.length + ')</h2>'
      + courseBlocks
      + '</div>';
  }
});
