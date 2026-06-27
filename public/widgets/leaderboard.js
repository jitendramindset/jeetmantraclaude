/* widgets/leaderboard.js — student XP / level / rank. */
EduOSWidgets.register({
  id: 'leaderboard', title: 'Leaderboard', roles: ['student'],
  category: 'learning', size: 'small', priority: 35,
  aiTriggers: ['leaderboard', 'rank', 'my rank'],
  dataSource: function () { return EduOSWidgets._lib.api('/gamification/summary'); },
  render: function (d) {
    var L = EduOSWidgets._lib, s = (d && (d.summary || d)) || {};
    var xp = s.xp != null ? s.xp : (s.total_xp || 0);
    var lvl = s.level != null ? s.level : 1;
    return '<div class="wg-big">Lv ' + L.pct(lvl) + '</div>'
      + '<div class="wg-sub">' + L.pct(xp) + ' XP' + (s.rank ? ' · rank #' + L.pct(s.rank) : '') + '</div>';
  }
});
