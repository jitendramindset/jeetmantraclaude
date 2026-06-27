/**
 * ui/screens/Settings.js — Settings landing page (takeover via #settingsPage).
 * Replaces inline openSettings(). All page-level helpers (setLang, setTheme,
 * stChangePassword, logout, the open* navigation targets) stay in dashboard.html.
 */
JM.Screens.register({
  id: 'settings',
  title: '⚙️ Settings',
  surface: 'takeover',
  pageId: 'settingsPage',
  bodyId: 'st-body',
  crumbId: '__nope__',                 // settings shell has its own H2, no crumb
  model: JM.Models.Settings,
  render: function (d) {
    var LANGS = (window.JM_LANGS || [{ c: 'en', n: 'English' }]);

    var tile = function (c, icon, title, desc, action) {
      return '<div class="card" onclick="' + action.replace(/"/g, '&quot;') + '"'
        + ' style="cursor:pointer;padding:18px;position:relative;overflow:hidden;border-top:3px solid ' + c + ';transition:transform .15s,box-shadow .15s"'
        + ' onmouseover="this.style.transform=\'translateY(-2px)\';this.style.boxShadow=\'0 6px 20px rgba(15,23,42,.08)\'"'
        + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'">'
        + '<div style="font-size:28px;margin-bottom:8px">' + icon + '</div>'
        + '<div style="font-weight:700;font-size:14px;margin-bottom:4px;color:var(--jm-text)">' + title + '</div>'
        + '<div style="font-size:12px;color:var(--jm-text-muted);line-height:1.4">' + desc + '</div>'
        + '</div>';
    };

    var sectionHeader = function (label) {
      return '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--jm-text-muted);margin:8px 0 10px">'
        + label + '</div>';
    };
    var grid = function (inner) {
      return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:14px;margin-bottom:24px">' + inner + '</div>';
    };

    var personal = sectionHeader('Personal') + grid(
        tile('#7c3aed', '👤', 'Profile', 'Name · contact · address · photo', 'openProfilePage()')
      + tile('#0ea5e9', '🏫', 'My Institutions', 'Manage school / coaching links', 'openMyInstitutions()')
      + tile('#10b981', '🤖', 'AI assistant key', 'Configure provider (OpenAI / Anthropic / Gemini)', 'openAiKey()')
      + tile('#ec4899', '💳', 'Payments &amp; coupons', 'Razorpay status · coupon codes · refunds', 'openPayments()')
    );

    var langOpts = LANGS.map(function (l) {
      return '<option value="' + l.c + '"' + (d.lang === l.c ? ' selected' : '') + '>🇮🇳 ' + JM.esc(l.n) + '</option>';
    }).join('');

    var appearance = sectionHeader('Appearance &amp; language')
      + '<div class="card" style="padding:18px;margin-bottom:24px">'
      +   '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:18px;align-items:end">'
      +     '<div class="form-row" style="margin:0"><label>🌐 Language</label>'
      +       '<select id="st-lang" onchange="setLang(this.value)">' + langOpts + '</select></div>'
      +     '<div class="form-row" style="margin:0"><label>🎨 Theme</label>'
      +       '<select id="st-theme" onchange="setTheme(this.value)">'
      +         '<option value="light"' + (d.theme === 'light' ? ' selected' : '') + '>☀ Light</option>'
      +         '<option value="dark"'  + (d.theme === 'dark'  ? ' selected' : '') + '>🌙 Dark</option>'
      +       '</select></div>'
      +     '<div class="form-row" style="margin:0"><label>💱 Currency</label>'
      +       '<select id="st-currency" onchange="localStorage.setItem(\'jm_currency\',this.value);toast(\'Currency set — applies on next reload\')">'
      +         '<option value="INR"' + (d.currency === 'INR' ? ' selected' : '') + '>₹ INR — Indian Rupee</option>'
      +         '<option value="USD"' + (d.currency === 'USD' ? ' selected' : '') + '>$ USD — US Dollar</option>'
      +         '<option value="EUR"' + (d.currency === 'EUR' ? ' selected' : '') + '>€ EUR — Euro</option>'
      +       '</select></div>'
      +   '</div>'
      +   '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--jm-border)">'
      +     '<a href="#/m/settings" style="font-size:13px;font-weight:700;color:var(--jm-primary);text-decoration:none">⚙️ All customization in Settings — colors, branding, fonts, language &amp; integrations →</a>'
      +   '</div>'
      + '</div>';

    var workspace = sectionHeader('Workspace') + grid(
        tile('#f97316', '🏢', 'CRM configuration', 'Company · invoice format · branding · logo', 'openCRMConfig()')
      + tile('#f59e0b', '🧾', 'Billing &amp; invoices', 'Issue invoices · mark paid · PDF', 'openBilling()')
      + tile('#7c3aed', '📅', 'Calendar', 'Month view of classes, tests, assignments', 'openCalendar()')
      + tile('#0ea5e9', '📹', 'Recordings', 'Browse past live-class recordings', 'openRecordings()')
      + tile('#10b981', '📊', 'Test analytics', 'Per-question pass rate · score distribution', "toast('Open a test from Configure → 📊 Analytics')")
    );

    var admin = d.isAdmin
      ? sectionHeader('Admin') + grid(
            tile('#ef4444', '🛡', 'Audit log', 'Recent admin actions', "toast('See Admin page')")
          + tile('#7c3aed', '💰', 'Commission rate', 'Platform commission %', "openEmbed('/admin-os.html?embed=1','🛡️ Platform OS')")
          + tile('#ec4899', '🔌', 'n8n / webhooks', 'Configure automations', 'openN8nConfig()')
        )
      : '';

    var account = sectionHeader('Account')
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:14px">'
      + tile('#0ea5e9', '🔑', 'Change password', 'Send a reset link to your email', 'stChangePassword()')
      + tile('#ef4444', '🚪', 'Log out', 'End your session on this device', 'logout()')
      + '</div>';

    return '<div style="max-width:1180px;margin:0 auto">'
      + '<h2 style="margin-bottom:6px">⚙️ Settings</h2>'
      + '<div style="color:var(--jm-text-muted);font-size:13px;margin-bottom:18px">Personal preferences and workspace configuration</div>'
      + personal + appearance + workspace + admin + account
      + '</div>';
  }
});
