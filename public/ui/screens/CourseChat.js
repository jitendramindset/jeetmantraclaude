/**
 * ui/screens/CourseChat.js — Course chat room modal.
 * Replaces openCourseChat(courseId, title). Helpers that stay in dashboard.html:
 * renderChat(), sendChat(), micBtn() — they write to #chat-messages / read #chat-input.
 * afterMount sets window._activeChat then calls renderChat().
 * ctx: { courseId, title? }
 */
JM.Screens.register({
  id: 'course-chat',
  title: '💬 Course Chat',
  surface: 'modal',
  model: JM.Models.CourseChat,
  render: function () {
    var micButton = typeof window.micBtn === 'function' ? window.micBtn('chat-input') : '';
    return '<div id="chat-body" style="display:flex;flex-direction:column;min-height:400px">'
      + '<div id="chat-messages" style="flex:1;overflow-y:auto;max-height:340px;padding:6px 0;'
      + 'border-bottom:1px solid var(--jm-border);margin-bottom:10px">Loading…</div>'
      + '<div style="display:flex;gap:6px;align-items:flex-end">'
      + '<textarea id="chat-input" rows="2" placeholder="Type a message…" style="flex:1"></textarea>'
      + micButton
      + '<button class="btn-sm btn-primary" onclick="sendChat()">Send →</button>'
      + '</div></div>';
  },
  afterMount: function (d, ctx) {
    window._activeChat = d && d.room;
    var title = (ctx && ctx.title) || '';
    var h3 = document.querySelector('#jm-generic-modal h3');
    if (h3 && title) h3.textContent = '💬 ' + title;
    if (typeof window.renderChat === 'function') window.renderChat();
  }
});
