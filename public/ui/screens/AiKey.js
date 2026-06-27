/**
 * ui/screens/AiKey.js — BYOK AI key + usage counter (modal surface).
 * Replaces inline openAiKey(); MVC: model = JM.Models.AiKey.
 * Page-side saveAiKey() / clearAiKey() still own the writes.
 */
JM.Screens.register({
  id: 'ai-key',
  title: '🔑 AI Key (BYOK)',
  model: JM.Models.AiKey,
  render: function (d) {
    var PROVIDERS = ['openai', 'anthropic', 'gemini', 'openrouter'];
    var providerOpts = '<option value="">— pick one —</option>'
      + PROVIDERS.map(function (p) {
          return '<option value="' + p + '"' + (d.provider === p ? ' selected' : '') + '>' + p + '</option>';
        }).join('');
    var usageBanner =
      '<div style="background:var(--jm-primary-tint,rgba(124,58,237,.18));padding:12px;border-radius:8px;margin-bottom:14px;font-size:13px">'
      + '<strong>Today\'s usage:</strong> ' + d.todayCalls + ' / ' + d.freeLimit + ' calls on the FREE plan'
      + (d.hasKey ? ' ' + JM.Badge({ text: 'your own key — unlimited', kind: 'success' }) : '')
      + '</div>';
    return JM.ModalShell({
      body: usageBanner
        + '<div class="form-row"><label>Provider</label><select id="m-aiprov">' + providerOpts + '</select></div>'
        + '<div class="form-row"><label>API Key</label>'
        +   '<input id="m-aikey" type="password" placeholder="' + (d.hasKey ? '(set — type to overwrite)' : 'sk-…') + '">'
        + '</div>'
        + '<div style="display:flex;gap:8px;margin-top:10px">'
        +   JM.Button({ label: 'Save Key', kind: 'primary', size: 'sm', onClick: 'saveAiKey()' })
        +   JM.Button({ label: 'Remove Key', kind: 'ghost', size: 'sm', onClick: 'clearAiKey()' })
        + '</div>'
        + '<div style="font-size:12px;color:var(--jm-text-muted);margin-top:10px">Your key is encrypted at rest. Without your own key the platform falls back to ' + d.freeLimit + ' shared-quota calls per day.</div>'
    });
  }
});
