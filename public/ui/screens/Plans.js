/**
 * ui/screens/Plans.js — SaaS subscription plans (takeover-page).
 * Replaces inline openPlans(). Legacy subscribe(planCode, billingPeriod) handler stays.
 */
JM.Screens.register({
  id: 'plans',
  title: '⚡ Plans',
  crumb: 'Plans',
  surface: 'takeover',
  model: JM.Models.Plans,
  render: function (d) {
    var plans = d.plans || [];
    var current = d.current;
    var planColor = { free: 'var(--jm-text-subtle,#94a3b8)', basic: 'var(--jm-accent-cyan,#0ea5e9)', pro: 'var(--jm-primary,#7c3aed)', enterprise: 'var(--jm-success,var(--jm-success,#16a34a))' };

    var currentBanner = current
      ? '<div class="card" style="padding:14px;margin-bottom:18px;display:flex;align-items:center;gap:10px;background:var(--jm-primary-tint,rgba(124,58,237,.18))">'
        + '<span style="font-size:22px">✅</span>'
        + '<div><div style="font-weight:700">Current plan: ' + JM.esc(current.plan_code || current.plan_name || '') + '</div>'
        +   '<div style="font-size:12px;color:var(--jm-text-muted)">Active until '
        +     (current.expires_at ? new Date(current.expires_at).toLocaleDateString('en-IN') : '—')
        +   '</div></div>'
        + '</div>'
      : '';

    var cards = plans.map(function (p) {
      var isCurrent = current && current.plan_code === p.code;
      var c = planColor[p.code] || 'var(--jm-primary,#7c3aed)';
      var ribbon = p.code === 'pro'
        ? '<div style="position:absolute;top:-10px;right:14px;background:' + c + ';color:#fff;padding:3px 10px;border-radius:99px;font-size:10px;font-weight:800;letter-spacing:.05em">MOST POPULAR</div>'
        : '';
      var price = p.price_monthly == 0
        ? 'Free'
        : '₹' + p.price_monthly + '<span style="font-size:13px;color:var(--jm-text-muted);font-weight:500">/mo</span>';
      var yearly = p.price_yearly
        ? 'or ₹' + p.price_yearly + ' / yr (save ' + Math.round((1 - p.price_yearly / (p.price_monthly * 12)) * 100) + '%)'
        : '';
      var features = (p.features || []).map(function (f) {
        return '<li style="padding:4px 0;display:flex;gap:8px"><span style="color:' + c + '">✓</span>' + JM.esc(f) + '</li>';
      }).join('');
      var cta = isCurrent
        ? '<button class="btn-sm btn-outline" style="width:100%" disabled>Current plan</button>'
        : '<button class="btn-sm btn-primary" style="width:100%;background:linear-gradient(135deg,' + c + ',color-mix(in oklab,' + c + ',var(--jm-accent-purple,#a855f7) 30%))" onclick="subscribe(\'' + p.code + '\',\'monthly\')">Choose ' + JM.esc(p.name) + '</button>';
      return '<div class="card" style="padding:22px;border-top:4px solid ' + c + ';position:relative;'
        + (isCurrent ? 'box-shadow:0 0 0 2px ' + c : '') + '">'
        + ribbon
        + '<div style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:' + c + ';margin-bottom:4px">' + JM.esc(p.name) + '</div>'
        + '<div style="font-size:32px;font-weight:800;letter-spacing:-.02em">' + price + '</div>'
        + '<div style="font-size:11px;color:var(--jm-text-muted);margin-bottom:14px">' + yearly + '</div>'
        + '<ul style="list-style:none;padding:0;margin:0 0 16px;font-size:13px">' + features + '</ul>'
        + cta
        + '</div>';
    }).join('');

    return '<div style="max-width:1180px;margin:0 auto">'
      + '<h2 style="margin-bottom:6px">⚡ SaaS plans</h2>'
      + '<div style="color:var(--jm-text-muted);font-size:13px;margin-bottom:18px">Scale your institute with the right plan. Switch any time.</div>'
      + currentBanner
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr));gap:14px">' + cards + '</div>'
      + '</div>';
  }
});
