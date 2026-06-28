/* ui/models/WidgetAdmin.js — admin widget policy + the registered widget catalog. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.WidgetAdmin = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/admin/widget-config', { headers: { Authorization: 'Bearer ' + t } });
    var cfg = { global: {}, byRole: {}, order: {}, sizes: {} };
    if (r.ok) { var j = await r.json(); cfg = j.config || cfg; }
    var widgets = (window.EduOSWidgets && EduOSWidgets.WIDGETS) ? EduOSWidgets.WIDGETS : [];
    return { widgets: widgets, config: cfg };
  },
  save: async function (cfg) {
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/admin/widget-config', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify(cfg) });
    if (!r.ok) throw new Error('Save failed (HTTP ' + r.status + ')');
    return r.json();
  }
};
