/**
 * ui/screens/LessonPlanner.js — AI lesson plan generator (modal).
 * Replaces openLessonPlanner(). Helpers that stay in dashboard.html:
 * _lpAttachText (var), _lpReadAttach(input), _lpGenerate() — updated to
 * call closeAnyModal() instead of document.getElementById('lpInput')?.remove().
 */
JM.Screens.register({
  id: 'lesson-planner',
  title: '🤖 AI Lesson Plan',
  surface: 'modal',
  model: JM.Models.LessonPlanner,
  render: function () {
    return '<div style="font-size:13px;color:var(--jm-text-muted);margin-bottom:12px">'
      + 'Describe the lesson in a line or two — type or dictate. AI fills in objectives, a timed plan, materials, assessment &amp; homework.'
      + '</div>'
      + '<div class="form-row"><label>What\'s the lesson about? *</label>'
      + '<div style="display:flex;gap:6px;align-items:flex-start">'
      + '<textarea id="lp-brief" rows="3" placeholder="e.g. Intro to photosynthesis for class 7 — focus on the light reaction, with a quick experiment" style="flex:1"></textarea>'
      + '<button type="button" class="btn-sm btn-outline" title="Dictate" onclick="startVoiceFor(\'lp-brief\')" style="padding:8px 10px">🎤</button>'
      + '</div></div>'
      + '<div class="grid-2">'
      + '<div class="form-row"><label>Level</label><select id="lp-level"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></div>'
      + '<div class="form-row"><label>Duration (min)</label><input id="lp-dur" type="number" min="10" value="45"></div>'
      + '</div>'
      + '<div class="form-row"><label>Reference notes (optional)</label>'
      + '<input id="lp-file" type="file" accept=".txt,.md,.csv,text/*" onchange="_lpReadAttach(this)">'
      + '<div id="lp-attach-note" style="font-size:11px;color:var(--jm-text-muted);margin-top:4px">Attach a .txt/.md outline to ground the plan in your material.</div>'
      + '</div>'
      + '<button class="btn-sm btn-primary" style="width:100%;padding:11px;margin-top:6px" onclick="_lpGenerate()">✨ Generate lesson plan</button>';
  },
  afterMount: function () {
    window._lpAttachText = '';
    setTimeout(function () {
      var el = document.getElementById('lp-brief');
      if (el) el.focus();
    }, 80);
  }
});
