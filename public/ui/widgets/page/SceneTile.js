/**
 * ui/widgets/page/SceneTile.js — scene/class/layer list tile used in studio.html.
 *
 *   JM.SceneTile({
 *     id: 'tc_abc',                       // optional element id
 *     thumb: '🎥',                        // icon or HTML
 *     name: 'My Scene',
 *     sub: 'live · started 2m ago',       // optional sub-line
 *     active: true,                       // adds .active class
 *     onClick: "switchScene('abc')",      // primary action
 *     actions: [                          // optional inline buttons (right-aligned)
 *       { label: '×', onClick: "delScene('abc')", title: 'Delete' }
 *     ]
 *   })
 *     → returns the tile HTML matching studio.html's existing .scene CSS.
 *
 * Used by: studio.html (class tiles, scene tiles, layer tiles).
 */
window.JM = window.JM || {};
JM.SceneTile = function (o) {
  o = o || {};
  var idAttr = o.id ? ' id="' + o.id + '"' : '';
  var actions = (o.actions || []).map(function (a) {
    var pad = a.compact ? '3px 6px' : '3px 8px';
    var ttl = a.title ? ' title="' + a.title.replace(/"/g, '&quot;') + '"' : '';
    return '<button class="btn" style="padding:' + pad + '"' + ttl + ' onclick="event.stopPropagation();' + (a.onClick || '') + '">' + a.label + '</button>';
  }).join('');
  var sub = o.sub ? '<div style="font-size:10px;color:var(--mut)">' + o.sub + '</div>' : '';
  return '<div class="scene' + (o.active ? ' active' : '') + '"' + idAttr + ' onclick="' + (o.onClick || '') + '">'
    + '<div class="thumb">' + (o.thumb || '🎬') + '</div>'
    + '<div class="nm">' + (o.name || '') + sub + '</div>'
    + actions
    + '</div>';
};
