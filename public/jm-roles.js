/**
 * jm-roles.js — canonical frontend role groups (single source of truth).
 *
 * Load early: <script src="/jm-roles.js"></script>
 * Consumers read window.JMRoles.X but keep a local fallback array, so a page
 * that forgets to include this script still behaves exactly as before.
 *
 * NOTE: some legacy files use slightly different creator/seller sets (e.g.
 * jm-nav includes 'institute_owner', widget-registry does not). Those are
 * intentionally NOT unified here — reconciling them is a product decision.
 * This file only canonicalises groups that are already identical across files.
 */
(function (g) {
  // Roles allowed to run/teach a class AND to list/sell on the marketplace.
  // Identical set previously duplicated in liveRoom.js, marketplace.js and
  // exam-platform.js. Order-independent membership check is what callers use.
  var CAN_TEACH_OR_SELL = ['teacher', 'school', 'coaching', 'admin', 'partner'];

  g.JMRoles = g.JMRoles || {};
  g.JMRoles.CAN_TEACH_OR_SELL = CAN_TEACH_OR_SELL;
  // Predicate helper — tolerant of user_type|role shape.
  g.JMRoles.canTeachOrSell = function (role) {
    return CAN_TEACH_OR_SELL.indexOf(role) >= 0;
  };
})(window);
