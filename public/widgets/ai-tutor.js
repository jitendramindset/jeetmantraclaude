/* widgets/ai-tutor.js — AI command-bar shortcut (universal). */
EduOSWidgets.register({
  id: 'ai-tutor', title: 'AI Copilot', roles: null,
  category: 'ai', size: 'small', priority: 60,
  render: function () {
    return '<div class="wg-sub">Ask anything — "show revenue", "today\'s classes", "create course".</div>'
      + '<a class="wg-action" style="margin-top:10px" href="dashboard.html#ai">🤖 Open Copilot</a>';
  }
});
