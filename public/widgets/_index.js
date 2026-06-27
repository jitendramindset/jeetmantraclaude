/**
 * widgets/_index.js — load every extracted widget manifest.
 *
 * Each widget file calls EduOSWidgets.register({...}) on load. This loader is
 * included AFTER /widget-registry.js but BEFORE the dashboard boots widgets,
 * so by the time boot() runs, every manifest is in the registry.
 *
 * To add a new widget: drop a /widgets/<id>.js that calls .register(), then
 * add its filename to FILES below.
 */
(function () {
  if (!window.EduOSWidgets || typeof window.EduOSWidgets.register !== 'function') {
    console.warn('EduOSWidgets.register not found — widget files cannot self-register.');
    return;
  }
  var FILES = [
    'quick-actions','streak','continue-learning','assignments-due',
    'upcoming-classes','pending-eval','revenue','my-courses','my-listings',
    'recommended','notifications','leaderboard','certificates','messages',
    'attendance-pending','weak-students','timetable','admissions','fees',
    'bookings','children','network','ai-tutor'
  ];
  FILES.forEach(function (id) {
    var s = document.createElement('script');
    s.src = '/widgets/' + id + '.js?v=1';
    s.async = false; // preserve registration order
    document.head.appendChild(s);
  });
})();
