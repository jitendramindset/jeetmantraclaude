/* ui/widgets/atoms/Card.js — JM.Card({title, body, accent, padding, footer}) */
window.JM = window.JM || {};
JM.Card = function (p) {
  p = p || {};
  var accent = p.accent ? '--wg-accent:' + p.accent + ';' : '';
  var pad = p.padding || '16px';
  var head = p.title ? '<div style="font-weight:700;font-size:13px;margin-bottom:10px">' + JM.esc(p.title) + '</div>' : '';
  var foot = p.footer ? '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--jm-border)">' + p.footer + '</div>' : '';
  return '<div class="jm-card wg-card" style="' + accent + 'background:var(--jm-surface,#fff);border:1px solid var(--jm-border);border-radius:12px;padding:' + pad + ';box-shadow:var(--jm-shadow-soft,0 1px 3px rgba(0,0,0,.06))">'
    + head + (p.body || '') + foot + '</div>';
};
