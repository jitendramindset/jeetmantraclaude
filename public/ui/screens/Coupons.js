/**
 * ui/screens/Coupons.js — discount coupons (list + create form) — modal.
 * Replaces inline openCoupons / cpnRefresh.
 * Legacy cpnCreate() and cpnDelete() handlers stay in dashboard.html; they
 * read the form inputs by id (cpn-code, cpn-pct, cpn-flat, cpn-course,
 * cpn-max, cpn-exp) so the rendered ids must match.
 *
 * cpnRefresh() in dashboard.html re-calls JM.Screens.open('coupons') so the
 * page-level helpers don't need any other update.
 */
JM.Screens.register({
  id: 'coupons',
  title: '🎟 Discount Coupons',
  surface: 'modal',
  model: JM.Models.Coupons,
  render: function (d) {
    var courses = d.courses || [];
    var coupons = d.coupons || [];
    var courseOpts = '<option value="">All my courses</option>'
      + courses.map(function (c) { return '<option value="' + c.id + '">' + JM.esc(c.title) + '</option>'; }).join('');

    var rows;
    if (!coupons.length) {
      rows = JM.EmptyState({
        icon: '🎟',
        title: 'No coupons yet',
        msg: 'Give learners a discount nudge — coupons drive enrollment by ~20%.',
        cta: { label: '🎟 Focus the form', onClick: "document.getElementById('cpn-code')?.focus();document.getElementById('cpn-code')?.scrollIntoView({behavior:'smooth',block:'center'})" }
      });
    } else {
      rows = coupons.map(function (c) {
        var disc = c.discount_percent ? c.discount_percent + '% off'
          : c.discount_flat ? '₹' + c.discount_flat + ' off' : '—';
        var used = (c.used_count || 0) + '/' + (c.max_uses || 100) + ' used';
        var exp = c.expires_at ? ' · exp ' + new Date(c.expires_at).toLocaleDateString() : '';
        return '<div style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--jm-border);border-radius:10px;margin-bottom:8px">'
          + '<div style="font-family:monospace;font-weight:800;font-size:15px;background:var(--jm-primary-tint,rgba(124,58,237,.18));color:var(--jm-primary,var(--jm-primary,#7c3aed));padding:4px 10px;border-radius:6px">' + JM.esc(c.code) + '</div>'
          + '<div style="flex:1;min-width:0">'
          +   '<div style="font-weight:600;font-size:13px">' + disc + ' · ' + JM.esc(c.course_title || 'All courses') + '</div>'
          +   '<div style="font-size:11px;color:var(--jm-text-muted)">' + used + exp + '</div>'
          + '</div>'
          + '<button class="btn-sm btn-outline" onclick="cpnDelete(\'' + c.id + '\')" title="Delete" style="color:var(--jm-danger,#ef4444)">🗑</button>'
          + '</div>';
      }).join('');
    }

    var createForm = '<div style="border:1px solid var(--jm-border);border-radius:10px;padding:14px;margin-bottom:16px">'
      + '<div style="font-weight:700;font-size:13px;margin-bottom:10px">Create a coupon</div>'
      + '<div class="grid-2">'
      +   '<div class="form-row"><label>Code</label><input id="cpn-code" placeholder="WELCOME20" style="text-transform:uppercase"></div>'
      +   '<div class="form-row"><label>Applies to</label><select id="cpn-course">' + courseOpts + '</select></div>'
      + '</div>'
      + '<div class="grid-2">'
      +   '<div class="form-row"><label>Discount %</label><input id="cpn-pct" type="number" min="0" max="100" placeholder="e.g. 20"></div>'
      +   '<div class="form-row"><label>OR Flat ₹ off</label><input id="cpn-flat" type="number" min="0" placeholder="e.g. 100"></div>'
      + '</div>'
      + '<div class="grid-2">'
      +   '<div class="form-row"><label>Max uses</label><input id="cpn-max" type="number" min="1" value="100"></div>'
      +   '<div class="form-row"><label>Expires (optional)</label><input id="cpn-exp" type="date"></div>'
      + '</div>'
      + JM.Button({ label: '＋ Create coupon', kind: 'primary', size: 'sm', onClick: 'cpnCreate()' })
      + '</div>';

    return JM.ModalShell({
      body: createForm
        + '<div style="font-weight:700;font-size:13px;margin-bottom:8px">Your coupons</div>'
        + rows
    });
  }
});
