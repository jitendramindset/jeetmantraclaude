/**
 * ui/widgets/page/RolePicker.js — bhasha-setu's rolecard pattern (icon + title + sub).
 *
 *   JM.RolePicker({
 *     roles: [
 *       { id: 'student', icon: '🧑‍🎓', title: "I'm a student", sub: 'Learn languages', onClick: "go('login',{sub:'student'})" },
 *       { id: 'teacher', icon: '🧑‍🏫', title: "I'm a teacher", sub: 'Add lessons' }
 *     ]
 *   })
 *     → returns vertical stack of clickable rolecard buttons matching bhasha-setu's existing CSS.
 *
 * Distinct from RoleGrid (which is a horizontal 6-tile picker for login/signup).
 * Used by: bhasha-setu.html.
 */
window.JM = window.JM || {};
JM.RolePicker = function (opts) {
  opts = opts || {};
  var roles = opts.roles || [];
  return '<div class="rolepick">'
    + roles.map(function (r) {
        var idAttr = r.id ? ' id="' + r.id + '"' : '';
        var click = r.onClick ? ' onclick="' + r.onClick.replace(/"/g, '&quot;') + '"' : '';
        return '<button class="rolecard"' + idAttr + click + '>'
          + '<span class="ri">' + (r.icon || '🎯') + '</span>'
          + '<span><b>' + (r.title || '') + '</b>'
          +   (r.sub ? '<span class="muted">' + r.sub + '</span>' : '')
          + '</span>'
          + '</button>';
      }).join('')
    + '</div>';
};
