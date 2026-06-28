/* ui/models/N8nConfig.js — admin n8n webhook config. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.N8nConfig = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/n8n/config', { headers: { Authorization: 'Bearer ' + t } });
    if (!r.ok) throw new Error('n8n config HTTP ' + r.status);
    var j = await r.json();
    return {
      url: j.url || '',
      hasSecret: !!j.hasSecret,
      enabled: !!j.enabled,
      source: j.source || ''
    };
  }
};
