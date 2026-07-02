/**
 * ui/screens/Help.js — static FAQ + Ask AI + Email support.
 * Composes: KPIGrid (no), ActionToolbar, ListSection. Pure view; no model.
 */
JM.Screens.register({
  id: 'help',
  title: '❓ Help & Support',
  surface: 'modal',
  // No model — fully static content.
  render: function () {
    var faqs = [
      { q: '🚀 Getting started', a: 'Pick a role on signup, then use the menu to navigate. Every empty card has a button to create your first item.' },
      { q: '💳 Payments & wallet', a: 'Top up your wallet from Wallet → Add money. Course purchases and refunds appear in your transaction history.' },
      { q: '🎥 Going live', a: 'Teachers: open Studio to broadcast. Students join from Live Classes when a teacher is on air.' },
      { q: '🌐 Language', a: 'Change the interface language from the top bar selector or Settings. Bhasha Setu offers per-line read-aloud in 12 languages.' },
      { q: '🔒 Account & privacy', a: 'Manage your profile, password, and notification settings from Settings. We never share your data without consent.' }
    ];
    var faqsHtml = faqs.map(function (f) {
      return '<details style="border:1px solid var(--jm-border);border-radius:10px;padding:10px 14px;margin-bottom:8px">'
        + '<summary style="font-weight:600;font-size:13px;cursor:pointer">' + JM.esc(f.q) + '</summary>'
        + '<div style="font-size:12px;color:var(--jm-text-muted);margin-top:8px;line-height:1.6">' + JM.esc(f.a) + '</div>'
        + '</details>';
    }).join('');
    var toolbar = JM.ActionToolbar({
      max: 2,
      actions: [
        { label: 'Ask the AI Assistant', icon: '🤖', kind: 'primary',
          onClick: "closeAnyModal(); if(typeof openMessenger==='function')openMessenger('ai')" },
        { label: 'Email support', icon: '✉️', kind: 'ghost',
          onClick: "location.href='mailto:support@mantravat.cloud'" }
      ]
    });
    return JM.ModalShell({
      body: toolbar
        + JM.SectionHeader({ title: 'Frequently asked' })
        + faqsHtml
        + '<div style="font-size:11px;color:var(--jm-text-muted);text-align:center;margin-top:14px">'
        + 'Still stuck? Email <a href="mailto:support@mantravat.cloud">support@mantravat.cloud</a></div>'
    });
  }
});
