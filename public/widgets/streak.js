/* widgets/streak.js — student daily learning streak. */
EduOSWidgets.register({
  id: 'streak', title: 'Learning Streak', roles: ['student'],
  category: 'learning', size: 'small', priority: 10,
  aiTriggers: ['streak', 'my streak'],
  dataSource: function () { return EduOSWidgets._lib.api('/gamification/streak'); },
  render: function (d) {
    var L = EduOSWidgets._lib, s = (d && d.streak) || {};
    return '<div class="wg-big">' + L.pct(s.current_streak) + '🔥</div>'
      + '<div class="wg-sub">day streak · longest ' + L.pct(s.longest_streak) + ' · ' + L.pct(s.total_days) + ' active days</div>';
  }
});
