/**
 * ui/screens/Gamification.js — streak / XP / badges (modal surface).
 * Replaces inline openGamificationPanel(); MVC: model = JM.Models.Gamification.
 */
JM.Screens.register({
  id: 'gamification',
  title: '🏆 Your progress',
  surface: 'modal',
  model: JM.Models.Gamification,
  render: function (d) {
    var st = d.streak || {};
    var earned = (d.badges || []).filter(function (x) { return x.earned; });
    var locked = (d.badges || []).filter(function (x) { return !x.earned; });
    var kpiRow = JM.KPIGrid([
      {
        label: 'Streak',
        value: (st.current_streak || 0),
        icon: '🔥',
        sub: 'Longest: ' + (st.longest_streak || 0) + ' days',
        accent: 'var(--jm-accent-orange, var(--jm-accent-orange,#f97316))'
      },
      {
        label: 'XP · Level ' + (d.xp.level || 1),
        value: (d.xp.total || 0).toLocaleString(),
        icon: '⭐',
        sub: 'Next level: ' + (d.xp.nextLevelAt || 100).toLocaleString(),
        accent: 'var(--jm-accent-purple, var(--jm-primary,#7c3aed))'
      }
    ], { min: 120 });
    var tile = function (x, isLocked) {
      var common = 'text-align:center;padding:8px;background:var(--jm-surface-2,var(--jm-surface-2,#f3f4f6));border-radius:10px';
      var border = isLocked ? ';opacity:.4;filter:grayscale(1)' : ';border:1.5px solid var(--jm-accent-amber, var(--jm-warn,#f59e0b))';
      return '<div title="' + (isLocked ? 'Locked: ' : '') + JM.esc(x.description || '') + '" style="' + common + border + '">'
        + '<div style="font-size:26px">' + JM.esc(x.icon || (isLocked ? '🔒' : '🏆')) + '</div>'
        + '<div style="font-size:10px;font-weight:700;margin-top:2px">' + JM.esc(x.title) + '</div>'
        + '</div>';
    };
    var grid =
      '<div style="font-weight:700;margin-bottom:6px">🏅 Badges (' + d.earnedCount + '/' + d.totalCount + ')</div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px">'
      + earned.map(function (x) { return tile(x, false); }).join('')
      + locked.slice(0, 12).map(function (x) { return tile(x, true); }).join('')
      + '</div>'
      + (earned.length === 0 ? JM.EmptyState({ icon: '🏅', title: 'No badges yet', msg: 'Submit an assignment or join a class to earn your first badge.' }) : '');
    return JM.ModalShell({ body: kpiRow + grid });
  }
});
