/**
 * ui/_boot.js — initialises the JM namespace + loads every atom, molecule and
 * screen file in dependency order. This is included from dashboard.html ONCE.
 *
 *   <script src="/ui/_boot.js"></script>
 *
 * Adding a new atom/screen = drop a file into the matching folder + add its
 * basename to the corresponding list below. Engine is untouched.
 */
(function () {
  'use strict';
  // Public namespace. Atoms attach as JM.<Name>, screens register via JM.Screens.
  window.JM = window.JM || {};
  JM.esc = JM.esc || function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
  };
  // Token API (matches premium-ui.css :root). Atoms read tokens via JM.t('sp-4') etc.
  JM.t = function (name) {
    return getComputedStyle(document.documentElement).getPropertyValue('--jm-' + name).trim();
  };
  // Tiny event bus — screens dispatch actions, controllers listen.
  JM.bus = { listeners: {}, on: function (n, fn) { (this.listeners[n] = this.listeners[n] || []).push(fn); }, emit: function (n, p) { (this.listeners[n] || []).forEach(function (f) { try { f(p); } catch (e) {} }); } };

  // Load lists (in dependency order). Atoms first, then molecules, then screens.
  var ATOMS = [
    'Button', 'Card', 'KPI', 'Row', 'Badge', 'EmptyState', 'Avatar',
    'SectionHeader', 'ModalShell', 'Tabs', 'Tag'
  ];
  var MOLECULES = ['KPIGrid', 'ListSection', 'ActionToolbar', 'TakeoverPage'];
  var MODELS = ['Wallet', 'Certificates', 'WidgetAdmin', 'Analytics', 'MyStudents', 'Downloads', 'Recordings', 'AttendanceReport', 'Gamification', 'AiKey', 'MyExternalResults', 'LiveRoster', 'AttendanceLog', 'Wall', 'Timetable', 'TestAnalytics', 'EssayInbox', 'Submissions', 'StudentDetail', 'N8nConfig', 'Coupons', 'Plans', 'Profile', 'Settings', 'NearbySearch', 'MyInstitutions', 'Billing', 'Calendar', 'CrmConfig', 'Configure', 'MoneyPage', 'RagTrainer', 'QuestionEditor', 'CourseStudents', 'CourseChat', 'AttGrid', 'QuestionBank', 'BookingDetail', 'Wizard', 'LessonPlanner', 'ProctorEvents', 'EduOS', 'LangPicker'];
  var CONTROLLERS = ['Wallet'];
  var SCREENS = ['Help', 'WidgetAdmin', 'Wallet', 'Certificates', 'Analytics', 'MyStudents', 'Downloads', 'Recordings', 'AttendanceReport', 'Gamification', 'AiKey', 'MyExternalResults', 'LiveRoster', 'AttendanceLog', 'Wall', 'Timetable', 'TestAnalytics', 'EssayInbox', 'Submissions', 'StudentDetail', 'N8nConfig', 'Coupons', 'Plans', 'Profile', 'Settings', 'NearbySearch', 'MyInstitutions', 'Billing', 'Calendar', 'CrmConfig', 'Configure', 'MoneyPage', 'RagTrainer', 'QuestionEditor', 'CourseStudents', 'CourseChat', 'AttGrid', 'QuestionBank', 'BookingDetail', 'Wizard', 'LessonPlanner', 'ProctorEvents', 'EduOS', 'LangPicker'];

  function inject(folder, names) {
    names.forEach(function (n) {
      var src = '/ui/' + folder + '/' + n + '.js?v=38';
      var s = document.createElement('script');
      s.src = src;
      s.async = false; // preserve order
      s.onerror = function () {
        console.warn('[JM Boot] Failed to load:', src, '— continuing');
      };
      document.head.appendChild(s);
    });
  }
  // Registry must exist before screens self-register.
  var reg = document.createElement('script');
  reg.src = '/ui/registry/screens.js?v=38';
  reg.async = false;
  reg.onerror = function () {
    console.warn('[JM Boot] Failed to load: /ui/registry/screens.js — continuing');
  };
  document.head.appendChild(reg);

  inject('widgets/atoms', ATOMS);
  inject('widgets/molecules', MOLECULES);
  inject('models', MODELS);
  inject('controllers', CONTROLLERS);
  inject('screens', SCREENS);
})();
