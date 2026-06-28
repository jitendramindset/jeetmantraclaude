/**
 * ui/widgets/page/QuestionCard.js — exam question card with options.
 *
 *   JM.QuestionCard({
 *     index: 0,                          // 0-indexed
 *     text: 'What is 2+2?',              // pre-rendered (math/HTML allowed)
 *     marks: 2,
 *     subject: 'Math',
 *     type: 'mcq',                       // 'mcq' | 'msq' | 'short' | 'long'
 *     difficulty: 'Easy',
 *     answerHtml: '<div class="opt-item">…</div>'  // pre-built answer area
 *   })
 *     → returns the card HTML matching exam-platform's existing CSS.
 *
 * Used by: exam-platform.html
 */
window.JM = window.JM || {};
JM.QuestionCard = function (o) {
  o = o || {};
  var marks = o.marks || 1;
  return '<div class="q-card">'
    + '<div class="q-card-head">'
    +   '<div class="q-n">Q' + ((o.index || 0) + 1) + '</div>'
    +   '<div class="q-text-body">' + (o.text || '') + '</div>'
    +   '<span class="q-marks">+' + marks + ' mark' + (marks > 1 ? 's' : '') + '</span>'
    + '</div>'
    + '<div style="display:flex;gap:5px;margin-bottom:12px">'
    +   '<span class="info-pill blue">' + (o.subject || '') + '</span>'
    +   '<span class="info-pill purple">' + (o.type || '').toUpperCase() + '</span>'
    +   '<span class="info-pill" style="background:rgba(255,255,255,0.04);color:var(--muted)">' + (o.difficulty || '') + '</span>'
    + '</div>'
    + (o.answerHtml || '')
    + '</div>';
};
