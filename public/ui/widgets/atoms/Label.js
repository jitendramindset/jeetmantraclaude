/* ui/widgets/atoms/Label.js — JM.Label({text, for, size, color, weight, required})
   Standalone label for form fields that can't use JM.Input's built-in label. */
(function () {
  window.JM = window.JM || {};

  JM.Label = function (p) {
    p = p || {};
    var forAttr = p['for'] ? ' for="' + JM.esc(p['for']) + '"' : '';
    var size   = p.size === 'sm' ? '11px' : p.size === 'lg' ? '15px' : '12px';
    var weight = p.weight || '600';
    var color  = p.color  || 'var(--jm-text,#1e293b)';
    var req    = p.required ? ' <span aria-hidden="true" style="color:var(--jm-danger,#ef4444)">*</span>' : '';
    return '<label' + forAttr + ' style="display:block;font-size:' + size + ';font-weight:' + weight + ';color:' + color + ';letter-spacing:.01em;margin-bottom:5px">' + JM.esc(p.text || '') + req + '</label>';
  };
})();
