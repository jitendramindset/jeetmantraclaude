/**
 * ui/controllers/Wallet.js — wallet ACTIONS. No DOM, just business logic.
 * Registered with JM.Screens so screens dispatch via JM.Screens.action('wallet.topup').
 */
window.JM = window.JM || {}; JM.Controllers = JM.Controllers || {};
JM.Controllers.Wallet = {
  topUp: function () {
    // Delegate to the existing dashboard helper if present; else fallback CTA.
    if (typeof walletTopupOpen === 'function') return walletTopupOpen();
    if (typeof openWallet === 'function') return openWallet();
    alert('Top-up flow not available yet.');
  }
};
// Wire actions into the screen registry's dispatcher.
if (window.JM && JM.Screens && typeof JM.Screens.handle === 'function') {
  JM.Screens.handle('wallet.topup', JM.Controllers.Wallet.topUp);
}
