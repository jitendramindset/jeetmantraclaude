/**
 * ui/screens/Wizard.js — Multi-step course creation wizard (takeover).
 * Replaces openWizard(). Helpers that stay in dashboard.html:
 * closeWizard(), wizStep(n), wizCaptureFields(), renderWizard(),
 * wizScrapeFromUrl(), wizAiFill(), wizCreate().
 * afterMount inits window._wiz state and calls renderWizard().
 */
JM.Screens.register({
  id: 'wizard',
  title: '📚 New Course',
  surface: 'takeover',
  pageId: 'wizardPage',
  bodyId: 'wiz-body',
  crumbId: '__nope__',
  model: JM.Models.Wizard,
  render: function () {
    return '<div style="text-align:center;padding:40px;color:#888">Loading wizard…</div>';
  },
  afterMount: function () {
    window._wiz = {
      step: 1,
      data: { title: '', category: 'General', level: 'beginner', price: 0, description: '', cover: null }
    };
    if (typeof window.renderWizard === 'function') window.renderWizard();
  }
});
