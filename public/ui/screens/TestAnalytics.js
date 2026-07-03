/**
 * ui/screens/TestAnalytics.js — per-test analytics (takeover-page).
 * Replaces inline openTestAnalytics(testId, testTitle).
 * Call: JM.Screens.open('test-analytics', { testId, testTitle }).
 */
JM.Screens.register({
  id: 'test-analytics',
  title: '📊 Test analytics',
  crumb: 'Test analytics',
  surface: 'takeover',
  model: JM.Models.TestAnalytics,
  render: function (d, ctx) {
    var title = (d.test && d.test.title) || (ctx && ctx.testTitle) || 'Test';
    var totalMarks = (d.test && d.test.total_marks) || 100;
    var dist = d.score_distribution || [];
    var maxBucket = Math.max.apply(null, [1].concat(dist.map(function (b) { return b.count; })));

    var kpis = JM.KPIGrid([
      { label: 'Attempts', value: d.totalAttempts, accent: 'var(--jm-primary,#7c3aed)' },
      { label: 'Mean score', value: d.mean_score, sub: 'of ' + totalMarks, accent: 'var(--jm-success,var(--jm-success,#16a34a))' },
      { label: 'Questions', value: d.per_question.length, accent: 'var(--jm-warn,#f59e0b)' }
    ]);

    var distBars = '<div class="card" style="margin-bottom:18px;padding:14px"><div style="font-weight:700;margin-bottom:10px">Score distribution</div>'
      + '<div style="display:flex;align-items:flex-end;gap:10px;height:160px">'
      + dist.map(function (b) {
          var h = (b.count / maxBucket) * 120;
          return '<div style="flex:1;text-align:center;display:flex;flex-direction:column;justify-content:flex-end">'
            + '<div style="background:var(--jm-primary,var(--jm-primary,#7c3aed));height:' + h + 'px;border-radius:6px 6px 0 0;min-height:2px"></div>'
            + '<div style="font-size:11px;margin-top:4px;font-weight:600">' + b.count + '</div>'
            + '<div style="font-size:10px;color:var(--jm-text-muted)">' + JM.esc(b.range || '') + '</div>'
            + '</div>';
        }).join('')
      + '</div></div>';

    var qRows = (d.per_question || []).map(function (q, i) {
      var color = q.pass_rate >= 70 ? 'var(--jm-success,var(--jm-success,#16a34a))' : q.pass_rate >= 40 ? 'var(--jm-warn,#f59e0b)' : 'var(--jm-danger,#ef4444)';
      var topWrong = q.top_wrong_answer
        ? JM.esc(String(q.top_wrong_answer.value || '').slice(0, 40)) + ' <span style="color:var(--jm-text-muted)">(' + q.top_wrong_answer.count + '×)</span>'
        : '—';
      return '<tr style="border-bottom:1px solid var(--jm-border)">'
        + '<td style="padding:8px;color:var(--jm-text-muted)">' + (i + 1) + '</td>'
        + '<td style="padding:8px">' + JM.esc(String(q.question_text || '').slice(0, 80)) + '</td>'
        + '<td style="padding:8px;text-align:center">' + JM.Badge({ text: q.type, kind: 'default' }) + '</td>'
        + '<td style="padding:8px;text-align:center"><div style="display:inline-block;padding:3px 10px;border-radius:99px;background:' + color + ';color:#fff;font-weight:600;font-size:12px">' + q.pass_rate + '%</div>'
        +   '<div style="font-size:10px;color:var(--jm-text-muted);margin-top:2px">' + q.correct + '/' + q.attempted + '</div></td>'
        + '<td style="padding:8px;font-size:12px">' + topWrong + '</td>'
        + '</tr>';
    }).join('');

    var qTable = '<div class="card" style="padding:14px"><div style="font-weight:700;margin-bottom:10px">Per-question performance</div>'
      + '<table style="width:100%;border-collapse:collapse">'
      + '<thead><tr style="text-align:left;color:var(--jm-text-muted);font-size:12px;border-bottom:1px solid var(--jm-border)">'
      +   '<th style="padding:8px">#</th>'
      +   '<th style="padding:8px">Question</th>'
      +   '<th style="padding:8px;text-align:center">Type</th>'
      +   '<th style="padding:8px;text-align:center">Pass rate</th>'
      +   '<th style="padding:8px">Top wrong answer</th>'
      + '</tr></thead><tbody>' + qRows + '</tbody></table></div>';

    return '<div style="max-width:1180px;margin:0 auto">'
      + '<h2 style="margin-bottom:14px">📊 ' + JM.esc(title) + ' — analytics</h2>'
      + kpis
      + '<div style="margin-bottom:14px"></div>'
      + distBars
      + qTable
      + '</div>';
  }
});
