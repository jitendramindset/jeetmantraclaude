/**
 * ui/screens/Gamification.js — streak / XP / badges (modal surface).
 * Replaces inline openGamificationPanel(); MVC: model = JM.Models.Gamification.
 */
JM.Screens.register({
  id: 'gamification',
  title: '🏆 Your progress',
  model: JM.Models.Gamification,
  render: function (d) {
    var st = d.streak || {};
    var earned = (d.badges || []).filter(function (x) { return x.earned; });
    var locked = (d.badges || []).filter(function (x) { return !x.earned; });
    var kpiRow =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">'
      + '<div style="background:linear-gradient(135deg,#f97316,#ef4444);color:#fff;border-radius:12px;padding:14px">'
      +   '<div style="font-size:11px;opacity:.85;text-transform:uppercase">Streak</div>'
      +   '<div style="font-size:26px;font-weight:800;line-height:1">🔥 ' + (st.current_streak || 0) + '</div>'
      +   '<div style="font-size:11px;opacity:.85;margin-top:2px">Longest: ' + (st.longest_streak || 0) + ' days</div>'
      + '</div>'
      + '<div style="background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;border-radius:12px;padding:14px">'
      +   '<div style="font-size:11px;opacity:.85;text-transform:uppercase">XP · Level ' + (d.xp.level || 1) + '</div>'
      +   '<div style="font-size:26px;font-weight:800;line-height:1">⭐ ' + (d.xp.total || 0).toLocaleString() + '</div>'
      +   '<div style="font-size:11px;opacity:.85;margin-top:2px">Next level: ' + (d.xp.nextLevelAt || 100).toLocaleString() + '</div>'
      + '</div>'
      + '</div>';
    var tile = function (x, isLocked) {
      var common = 'text-align:center;padding:8px;background:var(--jm-surface-2,#f3f4f6);border-radius:10px';
      var border = isLocked ? ';opacity:.4;filter:grayscale(1)' : ';border:1.5px solid #f59e0b';
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
      + (earned.length === 0 ? '<div style="text-align:center;color:var(--jm-text-muted);font-size:12px;margin-top:14px">Submit an assignment or join a class to earn your first badge.</div>' : '');
    return JM.ModalShell({ body: kpiRow + grid });
  }
});
