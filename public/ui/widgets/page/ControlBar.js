/**
 * ui/widgets/page/ControlBar.js — horizontal button cluster (recording/class controls).
 *
 *   JM.ControlBar({
 *     buttons: [
 *       { label: '▶ Start', kind: 'primary', onClick: 'startClass()', id: 'btnStart' },
 *       { label: '🖥 Share', onClick: 'shareScreen()', hidden: true },
 *       { label: '⏹ End',   kind: 'danger', onClick: 'endClass()' }
 *     ]
 *   })
 *     → returns wrapped button group HTML.
 *
 * Each button: { label, kind?: 'primary'|'danger'|'warn'|'ghost', onClick?, id?, title?, hidden? }
 * Used by: studio.html (recording controls), liveRoom.html (teacher actions).
 */
window.JM = window.JM || {};
JM.ControlBar = function (opts) {
  opts = opts || {};
  var buttons = opts.buttons || [];
  return '<div class="' + (opts.className || 'jm-control-bar') + '" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
    + buttons.map(function (b) {
        var kind = b.kind ? ' ' + b.kind : '';
        var idAttr = b.id ? ' id="' + b.id + '"' : '';
        var ttl = b.title ? ' title="' + b.title.replace(/"/g, '&quot;') + '"' : '';
        var click = b.onClick ? ' onclick="' + b.onClick.replace(/"/g, '&quot;') + '"' : '';
        var disabled = b.disabled ? ' disabled' : '';
        var style = b.hidden ? ' style="display:none"' : '';
        return '<button class="btn' + kind + '"' + idAttr + ttl + click + disabled + style + '>' + b.label + '</button>';
      }).join('')
    + '</div>';
};
