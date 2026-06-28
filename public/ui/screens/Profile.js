/**
 * ui/screens/Profile.js — editable user profile (takeover via pre-existing #profilePage).
 * Replaces inline openProfilePage().
 *
 * Uses the existing #profilePage / #pf-body / (no crumb) DOM rather than the
 * default bookingsPage shell. Legacy pfSave() and pfUploadPhoto() handlers
 * in dashboard.html still read inputs by id (pf-name, pf-email, pf-phone, etc.).
 */
JM.Screens.register({
  id: 'profile-page',
  title: '👤 Profile',
  surface: 'takeover',
  pageId: 'profilePage',
  bodyId: 'pf-body',
  // No bk-crumb in this scaffold — set crumbId to a non-existent id so the registry no-ops it.
  crumbId: '__nope__',
  model: JM.Models.Profile,
  render: function (u) {
    u = u || {};
    var avatar = u.profile_image
      ? '<img src="' + JM.esc(u.profile_image) + '" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid var(--jm-border)">'
      : '<div style="width:72px;height:72px;border-radius:50%;background:var(--jm-primary-tint,rgba(124,58,237,.18));display:flex;align-items:center;justify-content:center;font-size:28px">👤</div>';

    var pair = function (a, b) { return '<div class="grid-2">' + a + b + '</div>'; };
    var row = function (label, html) { return '<div class="form-row"><label>' + label + '</label>' + html + '</div>'; };
    var input = function (id, val, type, placeholder) {
      type = type || 'text';
      return '<input id="' + id + '" type="' + type + '" value="' + JM.esc(val || '') + '"'
        + (placeholder ? ' placeholder="' + JM.esc(placeholder) + '"' : '') + '>';
    };
    var textarea = function (id, val, rows, placeholder) {
      return '<textarea id="' + id + '" rows="' + (rows || 2) + '"' + (placeholder ? ' placeholder="' + JM.esc(placeholder) + '"' : '') + '>'
        + JM.esc(val || '') + '</textarea>';
    };
    var section = function (title) {
      return '<h3 style="font-size:14px;margin:14px 0 8px;color:var(--jm-text-muted);text-transform:uppercase;letter-spacing:.05em">' + title + '</h3>';
    };

    var header = '<div style="display:flex;gap:14px;align-items:center;margin-bottom:18px;flex-wrap:wrap">'
      + avatar
      + '<div><div style="font-weight:700;font-size:16px">' + JM.esc(u.full_name || '') + '</div>'
      +   '<div style="font-size:12px;color:var(--jm-text-muted)">' + JM.esc(u.user_type || u.role || '') + '</div></div>'
      + '<div style="margin-left:auto"><input type="file" id="pf-photo" accept="image/*" onchange="pfUploadPhoto(this)" style="font-size:12px"></div>'
      + '</div>';

    var basics = pair(
      row('Full name', input('pf-name', u.full_name)),
      row('Date of birth', input('pf-dob', u.date_of_birth, 'date'))
    ) + pair(
      row('Email <span style="color:#ef4444">*</span>', input('pf-email', u.email, 'email')),
      row('Mobile <span style="color:#ef4444">*</span>', input('pf-phone', u.phone, 'tel'))
    ) + row('Bio', textarea('pf-bio', u.bio, 3, 'A short bio'));

    var address = section('Address')
      + row('Street', input('pf-street', u.street))
      + pair(row('City', input('pf-city', u.city)), row('State / region', input('pf-state', u.state_region)))
      + pair(row('Postal code', input('pf-postal', u.postal_code)), row('Country', input('pf-country', u.country || 'India')))
      + pair(row('Alternate contact no.', input('pf-altphone', u.alt_phone, 'text', 'optional second number')), '<div class="form-row"></div>');

    var professional = section('Professional')
      + row('Education / qualifications', textarea('pf-education', u.education, 2, 'e.g. M.Sc Physics, B.Ed · IIT Delhi'))
      + row('Experience', textarea('pf-experience', u.experience, 2, 'e.g. 8 years teaching JEE/NEET physics'));

    var social = section('Social &amp; links')
      + pair(row('🎥 YouTube', input('pf-youtube', u.youtube_url, 'text', 'https://youtube.com/@channel')),
             row('🔗 Website', input('pf-website', u.website_url, 'text', 'https://…')))
      + pair(row('💼 LinkedIn', input('pf-linkedin', u.linkedin_url, 'text', 'https://linkedin.com/in/…')),
             row('📸 Instagram', input('pf-instagram', u.instagram_url, 'text', 'https://instagram.com/…')))
      + pair(row('𝕏 Twitter / X', input('pf-twitter', u.twitter_url, 'text', 'https://x.com/…')), '<div class="form-row"></div>');

    var msgRow = '<div id="pf-msg" class="msg" style="margin:10px 0"></div>';
    var actions = '<div style="display:flex;gap:8px;margin-top:10px">'
      + JM.Button({ label: 'Cancel', kind: 'ghost', size: 'sm', onClick: 'closeProfilePage()' })
      + JM.Button({ label: '💾 Save profile', kind: 'primary', size: 'sm', onClick: 'pfSave()' })
      + '</div>';

    return '<div style="max-width:760px;margin:0 auto">'
      + '<div class="card" style="padding:20px;margin-bottom:14px">'
      +   '<h2 style="margin-bottom:14px">👤 Your profile</h2>'
      +   header + basics + address + professional + social + msgRow + actions
      + '</div></div>';
  }
});
