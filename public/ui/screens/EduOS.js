/**
 * ui/screens/EduOS.js — EduOS Hub takeover (tabs: Notifications, Forums,
 * Batches, QR Attend, Report Card, Admissions, Fees, Payroll, Leave,
 * White-label, Franchise, OCR Scan).
 * Replaces openEduOS(initialTab). All tab renderers stay in dashboard.html:
 * renderEduOSTab(k), loadForumThreads(), loadBatches(), markAllRead(),
 * generateQR(), createAdmission(), updateAdmission(), payInvoice(),
 * eduosSendReminders(), saveBranding(), openForumThread(), postReply(),
 * studentQRCheckin(), createBatch().
 * ctx: { initialTab? }
 */
JM.Screens.register({
  id: 'eduos',
  title: '🛰️ EduOS Hub',
  surface: 'takeover',
  model: JM.Models.EduOS,
  render: function () {
    return '<div style="text-align:center;padding:40px;color:#888">Loading EduOS…</div>';
  },
  afterMount: function (d, ctx) {
    var initialTab = ctx && ctx.initialTab;
    var role = (window.currentUser && window.currentUser.role) || 'student';
    var allTabs = [
      { k: 'notify',     l: '🔔 Notifications', roles: '*' },
      { k: 'forum',      l: '💬 Forums',         roles: '*' },
      { k: 'batches',    l: '👥 Batches',        roles: ['teacher', 'school', 'coaching', 'partner', 'admin', 'content_creator', 'corporate_trainer'] },
      { k: 'qr',         l: '📷 QR Attend',      roles: '*' },
      { k: 'reportcard', l: '📊 Report Card',    roles: '*' },
      { k: 'admissions', l: '🎫 Admissions',     roles: ['school', 'coaching', 'admin'] },
      { k: 'fees',       l: '💰 Fees',           roles: '*' },
      { k: 'payroll',    l: '💼 Payroll',        roles: ['school', 'coaching', 'admin'] },
      { k: 'leave',      l: '🏖 Leave',          roles: '*' },
      { k: 'branding',   l: '🎨 White-label',    roles: ['school', 'coaching', 'admin'] },
      { k: 'franchise',  l: '🏢 Franchise',      roles: ['franchise', 'admin'] },
      { k: 'ocr',        l: '📸 OCR Scan',       roles: '*' }
    ].filter(function (t) { return t.roles === '*' || t.roles.indexOf(role) !== -1; });

    var body = document.getElementById('bk-body');
    if (!body) return;
    body.innerHTML = '<div style="display:flex;gap:8px;overflow-x:auto;padding:8px 0;border-bottom:1px solid var(--jm-border);margin-bottom:16px">'
      + allTabs.map(function (t) {
          return '<button class="btn btn-ghost eduos-tab" data-k="' + t.k
            + '" onclick="renderEduOSTab(\'' + t.k + '\')" style="white-space:nowrap">' + t.l + '</button>';
        }).join('')
      + '</div>'
      + '<div id="eduos-tab-body" style="min-height:300px"></div>';

    if (typeof window.renderEduOSTab === 'function') {
      window.renderEduOSTab(initialTab || (allTabs[0] && allTabs[0].k) || 'notify');
    }
  }
});
