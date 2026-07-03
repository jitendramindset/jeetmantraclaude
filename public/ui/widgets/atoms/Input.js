/* ui/widgets/atoms/Input.js — JM.Input({name, label, type, value, placeholder, required, disabled, hint, error, onChange}) */
(function () {
  window.JM = window.JM || {};

  JM.Input = function (p) {
    p = p || {};
    var id    = 'jm-inp-' + (p.name || Math.random().toString(36).slice(2));
    var type  = p.type || 'text';
    var label = p.label ? '<label for="' + id + '" style="display:block;font-size:12px;font-weight:600;color:var(--jm-text,#1e293b);margin-bottom:5px;letter-spacing:.01em">' + JM.esc(p.label) + (p.required ? ' <span aria-hidden="true" style="color:var(--jm-danger,#ef4444)">*</span>' : '') + '</label>' : '';
    var hint  = p.hint  ? '<div style="font-size:11px;color:var(--jm-text-subtle,#64748b);margin-top:4px">' + JM.esc(p.hint) + '</div>' : '';
    var err   = p.error ? '<div role="alert" style="font-size:11px;color:var(--jm-danger,#ef4444);margin-top:4px">' + JM.esc(p.error) + '</div>' : '';
    var borderColor = p.error ? 'var(--jm-danger,#ef4444)' : 'var(--jm-border,#e2e8f0)';
    var onChange = p.onChange ? ' oninput="' + String(p.onChange).replace(/"/g, '&quot;') + '"' : '';
    var base = [
      'width:100%',
      'padding:9px 12px',
      'font-size:13px',
      'line-height:1.5',
      'color:var(--jm-text,#1e293b)',
      'background:var(--jm-surface-1,#f8fafc)',
      'border:1.5px solid ' + borderColor,
      'border-radius:8px',
      'outline:none',
      'transition:border-color .15s,box-shadow .15s',
      'box-sizing:border-box',
      p.disabled ? 'opacity:.55;cursor:not-allowed' : '',
    ].filter(Boolean).join(';');

    var input = type === 'textarea'
      ? '<textarea id="' + id + '" name="' + JM.esc(p.name||'') + '" rows="' + (p.rows||4) + '" placeholder="' + JM.esc(p.placeholder||'') + '"' + (p.required?' required':'') + (p.disabled?' disabled':'') + onChange + ' style="' + base + ';resize:vertical" onfocus="this.style.borderColor=\'var(--jm-primary,#7c3aed)\';this.style.boxShadow=\'0 0 0 3px rgba(124,58,237,.12)\'" onblur="this.style.borderColor=\'' + borderColor + '\';this.style.boxShadow=\'none\'">' + JM.esc(p.value||'') + '</textarea>'
      : '<input type="' + type + '" id="' + id + '" name="' + JM.esc(p.name||'') + '" value="' + JM.esc(p.value||'') + '" placeholder="' + JM.esc(p.placeholder||'') + '"' + (p.required?' required':'') + (p.disabled?' disabled':'') + (p.min!==undefined?' min="'+p.min+'"':'') + (p.max!==undefined?' max="'+p.max+'"':'') + onChange + ' style="' + base + '" onfocus="this.style.borderColor=\'var(--jm-primary,#7c3aed)\';this.style.boxShadow=\'0 0 0 3px rgba(124,58,237,.12)\'" onblur="this.style.borderColor=\'' + borderColor + '\';this.style.boxShadow=\'none\'">';

    return '<div style="margin-bottom:' + (p.noMargin ? '0' : '16px') + '">' + label + input + hint + err + '</div>';
  };
})();
