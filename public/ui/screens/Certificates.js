/**
 * ui/screens/Certificates.js — earned certificates list with public verify links.
 */
JM.Screens.register({
  id: 'certificates',
  title: '🎓 My Certificates',
  surface: 'takeover',
  crumb: 'Certificates',

  model: JM.Models.Certificates,
  render: function (d) {
    var origin = location.origin;
    var rows = (d.certificates || []).map(function (c) {
      var verify = c.verify_token ? origin + '/api/certificates/verify/' + encodeURIComponent(c.verify_token) : '';
      var right = verify ? '<a href="' + verify + '" target="_blank" rel="noopener" style="font-size:11px;color:var(--jm-primary,var(--jm-primary,#7c3aed));text-decoration:none">🔗 Verify</a>' : '';
      return {
        icon: '🎓',
        title: c.course_title || c.title || 'Certificate',
        sub: 'Issued ' + (c.issued_at ? new Date(c.issued_at).toLocaleDateString() : '—') + (c.certificate_number ? ' · #' + c.certificate_number : ''),
        right: right
      };
    });
    return JM.ModalShell({
      body: JM.ListSection({
        items: rows,
        empty: { icon: '🎓', title: 'No certificates yet',
          msg: 'Finish a course to earn your first certificate — it\'s verifiable and shareable with employers.',
          cta: { label: '📚 Go to my courses', onClick: "closeAnyModal();var n=document.querySelector('.nav-item[data-nav-key=courses]');n&&n.click();" } }
      })
    });
  }
});
