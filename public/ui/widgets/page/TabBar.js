/**
 * ui/widgets/page/TabBar.js — standalone page tab bar with content panels.
 *
 *   JM.TabBar({
 *     tabs: [
 *       { id: 'attendees', label: '👥 Attendees', body: '<div id="attendeesList"></div>' },
 *       { id: 'chat',      label: '💬 Chat',      body: '<div id="chatList"></div>' }
 *     ],
 *     active: 'attendees',          // optional initial active tab
 *     panelIdPrefix: 'tab',         // optional id prefix for panels (default: 'tab') → #tabAttendees
 *     classNames: {                 // optional CSS class overrides
 *       tabs: 'tabs', tab: 'tab', body: 'tab-body'
 *     }
 *   })
 *     → returns the tabs + panels HTML. Click handlers built in (no external JS needed).
 *
 *   JM.TabBar.show(id) — programmatic tab switch.
 *
 * Used by: liveRoom.html (Attendees/Chat/Polls); reusable on any page tabbing pattern.
 */
window.JM = window.JM || {};
JM.TabBar = function (opts) {
  opts = opts || {};
  var tabs = opts.tabs || [];
  var active = opts.active || (tabs[0] && tabs[0].id);
  var prefix = opts.panelIdPrefix || 'tab';
  var cls = Object.assign({ tabs: 'tabs', tab: 'tab', body: 'tab-body' }, opts.classNames || {});
  var click = function (id) {
    // Click handler: hides all panels, shows the chosen one, toggles active class.
    return "(function(btn,pid){"
      + "document.querySelectorAll('." + cls.tab + "').forEach(function(t){t.classList.remove('active')});"
      + "btn.classList.add('active');"
      + "document.querySelectorAll('." + cls.body + "[data-tab-panel]').forEach(function(p){p.style.display='none'});"
      + "var t=document.getElementById('" + prefix + "'+pid);if(t)t.style.display='';"
      + "}).call(null,this,'" + id + "')";
  };
  var head = '<div class="' + cls.tabs + '">'
    + tabs.map(function (t) {
        var isActive = t.id === active;
        return '<button class="' + cls.tab + (isActive ? ' active' : '') + '" data-tab-id="' + t.id + '" onclick="' + click(idCap(t.id)) + '">' + t.label + '</button>';
      }).join('')
    + '</div>';
  var panels = tabs.map(function (t) {
    var isActive = t.id === active;
    return '<div class="' + cls.body + '" id="' + prefix + idCap(t.id) + '" data-tab-panel="' + t.id + '" style="display:' + (isActive ? '' : 'none') + '">' + (t.body || '') + '</div>';
  }).join('');
  return head + panels;
};
JM.TabBar.show = function (id, opts) {
  opts = opts || {};
  var cls = Object.assign({ tab: 'tab', body: 'tab-body' }, opts.classNames || {});
  var prefix = opts.panelIdPrefix || 'tab';
  document.querySelectorAll('.' + cls.tab).forEach(function (t) {
    t.classList.toggle('active', t.getAttribute('data-tab-id') === id);
  });
  document.querySelectorAll('.' + cls.body + '[data-tab-panel]').forEach(function (p) { p.style.display = 'none'; });
  var t = document.getElementById(prefix + idCap(id));
  if (t) t.style.display = '';
};
function idCap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }
