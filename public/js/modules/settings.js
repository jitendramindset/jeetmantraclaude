(function(g) {
  var _CSS = [
    '.wrap{max-width:760px;margin:0 auto;padding:28px 24px 80px}',
    'h1{font-size:26px;font-weight:800;letter-spacing:-.02em;margin-bottom:4px}',
    '.sub{color:var(--jm-text-muted);font-size:14px;margin-bottom:24px}',
    '.card{background:var(--jm-surface);border:1px solid var(--jm-border);border-radius:var(--jm-radius);padding:20px 22px;margin-bottom:18px;box-shadow:var(--jm-shadow-sm)}',
    '.card h2{font-size:15px;font-weight:800;margin-bottom:4px}',
    '.card .hint{font-size:12px;color:var(--jm-text-muted);margin-bottom:16px}',
    '.field{margin-bottom:14px}',
    '.field label{display:block;font-size:12px;font-weight:700;color:var(--jm-text-strong);margin-bottom:5px}',
    '.field input,.field select{width:100%;background:var(--jm-surface);border:1.5px solid var(--jm-border);border-radius:var(--jm-radius-sm);padding:9px 12px;color:var(--jm-text);font-size:14px;outline:none;font-family:inherit}',
    '.field input:focus,.field select:focus{border-color:var(--jm-primary);box-shadow:0 0 0 3px rgba(124,58,237,.12)}',
    '.row{display:flex;gap:12px}.row .field{flex:1}',
    '.color-row{display:flex;align-items:center;gap:10px}',
    '.color-row input[type=color]{width:46px;height:40px;padding:2px;border:1.5px solid var(--jm-border);border-radius:8px;background:var(--jm-surface)}',
    '.toggle{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:var(--jm-text-strong)}',
    '.toggle input{width:18px;height:18px}',
    '.actions{display:flex;gap:10px;align-items:center;position:sticky;bottom:0;background:var(--jm-bg);padding:14px 0;margin-top:6px}',
    '.btn{padding:11px 22px;border:none;border-radius:var(--jm-radius-sm);font-size:14px;font-weight:700;cursor:pointer}',
    '.btn-primary{background:var(--jm-primary);color:#fff;box-shadow:0 2px 8px var(--jm-primary-glow)}',
    '.btn-ghost{background:var(--jm-surface);border:1.5px solid var(--jm-border);color:var(--jm-text-strong)}',
    '.saved{font-size:13px;font-weight:700;color:#15803d;opacity:0;transition:opacity .2s}',
    '.saved.show{opacity:1}',
    '.applies{font-size:11px;color:var(--jm-text-muted);margin-top:6px}'
  ].join('');

  var _HTML = [
    '<div class="wrap">',
    '  <h1>⚙️ Settings</h1>',
    '  <div class="sub">One place for branding, language and integrations — applied across the dashboard, Exam Platform and Bhasha Setu.</div>',
    '  <div class="card">',
    '    <h2>🎨 Branding</h2>',
    '    <div class="hint">Shown across the platform and the satellite apps.</div>',
    '    <div class="row">',
    '      <div class="field"><label>Organization name</label><input id="orgName" type="text" placeholder="JeetMantra"></div>',
    '      <div class="field"><label>App name</label><input id="appName" type="text" placeholder="JeetMantra"></div>',
    '    </div>',
    '    <div class="field"><label>Logo emoji</label><input id="logoEmoji" type="text" maxlength="4" style="max-width:90px" placeholder="📚"></div>',
    '    <div class="row">',
    '      <div class="field"><label>Primary color</label><div class="color-row"><input id="primary" type="color"><input id="primaryHex" type="text" placeholder="#7c3aed"></div></div>',
    '      <div class="field"><label>Accent color</label><div class="color-row"><input id="accent" type="color"><input id="accentHex" type="text" placeholder="#f5a623"></div></div>',
    '    </div>',
    '    <div class="field"><label class="toggle"><input id="dark" type="checkbox"> Dark mode by default</label></div>',
    '  </div>',
    '  <div class="card">',
    '    <h2>🌐 Localization</h2>',
    '    <div class="hint">Default language for the app shell and the satellite apps.</div>',
    '    <div class="row">',
    '      <div class="field"><label>Default language</label>',
    '        <select id="language">',
    '          <option value="en">English</option><option value="hi">हिन्दी (Hindi)</option>',
    '          <option value="bn">বাংলা (Bengali)</option><option value="ta">தமிழ் (Tamil)</option>',
    '          <option value="te">తెలుగు (Telugu)</option><option value="mr">मराठी (Marathi)</option>',
    '          <option value="gu">ગુજરાતી (Gujarati)</option><option value="kn">ಕನ್ನಡ (Kannada)</option>',
    '          <option value="ml">മലയാളം (Malayalam)</option><option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>',
    '          <option value="ur">اردو (Urdu)</option><option value="or">ଓଡ଼ିଆ (Odia)</option>',
    '        </select>',
    '      </div>',
    '      <div class="field"><label>Text size</label>',
    '        <select id="fontScale"><option value="0.9">Small</option><option value="1">Normal</option><option value="1.15">Large</option><option value="1.3">Extra large</option></select>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <div class="card">',
    '    <h2>🔗 Integrations</h2>',
    '    <div class="hint">Configure once — used by the dashboard, Exam Platform (AI generation) and Bhasha Setu (AI tutor).</div>',
    '    <div class="field"><label>n8n / automation webhook</label><input id="n8nWebhook" type="url" placeholder="https://your-n8n.example.com/webhook/..."></div>',
    '    <div class="field"><label>AI generation endpoint</label><input id="aiWebhookUrl" type="url" placeholder="https://your-n8n.example.com/webhook/ai"></div>',
    '    <div class="field"><label>AI key <span style="font-weight:400;color:var(--jm-text-muted)">(stored on this device only)</span></label><input id="aiWebhookKey" type="password" placeholder="••••••••"></div>',
    '    <div class="applies">↳ Fans out to <code>examforge_ai_url</code> (Exam Platform) and <code>bs_config.webhook</code> (Bhasha Setu) automatically.</div>',
    '  </div>',
    '  <div class="actions">',
    '    <button class="btn btn-primary" id="saveBtn" onclick="saveSettings()">Save settings</button>',
    '    <button class="btn btn-ghost" onclick="resetSettings()">Reset</button>',
    '    <span class="saved" id="savedMsg">✓ Saved &amp; applied everywhere</span>',
    '  </div>',
    '</div>'
  ].join('');

  function _init(container) {
    function load() {
      var s = JMSettings.get();
      var set = function(id, v) { var el = document.getElementById(id); if (el) (el.type === 'checkbox' ? el.checked = !!v : el.value = v); };
      set('orgName', s.orgName); set('appName', s.appName); set('logoEmoji', s.logoEmoji);
      set('primary', s.primary); set('primaryHex', s.primary); set('accent', s.accent); set('accentHex', s.accent);
      set('dark', s.dark); set('language', s.language); set('fontScale', String(s.fontScale));
      set('n8nWebhook', s.n8nWebhook); set('aiWebhookUrl', s.aiWebhookUrl); set('aiWebhookKey', s.aiWebhookKey);
    }
    // keep color picker + hex in sync
    ['primary','accent'].forEach(function(k) {
      var pick = document.getElementById(k), hex = document.getElementById(k+'Hex');
      if (pick && hex) {
        pick.addEventListener('input', function() { hex.value = pick.value; });
        hex.addEventListener('input', function() { if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) pick.value = hex.value; });
      }
    });
    g.saveSettings = async function() {
      var v = function(id) { return document.getElementById(id).value; };
      var next = JMSettings.set({
        orgName: v('orgName'), appName: v('appName'), logoEmoji: v('logoEmoji'),
        primary: document.getElementById('primaryHex').value || v('primary'),
        accent: document.getElementById('accentHex').value || v('accent'),
        dark: document.getElementById('dark').checked,
        language: v('language'), fontScale: parseFloat(v('fontScale')) || 1,
        n8nWebhook: v('n8nWebhook'), aiWebhookUrl: v('aiWebhookUrl'), aiWebhookKey: v('aiWebhookKey')
      });
      var r = await JMSettings.syncToOrg();
      var msg = document.getElementById('savedMsg');
      msg.textContent = r.ok ? '✓ Saved, applied everywhere & synced to your org' : '✓ Saved & applied everywhere (this device)';
      msg.classList.add('show'); setTimeout(function() { msg.classList.remove('show'); }, 2600);
    };
    g.resetSettings = function() {
      if (!confirm('Reset all settings to defaults?')) return;
      JMSettings.set(JMSettings.DEFAULTS); load();
    };
    load();

    // App-shell embed mode
    (function(){ try{ if(new URLSearchParams(location.search).get('embed')!=='1') return;
      document.documentElement.classList.add('embed');
      var s=document.createElement('style');
      s.textContent='html.embed a[href$="/dashboard.html"],html.embed a[href="/app"],html.embed [data-embed-hide]{display:none!important}';
      (document.head||document.documentElement).appendChild(s);
      var hide=function(){ document.querySelectorAll('[onclick]').forEach(function(el){ var o=el.getAttribute('onclick')||''; if(o.indexOf('dashboard.html')>-1 || /[\'"]\/app[\'"]/g.test(o)) el.style.display='none'; }); };
      hide();
    }catch(e){} })();
  }

  function mount(container) {
    if (!document.getElementById('jm-mod-settings-css')) {
      var s = document.createElement('style');
      s.id = 'jm-mod-settings-css';
      s.textContent = _CSS;
      document.head.appendChild(s);
    }
    container.innerHTML = _HTML;
    try { _init(container); } catch(e) { console.warn('settings init error:', e); }
  }

  g.JM = g.JM || {};
  g.JM.Modules = g.JM.Modules || {};
  g.JM.Modules['settings'] = { mount: mount, unmount: function(c){ if(c) c.innerHTML=''; } };
})(window);
