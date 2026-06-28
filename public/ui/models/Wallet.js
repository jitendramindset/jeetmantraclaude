/**
 * ui/models/Wallet.js — Wallet data model. ONE place for wallet API knowledge.
 * JM.Models.Wallet.fetch(ctx) → { balance, referral, transactions[] }
 */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.Wallet = {
  fetch: async function () {
    var t = localStorage.getItem('jm_token');
    var H = { headers: { Authorization: 'Bearer ' + t } };
    var r = await fetch('/api/wallet', H);
    if (!r.ok) throw new Error('Wallet HTTP ' + r.status);
    var j = await r.json();
    // Best-effort referral code lookup (separate endpoint in current backend).
    var refObj = j.referral_code || j.referralCode || null;
    if (!refObj) {
      try {
        var rr = await fetch('/api/wallet/referrals/my-code', H);
        if (rr.ok) refObj = await rr.json();
      } catch (e) { /* ignore */ }
    }
    return {
      balance: Number(j.balance || 0),
      referralCode: refObj || '',
      txCount30: (j.transactions || []).filter(function (t) { return Date.now() - new Date(t.created_at).getTime() < 30 * 86400000; }).length,
      transactions: j.transactions || []
    };
  }
};
