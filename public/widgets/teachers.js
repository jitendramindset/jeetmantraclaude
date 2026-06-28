/* widgets/teachers.js — teacher roster summary (parents, students, org-admins). */
EduOSWidgets.register({
  id: 'teachers',
  title: 'Teachers',
  description: 'Faculty roster with subjects, ratings, and quick reach.',
  icon: '👨‍🏫',
  roles: ['student', 'parent', 'school', 'coaching', 'institute_owner', 'org_admin', 'franchise', 'admin'],
  category: 'people',
  size: 'medium',
  defaultSize: 'medium',
  supportedSizes: ['small', 'medium', 'large'],
  priority: 55,
  aiTriggers: ['teachers', 'faculty', 'instructors'],
  dataSource: function () {
    // Best-effort: parents use /parent/teachers (their child's), org-admins use /admin/teachers (full roster).
    return EduOSWidgets._lib.api('/admin/teachers')
      .catch(function () { return EduOSWidgets._lib.api('/parent/teachers').catch(function () { return { teachers: [] }; }); });
  },
  render: function (d) {
    var L = EduOSWidgets._lib;
    var list = L.listOf(d, 'teachers', 'list', 'items').slice(0, 6);
    if (!list.length) return L.empty('No teachers yet.', { label: '🔍 Browse teachers', onclick: "location.hash='#/marketplace'" });
    var rows = list.map(function (t) {
      var name = L.esc(t.name || t.full_name || 'Teacher');
      var subj = L.esc(t.subject || (Array.isArray(t.subjects) ? t.subjects.join(', ') : '') || 'General');
      var rating = t.rating != null ? '⭐ ' + Number(t.rating).toFixed(1) : '';
      return '<div class="wg-row" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--jm-border)">'
        + '<div style="width:32px;height:32px;border-radius:50%;background:var(--jm-primary-tint,rgba(124,58,237,.16));display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">' + name.charAt(0).toUpperCase() + '</div>'
        + '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px">' + name + '</div>'
        +   '<div style="font-size:11px;color:var(--jm-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + subj + '</div></div>'
        + (rating ? '<div style="font-size:11px;color:var(--jm-text-muted)">' + rating + '</div>' : '')
        + '</div>';
    }).join('');
    return rows + '<div class="wg-sub" style="margin-top:8px"><a class="wg-link" href="dashboard.html#teachers">View all →</a></div>';
  }
});
