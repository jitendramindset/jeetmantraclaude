/**
 * ui/screens/N8nConfig.js — n8n webhook config form (modal).
 * Replaces inline openN8nConfig().
 * Legacy saveN8nConfig() and testN8n() helpers stay in dashboard.html — they
 * read #m-n8n-url + #m-n8n-secret from this screen's rendered form.
 */
JM.Screens.register({
  id: 'n8n-config',
  title: '⚡ n8n Webhook Config',
  surface: 'modal',
  model: JM.Models.N8nConfig,
  render: function (d) {
    var statusBadge = JM.Badge({
      text: d.enabled ? 'Enabled' : 'Disabled',
      kind: d.enabled ? 'success' : 'default'
    });
    var sourceBadge = d.source ? ' ' + JM.Badge({ text: 'source: ' + d.source, kind: 'default' }) : '';
    return JM.ModalShell({
      body: '<div class="form-row"><label>Webhook URL</label>'
        +   '<input id="m-n8n-url" placeholder="https://your-n8n.com/webhook/jeetmantra" value="' + JM.esc(d.url) + '"></div>'
        + '<div class="form-row"><label>Secret (header X-N8N-Secret)</label>'
        +   '<input id="m-n8n-secret" placeholder="' + (d.hasSecret ? '(set — overwrite to change)' : 'optional') + '"></div>'
        + '<div class="form-row"><label>Status</label>'
        +   '<div style="font-size:13px">' + statusBadge + sourceBadge + '</div></div>'
        + '<div style="display:flex;gap:8px;margin-top:14px">'
        +   JM.Button({ label: 'Save & Enable', kind: 'primary', size: 'sm', onClick: 'saveN8nConfig(true)' })
        +   JM.Button({ label: 'Save & Disable', kind: 'ghost', size: 'sm', onClick: 'saveN8nConfig(false)' })
        +   JM.Button({ label: '🔔 Send Test Event', kind: 'ghost', size: 'sm', onClick: 'testN8n()' })
        + '</div>'
        + '<div id="n8n-result" style="margin-top:12px;font-size:13px"></div>'
    });
  }
});
