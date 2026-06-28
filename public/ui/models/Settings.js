/* ui/models/Settings.js — read-only model: pulls user prefs from localStorage. */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Settings = {
  fetch: async function () {
    var u = {};
    try { u = JSON.parse(localStorage.getItem('jm_user') || '{}'); } catch (_) {}
    return {
      lang: localStorage.getItem('jm_lang') || 'en',
      theme: localStorage.getItem('jm_theme') || 'light',
      currency: localStorage.getItem('jm_currency') || 'INR',
      role: u.user_type || u.role || 'student',
      isAdmin: (u.user_type === 'admin') || (u.role === 'admin')
    };
  }
};
