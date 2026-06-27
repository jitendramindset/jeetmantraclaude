/**
 * ui/widgets/page/Timer.js — countdown timer display with warning thresholds.
 *
 *   JM.Timer({ id: 'exam-timer', seconds: 3600, warnAt: 300, critAt: 60 })
 *     → returns `<div id="exam-timer" class="timer-display" data-jm-timer>60:00</div>`
 *
 *   JM.Timer.format(seconds)              → '60:00' / '1:23:45'
 *   JM.Timer.update(id, secondsLeft)      → updates DOM, applies .warn / .crit classes
 *   JM.Timer.css()                        → shared CSS string
 *
 * State-bound logic (interval, onExpire) stays in caller. Widget owns display only.
 * Used by: exam-platform.html (countdown), reusable for live-class duration, OTP cooldown.
 */
window.JM = window.JM || {};
JM.Timer = function (opts) {
  opts = opts || {};
  var id = opts.id || 'jm-timer';
  var warnAt = opts.warnAt != null ? opts.warnAt : 300;
  var critAt = opts.critAt != null ? opts.critAt : 60;
  return '<div id="' + id + '" class="timer-display" data-jm-timer'
    + ' data-warn-at="' + warnAt + '" data-crit-at="' + critAt + '">'
    + JM.Timer.format(opts.seconds || 0) + '</div>';
};
JM.Timer.format = function (s) {
  s = Math.max(0, Math.floor(Number(s) || 0));
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var sec = s % 60;
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  return h > 0 ? h + ':' + pad(m) + ':' + pad(sec) : pad(m) + ':' + pad(sec);
};
JM.Timer.update = function (id, secondsLeft) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = JM.Timer.format(secondsLeft);
  var warnAt = parseInt(el.dataset.warnAt || '300', 10);
  var critAt = parseInt(el.dataset.critAt || '60', 10);
  el.classList.toggle('warn', secondsLeft <= warnAt && secondsLeft > critAt);
  el.classList.toggle('crit', secondsLeft <= critAt);
};
JM.Timer.css = function () {
  return ''
    + '.timer-display{font-family:monospace;font-weight:700;font-size:18px;color:var(--jm-text,#1a1325);padding:6px 14px;border-radius:8px;background:var(--jm-surface-2,#f3f4f6);display:inline-block;transition:all .2s}'
    + '.timer-display.warn{background:#fef3c7;color:#92400e;animation:jm-timer-pulse-warn 1.5s infinite}'
    + '.timer-display.crit{background:#fee2e2;color:#991b1b;animation:jm-timer-pulse-crit .8s infinite}'
    + '@keyframes jm-timer-pulse-warn{0%,100%{opacity:1}50%{opacity:.7}}'
    + '@keyframes jm-timer-pulse-crit{0%,100%{opacity:1}50%{opacity:.5}}';
};
