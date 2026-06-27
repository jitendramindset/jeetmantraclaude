/**
 * ui/models/Wallet.js — Wallet data model. ONE place for wallet API knowledge.
 * JM.Models.Wallet.fetch(ctx) → { balance, referral, transactions[] }
 */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Wallet = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var r = await fetch('/api/wallet', { headers: { Authorization: 'Bearer ' + t } });
    if (!r.ok) throw new Error('Wallet HTTP ' + r.status);
    var j = await r.json();
    return {
      balance: Number(j.balance || 0),
      referralCode: j.referral_code || j.referralCode || '',
      txCount30: (j.transactions || []).filter(function (t) { return Date.now() - new Date(t.created_at).getTime() < 30 * 86400000; }).length,
      transactions: j.transactions || []
    };
  }
};
