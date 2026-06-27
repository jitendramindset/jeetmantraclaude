/* ui/widgets/atoms/ModalShell.js — JM.ModalShell({body, footer}) → HTML for the modal body. */
window.JM = window.JM || {};
JM.ModalShell = function (p) {
  p = p || {};
  var foot = p.footer ? '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--jm-border);display:flex;gap:10px;align-items:center">' + p.footer + '</div>' : '';
  return '<div class="jm-modal-shell">' + (p.body || '') + foot + '</div>';
};
