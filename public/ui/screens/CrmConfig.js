/**
 * ui/screens/CrmConfig.js — CRM Configuration takeover (reuses #settingsPage / #st-body).
 * Replaces inline openCRMConfig(). All ~15 page-level helpers stay in dashboard.html:
 * _crmFmtInvoice, _crmPreviewInv, _crmPickAccent, _crmPickTheme, _crmPickFont,
 * _crmAddField, _crmUpdField, _crmDelField, _crmFileToDataURL, _crmLogoFile,
 * _crmClearLogo, _crmCoverFile, _crmClearCover, _crmAttUpload, _crmDelAtt,
 * _crmSubcatOptions, _crmUseLocation, _crmSaveAll — they write directly to DOM ids
 * and call openCRMConfig() (now the delegator) to refresh.
 */
JM.Screens.register({
  id: 'crm-config',
  title: '🏢 CRM Configuration',
  surface: 'takeover',
  pageId: 'settingsPage',
  bodyId: 'st-body',
  crumbId: '__nope__',
  model: JM.Models.CrmConfig,
  render: function (d) {
    var c = d.crm;
    var E = JM.esc;
    var previewInv = window._crmFmtInvoice
      ? window._crmFmtInvoice(c.invoiceFormat, d.lastInv + 1)
      : 'JM-' + new Date().getFullYear() + '-' + String(d.lastInv + 1).padStart(3, '0');

    var CATS = window.INSTITUTE_CATEGORIES || {};

    var swatches = ['var(--jm-accent-orange,#f97316)','var(--jm-primary,#7c3aed)','var(--jm-accent-cyan,#0ea5e9)','var(--jm-success,var(--jm-success,#16a34a))','var(--jm-accent-pink,#ec4899)','var(--jm-warn,#f59e0b)','var(--jm-danger,#ef4444)','var(--jm-bg-dark,#0f172a)']
      .map(function (hex) {
        return '<div class="crm-swatch ' + (c.accentColor === hex ? 'active' : '') + '" data-hex="' + hex + '" style="background:' + hex + '" onclick="_crmPickAccent(\'' + hex + '\')"></div>';
      }).join('');

    var themes = [
      {k:'midnight', l:'Midnight Blue', bg:'linear-gradient(135deg,var(--jm-bg-dark,#0f172a),#1e3a5f)'},
      {k:'light',    l:'Daylight',      bg:'linear-gradient(135deg,var(--jm-white,#ffffff),var(--jm-surface-2,#f1f5f9))', color:'var(--jm-bg-dark,#0f172a)'},
      {k:'paper',    l:'Warm Paper',    bg:'linear-gradient(135deg,#faf7f2,#f0e7d8)', color:'#3f3a35'},
      {k:'forest',   l:'Forest',        bg:'linear-gradient(135deg,#0f1f17,#1a3a2a)'},
      {k:'rose',     l:'Rose',          bg:'linear-gradient(135deg,var(--jm-danger-bg,#fee2e2),var(--jm-danger-bg,#fee2e2))', color:'var(--jm-danger-dark,#4c0519)'}
    ].map(function (t) {
      return '<div class="crm-theme-card ' + (c.bgTheme === t.k ? 'active' : '') + '" style="background:' + t.bg + ';color:' + (t.color || '#fff') + '" onclick="_crmPickTheme(\'' + t.k + '\')">' + t.l + '</div>';
    }).join('');

    var catOptions = Object.keys(CATS).map(function (k) {
      return '<option value="' + E(k) + '" ' + (c.instituteCategory === k ? 'selected' : '') + '>' + E(k) + '</option>';
    }).join('');
    var subcatOptions = (CATS[c.instituteCategory] || []).map(function (s) {
      return '<option value="' + E(s) + '" ' + (c.instituteSubcategory === s ? 'selected' : '') + '>' + E(s) + '</option>';
    }).join('') || '<option value="">— pick a category —</option>';

    var fieldRows = (c.customFields || []).map(function (f, i) {
      var typeOpts = ['text','number','date','email','tel'].map(function (t) {
        return '<option ' + (f.type === t ? 'selected' : '') + '>' + t + '</option>';
      }).join('');
      return '<div class="inline-row" style="gap:8px;margin-bottom:6px">'
        + '<input value="' + E(f.label) + '" placeholder="Label" oninput="_crmUpdField(' + i + ',\'label\',this.value)" style="flex:1;padding:8px;border:1.5px solid var(--jm-border,#e2e8f0);border-radius:6px">'
        + '<select onchange="_crmUpdField(' + i + ',\'type\',this.value)" style="padding:8px;border:1.5px solid var(--jm-border,#e2e8f0);border-radius:6px">' + typeOpts + '</select>'
        + '<button class="btn btn-ghost" onclick="_crmDelField(' + i + ')" style="color:var(--jm-danger,#ef4444)">✕</button>'
        + '</div>';
    }).join('');

    var logoInner = c.logo
      ? '<div style="display:flex;align-items:center;gap:12px"><img src="' + c.logo + '" class="crm-preview-img"><div style="flex:1"><div style="font-weight:700;font-size:13px">Current logo</div><div style="font-size:11px;color:var(--jm-text-subtle,#64748b)">Click to replace · drag a new file</div></div><button onclick="event.preventDefault();event.stopPropagation();_crmClearLogo()" style="background:var(--jm-danger-bg,#fee2e2);color:var(--jm-danger,#ef4444);border:none;padding:6px 10px;border-radius:6px;font-size:12px;cursor:pointer">✕ Remove</button></div>'
      : '<div style="font-size:32px;margin-bottom:6px">📁</div><div style="font-weight:700;font-size:13px">Click or drag logo here</div><div style="font-size:11px;color:var(--jm-text-subtle,#94a3b8);margin-top:2px">PNG/JPG, max 2MB</div>';

    var attRows = (c.defaultAttachments || []).length
      ? (c.defaultAttachments || []).map(function (a, i) {
          return '<div class="crm-att-tile"><img src="' + a.url + '">'
            + '<div class="meta"><div style="font-weight:700;font-size:13px">' + E(a.label) + '</div><div style="font-size:11px;color:var(--jm-text-subtle,#94a3b8)">' + (a.size || '') + '</div></div>'
            + '<button onclick="_crmDelAtt(' + i + ')" style="background:var(--jm-danger-bg,#fee2e2);color:var(--jm-danger,#ef4444);border:none;padding:6px 10px;border-radius:6px;font-size:12px;cursor:pointer">Remove</button>'
            + '</div>';
        }).join('')
      : '<div style="text-align:center;padding:20px;color:var(--jm-text-subtle,#94a3b8);font-size:13px">No default attachments yet. Add some below.</div>';

    var fontOptions = ['Plus Jakarta Sans','Inter','Poppins','Roboto','Open Sans','Lato','Merriweather','Georgia','system-ui']
      .map(function (f) { return '<option ' + (c.font === f ? 'selected' : '') + ' style="font-family:\'' + f + '\'">' + f + '</option>'; }).join('');

    var coverInner = c.courseCover
      ? '<img src="' + c.courseCover + '" style="max-width:100%;max-height:140px;object-fit:cover;border-radius:8px">'
      : '<div style="font-size:32px;margin-bottom:6px">🖼</div><div style="font-weight:700;font-size:13px">Click or drag cover image</div><div style="font-size:11px;color:var(--jm-text-subtle,#94a3b8);margin-top:2px">Recommended 1280×720 · max 2MB</div>';
    var clearCoverBtn = c.courseCover
      ? '<button class="btn btn-ghost" onclick="_crmClearCover()" style="margin-top:8px;color:var(--jm-danger,#ef4444)">✕ Remove cover</button>' : '';

    return '<style>'
      + '.crm-wrap{max-width:980px;margin:0 auto;padding-bottom:60px}'
      + '.crm-section{background:var(--jm-surface,#fff);border:1px solid var(--jm-border,var(--jm-border,#e2e8f0));border-radius:14px;padding:22px;margin-bottom:18px}'
      + '.crm-section h3{font-size:15px;font-weight:800;margin:0 0 14px;display:flex;align-items:center;gap:8px}'
      + '.crm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));gap:14px}'
      + '.crm-field{display:flex;flex-direction:column;gap:6px}'
      + '.crm-field label{font-size:11px;font-weight:700;color:var(--jm-text-subtle,#64748b);text-transform:uppercase;letter-spacing:.05em}'
      + '.crm-field input,.crm-field select,.crm-field textarea{padding:10px 12px;border:1.5px solid var(--jm-border,var(--jm-border,#e2e8f0));border-radius:8px;font-size:13px;font-family:inherit;background:#fff;color:var(--jm-bg-dark,#0f172a);outline:none;transition:.15s}'
      + '.crm-field input:focus,.crm-field select:focus,.crm-field textarea:focus{border-color:var(--jm-primary,#7c3aed);box-shadow:0 0 0 3px rgba(124,58,237,.12)}'
      + '.crm-help{font-size:11px;color:var(--jm-text-subtle,#94a3b8);margin-top:4px;line-height:1.5}'
      + '.crm-help code{background:var(--jm-surface-2,#f1f5f9);padding:1px 5px;border-radius:3px;font-family:\'JetBrains Mono\',monospace;font-size:10px;color:var(--jm-surface-3,#334155)}'
      + '.crm-uploader{border:2px dashed var(--jm-border,#e2e8f0);border-radius:10px;padding:24px;text-align:center;cursor:pointer;transition:.15s;background:var(--jm-surface-1,#f8fafc)}'
      + '.crm-uploader:hover{border-color:var(--jm-primary,#7c3aed);background:var(--jm-primary-bg,#f5f3ff)}'
      + '.crm-uploader.has-file{padding:12px;background:#fff}'
      + '.crm-preview-img{max-width:100%;max-height:80px;border-radius:6px;object-fit:contain}'
      + '.crm-swatch{width:40px;height:40px;border-radius:10px;cursor:pointer;border:3px solid transparent;transition:.15s}'
      + '.crm-swatch.active{border-color:var(--jm-bg-dark,#0f172a);transform:scale(1.08)}'
      + '.crm-theme-card{padding:14px;border-radius:10px;cursor:pointer;border:2px solid transparent;transition:.15s;text-align:center;color:#fff;font-weight:700;font-size:12px}'
      + '.crm-theme-card.active{border-color:var(--jm-primary,#7c3aed);box-shadow:0 0 0 3px rgba(124,58,237,.2)}'
      + '.crm-att-tile{border:1px solid var(--jm-border,var(--jm-border,#e2e8f0));border-radius:10px;padding:10px;display:flex;gap:10px;align-items:center;margin-bottom:8px;background:#fff}'
      + '.crm-att-tile img{width:56px;height:56px;object-fit:cover;border-radius:6px}'
      + '.crm-att-tile .meta{flex:1;min-width:0}'
      + '.crm-bar{position:sticky;bottom:0;background:#fff;border-top:1px solid var(--jm-border,#e2e8f0);padding:14px 18px;margin:0 -18px -60px;display:flex;justify-content:flex-end;gap:8px;box-shadow:0 -8px 24px rgba(15,23,42,.06);z-index:5}'
      + '@media(max-width:600px){.crm-section{padding:16px}}'
      + '</style>'
      + '<div class="crm-wrap">'
      + '<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:18px;gap:12px;flex-wrap:wrap">'
      +   '<div><h2 style="margin:0 0 4px;font-size:22px;font-weight:900">🏢 CRM Configuration</h2>'
      +   '<div style="color:var(--jm-text-subtle,#64748b);font-size:13px">Company details, invoice format, theming and default attachments — applied across all invoices, courses, and emails.</div></div>'
      +   '<button class="btn btn-ghost" onclick="openSettings()">← Back to Settings</button>'
      + '</div>'

      // Company details
      + '<div class="crm-section"><h3>🏷 Company details</h3><div class="crm-grid">'
      + '<div class="crm-field"><label>Company name</label><input id="crmCompany" value="' + E(c.companyName) + '"></div>'
      + '<div class="crm-field"><label>Tagline / Subtitle</label><input id="crmTagline" value="' + E(c.tagline) + '"></div>'
      + '<div class="crm-field" style="grid-column:1/-1"><label>Address</label><textarea id="crmAddress" rows="2">' + E(c.address) + '</textarea></div>'
      + '<div class="crm-field"><label>Phone</label><input id="crmPhone" value="' + E(c.phone) + '" inputmode="tel"></div>'
      + '<div class="crm-field"><label>Email</label><input id="crmEmail" type="email" value="' + E(c.email) + '"></div>'
      + '<div class="crm-field"><label>Website</label><input id="crmWebsite" value="' + E(c.website) + '" placeholder="https://"></div>'
      + '<div class="crm-field"><label>GSTIN</label><input id="crmGstin" value="' + E(c.gstin) + '" maxlength="15" style="text-transform:uppercase;font-family:\'JetBrains Mono\',monospace"></div>'
      + '<div class="crm-field"><label>PAN</label><input id="crmPan" value="' + E(c.pan) + '" maxlength="10" style="text-transform:uppercase;font-family:\'JetBrains Mono\',monospace"></div>'
      + '<div class="crm-field"><label>Institute category</label><select id="crmCategory" onchange="_crmSubcatOptions(this.value)"><option value="">— select —</option>' + catOptions + '</select></div>'
      + '<div class="crm-field"><label>Sub-category</label><select id="crmSubcategory">' + subcatOptions + '</select></div>'
      + '<div class="crm-field"><label>City</label><input id="crmCity" value="' + E(c.instituteCity) + '" placeholder="e.g. Jaipur"></div>'
      + '<div class="crm-field"><label>Location (lat, lng)</label><div style="display:flex;gap:6px"><input id="crmLat" value="' + E(c.lat) + '" placeholder="lat" style="flex:1"><input id="crmLng" value="' + E(c.lng) + '" placeholder="lng" style="flex:1"><button class="btn-sm btn-outline" type="button" onclick="_crmUseLocation()">📍</button></div></div>'
      + '</div></div>'

      // Invoice numbering
      + '<div class="crm-section"><h3>🧾 Invoice numbering</h3><div class="crm-field">'
      + '<label>Format</label>'
      + '<input id="crmInvFmt" value="' + E(c.invoiceFormat) + '" oninput="_crmPreviewInv()" style="font-family:\'JetBrains Mono\',monospace">'
      + '<div class="crm-help">Placeholders: <code>{YYYY}</code> year · <code>{YY}</code> short year · <code>{MM}</code> month · <code>{####}</code> auto-number (the # count sets digit width). Leave blank to continue from your last invoice automatically.</div>'
      + '<div style="margin-top:8px;padding:10px;background:var(--jm-success-bg,#f0fdf4);border:1px solid var(--jm-success-mid,#bbf7d0);border-radius:8px;font-size:13px"><strong>Next will be:</strong> <span id="crmInvPreview" style="font-family:\'JetBrains Mono\',monospace;color:var(--jm-success,#16a34a)">' + E(previewInv) + '</span></div>'
      + '</div></div>'

      // Admin password
      + '<div class="crm-section"><h3>🔐 Admin password</h3><div class="crm-field">'
      + '<label>New password (leave blank to keep)</label>'
      + '<input id="crmAdminPw" type="password" placeholder="••••••••" autocomplete="new-password">'
      + '<div class="crm-help">Password is hashed locally before save. Used as a 4-eyes check on destructive operations.</div>'
      + '</div></div>'

      // Accent + theme
      + '<div class="crm-section"><h3>🎨 Accent &amp; theme</h3>'
      + '<div class="crm-field" style="margin-bottom:16px"><label>Accent / theme colour</label>'
      + '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">' + swatches
      + '<input type="color" id="crmAccentCustom" value="' + E(c.accentColor) + '" onchange="_crmPickAccent(this.value)" style="width:40px;height:40px;border:none;border-radius:10px;cursor:pointer;background:transparent">'
      + '</div></div>'
      + '<div class="crm-field"><label>Background theme</label>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(140px,100%),1fr));gap:10px">' + themes + '</div>'
      + '<div class="crm-help">Changes the CRM background instantly. Applies on next page load for printed invoices.</div>'
      + '</div></div>'

      // Custom fields
      + '<div class="crm-section"><h3>⚙ Custom fields</h3>'
      + '<p style="font-size:12px;color:var(--jm-text-subtle,#64748b);margin-bottom:12px">Rename built-in labels (e.g. "Phone" → "Mobile") or add your own fields to Clients &amp; Products.</p>'
      + '<div id="crmFieldsList">' + fieldRows + '</div>'
      + '<button class="btn btn-ghost" onclick="_crmAddField()" style="margin-top:6px">+ Add custom field</button>'
      + '</div>'

      // Logo
      + '<div class="crm-section"><h3>🖼 Logo</h3>'
      + '<label for="crmLogoFile" class="crm-uploader ' + (c.logo ? 'has-file' : '') + '" id="crmLogoDrop">' + logoInner + '</label>'
      + '<input id="crmLogoFile" type="file" accept="image/*" style="display:none" onchange="_crmLogoFile(this.files[0])">'
      + '<div class="crm-field" style="margin-top:14px">'
      + '<label>Logo size in invoice (<span id="crmLogoSizeVal">' + (c.logoSize || 58) + '</span>px)</label>'
      + '<input id="crmLogoSize" type="range" min="28" max="120" value="' + (c.logoSize || 58) + '" oninput="document.getElementById(\'crmLogoSizeVal\').textContent=this.value">'
      + '</div></div>'

      // Default attachments
      + '<div class="crm-section"><h3>📎 Default invoice attachments</h3>'
      + '<p style="font-size:12px;color:var(--jm-text-subtle,#64748b);margin-bottom:12px">Images uploaded here are automatically attached to every new invoice with the label you set. T&amp;C, Warranty, product specs — set once, forget forever. Max 8, each up to 2MB.</p>'
      + '<div id="crmAttList">' + attRows + '</div>'
      + '<div style="display:flex;gap:8px;margin-top:12px;align-items:end;flex-wrap:wrap">'
      + '<div class="crm-field" style="flex:1;min-width:160px"><label>Label</label><input id="crmAttLabel" placeholder="e.g. Warranty, T&amp;C, Validity"></div>'
      + '<input id="crmAttFile" type="file" accept="image/*" style="display:none" onchange="_crmAttUpload(this.files[0])">'
      + '<button class="btn btn-primary" onclick="document.getElementById(\'crmAttFile\').click()">📷 Upload image</button>'
      + '</div></div>'

      // Typography
      + '<div class="crm-section"><h3>🔤 Typography</h3><div class="crm-field">'
      + '<label>Font family (invoice + app)</label>'
      + '<select id="crmFont" onchange="_crmPickFont(this.value)">' + fontOptions + '</select>'
      + '<div class="crm-help" id="crmFontPreview" style="margin-top:10px;font-size:15px;color:var(--jm-bg-dark,#0f172a);font-family:\'' + E(c.font) + '\'">The quick brown fox jumps over 1234567890 ₹ INR</div>'
      + '</div></div>'

      // Course cover
      + '<div class="crm-section"><h3>📚 Default course cover &amp; title image</h3>'
      + '<p style="font-size:12px;color:var(--jm-text-subtle,#64748b);margin-bottom:12px">This cover is used as the fallback image whenever a course is created without one — and shown on the course title card. You can still override per-course in the Course wizard.</p>'
      + '<div class="crm-grid"><div>'
      + '<label for="crmCoverFile" class="crm-uploader ' + (c.courseCover ? 'has-file' : '') + '">' + coverInner + '</label>'
      + '<input id="crmCoverFile" type="file" accept="image/*" style="display:none" onchange="_crmCoverFile(this.files[0])">'
      + clearCoverBtn
      + '</div>'
      + '<div class="crm-field"><label>Course-title accent</label>'
      + '<input type="color" id="crmCourseColor" value="' + E(c.courseTitleColor) + '" onchange="_crmSave({courseTitleColor:this.value});toast(\'✓ Title colour saved\')" style="width:80px;height:40px;border:none;border-radius:8px;cursor:pointer">'
      + '<div class="crm-help">Used as the text colour over the cover image on the course title card.</div>'
      + '</div></div></div>'

      // Sticky save bar
      + '<div class="crm-bar">'
      + '<button class="btn btn-ghost" onclick="openSettings()">Cancel</button>'
      + '<button class="btn btn-primary" onclick="_crmSaveAll()">💾 Save all changes</button>'
      + '</div>'
      + '</div>';
  }
});
