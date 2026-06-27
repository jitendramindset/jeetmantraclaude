/* widgets/profile.js — compact profile card (avatar, name, role, quick stats). */
EduOSWidgets.register({
  id: 'profile',
  title: 'My Profile',
  description: 'Your account at a glance.',
  icon: '👤',
  roles: null,                       // universal
  category: 'identity',
  size: 'small',
  defaultSize: 'small',
  supportedSizes: ['small', 'medium'],
  priority: 5,
  aiTriggers: ['profile', 'my account', 'who am i'],
  dataSource: function () {
    return EduOSWidgets._lib.api('/me')
      .catch(function () {
        try { return { user: JSON.parse(localStorage.getItem('jm_user') || '{}') }; }
        catch (_) { return { user: {} }; }
      });
  },
  render: function (d) {
    var L = EduOSWidgets._lib;
    var u = (d && (d.user || d.profile)) || {};
    var name = L.esc(u.full_name || u.fullName || u.name || 'You');
    var role = L.esc(u.role || u.user_type || 'student');
    var email = L.esc(u.email || '');
    var initial = (name || '?').charAt(0).toUpperCase();
    return '<div style="display:flex;align-items:center;gap:10px">'
      + '<div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--jm-primary,#7c3aed),#a855f7);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;flex-shrink:0">' + initial + '</div>'
      + '<div style="flex:1;min-width:0">'
      +   '<div style="font-weight:700;font-size:13px;line-height:1.3">' + name + '</div>'
      +   '<div style="font-size:11px;color:var(--jm-text-muted);text-transform:capitalize">' + role.replace(/_/g, ' ') + '</div>'
      +   (email ? '<div style="font-size:10px;color:var(--jm-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px">' + email + '</div>' : '')
      + '</div>'
      + '</div>'
      + '<div style="margin-top:10px;display:flex;gap:6px">'
      +   '<a class="wg-link" style="font-size:11px;padding:4px 8px;border-radius:6px;background:var(--jm-surface-2,#f3f4f6);text-decoration:none;color:var(--jm-text)" href="/settings.html">⚙️ Settings</a>'
      +   '<a class="wg-link" style="font-size:11px;padding:4px 8px;border-radius:6px;background:var(--jm-surface-2,#f3f4f6);text-decoration:none;color:var(--jm-text)" href="dashboard.html#profile">View →</a>'
      + '</div>';
  }
});
