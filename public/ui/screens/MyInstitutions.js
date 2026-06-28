/**
 * ui/screens/MyInstitutions.js — institution membership switcher (takeover).
 * Replaces inline openMyInstitutions(). setActiveInstitution() stays in
 * dashboard.html (writes localStorage + reloads dashboard + re-opens screen).
 */
JM.Screens.register({
  id: 'my-institutions',
  title: '🏫 My Institutions',
  surface: 'takeover',
  crumb: 'My Institutions',
  model: JM.Models.MyInstitutions,
  render: function (d) {
    var links = d.institutions;
    var active = d.active;

    if (!links.length) {
      return '<div class="card" style="max-width:600px;margin:40px auto;padding:24px;text-align:center">'
        + '<div style="font-size:48px">🏫</div>'
        + '<div style="font-weight:600;margin-top:10px">No institutions linked yet</div>'
        + '<div style="color:var(--jm-text-muted);margin-top:6px">A school or coaching center can add you from their dashboard.</div>'
        + '</div>';
    }

    var isAll = !active || active === 'all';

    var allCard = '<div class="card" style="padding:18px;border:2px solid ' + (isAll ? 'var(--jm-primary)' : 'var(--jm-border)') + '">'
      + '<div style="font-weight:700;font-size:15px;margin-bottom:4px">🌐 All Institutes</div>'
      + '<div style="font-size:12px;color:var(--jm-text-muted);margin-bottom:10px">Combined view across every institution you belong to.</div>'
      + (isAll
          ? '<button class="btn-sm btn-primary" disabled>✓ Active</button>'
          : '<button class="btn-sm btn-outline" onclick="setActiveInstitution(\'all\')">Switch to combined</button>')
      + '</div>';

    var instCards = links.map(function (i) {
      var id = i.institution_id || i.id;
      var isActive = active === id;
      var subjectBadge = i.subject
        ? '<div style="font-size:12px;margin-bottom:10px"><span class="badge badge-muted">' + JM.esc(i.subject) + '</span></div>'
        : '';
      return '<div class="card" style="padding:18px;border:2px solid ' + (isActive ? 'var(--jm-primary)' : 'var(--jm-border)') + '">'
        + '<div style="font-weight:700;font-size:15px;margin-bottom:4px">' + JM.esc(i.name || i.institution_name || 'Institution') + '</div>'
        + '<div style="font-size:12px;color:var(--jm-text-muted);margin-bottom:10px">'
        +   JM.esc(i.type || i.institution_type || 'school') + ' · Role: ' + JM.esc(i.role || i.member_role || 'member')
        + '</div>'
        + subjectBadge
        + (isActive
            ? '<button class="btn-sm btn-primary" disabled>✓ Active</button>'
            : '<button class="btn-sm btn-outline" onclick="setActiveInstitution(\'' + id + '\')">Switch to this</button>')
        + '</div>';
    }).join('');

    return '<div style="max-width:900px;margin:0 auto">'
      + '<h2 style="margin-bottom:14px">🏫 My Institutions (' + links.length + ')</h2>'
      + '<div style="color:var(--jm-text-muted);font-size:13px;margin-bottom:18px">'
      +   'You\'re a member of multiple institutions with a single JeetMantra account. '
      +   'Pick one to scope your dashboard, or "All Institutes" for a combined view.'
      + '</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr));gap:14px">'
      +   allCard + instCards
      + '</div>'
      + '</div>';
  }
});
