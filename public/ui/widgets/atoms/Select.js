/* ui/widgets/atoms/Select.js — JM.Select({name, label, value, options, required, disabled, hint, error, onChange})
   options: [{value, label}] or ['string', …] */
(function () {
  window.JM = window.JM || {};

  JM.Select = function (p) {
    p = p || {};
    var id    = 'jm-sel-' + (p.name || Math.random().toString(36).slice(2));
    var label = p.label ? '<label for="' + id + '" style="display:block;font-size:12px;font-weight:600;color:var(--jm-text,#1e293b);margin-bottom:5px;letter-spacing:.01em">' + JM.esc(p.label) + (p.required ? ' <span aria-hidden="true" style="color:var(--jm-danger,#ef4444)">*</span>' : '') + '</label>' : '';
    var hint  = p.hint  ? '<div style="font-size:11px;color:var(--jm-text-subtle,#64748b);margin-top:4px">' + JM.esc(p.hint) + '</div>' : '';
    var err   = p.error ? '<div role="alert" style="font-size:11px;color:var(--jm-danger,#ef4444);margin-top:4px">' + JM.esc(p.error) + '</div>' : '';
    var borderColor = p.error ? 'var(--jm-danger,#ef4444)' : 'var(--jm-border,#e2e8f0)';
    var onChange = p.onChange ? ' onchange="' + String(p.onChange).replace(/"/g, '&quot;') + '"' : '';

    var opts = (p.options || []).map(function (o) {
      var val   = typeof o === 'string' ? o : o.value;
      var lbl   = typeof o === 'string' ? o : (o.label || o.value);
      var sel   = String(val) === String(p.value) ? ' selected' : '';
      return '<option value="' + JM.esc(val) + '"' + sel + '>' + JM.esc(lbl) + '</option>';
    }).join('');

    if (p.placeholder) {
      opts = '<option value="" disabled' + (!p.value ? ' selected' : '') + '>' + JM.esc(p.placeholder) + '</option>' + opts;
    }

    var selectEl = '<select id="' + id + '" name="' + JM.esc(p.name||'') + '"' +
      (p.required  ? ' required'  : '') +
      (p.disabled  ? ' disabled'  : '') +
      (p.multiple  ? ' multiple'  : '') +
      onChange +
      ' style="width:100%;padding:9px 32px 9px 12px;font-size:13px;color:var(--jm-text,#1e293b);background:var(--jm-surface-1,#f8fafc) url(\'data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"12\\" height=\\"8\\" viewBox=\\"0 0 12 8\\"><path d=\\"M1 1l5 5 5-5\\" stroke=\\"%2364748b\\" stroke-width=\\"1.5\\" fill=\\"none\\" stroke-linecap=\\"round\\"/></svg>\') no-repeat right 12px center;border:1.5px solid ' + borderColor + ';border-radius:8px;outline:none;appearance:none;-webkit-appearance:none;cursor:' + (p.disabled ? 'not-allowed' : 'pointer') + ';box-sizing:border-box;transition:border-color .15s,box-shadow .15s' + (p.disabled ? ';opacity:.55' : '') + '"' +
      ' onfocus="this.style.borderColor=\'var(--jm-primary,#7c3aed)\';this.style.boxShadow=\'0 0 0 3px rgba(124,58,237,.12)\'"' +
      ' onblur="this.style.borderColor=\'' + borderColor + '\';this.style.boxShadow=\'none\'">' +
      opts + '</select>';

    return '<div style="margin-bottom:' + (p.noMargin ? '0' : '16px') + '">' + label + selectEl + hint + err + '</div>';
  };
})();
