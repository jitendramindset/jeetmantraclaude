/**
 * ui/widgets/page/StatusBadge.js — colored status pill (live/scheduled/paused/completed/draft).
 *
 *   JM.StatusBadge('live')                     → red pulsing dot + label
 *   JM.StatusBadge('scheduled', {label: 'Soon'}) → blue
 *   JM.StatusBadge('paid', {label: '✅ Paid'})   → green (works for non-class statuses too)
 *
 * Accepts: live, scheduled, paused, completed, draft, paid, pending, error
 * + any custom kind via opts.color/textColor.
 *
 * Used by: liveRoom.html (class status), bookings, payments — reusable anywhere
 * a state pill is needed.
 */
window.JM = window.JM || {};
JM.StatusBadge = function (status, opts) {
  opts = opts || {};
  var s = String(status || '').toLowerCase();
  var PRESET = {
    live:      { bg: '#7f1d1d', fg: '#fecaca', dot: '#ef4444', pulse: true },
    scheduled: { bg: '#1e3a8a', fg: '#dbeafe' },
    paused:    { bg: '#78350f', fg: '#fed7aa' },
    completed: { bg: '#14532d', fg: '#bbf7d0' },
    draft:     { bg: '#374151', fg: '#d1d5db' },
    paid:      { bg: '#14532d', fg: '#bbf7d0' },
    pending:   { bg: '#78350f', fg: '#fed7aa' },
    error:     { bg: '#7f1d1d', fg: '#fecaca' }
  };
  var preset = PRESET[s] || { bg: '#374151', fg: '#d1d5db' };
  var bg = opts.color || preset.bg;
  var fg = opts.textColor || preset.fg;
  var label = opts.label || status;
  var idAttr = opts.id ? ' id="' + opts.id + '"' : '';
  var dot = preset.dot
    ? '<span style="width:8px;height:8px;border-radius:50%;background:' + preset.dot + ';' + (preset.pulse ? 'animation:jm-pulse 1.5s infinite' : '') + '"></span>'
    : '';
  return '<span class="jm-status-badge"' + idAttr
    + ' style="padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;background:' + bg + ';color:' + fg + '">'
    + dot + JM.esc(label)
    + '</span>';
};
// Inject pulse keyframes once (idempotent).
JM.StatusBadge.injectKeyframes = function () {
  if (document.getElementById('jm-statusbadge-kf')) return;
  var s = document.createElement('style');
  s.id = 'jm-statusbadge-kf';
  s.textContent = '@keyframes jm-pulse{0%,100%{opacity:1}50%{opacity:.4}}';
  document.head.appendChild(s);
};
// Auto-inject on load (browser-safe).
if (typeof document !== 'undefined' && document.head) JM.StatusBadge.injectKeyframes();
JM.esc = JM.esc || function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); };
