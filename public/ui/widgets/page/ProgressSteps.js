/**
 * ui/widgets/page/ProgressSteps.js — multi-step wizard progress indicator.
 *
 *   JM.ProgressSteps({
 *     steps: [{ id: 1, label: 'AI Setup' }, ...],
 *     active: 1                                     // 1-indexed current step
 *   })
 *     → returns the step indicator HTML.
 *
 *   JM.ProgressSteps.setActive(stepId)              // updates DOM state
 *   JM.ProgressSteps.css()                          // shared CSS string
 *
 * Used by: signup.html (4-step wizard); reusable on onboarding, checkout flows.
 */
window.JM = window.JM || {};
JM.ProgressSteps = function (opts) {
  opts = opts || {};
  var steps = opts.steps || [];
  var active = opts.active || 1;
  return '<div class="jm-progress-steps" data-jm-progress>'
    + steps.map(function (s) {
        var isActive = s.id <= active;
        var isCurrent = s.id === active;
        return '<div class="jm-step ' + (isCurrent ? 'active' : (isActive ? 'completed' : '')) + '" data-step-id="' + s.id + '">'
          + '<div class="jm-step-number">' + (isActive && !isCurrent ? '✓' : s.id) + '</div>'
          + '<div class="jm-step-label">' + s.label + '</div>'
          + '</div>';
      }).join('')
    + '</div>';
};
JM.ProgressSteps.setActive = function (stepId) {
  document.querySelectorAll('.jm-step').forEach(function (el) {
    var id = parseInt(el.dataset.stepId, 10);
    el.classList.remove('active', 'completed');
    if (id === stepId) el.classList.add('active');
    else if (id < stepId) el.classList.add('completed');
    var num = el.querySelector('.jm-step-number');
    if (num) num.textContent = (id < stepId) ? '✓' : id;
  });
};
JM.ProgressSteps.css = function () {
  return ''
    + '.jm-progress-steps{display:flex;justify-content:space-between;margin-bottom:32px;position:relative}'
    + '.jm-progress-steps::before{content:"";position:absolute;top:18px;left:0;right:0;height:2px;background:#e5e7eb;z-index:0}'
    + '.jm-step{display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;z-index:1;flex:1}'
    + '.jm-step-number{width:36px;height:36px;border-radius:50%;background:#fff;border:2px solid #e5e7eb;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#9ca3af;transition:all .2s}'
    + '.jm-step.active .jm-step-number{background:var(--jm-primary,#7c3aed);border-color:var(--jm-primary,#7c3aed);color:#fff;box-shadow:0 0 0 4px rgba(124,58,237,.18)}'
    + '.jm-step.completed .jm-step-number{background:#10b981;border-color:#10b981;color:#fff}'
    + '.jm-step-label{font-size:12px;font-weight:600;color:#6b7280;text-align:center}'
    + '.jm-step.active .jm-step-label{color:var(--jm-primary,#7c3aed)}'
    + '.jm-step.completed .jm-step-label{color:#10b981}';
};
