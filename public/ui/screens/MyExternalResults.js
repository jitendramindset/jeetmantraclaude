/**
 * ui/screens/MyExternalResults.js — local-storage exam + bhasha-setu results.
 * Replaces inline openMyExternalResults(); MVC: model = JM.Models.MyExternalResults.
 * The legacy version built its own overlay; this screen uses the standard modal surface
 * for consistency with other extracted screens.
 */
JM.Screens.register({
  id: 'my-external-results',
  title: '📊 My Results & Progress',
  surface: 'takeover',
  crumb: 'My Results',

  model: JM.Models.MyExternalResults,
  render: function (d) {
    var fmt = function (ts) { try { return new Date(ts).toLocaleString(); } catch (_) { return '—'; } };
    var examRows = d.exams.length
      ? d.exams.map(function (r) {
          var pct = Number(r.pct) || 0;
          var color = pct >= 70 ? 'var(--jm-success,#16a34a)' : pct >= 50 ? 'var(--jm-warn,#f59e0b)' : 'var(--jm-danger,#ef4444)';
          return '<tr><td style="padding:6px 8px">' + fmt(r.ts) + '</td>'
            + '<td style="padding:6px 8px">' + JM.esc(r.topic || r.subject || '—') + '</td>'
            + '<td style="padding:6px 8px;text-align:right">' + (r.score || 0) + '/' + (r.total || 0) + '</td>'
            + '<td style="padding:6px 8px;text-align:right"><b style="color:' + color + '">' + pct + '%</b></td>'
            + '<td style="padding:6px 8px">' + JM.esc(r.grade || '—') + '</td></tr>';
        }).join('')
      : '<tr><td colspan="5" style="padding:14px;text-align:center;color:var(--jm-text-muted)">No exam attempts yet. Open Take Exam to start.</td></tr>';
    var bhashaRows = d.bhasha.length
      ? d.bhasha.slice(0, 30).map(function (r) {
          return '<tr><td style="padding:6px 8px">' + fmt(r.ts) + '</td>'
            + '<td style="padding:6px 8px">' + JM.esc(r.title || r.topic || '—') + '</td>'
            + '<td style="padding:6px 8px">' + JM.esc((r.lang || '').toUpperCase()) + '</td>'
            + '<td style="padding:6px 8px;text-align:right">' + (r.turns || 0) + ' turns</td></tr>';
        }).join('')
      : '<tr><td colspan="4" style="padding:14px;text-align:center;color:var(--jm-text-muted)">No language practice yet. Open Bhasha Setu to begin.</td></tr>';
    var summary = '<div style="font-size:12px;color:var(--jm-text-muted);margin-bottom:14px">'
      + d.exams.length + ' exam' + (d.exams.length !== 1 ? 's' : '')
      + ' · ' + d.bhasha.length + ' language session' + (d.bhasha.length !== 1 ? 's' : '')
      + '</div>';
    var launchers = '<div style="display:flex;gap:8px;margin-bottom:14px">'
      + JM.Button({ label: '🧪 Take Exam', kind: 'ghost', size: 'sm', href: '/exam-platform.html' })
      + JM.Button({ label: '🈯 Bhasha Setu', kind: 'ghost', size: 'sm', href: '/bhasha-setu.html' })
      + '</div>';
    var examTable = '<div style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--jm-primary,#7c3aed)">🧪 Exam Attempts</div>'
      + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:18px">'
      +   '<thead><tr style="background:var(--jm-surface-2,var(--jm-primary-bg,#f5f3ff))">'
      +     '<th style="padding:8px;text-align:left;color:var(--jm-text-muted);font-size:11px;text-transform:uppercase">When</th>'
      +     '<th style="padding:8px;text-align:left;color:var(--jm-text-muted);font-size:11px;text-transform:uppercase">Topic</th>'
      +     '<th style="padding:8px;text-align:right;color:var(--jm-text-muted);font-size:11px;text-transform:uppercase">Score</th>'
      +     '<th style="padding:8px;text-align:right;color:var(--jm-text-muted);font-size:11px;text-transform:uppercase">%</th>'
      +     '<th style="padding:8px;text-align:left;color:var(--jm-text-muted);font-size:11px;text-transform:uppercase">Grade</th>'
      +   '</tr></thead><tbody>' + examRows + '</tbody></table></div>';
    var bhashaTable = '<div style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--jm-success,#16a34a)">🈯 Language Practice (Bhasha Setu)</div>'
      + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:12.5px">'
      +   '<thead><tr style="background:var(--jm-surface-2,var(--jm-success-bg,#f0fdf4))">'
      +     '<th style="padding:8px;text-align:left;color:var(--jm-text-muted);font-size:11px;text-transform:uppercase">When</th>'
      +     '<th style="padding:8px;text-align:left;color:var(--jm-text-muted);font-size:11px;text-transform:uppercase">Lesson</th>'
      +     '<th style="padding:8px;text-align:left;color:var(--jm-text-muted);font-size:11px;text-transform:uppercase">Lang</th>'
      +     '<th style="padding:8px;text-align:right;color:var(--jm-text-muted);font-size:11px;text-transform:uppercase">Activity</th>'
      +   '</tr></thead><tbody>' + bhashaRows + '</tbody></table></div>';
    return JM.ModalShell({ body: summary + launchers + examTable + bhashaTable });
  }
});
