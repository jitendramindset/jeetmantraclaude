/**
 * ui/screens/EssayInbox.js — pending essays awaiting teacher grading (takeover).
 * Replaces inline openEssayInbox().
 * essayGrade() and essayAiGrade() helpers stay in dashboard.html and write
 * back to the form fields — same pattern as AiKey screen + its save/clear helpers.
 *
 * IMPORTANT: window._essayItems is still populated here so the AI-grade
 * handler can read the original answer text when the teacher clicks "✨ AI grade".
 */
JM.Screens.register({
  id: 'essay-inbox',
  title: '📝 Pending essays',
  crumb: 'Essay grading',
  surface: 'takeover',
  model: JM.Models.EssayInbox,
  render: function (d) {
    var items = d.items || [];
    // Side effect kept for back-compat with essayAiGrade(window._essayItems[i].answer).
    window._essayItems = items;

    if (!items.length) {
      return '<div class="card" style="max-width:600px;margin:40px auto;padding:24px;text-align:center">'
        + '<div style="font-size:48px">📝</div>'
        + '<div style="font-weight:600;margin-top:10px">No pending essays</div>'
        + '<div style="color:var(--jm-text-muted);margin-top:6px">All long-answer responses have been graded.</div>'
        + '</div>';
    }
    var rows = items.map(function (it, i) {
      var submitted = it.submitted_at ? new Date(it.submitted_at).toLocaleString() : '';
      var qEsc = JM.esc(it.question_text || '').replace(/'/g, '&#39;');
      return '<div class="card" style="margin-bottom:14px;padding:18px">'
        + '<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:12px;color:var(--jm-text-muted)">'
        +   '<span>' + JM.esc((it.test && it.test.title) || 'Test') + '</span>'
        +   '<span>Submitted ' + submitted + '</span>'
        + '</div>'
        + '<div style="font-weight:600;margin-bottom:6px">Q. ' + JM.esc(it.question_text || '') + '</div>'
        + '<div style="font-size:13px;background:var(--jm-bg,#f8f7fc);padding:10px;border-radius:6px;border-left:3px solid var(--jm-primary,#7c3aed);margin-bottom:10px;white-space:pre-wrap">'
        +   JM.esc(it.answer || '') + '</div>'
        + '<div class="grid-2">'
        +   '<div class="form-row"><label>Score (out of ' + it.max_marks + ')</label>'
        +     '<input id="eg-s-' + i + '" type="number" min="0" max="' + it.max_marks + '" value="0"></div>'
        +   '<div class="form-row"><label>Feedback</label>'
        +     '<input id="eg-f-' + i + '" placeholder="Optional comments"></div>'
        + '</div>'
        + '<div style="display:flex;gap:8px">'
        +   JM.Button({ label: '💾 Save grade', kind: 'primary', size: 'sm', onClick: "essayGrade('" + it.session_id + "','" + it.question_id + "'," + i + ")" })
        +   JM.Button({ label: '✨ AI grade', kind: 'ghost', size: 'sm', onClick: "essayAiGrade('" + it.session_id + "','" + it.question_id + "'," + i + ",'" + qEsc + "'," + it.max_marks + ")" })
        + '</div>'
        + '</div>';
    }).join('');
    return '<div style="max-width:900px;margin:0 auto">'
      + '<h2 style="margin-bottom:14px">📝 Pending essays (' + items.length + ')</h2>'
      + rows
      + '</div>';
  }
});
