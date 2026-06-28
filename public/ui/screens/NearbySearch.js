/**
 * ui/screens/NearbySearch.js — find courses near you (modal).
 * Replaces the inline shell of openNearbySearch(). The runNearbySearch(),
 * nearUseLocation(), nearToggle(), nearUpdateFooter(), nearEnroll(),
 * nearEnrollSelected() handlers stay in dashboard.html — they read inputs by
 * id (#near-city, #near-q, #near-mode, #near-radius) and paint #near-results.
 *
 * Side effect preserved: _nearSelected is reset by the inline delegator before
 * opening this screen (same as the inline version did).
 */
JM.Screens.register({
  id: 'nearby-search',
  title: '📍 Find Classes Near You',
  model: JM.Models.NearbySearch,
  render: function () {
    var inputSty = 'flex:1;min-width:120px;padding:8px 12px;border:1.5px solid var(--jm-border);border-radius:8px;background:var(--jm-surface);color:inherit';
    var pickSty  = 'padding:7px 10px;border:1.5px solid var(--jm-border);border-radius:8px;background:var(--jm-surface);color:inherit';
    return JM.ModalShell({
      body:
        // Top row: city + free-text
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">'
        + '<input id="near-city" placeholder="City (e.g. Jaipur)" style="' + inputSty + '">'
        + '<input id="near-q" placeholder="Subject / keyword" style="' + inputSty + '">'
        + '</div>'
        // Filter row: mode, radius, geo, Search
        + '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">'
        +   '<select id="near-mode" style="' + pickSty + '">'
        +     '<option value="">Any mode</option>'
        +     '<option value="offline">Offline</option>'
        +     '<option value="hybrid">Hybrid</option>'
        +     '<option value="online">Online</option>'
        +   '</select>'
        +   '<select id="near-radius" style="' + pickSty + '">'
        +     '<option value="10">≤10 km</option>'
        +     '<option value="25">≤25 km</option>'
        +     '<option value="50" selected>≤50 km</option>'
        +     '<option value="200">≤200 km</option>'
        +   '</select>'
        +   JM.Button({ label: '📍 Use my location', kind: 'ghost', size: 'sm', onClick: 'nearUseLocation()' })
        +   '<span style="margin-left:auto"></span>'
        +   JM.Button({ label: '🔍 Search', kind: 'primary', size: 'sm', onClick: 'runNearbySearch()' })
        + '</div>'
        // Status + results + footer (selection summary) regions
        + '<div id="near-geo-status" style="font-size:11px;color:var(--jm-text-muted);margin-bottom:8px"></div>'
        + '<div id="near-results" style="min-height:120px">'
        +   JM.EmptyState({ icon: '📍', title: 'Search', msg: 'Set a city or use your location, then Search.' })
        + '</div>'
        + '<div id="near-footer"></div>'
    });
  }
});
