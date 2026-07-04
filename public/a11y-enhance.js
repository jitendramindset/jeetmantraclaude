/* a11y-enhance.js — makes click-only elements keyboard-accessible app-wide.
 * Any element with an onclick handler but no native keyboard semantics gets
 * role, tabindex and Enter/Space activation. Runs on load and observes the
 * DOM so dynamically-rendered app-shell cards are covered too. */
(function () {
  'use strict';
  var NATIVE = { A: 1, BUTTON: 1, INPUT: 1, SELECT: 1, TEXTAREA: 1, LABEL: 1, SUMMARY: 1 };

  function upgrade(el) {
    if (!el || el.nodeType !== 1) return;
    if (NATIVE[el.tagName]) return;
    if (el.dataset.a11yDone) return;
    // Only elements that are actually clickable
    var hasClick = el.hasAttribute('onclick') || el.getAttribute('role') === 'button' || el.getAttribute('role') === 'link';
    if (!hasClick) return;
    el.dataset.a11yDone = '1';
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        el.click();
      }
    });
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) return;
    var nodes = root.querySelectorAll('[onclick], [role="button"], [role="link"]');
    for (var i = 0; i < nodes.length; i++) upgrade(nodes[i]);
  }

  function init() {
    scan(document);
    try {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType === 1) { upgrade(n); scan(n); }
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    } catch (_) { /* MutationObserver unsupported — initial scan still applied */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
