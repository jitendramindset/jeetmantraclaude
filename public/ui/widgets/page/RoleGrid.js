/**
 * ui/widgets/page/RoleGrid.js — 6-role selector used on login & signup pages.
 *
 *   JM.RoleGrid({
 *     selected: 'student',                  // initial selection
 *     hiddenInputId: 'selectedRole',        // id of hidden <input> to write to
 *     roles: JM.RoleGrid.DEFAULT_ROLES,     // optional override
 *     onChange: 'console.log(role)'         // optional JS expression; receives `role`
 *   })
 *     → returns the grid HTML + a hidden input. Selection is plain JS click handler;
 *       no framework required.
 *
 *   JM.RoleGrid.css() → shared CSS string.
 */
window.JM = window.JM || {};
JM.RoleGrid = function (opts) {
  opts = opts || {};
  var sel = opts.selected || 'student';
  var hiddenId = opts.hiddenInputId || 'selectedRole';
  var roles = opts.roles || JM.RoleGrid.DEFAULT_ROLES;
  var onChange = opts.onChange ? (';' + opts.onChange) : '';
  // Inline click handler — toggles .selected class + writes value to the hidden input.
  var pick = "(function(el,v){document.querySelectorAll('.jm-role-card').forEach(function(c){c.classList.remove('selected')});el.classList.add('selected');var h=document.getElementById('" + hiddenId + "');if(h)h.value=v;var role=v" + onChange + "}).call(null,this,'%V%')";
  var tiles = roles.map(function (r) {
    return '<div class="jm-role-card' + (r.value === sel ? ' selected' : '') + '" role="button" tabindex="0" onclick="' + pick.replace('%V%', r.value) + '" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();this.click();}">'
      + '<div class="icon">' + r.icon + '</div>'
      + '<div class="label">' + r.label + '</div>'
      + '</div>';
  }).join('');
  return '<div class="jm-role-grid">' + tiles + '</div>'
    + '<input type="hidden" id="' + hiddenId + '" value="' + sel + '">';
};
JM.RoleGrid.DEFAULT_ROLES = [
  { value: 'student',  icon: '🎓',     label: 'Student' },
  { value: 'teacher',  icon: '👨‍🏫', label: 'Teacher' },
  { value: 'partner',  icon: '🤝',     label: 'Partner' },
  { value: 'school',   icon: '🏫',     label: 'School' },
  { value: 'coaching', icon: '🏆',     label: 'Coaching' },
  { value: 'admin',    icon: '⚙️',    label: 'Admin' }
];
JM.RoleGrid.css = function () {
  return ''
    + '.jm-role-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}'
    + '.jm-role-card{background:var(--jm-surface,#fff);border:1.5px solid var(--jm-border,#e5e3ed);border-radius:var(--jm-radius-sm,8px);padding:12px 8px;text-align:center;cursor:pointer;transition:all .15s}'
    + '.jm-role-card:hover{border-color:var(--jm-primary,#7c3aed)}'
    + '.jm-role-card:focus-visible{outline:2px solid var(--jm-primary,#7c3aed);outline-offset:2px}'
    + '.jm-role-card.selected{border-color:var(--jm-primary,#7c3aed);background:var(--jm-primary-tint,rgba(124,58,237,.12))}'
    + '.jm-role-card .icon{font-size:24px;margin-bottom:4px}'
    + '.jm-role-card .label{font-size:11px;color:var(--jm-text-strong,#1a1325);font-weight:600}'
    + '@media(max-width:480px){.jm-role-grid{grid-template-columns:1fr 1fr}}';
};
