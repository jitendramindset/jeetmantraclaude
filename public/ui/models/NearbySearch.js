/* ui/models/NearbySearch.js — static shell (no data fetch — the runNearbySearch
   helper in dashboard.html does the fetching when the user clicks Search). */
window.JM = window.JM || {}; JM.Models = JM.Models || {};
JM.Models.NearbySearch = {
  fetch: async function () { return {}; }
};
