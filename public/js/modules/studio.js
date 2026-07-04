(function(g) {
var _CSS = ['\n:root{--bg:#0b0d14;--panel:#15171f;--panel2:#1d202b;--bd:#2a2e3c;--txt:#e8eaf0;--mut:#9098ac;--pri:var(--jm-primary,#7c3aed)}\n*{box-sizing:border-box}\nbody{margin:0;background:var(--bg);color:var(--txt);font-family:-apple-system,\'Segoe UI\',sans-serif;height:100vh;display:flex;flex-direction:column;overflow:hidden}\n.topbar{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--panel);border-bottom:1px solid var(--bd);flex-wrap:wrap}\n.topbar .logo{font-weight:800;font-size:16px}.topbar ',
'.logo .a{color:var(--pri)}\n.btn{padding:8px 14px;border-radius:8px;border:1px solid var(--bd);background:var(--panel2);color:var(--txt);font-weight:600;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:6px}\n.btn:hover{border-color:var(--pri)}.btn:active{transform:scale(.97)}.btn.pri{background:var(--pri);border-color:var(--pri)}.btn.danger{background:var(--jm-danger,var(--jm-danger,#ef4444));border-color:var(--jm-danger,var(--jm-danger,#ef4444))}\n.btn.on{background:var(--pri);border-color:var(--pri)}\n.main{flex:1;display:grid;grid-temp',
'late-columns:250px 1fr 290px;overflow:hidden}\n.col{overflow-y:auto;padding:14px}.col.left{border-right:1px solid var(--bd);background:var(--panel)}.col.right{border-left:1px solid var(--bd);background:var(--panel)}\n.stage{display:flex;flex-direction:column;align-items:center;justify-content:center;background:#000;position:relative;padding:14px}\nh4{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:14px 0 8px}\nselect,input[type=text]{width:100%;padding:8px;bo',
'rder-radius:6px;border:1px solid var(--bd);background:var(--panel2);color:var(--txt);font-family:inherit;font-size:13px;margin-bottom:8px}\n.scene{display:flex;align-items:center;gap:8px;padding:10px;border:1px solid var(--bd);border-radius:8px;margin-bottom:8px;cursor:pointer;background:var(--panel2)}\n.scene.active{border-color:var(--pri);background:rgba(124,58,237,.12)}.scene .nm{flex:1;font-weight:600;font-size:13px}\n.scene .thumb{width:40px;height:30px;border-radius:4px;background:#000;dis',
'play:flex;align-items:center;justify-content:center;font-size:16px}\n#outWrap{position:relative;display:inline-block;max-width:100%}\n/* Board fills the (now full-width) stage — was capped at 64vh which left big\n   black margins once the side rails moved into the drawer. */\n#out{max-width:100%;max-height:82vh;width:auto;border-radius:8px;background:#000;display:block}\n.corner{position:absolute;width:22px;height:22px;border-radius:50%;background:var(--pri);border:3px solid #fff;transform:trans',
'late(-50%,-50%);cursor:grab;touch-action:none;z-index:6;box-shadow:0 2px 6px rgba(0,0,0,.6)}\n.corner:active{cursor:grabbing;transform:translate(-50%,-50%) scale(1.2)}\n#cornerSvg{position:absolute;inset:0;pointer-events:none;z-index:5}\n.hint{font-size:11px;color:var(--mut);margin:6px 0;line-height:1.5}\n.rec-dot{width:10px;height:10px;border-radius:50%;background:var(--jm-danger,#ef4444);animation:pulse 1.2s infinite;display:inline-block}\n@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}\n.row{display:flex;',
'gap:8px;align-items:center;margin-bottom:8px}.row label{font-size:12px;color:var(--mut)}\n.badge{font-size:10px;background:var(--panel2);padding:2px 8px;border-radius:10px;color:var(--mut)}\n.banner{padding:8px 10px;border-radius:8px;font-size:12px;margin-bottom:8px}.banner.warn{background:var(--jm-danger-dark,#7c2d12);color:var(--jm-danger-light,#fed7aa)}.banner.ok{background:#14532d;color:#bbf7d0}\n/* Tablet: 2-col — controls beside stage, settings panel spans full width below. */\n@media(max-width:1100px){.main{grid-template-columns:240',
'px 1fr;grid-template-rows:1fr auto}.col.left{grid-row:1}.stage{grid-row:1}.col.right{grid-column:1/-1;grid-row:2;border-left:0;border-top:1px solid var(--bd);max-height:38vh}}\n/* Phone: single column, stage gets priority via 16:9 lock; panels flow naturally. */\n@media(max-width:760px){.main{grid-template-columns:1fr;grid-template-rows:none;grid-auto-flow:row;overflow-y:auto}.col.left,.col.right,.stage{grid-row:auto;grid-column:auto;max-height:none}.col{max-height:none}.stage{order:-1;min-heigh',
't:50vh;padding:10px}#out{max-height:70vh}.corner{width:40px;height:40px;border-width:4px}}\n@media(max-width:480px){.topbar{padding:8px 10px;gap:6px}.btn{padding:9px 12px;font-size:12px;min-height:40px}#fmtSelect{width:100%;order:10}.col{padding:10px}.hint{display:none}}\n/* ── Focus / clean teaching board ──────────────────────────────────────────\n   Hide the topbar + both control columns so the board fills the screen; a\n   floating TOP bar (exit) and BOTTOM action bar keep teaching controls ',
'one tap\n   away. Works on phone, desktop and smartboard. Toggled via 🔳 Focus / Esc. */\nbody.focus .topbar,body.focus .col{display:none!important}\nbody.focus .main{grid-template-columns:1fr;grid-template-rows:1fr;grid-auto-flow:row;overflow:hidden}\nbody.focus .stage{order:0;grid-row:auto;grid-column:auto;min-height:100vh;height:100vh;max-height:100vh;padding:4px}\nbody.focus #out{max-height:86vh;max-width:100vw}\n/* ⚙ Tools slides the source panel in as a drawer without leaving focus mode */',
'\nbody.focus.panels .col.left{display:block!important;position:fixed;left:0;top:0;bottom:0;width:min(290px,86vw);max-height:100vh;z-index:430;box-shadow:6px 0 34px rgba(0,0,0,.55)}\n#focusTop{display:none;position:fixed;top:10px;left:10px;z-index:420;gap:8px;align-items:center}\n#focusBar{display:none;position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:420;gap:8px;align-items:center;background:rgba(18,18,26,.92);border:1px solid var(--bd);border-radius:16px;padding:8px 12px;bo',
'x-shadow:0 10px 34px rgba(0,0,0,.55);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);max-width:96vw;flex-wrap:wrap;justify-content:center}\nbody.focus #focusTop,body.focus #focusBar{display:flex}\n#focusBar .btn,#focusTop .btn{min-height:44px}\n/* ── Collapsible control columns on mobile ─────────────────────────────────\n   The board is what matters; the source + setup panels are a lot of buttons on\n   a phone. Each column gets a sticky header that hides/shows its body, and on\n ',
'  mobile both start collapsed so Studio opens to a clean board — tap a header\n   to reveal only what you need. Hidden entirely on desktop (space is ample). */\n/* Collapsible at every width now. The toggle header is always shown; a collapsed\n   column hides its body. On desktop a collapsed column shrinks to a thin strip\n   (just the toggle) and the stage reclaims the width via a JS grid recompute. */\n.col-toggle{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%',
';\n  background:var(--panel2);border:1px solid var(--bd);color:var(--txt);font-weight:700;font-size:13px;\n  padding:10px 12px;border-radius:8px;margin:0 0 10px;cursor:pointer;min-height:40px}\n.col-toggle .col-arrow{font-size:12px;color:var(--mut)}\n.col.collapsed>*:not(.col-toggle){display:none}\n@media(min-width:761px){\n  .col.collapsed{padding:10px 4px;overflow:hidden}\n  .col.collapsed .col-toggle{justify-content:center;padding:10px 2px}\n  .col.collapsed .col-toggle>span:not(.col-arrow){d',
'isplay:none}\n}\n@media(max-width:760px){\n  .col-toggle{position:sticky;top:0;z-index:6;min-height:44px;padding:12px}\n}\n/* Single consolidated controls drawer — replaces the separate left/right rails.\n   Everything lives here, grouped by usage; the stage runs full-width. */\n#studioMenuBtn{font-weight:700}\n#studioDrawer{position:fixed;top:0;left:0;bottom:0;width:min(360px,92vw);background:var(--panel);border-right:1px solid var(--bd);\n  z-index:500;transform:translateX(-100%);transition:tr',
'ansform .22s ease;display:flex;flex-direction:column;box-shadow:8px 0 40px rgba(0,0,0,.55)}\n#studioDrawer.open{transform:none}\n#studioDrawerBackdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:499;display:none}\n#studioDrawerBackdrop.open{display:block}\n#studioDrawerHead{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--bd);font-size:15px;flex:0 0 auto}\n#studioDrawerBody{flex:1;overflow-y:auto;padding:12px 14px}\n.sd-g',
'roup{margin-bottom:14px}\n.sd-gtitle{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);font-weight:700;margin:6px 2px 8px;position:sticky;top:0;background:var(--panel);padding:4px 0}\n.sd-gbody{display:flex;flex-direction:column;gap:8px}\n.sd-gbody>.btn{width:100%;justify-content:flex-start}\n.sd-gbody select{width:100%}\nbody.focus #studioDrawer,body.focus #studioDrawerBackdrop,body.focus #studioMenuBtn{display:none!important}\n/* Smartboard / 4K: scale up controls a',
'nd type so they stay legible from a distance. */\n@media(min-width:2200px){.main{grid-template-columns:340px 1fr 400px}.btn{font-size:16px;padding:12px 20px}h4{font-size:14px}select,input[type=text]{font-size:15px;padding:11px}.scene .nm{font-size:15px}}\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}\n.arc-h{position:absolute;width:14px;height:14px;background:var(--jm-primary,#7c3aed);border',
':2px solid #fff;border-radius:3px;transform:translate(-50%,-50%);touch-action:none}\n.wb-tool,.wb-bg-btn{padding:4px 8px;font-size:14px;min-width:32px}\n.wb-tool.on,.wb-bg-btn.on{background:var(--jm-primary,#7c3aed);color:#fff;border-color:var(--jm-primary,#7c3aed)}\n\n/* ── S-Board icon toolbar (dropdown groups) ── */\n#wbToolbar{display:none;flex-direction:column;margin-top:8px;background:var(--panel);border-radius:12px;border:1px solid var(--bd);overflow:visible}\n/* top row of group icon buttons */\n.wbg-bar{display:flex;align',
'-items:stretch;gap:0;border-bottom:1px solid var(--bd);flex-wrap:wrap;overflow:visible}\n/* each group button */\n.wbg-btn{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:7px 10px;border:none;border-right:1px solid var(--bd);background:var(--panel);color:var(--mut);cursor:pointer;font-size:11px;font-weight:700;min-width:52px;transition:color .12s,background .12s;position:relative;user-select:none}\n.wbg-btn .wbg-icon{font-size:17px;line-',
'height:1}\n.wbg-btn:hover{background:var(--panel2);color:var(--txt)}\n.wbg-btn.open,.wbg-btn.active-group{background:var(--pri);color:#fff;border-color:var(--pri)}\n/* group dropdown panel */\n.wbg-drop{display:none;position:fixed;z-index:1600;min-width:200px;background:var(--panel2);border:1.5px solid var(--bd);border-radius:10px;padding:10px;box-shadow:0 8px 32px rgba(0,0,0,.65);flex-direction:column;gap:8px}\n.wbg-drop.open{display:flex}\n/* tool buttons inside dropdown */\n.wbd-row{display:flex;gap:',
'5px;flex-wrap:wrap;align-items:center}\n.wbd-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin-bottom:3px}\n/* pages row */\n.wb-pages-row{display:flex;align-items:center;gap:5px;padding:5px 10px;border-top:1px solid var(--bd);flex-wrap:wrap}\n/* flat tool rows */\n.wb-row{display:flex;align-items:center;gap:3px;padding:5px 8px;background:var(--panel);border-radius:8px;flex-wrap:wrap;border-bottom:1px solid var(--bd)}\n.wb-sep{width:1px;he',
'ight:22px;background:var(--bd);flex-shrink:0;margin:0 2px}\n/* active tool indicator dot */\n.wbg-btn .wbg-active-dot{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:5px;height:5px;border-radius:50%;background:var(--pri);display:none}\n.wbg-btn.has-active .wbg-active-dot{display:block}\n/* RTE editor placeholder */\n#wbRteEditor:empty:before{content:attr(data-placeholder);color:var(--jm-placeholder,#4a4f66);font-style:italic;pointer-events:none}\n\n/* ── Welcome Guide overlay ── */\n#studioGuid',
'e{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:20px}\n#studioGuide .guide-card{background:var(--panel);border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:32px;max-width:680px;width:100%;text-align:center}\n#studioGuide h2{font-size:24px;margin:0 0 6px}\n#studioGuide p.sub{color:var(--mut);font-size:14px;margin:0 0 24px}\n.guide-choices{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-',
'bottom:20px}\n.guide-choice{flex:1;min-width:160px;max-width:200px;background:var(--panel2);border:1px solid var(--bd);border-radius:12px;padding:22px 16px;cursor:pointer;transition:border-color .15s}\n.guide-choice:hover{border-color:var(--pri)}\n.guide-choice .gc-icon{font-size:32px;margin-bottom:10px}\n.guide-choice .gc-title{font-size:14px;font-weight:700;margin-bottom:4px}\n.guide-choice .gc-desc{font-size:11px;color:var(--mut)}\n#guideSkip{font-size:12px;color:var(--mut);background:none;bo',
'rder:none;cursor:pointer;text-decoration:underline}\n#guideSkip:hover{color:var(--txt)}\n\n/* ── Template panel dropdown ── */\n#templatePanel{position:absolute;top:100%;left:0;margin-top:4px;z-index:100;background:var(--panel);border:1px solid var(--bd);border-radius:10px;padding:14px;width:300px;display:none}\n#templatePanel.open{display:block}\n.tpl-row{display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--bd);border-radius:8px;margin-bottom:6px;cursor:pointer;background:',
'var(--panel2)}\n.tpl-row:hover{border-color:var(--pri)}\n.tpl-row .tpl-nm{flex:1;font-size:13px;font-weight:600}\n.tpl-btn-wrap{position:relative;display:inline-flex}\n\n/* ── Crop rect overlay ── */\n#cropOverlay{position:absolute;border:2px dashed var(--pri);box-sizing:border-box;z-index:6;pointer-events:none;display:none}\n\n/* ── Toast ── */\n#studioToast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid var(--bd);color:var(--txt);padding',
':10px 20px;border-radius:8px;font-size:13px;z-index:300;opacity:0;transition:opacity .25s;pointer-events:none}\n#studioToast.show{opacity:1}\n'].join('');

var _HTML = ['<h1 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">JeetMantra Studio — Smart Camera &amp; Recording</h1>\n\n<!-- ── Welcome guide overlay ── -->\n<div id="studioGuide" style="display:none">\n  <div class="guide-card">\n    <h2>🎥 JeetMantra Studio</h2>\n    <p class="sub">Smart camera &amp; recording — pick how to start</p>\n    <div class="guide-choices">\n      <div class="guide-choice" onclick="enableDevices().then(()=>dismissGuide())">\n        <div class="gc-ico',
'n">📸</div>\n        <div class="gc-title">Start Camera</div>\n        <div class="gc-desc">Enable your webcam and microphone</div>\n      </div>\n      <div class="guide-choice" onclick="addScreen();dismissGuide()">\n        <div class="gc-icon">🖥</div>\n        <div class="gc-title">Share Screen</div>\n        <div class="gc-desc">Capture your screen or a window</div>\n      </div>\n      <div class="guide-choice" onclick="_showGuideTemplate()">\n        <div class="gc-icon">📋</div>\n       ',
' <div class="gc-title">Load Template</div>\n        <div class="gc-desc">Restore a saved scene layout</div>\n      </div>\n    </div>\n    <div id="guideTemplateArea" style="display:none;text-align:left;margin-bottom:16px;max-height:180px;overflow-y:auto"></div>\n    <button id="guideSkip" onclick="dismissGuide()">Skip — I\'ll set up manually</button>\n  </div>\n</div>\n\n<!-- ── Toast notification ── -->\n<div id="studioToast"></div>\n\n<div class="topbar">\n  <div class="logo" data-embed-hide>',
'Jeet<span class="a">Mantra</span> Studio</div>\n  <span class="badge" data-embed-hide>🎥 Smart Camera</span>\n  <!-- User profile chip — filled on load from jm_user -->\n  <span id="studioUserChip" style="display:none;background:rgba(124,58,237,.15);color:var(--pri);border-radius:8px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer" onclick="location.href=\'/app\'" title="Back to dashboard"></span>\n  <button class="btn" id="btnAdjust" onclick="toggleAdjust()" title="Drag corners o',
'n the big preview to fix perspective">✂️ Crop</button>\n  <button class="btn" id="btnLayout" onclick="toggleLayout()" title="Arrange multiple elements on the preview (drag to move, corner to resize)">🧩 Arrange layout</button>\n  <button class="btn" id="btnTeach" onclick="openTeach()" title="Connect this Studio to a course\'s live class and go live">📡 Teach a course</button>\n  <span id="boundClassBadge" class="badge" style="display:none;background:var(--jm-danger-dark,#7f1d1d);color:var(--jm-danger-light,#fecaca)"></span>\n  <select id="',
'fmtSelect" onchange="setFormat(this.value)" title="Output format — sets aspect ratio for recording" style="width:auto;margin:0;padding:7px 10px;border-color:var(--jm-primary,#7c3aed)">\n    <option value="1280x720">16:9 · 720p  (YouTube/Zoom)</option>\n    <option value="1920x1080">16:9 · 1080p (YouTube/Teams)</option>\n    <option value="1080x1920">9:16 · Portrait (Reels/Shorts)</option>\n    <option value="1080x1080">1:1 · Square  (Instagram)</option>\n    <option value="960x720">4:3 · Classic  (Projector)</opt',
'ion>\n  </select>\n  <span id="fmtBadge" class="badge" style="background:rgba(124,58,237,.25);color:#c4b5fd;font-weight:700">16:9 · 720p</span>\n  <button id="btnRecrop" onclick="openArCropSelector(document.getElementById(\'fmtSelect\').value)" title="Adjust crop region for current format" style="display:none;border:1px solid var(--jm-primary,#7c3aed);border-radius:7px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;background:rgba(124,58,237,.15);color:#c4b5fd">✂ Recrop</button>\n  <div style="fle',
'x:1"></div>\n  <span id="recStatus" style="display:none;font-size:13px"><span class="rec-dot"></span> REC <span id="recTime">00:00</span></span>\n  <select id="saveTarget" title="Where to save the recording" style="width:auto;margin:0;padding:7px 10px">\n    <option value="local">💾 Save to device</option>\n    <option value="class">☁️ Save in app (class)</option>\n    <option value="both" selected>💾☁️ Both</option>\n  </select>\n  <!-- Templates button with dropdown -->\n  <div class="tpl-btn-',
'wrap" id="tplBtnWrap">\n    <button class="btn" id="btnTemplates" onclick="toggleTemplatePanel()" title="Save or load scene templates">💾 Templates</button>\n    <div id="templatePanel">\n      <h4 style="margin-top:0">💾 Save current layout</h4>\n      <div style="display:flex;gap:6px;margin-bottom:10px">\n        <input type="text" id="tplNameInput" placeholder="Template name…" style="margin:0;flex:1">\n        <button class="btn pri" style="padding:7px 12px" onclick="saveTemplate()">Save</but',
'ton>\n      </div>\n      <h4>📂 Saved templates</h4>\n      <div id="tplList"><div class="hint">No templates yet.</div></div>\n    </div>\n  </div>\n  <button class="btn" onclick="openGuide()" title="Show welcome guide">❓ Guide</button>\n  <button class="btn pri" id="btnEnable" onclick="enableDevices()">🔓 Enable camera &amp; mic</button>\n  <button class="btn" id="btnRec" onclick="toggleRecord()">⏺ Record</button>\n  <button class="btn" id="btnFocus" onclick="toggleFocus()" title="Clean full-s',
'creen teaching board — hides panels (Esc to exit)">🔳 Focus</button>\n  <button class="btn" id="studioExitBtn" onclick="(typeof window._exitModule==='function'?window._exitModule():(location.hash=''))"">← Exit</button>\n</div>\n<!-- Focus-mode floating bars: only visible in clean teaching mode (body.focus). -->\n<div id="focusTop">\n  <button class="btn" onclick="toggleFocus()" title="Exit clean board">✕ Exit focus</button>\n  <span id="focusFmtBadge" class="badge" style="background:rgba(124,58,237,.25);color:#c4b5fd;font-weight:700"></span>\n</div>\n<d',
'iv id="focusBar" role="toolbar" aria-label="Teaching actions">\n  <button class="btn" onclick="studioFocusPanels()" title="Show sources & tools">⚙ Tools</button>\n  <button class="btn" onclick="addWhiteboard()" title="Add / focus whiteboard">🖍 Board</button>\n  <button class="btn" onclick="enableDevices()" title="Enable camera & mic">🎥 Cam</button>\n  <button class="btn pri" onclick="toggleRecord()" title="Start / stop recording">⏺ Rec</button>\n  <button class="btn" onclick="toggleFocus()" ti',
'tle="Exit clean board">⤢ Exit</button>\n</div>\n<!-- Hidden holder: keeping source <video>s in the DOM stops browsers from\n     throttling/freezing them when used as canvas paint sources. -->\n<div id="srcHolder" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden;opacity:0;pointer-events:none"></div>\n<div class="main">\n  <!-- SOURCES -->\n  <div class="col left">\n    <button class="col-toggle" type="button" onclick="studioToggleCol(this)" aria-label="Toggle sources ',
'panel"><span>📥 Sources &amp; scenes</span><span class="col-arrow">▾</span></button>\n    <div id="permBanner" class="banner warn">Click <b>Enable camera &amp; mic</b> to detect devices.</div>\n    <h4>📥 Camera</h4>\n    <select id="camSelect" onchange="startCamera(this.value)"><option value="">— enable first —</option></select>\n    <h4>🎙 Microphone</h4>\n    <select id="micSelect"><option value="">Default mic</option></select>\n    <button class="btn" style="width:100%" onclick="refreshDevic',
'es()">🔄 Refresh devices</button>\n    <h4>➕ Add source</h4>\n    <button class="btn" style="width:100%;margin-bottom:6px" onclick="addScreen()">🖥 Screen / window</button>\n    <button class="btn" style="width:100%;margin-bottom:6px" onclick="addWhiteboard()">🖍 Whiteboard (s-board)</button>\n    <button class="btn" style="width:100%;margin-bottom:6px" onclick="document.getElementById(\'docFile\').click()">📄 Image / document</button>\n    <input type="file" id="docFile" accept="image/*" style=',
'"display:none" onchange="addImage(this)">\n    <button class="btn" style="width:100%" onclick="openCoursePicker()">📚 Course content</button>\n    <div class="hint">USB/built-in cams, phone-as-webcam, screen, whiteboard, documents &amp; course content can all be scenes. DSLR/IP/HDMI need the desktop app.</div>\n    <h4>🎭 Virtual Background</h4>\n    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:8px" id="vbgSwatches">\n      <button class="btn" title="None (b',
'lack)" onclick="clearVbg()" style="font-size:18px;padding:6px;aspect-ratio:1">🚫</button>\n      <button class="btn" title="Classroom" onclick="setVbgColor(\'#1e3a5f\')" style="background:#1e3a5f;border-color:#1e3a5f;aspect-ratio:1;padding:0"></button>\n      <button class="btn" title="Office" onclick="setVbgColor(\'#2d2d2d\')" style="background:#2d2d2d;border-color:#2d2d2d;aspect-ratio:1;padding:0"></button>\n      <button class="btn" title="Nature" onclick="setVbgColor(\'#1a4731\')" style="bac',
'kground:#1a4731;border-color:#1a4731;aspect-ratio:1;padding:0"></button>\n      <button class="btn" title="Sunset" onclick="setVbgColor(\'#7c2d12\')" style="background:#7c2d12;border-color:#7c2d12;aspect-ratio:1;padding:0"></button>\n      <button class="btn" title="Sky" onclick="setVbgColor(\'#0369a1\')" style="background:#0369a1;border-color:#0369a1;aspect-ratio:1;padding:0"></button>\n      <button class="btn" title="Purple" onclick="setVbgColor(\'#4c1d95\')" style="background:#4c1d95;border-',
'color:#4c1d95;aspect-ratio:1;padding:0"></button>\n      <button class="btn" title="Custom color" onclick="document.getElementById(\'vbgColorPick\').click()" style="font-size:18px;padding:6px;aspect-ratio:1">🎨</button>\n    </div>\n    <input type="color" id="vbgColorPick" style="display:none" onchange="setVbgColor(this.value)">\n    <button class="btn" style="width:100%;margin-bottom:4px" onclick="document.getElementById(\'vbgFilePick\').click()">🖼 Upload background image</button>\n    <input',
' type="file" id="vbgFilePick" accept="image/*" style="display:none" onchange="loadVbgImage(this)">\n    <!-- VBG frame size slider -->\n    <div class="row" style="margin-top:4px">\n      <label style="flex:1">Camera frame size</label>\n      <input type="range" id="vbgFrameSlider" min="0.4" max="1.0" step="0.05" value="0.85" oninput="_vbgFrame=+this.value" style="flex:2">\n    </div>\n    <!-- VBG background image position -->\n    <div id="vbgPositionBtns" style="display:none;margin-bottom:6px',
'">\n      <div style="font-size:11px;color:var(--mut);margin-bottom:4px">Background position:</div>\n      <div style="display:flex;gap:6px">\n        <button class="btn" style="flex:1;font-size:11px;padding:5px" onclick="_vbgFit=\'fill\'">Fill</button>\n        <button class="btn" style="flex:1;font-size:11px;padding:5px" onclick="_vbgFit=\'contain\'">Fit</button>\n        <button class="btn" style="flex:1;font-size:11px;padding:5px" onclick="_vbgFit=\'center\'">Center</button>\n      </div>\n ',
'   </div>\n    <div class="hint" id="vbgHint">Background fills behind your camera. Tip: use a solid colour for best contrast.</div>\n    <h4>🎬 Scenes (switch live)</h4>\n    <div id="sceneList"></div>\n    <button class="btn pri" style="width:100%" onclick="addScene()">+ New scene/preset</button>\n    <h4>🧩 Layout (compose elements)</h4>\n    <div class="hint" id="layoutHint">Add elements (camera, screen, whiteboard, image…) to the current scene, then click <b>🧩 Arrange layout</b> to drag &am',
'p; resize each on the preview. With one element, the scene uses perspective mode.</div>\n    <div id="layerList"></div>\n    <div class="row" style="margin-top:6px"><button class="btn" style="flex:1" onclick="applyLayoutPreset(\'pip\')" title="Camera as a small picture-in-picture over the last element">🎥 PiP preset</button><button class="btn" style="flex:1" onclick="applyLayoutPreset(\'split\')" title="Side-by-side split">⬌ Split preset</button></div>\n  </div>\n  <!-- STAGE -->\n  <div class="',
'stage">\n    <div id="outWrap">\n      <canvas id="out" width="1280" height="720"></canvas>\n      <svg id="cornerSvg" viewBox="0 0 1280 720" preserveAspectRatio="none"></svg>\n      <div id="cropOverlay"></div>\n      <div id="wbSelBox" style="display:none;position:absolute;border:2px dashed var(--jm-primary,#7c3aed);box-sizing:border-box;background:rgba(124,58,237,.06);cursor:move">\n        <div class="wb-rsz" data-dir="nw" style="position:absolute;left:-5px;top:-5px;width:10px;height:10px;background:var(--jm-primary,#7c3aed);b',
'order-radius:2px;cursor:nw-resize"></div>\n        <div class="wb-rsz" data-dir="ne" style="position:absolute;right:-5px;top:-5px;width:10px;height:10px;background:var(--jm-primary,#7c3aed);border-radius:2px;cursor:ne-resize"></div>\n        <div class="wb-rsz" data-dir="sw" style="position:absolute;left:-5px;bottom:-5px;width:10px;height:10px;background:var(--jm-primary,#7c3aed);border-radius:2px;cursor:sw-resize"></div>\n        <div class="wb-rsz" data-dir="se" style="position:absolute;right:-5px;bottom:-5px;width:10px;height:1',
'0px;background:var(--jm-primary,#7c3aed);border-radius:2px;cursor:se-resize"></div>\n      </div>\n    </div>\n    <!-- ══ S-Board Toolbar: 3 flat rows ══ -->\n    <div id="wbToolbar" style="flex-direction:column;margin-top:8px;gap:2px">\n\n      <!-- ROW 1: Draw · Text · Shapes · Ink color · Size · Undo -->\n      <div class="wb-row" id="wbRow1">\n        <button class="btn wb-tool on" data-tool="pen"    onclick="wbSetTool(\'pen\')"    title="Pen (P)"     style="padding:3px 9px;font-size:12px">✏️ Pen</button>\n ',
'       <button class="btn wb-tool"    data-tool="eraser" onclick="wbSetTool(\'eraser\')" title="Eraser (E)"  style="padding:3px 9px;font-size:12px">🧹 Erase</button>\n        <button class="btn wb-tool"    data-tool="text"   onclick="wbSetTool(\'text\')"   title="Rich text (T)" style="padding:3px 9px;font-size:12px">📝 T</button>\n        <div class="wb-sep"></div>\n        <button class="btn wb-tool" data-tool="line"   onclick="wbSetTool(\'line\')"   title="Line"        style="padding:3px 8px;f',
'ont-size:14px">╱</button>\n        <button class="btn wb-tool" data-tool="rect"   onclick="wbSetTool(\'rect\')"   title="Rectangle"   style="padding:3px 8px;font-size:14px">▭</button>\n        <button class="btn wb-tool" data-tool="circle" onclick="wbSetTool(\'circle\')" title="Circle"      style="padding:3px 8px;font-size:14px">○</button>\n        <button class="btn wb-tool" data-tool="arrow"  onclick="wbSetTool(\'arrow\')"  title="Arrow"       style="padding:3px 8px;font-size:14px">→</button>',
'n        <button id="wbFillToggle" onclick="wbToggleFillMode()" title="Outline / Filled" style="border:1px solid var(--bd);border-radius:5px;padding:2px 7px;font-size:10px;cursor:pointer;background:var(--panel2);color:var(--mut)">Outline</button>\n        <div class="wb-sep"></div>\n        <!-- Dual color swatch -->\n        <div style="position:relative;width:32px;height:32px;flex-shrink:0;cursor:pointer" title="Primary / Secondary ink color">\n          <div id="wbColor2Swatch" onclick="wbActiva',
'teSlot(2)" style="position:absolute;right:0;bottom:0;width:20px;height:20px;border-radius:4px;background:#ffffff;border:1.5px solid var(--bd)"></div>\n          <div id="wbColor1Swatch" onclick="wbActivateSlot(1)" style="position:absolute;left:0;top:0;width:20px;height:20px;border-radius:4px;background:#1a1a25;border:2px solid var(--txt);box-shadow:0 0 0 1.5px var(--jm-primary,#7c3aed)"></div>\n        </div>\n        <button onclick="wbSwapColors()" title="Swap colors" style="border:1px solid var(--bd);border-radius:5px',
';padding:2px 5px;font-size:12px;cursor:pointer;background:var(--panel2);color:var(--txt)">⇄</button>\n        <!-- Quick 8-color palette -->\n        <button onclick="wbSetColorSlot(\'#1a1a25\')" style="width:14px;height:14px;border-radius:3px;background:#1a1a25;border:1.5px solid #555;padding:0;cursor:pointer;flex-shrink:0" title="Black"></button>\n        <button onclick="wbSetColorSlot(\'#ffffff\')" style="width:14px;height:14px;border-radius:3px;background:#fff;border:1.5px solid var(--mut);padding:0',
';cursor:pointer;flex-shrink:0" title="White"></button>\n        <button onclick="wbSetColorSlot(\'#e53e3e\')" style="width:14px;height:14px;border-radius:3px;background:#e53e3e;border:none;padding:0;cursor:pointer;flex-shrink:0" title="Red"></button>\n        <button onclick="wbSetColorSlot(\'#f97316\')" style="width:14px;height:14px;border-radius:3px;background:#f97316;border:none;padding:0;cursor:pointer;flex-shrink:0" title="Orange"></button>\n        <button onclick="wbSetColorSlot(\'#d69e2e',
'\')" style="width:14px;height:14px;border-radius:3px;background:#d69e2e;border:none;padding:0;cursor:pointer;flex-shrink:0" title="Yellow"></button>\n        <button onclick="wbSetColorSlot(\'#38a169\')" style="width:14px;height:14px;border-radius:3px;background:#38a169;border:none;padding:0;cursor:pointer;flex-shrink:0" title="Green"></button>\n        <button onclick="wbSetColorSlot(\'#3182ce\')" style="width:14px;height:14px;border-radius:3px;background:#3182ce;border:none;padding:0;cursor:po',
'inter;flex-shrink:0" title="Blue"></button>\n        <button onclick="wbSetColorSlot(\'#805ad5\')" style="width:14px;height:14px;border-radius:3px;background:#805ad5;border:none;padding:0;cursor:pointer;flex-shrink:0" title="Purple"></button>\n        <!-- Custom ink color picker -->\n        <label title="Custom ink color" style="display:inline-flex;align-items:center;cursor:pointer;position:relative">\n          <span id="wbC1Mini" style="width:16px;height:16px;border-radius:3px;background:#1a',
'1a25;border:1.5px solid #999;display:block"></span>\n          <span id="wbC2Mini" style="width:10px;height:10px;border-radius:2px;background:#fff;border:1px solid var(--bd);display:block;margin-left:-3px;margin-top:5px;flex-shrink:0"></span>\n          <input type="color" id="wbColorPicker" value="#1a1a25" oninput="wbSetColorSlot(this.value)" style="position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;border:none;padding:0;left:0;top:0">\n        </label>\n        <div class="wb-sep"></',
'div>\n        <!-- Size -->\n        <span id="wbSizeVal" style="font-size:11px;font-weight:700;min-width:18px;color:var(--mut);text-align:right">4</span>\n        <input id="wbSizeRange" type="range" min="1" max="60" value="4" oninput="wbSetSize(this.value);document.getElementById(\'wbSizeVal\').textContent=this.value" style="width:65px;accent-color:var(--jm-primary,#7c3aed)">\n        <div class="wb-sep"></div>\n        <button class="btn" onclick="wbUndo()"  title="Undo (Ctrl+Z)"  style="padding:3px 8px;font-size',
':12px">↩</button>\n        <button class="btn" onclick="wbRedo()"  title="Redo (Ctrl+Y)"  style="padding:3px 8px;font-size:12px">↪</button>\n        <button class="btn" onclick="wbClear()" title="Clear page"      style="padding:3px 8px;font-size:12px;color:var(--jm-danger,#ef4444)">🗑</button>\n      </div>\n\n      <!-- ROW 2: Select · Edit · Image · Doc ref · BG patterns -->\n      <div class="wb-row" id="wbRow2">\n        <button class="btn wb-tool" data-tool="select" onclick="wbSetTool(\'select\')" title="Se',
'lect &amp; move (S)" style="padding:3px 9px;font-size:12px">⬚ Select</button>\n        <button class="btn" onclick="wbCopy()"  title="Copy (Ctrl+C)"  style="padding:3px 8px;font-size:12px">⎘ Copy</button>\n        <button class="btn" onclick="wbCut()"   title="Cut (Ctrl+X)"   style="padding:3px 8px;font-size:12px">✂ Cut</button>\n        <button class="btn" onclick="wbPaste()" title="Paste (Ctrl+V)" style="padding:3px 8px;font-size:12px">📋 Paste</button>\n        <div class="wb-sep"></div>\n   ',
'     <button class="btn" onclick="document.getElementById(\'wbImgInput\').click()" title="Insert image onto board" style="padding:3px 8px;font-size:12px">🖼 Image</button>\n        <input type="file" id="wbImgInput" accept="image/*" style="display:none" onchange="wbInsertImageFile(this)">\n        <!-- Doc ref dropdown -->\n        <div style="position:relative">\n          <button class="wbg-btn" id="wbgBtn-doc" onclick="wbToggleGroup(\'doc\')" style="padding:4px 9px;font-size:12px;min-width:0;',
'height:auto;border-radius:6px">📄 Doc ▾</button>\n          <div class="wbg-drop" id="wbgDrop-doc" style="min-width:210px">\n            <div class="wbd-label">Reference panel (floats alongside board)</div>\n            <button class="btn" onclick="document.getElementById(\'wbDocInput\').click();wbCloseGroups()" style="width:100%;margin-bottom:4px;justify-content:flex-start;font-size:12px">📄 PDF / Image</button>\n            <input type="file" id="wbDocInput" accept="image/*,application/pdf" st',
'yle="display:none" onchange="wbOpenDocPanel(this)">\n            <button class="btn" onclick="document.getElementById(\'wbWordInput\').click();wbCloseGroups()" style="width:100%;justify-content:flex-start;font-size:12px">📝 Word / text file</button>\n            <input type="file" id="wbWordInput" accept=".doc,.docx,.txt,.rtf,text/plain" style="display:none" onchange="wbOpenWordPanel(this)">\n            <div style="font-size:10px;color:var(--mut);margin-top:4px">PDF opens in viewer panel · Images ',
'show as reference</div>\n          </div>\n        </div>\n        <div class="wb-sep"></div>\n        <!-- BG patterns dropdown -->\n        <div style="position:relative">\n          <button class="wbg-btn" id="wbgBtn-bg" onclick="wbToggleGroup(\'bg\')" style="padding:4px 9px;font-size:12px;min-width:0;height:auto;border-radius:6px">🎨 BG ▾</button>\n          <div class="wbg-drop" id="wbgDrop-bg" style="min-width:210px">\n            <div class="wbd-label">Board background</div>\n            ',
'<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">\n              <button class="btn wb-bg-btn on" data-bg="white"   onclick="wbSetBg(\'white\');wbCloseGroups()"   style="font-size:11px;padding:4px 6px;justify-content:flex-start">⬜ White</button>\n              <button class="btn wb-bg-btn"    data-bg="grid"    onclick="wbSetBg(\'grid\');wbCloseGroups()"    style="font-size:11px;padding:4px 6px;justify-content:flex-start">⊞ Grid</button>\n              <button class="btn wb-bg-btn"',
'    data-bg="dotgrid" onclick="wbSetBg(\'dotgrid\');wbCloseGroups()" style="font-size:11px;padding:4px 6px;justify-content:flex-start">⁘ Dots</button>\n              <button class="btn wb-bg-btn"    data-bg="graph"   onclick="wbSetBg(\'graph\');wbCloseGroups()"   style="font-size:11px;padding:4px 6px;justify-content:flex-start">📊 Graph</button>\n              <button class="btn wb-bg-btn"    data-bg="lines"   onclick="wbSetBg(\'lines\');wbCloseGroups()"   style="font-size:11px;padding:4px 6px;j',
'ustify-content:flex-start">≡ Lines</button>\n              <button class="btn wb-bg-btn"    data-bg="black"   onclick="wbSetBg(\'black\');wbCloseGroups()"   style="font-size:11px;padding:4px 6px;justify-content:flex-start">⬛ Dark</button>\n            </div>\n            <div class="wbd-label" style="margin-top:6px">Custom BG color</div>\n            <div style="display:flex;align-items:center;gap:6px">\n              <span id="wbBgSwatch" style="width:20px;height:20px;border-radius:4px;backgrou',
'nd:#fffef0;border:1px solid var(--bd);flex-shrink:0"></span>\n              <input type="color" id="wbBgColorPicker" value="#fffef0" oninput="wbSetBgColor(this.value)" style="width:36px;height:26px;border-radius:5px;border:1px solid var(--bd);padding:1px;cursor:pointer">\n            </div>\n          </div>\n        </div>\n        <!-- Full palette dropdown -->\n        <div style="position:relative">\n          <button class="wbg-btn" id="wbgBtn-palette" onclick="wbToggleGroup(\'palette\')" style=',
'"padding:4px 9px;font-size:12px;min-width:0;height:auto;border-radius:6px">🎨 More colors</button>\n          <div class="wbg-drop" id="wbgDrop-palette" style="min-width:220px">\n            <div class="wbd-label">Ink colors · Active: <span id="wbActiveSlotLabel">Primary</span></div>\n            <div style="display:grid;grid-template-columns:repeat(8,22px);gap:4px;margin-bottom:6px">\n              <button onclick="wbSetColorSlot(\'#000000\')" style="width:22px;height:22px;border-radius:4px;bac',
'kground:#000;border:1.5px solid #555;padding:0;cursor:pointer" title="Black"></button>\n              <button onclick="wbSetColorSlot(\'#ffffff\')" style="width:22px;height:22px;border-radius:4px;background:#fff;border:1.5px solid var(--mut);padding:0;cursor:pointer" title="White"></button>\n              <button onclick="wbSetColorSlot(\'#e53e3e\')" style="width:22px;height:22px;border-radius:4px;background:#e53e3e;border:none;padding:0;cursor:pointer" title="Red"></button>\n              <button onc',
'lick="wbSetColorSlot(\'#f97316\')" style="width:22px;height:22px;border-radius:4px;background:#f97316;border:none;padding:0;cursor:pointer" title="Orange"></button>\n              <button onclick="wbSetColorSlot(\'#d69e2e\')" style="width:22px;height:22px;border-radius:4px;background:#d69e2e;border:none;padding:0;cursor:pointer" title="Yellow"></button>\n              <button onclick="wbSetColorSlot(\'#38a169\')" style="width:22px;height:22px;border-radius:4px;background:#38a169;border:none;padd',
'ing:0;cursor:pointer" title="Green"></button>\n              <button onclick="wbSetColorSlot(\'#3182ce\')" style="width:22px;height:22px;border-radius:4px;background:#3182ce;border:none;padding:0;cursor:pointer" title="Blue"></button>\n              <button onclick="wbSetColorSlot(\'#805ad5\')" style="width:22px;height:22px;border-radius:4px;background:#805ad5;border:none;padding:0;cursor:pointer" title="Purple"></button>\n              <button onclick="wbSetColorSlot(\'#b7791f\')" style="width:',
'22px;height:22px;border-radius:4px;background:#b7791f;border:none;padding:0;cursor:pointer" title="Brown"></button>\n              <button onclick="wbSetColorSlot(\'#718096\')" style="width:22px;height:22px;border-radius:4px;background:#718096;border:none;padding:0;cursor:pointer" title="Gray"></button>\n              <button onclick="wbSetColorSlot(\'#fc8181\')" style="width:22px;height:22px;border-radius:4px;background:#fc8181;border:none;padding:0;cursor:pointer" title="Pink"></button>\n     ',
'         <button onclick="wbSetColorSlot(\'#68d391\')" style="width:22px;height:22px;border-radius:4px;background:#68d391;border:none;padding:0;cursor:pointer" title="Mint"></button>\n              <button onclick="wbSetColorSlot(\'#63b3ed\')" style="width:22px;height:22px;border-radius:4px;background:#63b3ed;border:none;padding:0;cursor:pointer" title="Sky"></button>\n              <button onclick="wbSetColorSlot(\'#faf089\')" style="width:22px;height:22px;border-radius:4px;background:#faf089;b',
'order:none;padding:0;cursor:pointer" title="Lt.Yellow"></button>\n              <button onclick="wbSetColorSlot(\'#e9d8fd\')" style="width:22px;height:22px;border-radius:4px;background:#e9d8fd;border:none;padding:0;cursor:pointer" title="Lavender"></button>\n              <button onclick="wbSetColorSlot(\'#feebc8\')" style="width:22px;height:22px;border-radius:4px;background:#feebc8;border:none;padding:0;cursor:pointer" title="Peach"></button>\n            </div>\n            <label style="displ',
'ay:flex;align-items:center;gap:6px;font-size:12px;color:#e8eaf0;cursor:pointer">\n              Custom: <input type="color" value="#1a1a25" oninput="wbSetColorSlot(this.value)" style="width:36px;height:26px;border-radius:5px;border:1px solid var(--bd);padding:1px;cursor:pointer">\n            </label>\n            <button onclick="wbSwapColors();wbCloseGroups()" style="margin-top:6px;border:1px solid var(--bd);border-radius:5px;padding:3px 10px;font-size:11px;cursor:pointer;background:var(--pane',
'l2);color:var(--txt);width:100%">⇄ Swap primary ↔ secondary</button>\n          </div>\n        </div>\n      </div>\n\n      <!-- ROW 3: Pages + PDF + Save to course -->\n      <div class="wb-pages-row">\n        <span style="font-size:10px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.05em">Pages</span>\n        <button class="btn" onclick="wbGoPage(-1)" style="padding:2px 9px">◀</button>\n        <span id="wbPageNum" style="font-size:13px;font-weight:800;min-width:40px;t',
'ext-align:center;color:var(--txt)">1/1</span>\n        <button class="btn" onclick="wbGoPage(1)"  style="padding:2px 9px">▶</button>\n        <button class="btn" onclick="wbAddPage()"  style="padding:2px 9px" title="Add page">＋ Page</button>\n        <button class="btn" onclick="wbDelPage()"  style="padding:2px 9px;color:var(--jm-danger,#ef4444)" title="Delete page">− Page</button>\n        <div style="flex:1"></div>\n        <button class="btn" onclick="toggleTemplatePanel()" style="padding:2px 9px;font-size:12px"',
' title="Save or load scene templates">🗂 Template</button>\n        <button class="btn" onclick="wbExportPdf()" style="padding:2px 9px;font-size:12px" title="Export all pages as PDF">📄 PDF</button>\n        <button class="btn pri" onclick="openWbSaveCourse()" style="padding:2px 9px;font-size:12px">💾 Save to course</button>\n      </div>\n\n    </div><!-- end wbToolbar -->\n\n    <!-- ── Rich Text Editor (Notion-style, draggable) ── -->\n    <div id="wbTextWindow" style="display:none;position:f',
'ixed;z-index:350;background:var(--panel2);border:1.5px solid var(--jm-primary,#7c3aed);border-radius:14px;box-shadow:0 16px 56px rgba(0,0,0,.7);width:480px;max-height:92vh;overflow:hidden;flex-direction:column">\n      <!-- Header / drag handle -->\n      <div id="wbTextWindowHeader" style="display:flex;align-items:center;justify-content:space-between;padding:9px 14px;background:var(--jm-primary,#7c3aed);border-radius:12px 12px 0 0;cursor:move;user-select:none;flex-shrink:0;gap:8px">\n        <span style="color:#fff;font-size:13px;font-',
'weight:700;flex-shrink:0">📝 Topic Rich Text</span>\n        <input id="wbChapterTitle" placeholder="Chapter / Topic title…" style="flex:1;background:rgba(255,255,255,.2);border:none;border-bottom:1.5px solid rgba(255,255,255,.5);color:#fff;font-size:12px;padding:3px 7px;border-radius:5px 5px 0 0;outline:none;font-weight:600;min-width:0">\n        <button id="wbTextWinClose" style="background:rgba(255,255,255,.25);border:none;color:#fff;font-size:15px;cursor:pointer;border-radius:6px;padding:2px',
' 9px;line-height:1;font-weight:700;flex-shrink:0">✕</button>\n      </div>\n      <!-- Formatting toolbar -->\n      <div style="display:flex;align-items:center;gap:2px;padding:5px 8px;background:var(--panel);border-bottom:1px solid var(--bd);flex-wrap:wrap;flex-shrink:0">\n        <!-- Block types -->\n        <button onclick="wbRteBlock(\'h1\')" title="Heading 1" style="border:1px solid var(--bd);border-radius:5px;padding:2px 7px;font-size:11px;font-weight:900;cursor:pointer;background:#15171f;color:#e',
'8eaf0">H1</button>\n        <button onclick="wbRteBlock(\'h2\')" title="Heading 2" style="border:1px solid var(--bd);border-radius:5px;padding:2px 7px;font-size:11px;font-weight:900;cursor:pointer;background:var(--panel);color:var(--txt)">H2</button>\n        <button onclick="wbRteBlock(\'h3\')" title="Heading 3" style="border:1px solid var(--bd);border-radius:5px;padding:2px 7px;font-size:11px;font-weight:700;cursor:pointer;background:var(--panel);color:var(--txt)">H3</button>\n        <button onclick="wbRteBlock(',
'\'p\')"  title="Paragraph" style="border:1px solid var(--bd);border-radius:5px;padding:2px 7px;font-size:12px;cursor:pointer;background:var(--panel);color:var(--txt)">¶</button>\n        <div style="width:1px;height:16px;background:var(--bd);margin:0 2px;flex-shrink:0"></div>\n        <!-- Text formats -->\n        <button id="rteB" onclick="wbRteFmt(\'bold\')"          title="Bold (Ctrl+B)"      style="border:1px solid var(--bd);border-radius:5px;padding:2px 7px;font-size:13px;font-weight:900;cursor:pointer;',
'background:var(--panel);color:var(--txt)">B</button>\n        <button id="rteI" onclick="wbRteFmt(\'italic\')"        title="Italic (Ctrl+I)"    style="border:1px solid var(--bd);border-radius:5px;padding:2px 7px;font-style:italic;font-size:13px;cursor:pointer;background:var(--panel);color:var(--txt)">I</button>\n        <button id="rteU" onclick="wbRteFmt(\'underline\')"     title="Underline (Ctrl+U)" style="border:1px solid var(--bd);border-radius:5px;padding:2px 7px;text-decoration:underline;font-size:13px;curso',
'r:pointer;background:var(--panel);color:var(--txt)">U</button>\n        <button id="rteS" onclick="wbRteFmt(\'strikeThrough\')" title="Strikethrough"      style="border:1px solid var(--bd);border-radius:5px;padding:2px 7px;text-decoration:line-through;font-size:12px;cursor:pointer;background:var(--panel);color:var(--txt)">S</button>\n        <div style="width:1px;height:16px;background:var(--bd);margin:0 2px;flex-shrink:0"></div>\n        <!-- Text color -->\n        <label title="Text color" style="position:relati',
've;display:inline-flex;flex-direction:column;align-items:center;cursor:pointer;font-size:11px;font-weight:700;color:var(--txt);gap:1px;padding:2px 5px;border:1px solid var(--bd);border-radius:5px;background:var(--panel)">\n          A<span id="wbTextColorBar" style="display:block;width:14px;height:3px;border-radius:2px;background:var(--txt)"></span>\n          <input type="color" id="wbTextColor" value="#e8eaf0" oninput="wbRteColor(this.value)" style="position:absolute;opacity:0;width:100%;height:100%;cursor',
':pointer;border:none;padding:0;left:0;top:0">\n        </label>\n        <!-- Highlight -->\n        <label title="Highlight" style="position:relative;display:inline-flex;align-items:center;cursor:pointer;padding:2px 5px;border:1px solid var(--bd);border-radius:5px;background:var(--panel);color:var(--txt);font-size:13px">\n          🖍<input type="color" id="wbHighlightColor" value="#fef08a" oninput="wbRteHighlight(this.value)" style="position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;borde',
'r:none;padding:0;left:0;top:0">\n        </label>\n        <div style="width:1px;height:16px;background:var(--bd);margin:0 2px;flex-shrink:0"></div>\n        <!-- Lists + blocks -->\n        <button onclick="wbRteInsert(\'bullet\')"   title="Bullet list"       style="border:1px solid var(--bd);border-radius:5px;padding:2px 6px;font-size:13px;cursor:pointer;background:var(--panel);color:var(--txt)">•</button>\n        <button onclick="wbRteInsert(\'numbered\')" title="Numbered list"     style="border:1px sol',
'id #2a2e3c;border-radius:5px;padding:2px 6px;font-size:11px;cursor:pointer;background:var(--panel);color:var(--txt)">1.</button>\n        <button onclick="wbRteInsert(\'quote\')"    title="Blockquote"        style="border:1px solid var(--bd);border-radius:5px;padding:2px 6px;font-size:13px;cursor:pointer;background:var(--panel);color:var(--txt)">❝</button>\n        <button onclick="wbRteInsert(\'link\')"     title="Insert link"       style="border:1px solid var(--bd);border-radius:5px;padding:2px 6px;font-size:12px',
';cursor:pointer;background:var(--panel);color:var(--txt)">🔗</button>\n        <button onclick="wbRteInsert(\'code\')"     title="Inline code"       style="border:1px solid var(--bd);border-radius:5px;padding:2px 5px;font-size:10px;cursor:pointer;background:var(--panel);color:var(--txt)">&lt;/&gt;</button>\n        <button onclick="wbRteInsert(\'table\')"    title="Table"             style="border:1px solid var(--bd);border-radius:5px;padding:2px 6px;font-size:13px;cursor:pointer;background:var(--panel);color:var(--txt)">▦',
'</button>\n        <button onclick="wbRteInsert(\'callout\')"  title="Callout / key tip" style="border:1px solid var(--bd);border-radius:5px;padding:2px 6px;font-size:13px;cursor:pointer;background:var(--panel);color:var(--txt)">💡</button>\n        <button onclick="wbRteInsert(\'divider\')"  title="Horizontal rule"   style="border:1px solid var(--bd);border-radius:5px;padding:2px 6px;font-size:13px;cursor:pointer;background:var(--panel);color:var(--txt)">—</button>\n        <button onclick="document.getElementById',
'(\'wbRteImgInput\').click()" title="Insert image" style="border:1px solid var(--bd);border-radius:5px;padding:2px 6px;font-size:13px;cursor:pointer;background:var(--panel);color:var(--txt)">🖼</button>\n        <input type="file" id="wbRteImgInput" accept="image/*" style="display:none" onchange="wbRteInsertImage(this)">\n        <button onclick="wbRteInsert(\'add\')" title="Add block" style="border:1.5px solid var(--jm-primary,#7c3aed);border-radius:5px;padding:2px 7px;font-size:13px;cursor:pointer;background:rgba(124,58,2',
'37,.2);color:#c4b5fd;font-weight:700">＋</button>\n        <div style="flex:1"></div>\n        <!-- Align -->\n        <button id="rteLeft"   onclick="wbRteAlign(\'left\')"   title="Left"   style="border:1px solid var(--bd);border-radius:5px;padding:2px 5px;font-size:10px;cursor:pointer;background:var(--jm-primary,#7c3aed);color:#fff">≡←</button>\n        <button id="rteCenter" onclick="wbRteAlign(\'center\')" title="Center" style="border:1px solid var(--bd);border-radius:5px;padding:2px 5px;font-size:10px;cursor:poin',
'ter;background:var(--panel);color:var(--txt)">≡↔</button>\n        <button id="rteRight"  onclick="wbRteAlign(\'right\')"  title="Right"  style="border:1px solid var(--bd);border-radius:5px;padding:2px 5px;font-size:10px;cursor:pointer;background:var(--panel);color:var(--txt)">≡→</button>\n      </div>\n      <!-- contenteditable editor -->\n      <div id="wbRteEditor" contenteditable="true" spellcheck="true"\n        data-placeholder="📌 Chapter 2 — Algebra Basics&#10;&#10;Variables, equations, solving…"\n      ',
'  style="flex:1;min-height:160px;max-height:320px;overflow-y:auto;padding:14px 16px;font-size:16px;line-height:1.75;background:var(--bg);color:var(--txt);outline:none;font-family:system-ui,sans-serif">\n      </div>\n      <!-- Footer actions -->\n      <div style="display:flex;gap:8px;padding:9px 14px;background:var(--panel);border-top:1px solid var(--bd);flex-shrink:0;align-items:center">\n        <button class="btn pri" onclick="wbStampRte()" style="flex:1;padding:8px;font-size:13px">✅ Stamp to Board</bu',
'tton>\n        <button onclick="wbRteInsert(\'bullet\')" style="border:1px solid var(--bd);border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer;background:var(--panel2);color:var(--txt)">• Bullets</button>\n        <button onclick="wbRteInsert(\'callout\')" style="border:1px solid var(--bd);border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer;background:var(--panel2);color:var(--txt)">💡 Note</button>\n        <button id="wbTextCancelBtn" class="btn" style="padding:8px 13px">✕</button>\n      ',
'</div>\n    </div>\n    <!-- Document reference panel — fixed overlay so it\'s always visible while teaching -->\n    <div id="wbDocPanel" style="display:none;position:fixed;z-index:280;right:16px;top:70px;width:min(380px,45vw);background:var(--panel);border:1.5px solid var(--bd);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.35);overflow:hidden;resize:both">\n      <div id="wbDocPanelHeader" style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:v',
'ar(--bd);font-size:12px;font-weight:700;cursor:move;user-select:none">\n        <span>📄 Document Reference</span>\n        <div style="display:flex;gap:5px;align-items:center">\n          <button class="btn" onclick="wbDocPage(-1)" style="padding:2px 7px">◀</button>\n          <span id="wbDocPageNum" style="font-size:11px;font-weight:700;min-width:30px;text-align:center">1/1</span>\n          <button class="btn" onclick="wbDocPage(1)"  style="padding:2px 7px">▶</button>\n          <button class',
'="btn" onclick="document.getElementById(\'wbDocPanel\').style.display=\'none\'" style="padding:2px 7px;color:var(--jm-danger,#ef4444)">✕</button>\n        </div>\n      </div>\n      <div style="overflow:auto;text-align:center;padding:6px;background:var(--panel2);max-height:calc(80vh - 50px)">\n        <img id="wbDocImg" src="" alt="" style="max-width:100%;border-radius:6px;display:none">\n        <iframe id="wbDocPdf" src="" style="width:100%;height:500px;border:none;border-radius:6px;display:none"></iframe>\n       ',
' <div id="wbDocNoImg" style="padding:20px;color:var(--mut);font-size:13px">No document loaded yet.<br>Open an image or PDF from Insert → Doc ref.</div>\n        <button id="wbDocAddToBoard" onclick="wbDocAddToBoard()" style="display:none;margin-top:8px;border:1px solid var(--jm-primary,#7c3aed);border-radius:8px;padding:5px 14px;font-size:12px;cursor:pointer;background:var(--panel2);color:var(--txt)">⬇ Add to board</button>\n      </div>\n    </div>\n\n    <!-- Save to course modal -->\n    <div id="wbSaveCourseModal" style=',
'"display:none;position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.6);align-items:center;justify-content:center">\n      <div style="background:var(--panel);border-radius:14px;padding:22px;max-width:460px;width:90%;max-height:90vh;overflow:auto">\n        <div style="display:flex;justify-content:space-between;margin-bottom:14px">\n          <strong style="font-size:16px">💾 Save whiteboard to course</strong>\n          <button class="btn" onclick="document.getElementById(\'wbSaveCourseModal',
'\').style.display=\'none\'">×</button>\n        </div>\n        <div style="margin-bottom:12px">\n          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:5px">Course</label>\n          <select id="wbCourseSelect" style="width:100%;padding:8px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--text)" onchange="wbLoadTopics(this.value)">\n            <option value="">— loading courses —</option>\n          </select>\n        </div>\n        <di',
'v style="margin-bottom:12px">\n          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:5px">Topic / Section</label>\n          <select id="wbTopicSelect" style="width:100%;padding:8px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--text)">\n            <option value="">— pick a course first —</option>\n          </select>\n          <input type="text" id="wbNewTopic" placeholder="Or type a new topic name…" style="width:100%;margin-top:6px;',
'padding:8px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--text)">\n        </div>\n        <div style="margin-bottom:14px">\n          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:5px">Title</label>\n          <input type="text" id="wbSaveTitle" placeholder="Whiteboard notes — Lesson 1" style="width:100%;padding:8px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--text)">\n        </div>\n        <div style=',
'"margin-bottom:14px">\n          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:5px">Save as</label>\n          <div style="display:flex;gap:8px">\n            <label style="display:flex;align-items:center;gap:5px"><input type="radio" name="wbSaveAs" value="image" checked> Image (PNG)</label>\n            <label style="display:flex;align-items:center;gap:5px"><input type="radio" name="wbSaveAs" value="pdf"> PDF (all pages)</label>\n          </div>\n        </div>\n    ',
'    <button class="btn pri" style="width:100%;padding:10px" onclick="wbDoSaveCourse()">💾 Save to course</button>\n        <div id="wbSaveStatus" style="margin-top:10px;font-size:13px;text-align:center"></div>\n      </div>\n    </div>\n    <div style="display:flex;gap:8px;margin-top:10px">\n      <span class="badge" id="srcLabel">No source</span><span class="badge">1280×720</span>\n      <span class="badge" id="adjustHint" style="display:none;background:var(--jm-danger-dark,#7c2d12);color:var(--jm-danger-light,#fed7aa)">Drag the 4 dots to',
' the area you want · click ✂️ again when done</span>\n    </div>\n  </div>\n  <!-- EDITOR -->\n  <div class="col right">\n    <button class="col-toggle" type="button" onclick="studioToggleCol(this)" aria-label="Toggle setup panel"><span>⚙ Output &amp; setup</span><span class="col-arrow">▾</span></button>\n    <h4>✂️ Perspective</h4>\n    <!-- Simple Crop mode -->\n    <div style="margin-bottom:8px">\n      <button class="btn" style="width:100%;margin-bottom:6px" id="btnSimpleCrop" onclick="toggl',
'eCropMode()">🔳 Simple Crop</button>\n      <button class="btn" style="width:100%;margin-bottom:6px" onclick="resetCrop()">↺ Reset Crop</button>\n    </div>\n    <details style="margin-bottom:8px">\n      <summary style="font-size:11px;color:var(--mut);cursor:pointer;user-select:none">⚙️ Fine-tune perspective (advanced)</summary>\n      <div style="margin-top:8px">\n        <div class="hint">Click <b>✂️ Crop</b> in the top bar, then drag the 4 dots on the big preview to the corners of your board',
'/area. Studio straightens &amp; crops it.</div>\n        <button class="btn" style="width:100%" onclick="resetCorners()">↺ Reset corners</button>\n      </div>\n    </details>\n    <div class="row" style="margin-top:12px"><label style="flex:1">Zoom</label><input type="range" id="zoom" min="1" max="3" step="0.05" value="1" oninput="updatePreset(\'zoom\',+this.value)" style="flex:2"></div>\n    <div class="row"><label style="flex:1">Rotation</label><input type="range" id="rot" min="-180" max="180"',
' step="1" value="0" oninput="updatePreset(\'rotation\',+this.value)" style="flex:2"></div>\n    <div class="row"><label style="flex:1">Perspective fix</label><input type="checkbox" id="perspOn" checked></div>\n    <h4>📝 Preset name</h4>\n    <input type="text" id="presetName" placeholder="e.g. Whiteboard view" oninput="updatePreset(\'name\',this.value)">\n    <h4>🏷 Branding (on recording)</h4>\n    <div class="row"><label style="flex:1">Show overlay</label><input type="checkbox" id="brandOn" c',
'hecked></div>\n    <input type="text" id="brandText" placeholder="Overlay text">\n    <div class="row"><label style="flex:1">Position</label><select id="brandPos" style="flex:2;margin:0"><option value="tl">Top-left</option><option value="tr" selected>Top-right</option><option value="bl">Bottom-left</option><option value="br">Bottom-right</option></select></div>\n    <div class="row"><label style="flex:1">Text size</label><input type="range" id="brandSize" min="14" max="48" step="1" value="26" st',
'yle="flex:2"></div>\n    <div class="row"><label style="flex:1">Text color</label><input type="color" id="brandColor" value="#ffffff" style="width:46px;height:30px;border:none;background:none"></div>\n    <div class="row"><label style="flex:1">Background</label><input type="range" id="brandBg" min="0" max="80" step="5" value="45" style="flex:2" title="overlay box opacity"></div>\n    <div class="row"><label style="flex:1">Logo size</label><input type="range" id="brandLogoSize" min="40" max="160"',
' step="5" value="90" style="flex:2"></div>\n    <div class="row"><label style="flex:1">Logo</label><input type="file" id="brandLogo" accept="image/*" onchange="loadBrandLogo(this)" style="flex:2"></div>\n    <div class="hint">Burned into the recording. Defaults pull from your CRM branding.</div>\n  </div>\n</div>\n<!-- Course picker modal -->\n<!-- Aspect Ratio Crop Selector -->\n<div id="arCropModal" style="display:none;position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.92);flex-directio',
'n:column;align-items:center;justify-content:flex-start;gap:10px;padding:16px;overflow-y:auto">\n  <!-- Header row -->\n  <div style="display:flex;align-items:center;justify-content:space-between;width:min(88vw,960px);gap:12px">\n    <div>\n      <div style="font-size:15px;font-weight:800;color:var(--txt)">🎬 Crop to Aspect Ratio</div>\n      <div id="arCropLabel" style="font-size:12px;color:var(--jm-primary,#7c3aed);font-weight:700;margin-top:2px">16:9 · YouTube / Zoom</div>\n    </div>\n    <!-- AR quick-select chips ',
'-->\n    <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">\n      <button onclick="arQuickSwitch(\'1920x1080\')" data-arq="1920x1080" style="border:1.5px solid var(--jm-primary,#7c3aed);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;background:var(--jm-primary,#7c3aed);color:#fff">16:9</button>\n      <button onclick="arQuickSwitch(\'1080x1920\')" data-arq="1080x1920" style="border:1.5px solid var(--bd);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;cursor:',
'pointer;background:transparent;color:var(--mut)">9:16</button>\n      <button onclick="arQuickSwitch(\'1280x720\')"  data-arq="1280x720"  style="border:1.5px solid var(--bd);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;background:transparent;color:var(--mut)">HD</button>\n      <button onclick="arQuickSwitch(\'1080x1080\')" data-arq="1080x1080" style="border:1.5px solid var(--bd);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;background:transpare',
'nt;color:#ccc">1:1</button>\n      <button onclick="arQuickSwitch(\'960x720\')"   data-arq="960x720"   style="border:1.5px solid var(--bd);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;background:transparent;color:var(--mut)">4:3</button>\n    </div>\n  </div>\n  <div style="font-size:11px;color:var(--mut);width:min(88vw,960px)">Drag the box to reposition · drag corner handles to resize (aspect ratio is locked) · corner handles keep the crop ratio</div>\n  <!-- Preview + cr',
'op box -->\n  <div id="arCropWrap" style="position:relative;max-width:min(88vw,960px);width:min(88vw,960px);cursor:default;user-select:none;line-height:0;border-radius:8px;overflow:hidden">\n    <canvas id="arCropPreview" style="display:block;width:100%;height:auto;border-radius:8px;background:var(--bg)"></canvas>\n    <div id="arcDimT" style="position:absolute;top:0;left:0;right:0;background:rgba(0,0,0,.6);pointer-events:none"></div>\n    <div id="arcDimB" style="position:absolute;bottom:0;left:0;ri',
'ght:0;background:rgba(0,0,0,.6);pointer-events:none"></div>\n    <div id="arcDimL" style="position:absolute;background:rgba(0,0,0,.6);pointer-events:none"></div>\n    <div id="arcDimR" style="position:absolute;background:rgba(0,0,0,.6);pointer-events:none"></div>\n    <!-- Crop box -->\n    <div id="arCropBox" style="position:absolute;border:2px solid var(--jm-primary,#7c3aed);box-sizing:border-box;cursor:move">\n      <!-- Rule-of-thirds grid lines -->\n      <div style="position:absolute;inset:0;pointer-events:',
'none;border:none">\n        <div style="position:absolute;left:33.3%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.2)"></div>\n        <div style="position:absolute;left:66.6%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.2)"></div>\n        <div style="position:absolute;top:33.3%;left:0;right:0;height:1px;background:rgba(255,255,255,.2)"></div>\n        <div style="position:absolute;top:66.6%;left:0;right:0;height:1px;background:rgba(255,255,255,.2)"></div>\n      </div>\n      ',
'<!-- AR label inside box -->\n      <div id="arCropBoxLabel" style="position:absolute;top:6px;left:50%;transform:translateX(-50%);background:rgba(124,58,237,.8);color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;pointer-events:none;white-space:nowrap">16:9</div>\n      <!-- Corner handles -->\n      <div class="arc-h" id="arc-tl" style="top:-7px;left:-7px;cursor:nwse-resize"></div>\n      <div class="arc-h" id="arc-tr" style="top:-7px;right:-7px;cursor:nesw-resize"></di',
'v>\n      <div class="arc-h" id="arc-bl" style="bottom:-7px;left:-7px;cursor:nesw-resize"></div>\n      <div class="arc-h" id="arc-br" style="bottom:-7px;right:-7px;cursor:nwse-resize"></div>\n    </div>\n  </div>\n  <!-- Platform hints -->\n  <div id="arPlatformHint" style="font-size:11px;color:var(--mut);width:min(88vw,960px);padding:6px 10px;background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.3);border-radius:8px">\n    📺 <strong style="color:var(--txt)">16:9</strong> — Best for: YouT',
'ube, Zoom, Google Meet, Teams, projectors\n  </div>\n  <!-- Actions -->\n  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:min(88vw,960px)">\n    <button class="btn pri" onclick="applyArCrop()" style="padding:10px 26px;font-size:13px">✓ Apply crop</button>\n    <button class="btn" onclick="applyArCropFull()" style="padding:10px 20px;font-size:13px">⬜ Full frame (no crop)</button>\n    <button class="btn" onclick="cancelArCrop()" style="padding:10px 18px;font-size:13',
'px;color:var(--jm-danger,#ef4444)">✕ Cancel</button>\n  </div>\n  <div style="font-size:11px;color:var(--mut)">After applying: use the <strong style="color:var(--txt)">corner handles</strong> on the preview canvas to fine-tune perspective.</div>\n</div>\n<div id="coursePicker" style="display:none;position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.6);align-items:center;justify-content:center;padding:16px" onclick="if(event.target===this)this.style.display=\'none\'">\n  <div style="background:var(--panel);border-r',
'adius:12px;max-width:560px;width:100%;max-height:80vh;overflow:auto;padding:18px">\n    <div style="display:flex;justify-content:space-between;margin-bottom:10px"><strong>📚 Add course content as a scene</strong><button class="btn" onclick="document.getElementById(\'coursePicker\').style.display=\'none\'">×</button></div>\n    <select id="cpCourse" onchange="cpLoad(this.value)"><option value="">— pick a course —</option></select>\n    <div id="cpItems"><div class="hint">Pick a course to list its',
' images, topics &amp; documents.</div></div>\n  </div>\n</div>\n<!-- Teach a course → connect Studio to a live class and go live -->\n<div id="teachModal" style="display:none;position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.6);align-items:center;justify-content:center;padding:16px" onclick="if(event.target===this)this.style.display=\'none\'">\n  <div style="background:var(--panel);border-radius:12px;max-width:520px;width:100%;max-height:85vh;overflow:auto;padding:18px">\n    <div style="',
'display:flex;justify-content:space-between;margin-bottom:6px"><strong>📡 Teach a course — go live</strong><button class="btn" onclick="document.getElementById(\'teachModal\').style.display=\'none\'">×</button></div>\n    <div class="hint" style="margin-bottom:10px">Pick a course and a live class. Going live attaches this Studio\'s recording to that class and marks it live for students.</div>\n    <div style="background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.3);border-radius:10px;',
'padding:12px;margin-bottom:12px">\n      <div style="font-weight:700;margin-bottom:6px">⚡ Instant live class — no course needed</div>\n      <input type="text" id="tInstantTitle" placeholder="Title (e.g. Doubt-clearing session)" style="margin-bottom:8px">\n      <button class="btn pri" style="width:100%" onclick="tInstantLive()">▶ Go live now &amp; copy share link</button>\n      <div class="hint" style="margin-top:6px">Anyone you share the link with can join — works without a course. Saved on t',
'his device; syncs when you\'re back online.</div>\n    </div>\n    <div style="text-align:center;color:var(--mut);font-size:12px;margin:0 0 8px">— or attach it to a course —</div>\n    <h4>Course</h4>\n    <select id="tCourse" onchange="tLoadClasses(this.value)"><option value="">— pick a course —</option></select>\n    <h4>Live class</h4>\n    <div id="tClasses"><div class="hint">Pick a course to list its scheduled classes.</div></div>\n    <div style="border-top:1px solid var(--bd);margin:12px ',
'0;padding-top:12px">\n      <h4 style="margin-top:0">＋ Or create a new live class</h4>\n      <input type="text" id="tNewTitle" placeholder="Class title (e.g. Trigonometry — Live)">\n      <div class="row"><input type="datetime-local" id="tNewTime" style="flex:2"><button class="btn pri" style="flex:1" onclick="tCreateClass()">Create &amp; select</button></div>\n    </div>\n    <div style="border-top:1px solid var(--bd);margin:12px 0;padding-top:12px">\n      <h4 style="margin-top:0">🎬 Layout fo',
'r this live</h4>\n      <select id="tTemplate"><option value="">— keep current studio layout —</option></select>\n      <div class="hint">Pick a saved template to load its scenes, format &amp; crops before going live. Your live camera/screen sources stay as they are.</div>\n    </div>\n    <button class="btn pri" id="tGoLive" style="width:100%;padding:11px;margin-top:6px" onclick="tGoLive()" disabled>📡 Go live with selected class</button>\n  </div>\n</div>\n<script>\nconst params=new URLSearchP',
'arams(location.search);\nconst CLASS_ID=params.get(\'class\'); const TOKEN=localStorage.getItem(\'jm_token\'); const API=\'/api\';\n\n// ── Dashboard connection: load user profile from localStorage ─────────────\n(function _initUserProfile(){\n  try{\n    const u=JSON.parse(localStorage.getItem(\'jm_user\')||\'null\');\n    if(!u) return;\n    const chip=document.getElementById(\'studioUserChip\');\n    if(chip){\n      const role=u.user_type||u.role||\'teacher\';\n      chip.textContent=\'👤 \'',
'+(u.full_name||u.name||u.email||\'User\')+\' · \'+role;\n      chip.style.display=\'inline-flex\';\n      chip.title=\'Logged in as \'+(u.full_name||u.email)+\' — click to go to dashboard\';\n    }\n  } catch(e){}\n})();\n\n// User courses cache (loaded lazily for "Save to course" + "Teach" flows)\nlet _userCourses=null;\nasync function _loadUserCourses(force){\n  if(_userCourses&&!force) return _userCourses;\n  try{\n    const tok=localStorage.getItem(\'jm_token\')||\'\';\n    if(!tok) return [',
'];\n    const res=await fetch(API+\'/courses?mine=1\',{headers:{Authorization:\'Bearer \'+tok}});\n    const data=await res.json();\n    _userCourses=(data.courses||data||[]);\n    return _userCourses;\n  } catch(e){ return []; }\n}\n// The live class this Studio session is bound to. Starts from ?class= but can\n// be (re)bound at runtime via the "Teach a course" flow, so recordings/streams\n// attach to the right class even when Studio is opened standalone.\nlet _boundClass=CLASS_ID||null, _bou',
'ndClassTitle=\'\';\nfunction crmKey(){ try{ const u=JSON.parse(localStorage.getItem(\'jm_user\')||\'{}\'); return u&&u.id?(\'jm_crm_\'+u.id):\'jm_crm\'; }catch(e){ return \'jm_crm\'; } }\nfunction getCrm(){ try{ let r=localStorage.getItem(crmKey()); if(r===null&&crmKey()!==\'jm_crm\') r=localStorage.getItem(\'jm_crm\'); return JSON.parse(r||\'{}\'); }catch(e){ return {}; } }\nlet sources={}, scenes=[], activeScene=null, _adjustMode=false;\n// Virtual background\nlet _vbgImg=null, _vbgColor=\'#00',
'0000\', _vbgMode=\'none\', _vbgFrame=0.85, _vbgFit=\'fill\';\nfunction clearVbg(){ _vbgMode=\'none\'; _vbgImg=null; _vbgColor=\'#000\'; document.getElementById(\'vbgHint\').textContent=\'Background: none\'; document.getElementById(\'vbgPositionBtns\').style.display=\'none\'; }\nfunction setVbgColor(c){ _vbgColor=c; _vbgMode=\'color\'; document.getElementById(\'vbgHint\').textContent=\'Background: solid colour\'; document.getElementById(\'vbgPositionBtns\').style.display=\'none\'; }\nfunction loa',
'dVbgImage(input){ const f=input.files?.[0]; if(!f) return; const r=new Image(); r.onload=()=>{ _vbgImg=r; _vbgMode=\'image\'; document.getElementById(\'vbgHint\').textContent=\'Background: \'+f.name; document.getElementById(\'vbgPositionBtns\').style.display=\'block\'; }; r.src=URL.createObjectURL(f); }\nlet gl=null, prog=null, tex=null, glCanvas=null, micStream=null, brandImg=null;\nconst out=document.getElementById(\'out\'), octx=out.getContext(\'2d\');\n\n// ── Simple Crop mode ──────────────',
'──────────────────────────────────────\nlet _cropMode=false;\n// Crop is PER-SCENE (like corners) — each scene keeps its own crop rect so\n// switching scenes shows/applies the right one. _crop() lazily initialises it.\nfunction _crop(){ if(!activeScene) return {x:0,y:0,w:1,h:1}; if(!activeScene.crop) activeScene.crop={x:0,y:0,w:1,h:1}; return activeScene.crop; }\n// ── AR-based source crop: maps a region of the SOURCE to fill the OUTPUT ──\nlet _srcCropMode=false, _srcCrop={x:0,y:0,w:1,h:1};\nf',
'unction toggleCropMode(){\n  _cropMode=!_cropMode;\n  document.getElementById(\'btnSimpleCrop\').classList.toggle(\'on\',_cropMode);\n  _updateCropOverlay();\n}\nfunction resetCrop(){ if(activeScene) activeScene.crop={x:0,y:0,w:1,h:1}; _updateCropOverlay(); }\nfunction _updateCropOverlay(){\n  const ov=document.getElementById(\'cropOverlay\');\n  if(!_cropMode){ ov.style.display=\'none\'; return; }\n  const rr=outRect(); const cr=_crop();\n  ov.style.display=\'block\';\n  ov.style.left=(cr.x*rr.',
'width)+\'px\';\n  ov.style.top=(cr.y*rr.height)+\'px\';\n  ov.style.width=(cr.w*rr.width)+\'px\';\n  ov.style.height=(cr.h*rr.height)+\'px\';\n  ov.style.pointerEvents=\'none\';\n  // Use CSS resize for the rectangle — achieved via a transparent inner resize handle\n  _attachCropHandles(ov, rr);\n}\nfunction _attachCropHandles(ov, rr){\n  // Remove old handles\n  ov.querySelectorAll(\'.crop-handle\').forEach(h=>h.remove());\n  const corners=[\n    {cx:0,cy:0,cursor:\'nwse-resize\'},\n    {cx:1,c',
'y:0,cursor:\'nesw-resize\'},\n    {cx:0,cy:1,cursor:\'nesw-resize\'},\n    {cx:1,cy:1,cursor:\'nwse-resize\'}\n  ];\n  ov.style.pointerEvents=\'auto\';\n  corners.forEach(({cx,cy,cursor})=>{\n    const h=document.createElement(\'div\');\n    h.className=\'crop-handle\';\n    h.style.cssText=`position:absolute;width:14px;height:14px;background:var(--pri);border:2px solid #fff;border-radius:3px;cursor:${cursor};z-index:7;transform:translate(-50%,-50%);left:${cx*100}%;top:${cy*100}%`;\n    h.addEve',
'ntListener(\'pointerdown\',e=>{\n      e.preventDefault(); e.stopPropagation(); h.setPointerCapture?.(e.pointerId);\n      const startX=e.clientX, startY=e.clientY;\n      const orig={...rr, rc:{..._crop()}};\n      const mv=ev=>{\n        const dx=(ev.clientX-startX)/orig.width, dy=(ev.clientY-startY)/orig.height;\n        const nr={...orig.rc};\n        if(cx===0){ nr.x=Math.min(orig.rc.x+dx, orig.rc.x+orig.rc.w-0.05); nr.w=orig.rc.w-(nr.x-orig.rc.x); }\n        else { nr.w=Math.max(0.05, orig',
'.rc.w+dx); }\n        if(cy===0){ nr.y=Math.min(orig.rc.y+dy, orig.rc.y+orig.rc.h-0.05); nr.h=orig.rc.h-(nr.y-orig.rc.y); }\n        else { nr.h=Math.max(0.05, orig.rc.h+dy); }\n        const cr=_crop(); cr.x=nr.x; cr.y=nr.y; cr.w=nr.w; cr.h=nr.h;\n        const rr2=outRect();\n        ov.style.left=(cr.x*rr2.width)+\'px\';\n        ov.style.top=(cr.y*rr2.height)+\'px\';\n        ov.style.width=(cr.w*rr2.width)+\'px\';\n        ov.style.height=(cr.h*rr2.height)+\'px\';\n      };\n      const up=',
'()=>{ window.removeEventListener(\'pointermove\',mv); window.removeEventListener(\'pointerup\',up); };\n      window.addEventListener(\'pointermove\',mv); window.addEventListener(\'pointerup\',up);\n    });\n    ov.appendChild(h);\n  });\n  // Move handle in center\n  const mh=document.createElement(\'div\'); mh.className=\'crop-handle\';\n  mh.style.cssText=\'position:absolute;width:20px;height:20px;background:rgba(124,58,237,.5);border:2px solid #fff;border-radius:50%;cursor:move;z-index:7;tra',
'nsform:translate(-50%,-50%);left:50%;top:50%\';\n  mh.addEventListener(\'pointerdown\',e=>{\n    e.preventDefault(); e.stopPropagation(); mh.setPointerCapture?.(e.pointerId);\n    let px=e.clientX, py=e.clientY;\n    const mv=ev=>{\n      const rr2=outRect();\n      const dx=(ev.clientX-px)/rr2.width, dy=(ev.clientY-py)/rr2.height;\n      px=ev.clientX; py=ev.clientY;\n      const cr=_crop();\n      cr.x=Math.max(0,Math.min(1-cr.w,cr.x+dx));\n      cr.y=Math.max(0,Math.min(1-cr.h,cr.y+dy));\n   ',
'   ov.style.left=(cr.x*rr2.width)+\'px\';\n      ov.style.top=(cr.y*rr2.height)+\'px\';\n    };\n    const up=()=>{ window.removeEventListener(\'pointermove\',mv); window.removeEventListener(\'pointerup\',up); };\n    window.addEventListener(\'pointermove\',mv); window.addEventListener(\'pointerup\',up);\n  });\n  ov.appendChild(mh);\n}\nwindow.addEventListener(\'resize\',()=>{ if(_cropMode) _updateCropOverlay(); });\n\n// ── Welcome Guide ───────────────────────────────────────────────────────',
'nfunction openGuide(){\n  document.getElementById(\'studioGuide\').style.display=\'flex\';\n  document.getElementById(\'guideTemplateArea\').style.display=\'none\';\n}\nfunction dismissGuide(){\n  localStorage.setItem(\'studio_seen\',\'1\');\n  document.getElementById(\'studioGuide\').style.display=\'none\';\n}\nfunction _showGuideTemplate(){\n  const area=document.getElementById(\'guideTemplateArea\');\n  area.style.display=\'block\';\n  const keys=Object.keys(localStorage).filter(k=>k.startsWi',
'th(\'jm_studio_tpl_\'));\n  if(!keys.length){ area.innerHTML=\'<div class="hint">No saved templates yet.</div>\'; return; }\n  area.innerHTML=keys.map(k=>{\n    const name=k.replace(\'jm_studio_tpl_\',\'\');\n    return `<div class="tpl-row" onclick="_loadTemplateByKey(\'${k}\');dismissGuide()"><div class="tpl-nm">${_esc(name)}</div><span style="color:var(--pri);font-size:12px">Load →</span></div>`;\n  }).join(\'\');\n}\n// Show guide on first load\nif(!localStorage.getItem(\'studio_seen\')){\n ',
' document.getElementById(\'studioGuide\').style.display=\'flex\';\n}\n\n// ── Toast ────────────────────────────────────────────────────────────────\nlet _toastTimer=null;\nfunction showToast(msg){\n  const t=document.getElementById(\'studioToast\'); t.textContent=msg; t.classList.add(\'show\');\n  clearTimeout(_toastTimer); _toastTimer=setTimeout(()=>t.classList.remove(\'show\'),2800);\n}\n\n// ── Templates ───────────────────────────────────────────────────────────\nfunction toggleTemplatePane',
'l(){\n  const p=document.getElementById(\'templatePanel\');\n  p.classList.toggle(\'open\');\n  if(p.classList.contains(\'open\')) renderTemplateList();\n}\n// Close template panel when clicking outside\ndocument.addEventListener(\'click\',e=>{\n  const wrap=document.getElementById(\'tplBtnWrap\');\n  if(wrap && !wrap.contains(e.target)) document.getElementById(\'templatePanel\').classList.remove(\'open\');\n});\nfunction saveTemplate(){\n  const name=document.getElementById(\'tplNameInput\').va',
'lue.trim();\n  if(!name){ alert(\'Enter a name for this template.\'); return; }\n  const data={\n    format: document.getElementById(\'fmtSelect\').value,\n    vbgMode: _vbgMode,\n    vbgColor: _vbgColor,\n    scenes: scenes.map(s=>({name:s.name,zoom:s.zoom,rotation:s.rotation,corners:s.corners,crop:s.crop,layers:s.layers||[]}))\n  };\n  localStorage.setItem(\'jm_studio_tpl_\'+name, JSON.stringify(data));\n  document.getElementById(\'tplNameInput\').value=\'\';\n  showToast(\'Template "\'+name+',
'" saved!\');\n  renderTemplateList();\n}\nfunction renderTemplateList(){\n  const box=document.getElementById(\'tplList\');\n  const keys=Object.keys(localStorage).filter(k=>k.startsWith(\'jm_studio_tpl_\'));\n  if(!keys.length){ box.innerHTML=\'<div class="hint">No templates yet.</div>\'; return; }\n  box.innerHTML=keys.map(k=>{\n    const name=k.replace(\'jm_studio_tpl_\',\'\');\n    return `<div class="tpl-row">\n      <div class="tpl-nm" onclick="_loadTemplateByKey(\'${_esc(k)}\')">${_esc(n',
'ame)}</div>\n      <button class="btn" style="padding:3px 8px;font-size:11px" onclick="_loadTemplateByKey(\'${_esc(k)}\')">Load</button>\n      <button class="btn" style="padding:3px 8px;font-size:11px" onclick="_deleteTemplate(\'${_esc(k)}\')">×</button>\n    </div>`;\n  }).join(\'\');\n}\nfunction _loadTemplateByKey(key){\n  try{\n    const data=JSON.parse(localStorage.getItem(key)||\'{}\');\n    if(data.format) setFormat(data.format);\n    if(data.vbgColor) _vbgColor=data.vbgColor;\n    if(da',
'ta.vbgMode) _vbgMode=data.vbgMode;\n    if(Array.isArray(data.scenes) && data.scenes.length){\n      // Restore scene layout (sources can\'t be restored — they\'re live streams)\n      scenes=data.scenes.map((s,i)=>({\n        id:\'sc_\'+Date.now()+\'_\'+i,\n        name:s.name||\'Scene \'+(i+1),\n        sourceId:activeScene?.sourceId||Object.keys(sources)[0]||\'\',\n        corners:s.corners||defaultCorners(),\n        crop:s.crop||{x:0,y:0,w:1,h:1},\n        zoom:s.zoom||1,\n        rotation:',
's.rotation||0,\n        layers:s.layers||[]\n      }));\n      activeScene=scenes[0]||null;\n      renderScenes(); loadEditor(); renderLayerList();\n    }\n    const name=key.replace(\'jm_studio_tpl_\',\'\');\n    showToast(\'Template "\'+name+\'" loaded!\');\n    document.getElementById(\'templatePanel\').classList.remove(\'open\');\n  }catch(e){ alert(\'Could not load template: \'+e.message); }\n}\nfunction _deleteTemplate(key){\n  const name=key.replace(\'jm_studio_tpl_\',\'\');\n  if(!confir',
'm(\'Delete template "\'+name+\'"?\')) return;\n  localStorage.removeItem(key);\n  renderTemplateList();\n}\n\n(function(){ const crm=getCrm();\n  if(crm.companyName && crm.companyName!==\'JeetMantra Classes\') document.getElementById(\'brandText\').value=crm.companyName;\n  if(crm.logo){ const im=new Image(); im.onload=()=>brandImg=im; im.src=crm.logo; }\n})();\n\n// ── Devices ────────────────────────────────────────────────────────────\nasync function enableDevices(){\n  const b=document.getEl',
'ementById(\'permBanner\');\n  try{ const s=await navigator.mediaDevices.getUserMedia({video:true,audio:true}); s.getTracks().forEach(t=>t.stop());\n    b.className=\'banner ok\'; b.innerHTML=\'✓ Devices unlocked. Pick a camera.\'; document.getElementById(\'btnEnable\').style.display=\'none\';\n    await refreshDevices(); const sel=document.getElementById(\'camSelect\'); const f=[...sel.options].find(o=>o.value); if(f){ sel.value=f.value; startCamera(f.value); }\n  }catch(e){ b.className=\'banner',
' warn\'; b.innerHTML=\'⚠️ \'+(e.name===\'NotAllowedError\'?\'Permission denied — allow camera/mic in the address bar.\':e.name===\'NotFoundError\'?\'No camera/mic found.\':e.message); }\n}\nasync function refreshDevices(){\n  let devs=[]; try{ devs=await navigator.mediaDevices.enumerateDevices(); }catch(e){}\n  const cams=devs.filter(d=>d.kind===\'videoinput\'), mics=devs.filter(d=>d.kind===\'audioinput\');\n  document.getElementById(\'camSelect\').innerHTML=cams.length?cams.map((d,i)=>`<option ',
'value="${d.deviceId}">${d.label||(\'Camera \'+(i+1))}</option>`).join(\'\'):\'<option value="">No cameras — click Enable</option>\';\n  document.getElementById(\'micSelect\').innerHTML=\'<option value="">Default mic</option>\'+mics.map((d,i)=>`<option value="${d.deviceId}">${d.label||(\'Mic \'+(i+1))}</option>`).join(\'\');\n}\nif(navigator.mediaDevices) navigator.mediaDevices.addEventListener?.(\'devicechange\', refreshDevices);\nasync function startCamera(deviceId){ if(!deviceId) return; if(so',
'urces[deviceId]){ pickSource(deviceId); return; }\n  try{ const stream=await navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:deviceId},width:{ideal:1280},height:{ideal:720}},audio:false}); registerVideo(deviceId,stream,\'Camera\'); refreshDevices(); }\n  catch(e){ alert(\'Could not open camera: \'+(e.message||e.name)); } }\nasync function addScreen(){ try{ const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:false}); const id=\'screen_\'+Date.now(); r',
'egisterVideo(id,stream,\'Screen\'); stream.getVideoTracks()[0].addEventListener(\'ended\',()=>{ delete sources[id]; }); }catch(e){} }\nfunction registerVideo(id,stream,label){ const v=document.createElement(\'video\'); v.srcObject=stream; v.autoplay=true; v.muted=true; v.playsInline=true; v.setAttribute(\'playsinline\',\'\'); document.getElementById(\'srcHolder\').appendChild(v); v.play().catch(()=>{}); sources[id]={el:v,type:\'video\',stream,label}; if(!scenes.length) addScene(id); else pickSou',
'rce(id); }\n// Whiteboard source — a drawable canvas.\nfunction addWhiteboard(){\n  const id=\'wb_\'+Date.now();\n  const cv=document.createElement(\'canvas\'); cv.width=out.width||1280; cv.height=out.height||720;\n  const c=cv.getContext(\'2d\');\n  c.fillStyle=\'#fff\'; c.fillRect(0,0,cv.width,cv.height);\n  sources[id]={el:cv,type:\'whiteboard\',ctx:c,label:\'Whiteboard\',undoStack:[],pages:[],currentPage:0};\n  // save initial blank page\n  sources[id].pages[0]={imageData:c.getImageData(0,0,',
'cv.width,cv.height),bg:\'white\'};\n  addScene(id); enableWbDraw(id);\n}\n// Image/document source.\nfunction addImage(input){ const f=input.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>{ const id=\'img_\'+Date.now(); sources[id]={el:im,type:\'image\',label:\'Document\'}; addScene(id); }; im.src=r.result; }; r.readAsDataURL(f); input.value=\'\'; }\nfunction addImageUrl(url,label){ const im=new Image(); im.crossOrigin=\'anonymous\'; im.on',
'load=()=>{ const id=\'img_\'+Date.now(); sources[id]={el:im,type:\'image\',label:label||\'Content\'}; addScene(id); }; im.onerror=()=>alert(\'Could not load that content as an image (PDFs/links may not embed).\'); im.src=url; }\nfunction pickSource(id){ if(activeScene){ activeScene.sourceId=id; renderScenes(); } document.getElementById(\'srcLabel\').textContent=(sources[id]?.label||\'Source\'); const isWb=sources[id]?.type===\'whiteboard\'; document.getElementById(\'wbToolbar\').style.display=is',
'Wb?\'flex\':\'none\'; if(isWb&&sources[id]) _wbUpdatePageNav(sources[id]); }\n\n// Whiteboard drawing (on the main preview when its scene is active).\nfunction enableWbDraw(id){\n  document.getElementById(\'wbToolbar\').style.display=\'flex\';\n  wbSetTool(\'pen\');\n  const s=sources[id]; if(s) _wbUpdatePageNav(s);\n  if(typeof _wbSyncSwatches===\'function\') _wbSyncSwatches();\n}\n\n// ── Course content picker ──────────────────────────────────────────────\nasync function openCoursePicker(){ d',
'ocument.getElementById(\'coursePicker\').style.display=\'flex\';\n  try{ const courses=await _loadUserCourses(true);\n    document.getElementById(\'cpCourse\').innerHTML=\'<option value="">— pick a course —</option>\'+courses.map(c=>`<option value="${c.id}">${(c.title||\'Course\')}</option>`).join(\'\');\n  }catch(e){}\n}\nasync function cpLoad(courseId){ if(!courseId) return; const box=document.getElementById(\'cpItems\'); box.innerHTML=\'Loading…\';\n  try{ const full=await fetch(API+\'/course',
'-content/\'+courseId+\'/full\',{headers:{Authorization:\'Bearer \'+TOKEN}}).then(x=>x.json());\n    const items=[]; (full.topics||[]).forEach(t=>(t.images||[]).forEach(u=>items.push({label:\'🖼 \'+(t.title||\'Topic\'),url:u})));\n    (full.materials||[]).forEach(m=>{ if(m.url&&/\\.(png|jpg|jpeg|webp|gif)$/i.test(m.url)) items.push({label:\'📄 \'+(m.title||\'Material\'),url:m.url}); });\n    box.innerHTML=items.length?items.map((it,i)=>`<div style="display:flex;gap:10px;align-items:center;padding',
':8px;border:1px solid var(--bd);border-radius:8px;margin-bottom:6px;cursor:pointer" onclick="addImageUrl(\'${it.url.replace(/\'/g,"\\\\\'")}\',\'${it.label.replace(/\'/g,"\\\\\'")}\');document.getElementById(\'coursePicker\').style.display=\'none\'"><div style="flex:1">${it.label}</div><span style="color:var(--pri)">Add →</span></div>`).join(\'\'):\'<div class="hint">No image content in this course. Upload images to topics/materials to share them here.</div>\';\n  }catch(e){ box.innerHTML=\'Erro',
'r: \'+e.message; }\n}\n\n// ── Teach a course → connect Studio to a live class & go live ───────────\nlet _tSelected=null;\nfunction _bindClass(id, title){\n  _boundClass=id; _boundClassTitle=title||\'\';\n  const b=document.getElementById(\'boundClassBadge\');\n  if(b){ if(id){ b.style.display=\'inline-block\'; b.textContent=\'🔴 Live: \'+(title||\'class\'); } else { b.style.display=\'none\'; } }\n  // Default the recording save-target to the class once connected.\n  const st=document.getElemen',
'tById(\'saveTarget\'); if(st && id && st.value===\'local\') st.value=\'both\';\n  // Start/stop casting the composite to the live room (students see this view).\n  if(id) startStudioCast(id); else stopStudioCast();\n}\n// ── Studio cast: push the composite canvas (#out) to the live room as periodic\n// JPEG frames (~1.5 fps) so students see exactly what\'s on screen here. A\n// lightweight alternative to a full WebRTC publish.\nlet _castTimer=null, _casting=false;\nfunction startStudioCast(class',
'Id){\n  stopStudioCast();\n  const canvas=document.getElementById(\'out\'); if(!canvas) return;\n  _castTimer=setInterval(async ()=>{\n    if(_casting) return;                 // skip if the previous POST is still in flight\n    let frame; try{ frame=canvas.toDataURL(\'image/jpeg\', 0.55); }catch(_){ return; }\n    if(!frame || frame.length<100) return;\n    _casting=true;\n    try{\n      await fetch(API+\'/live-classes/\'+classId+\'/cast\',{\n        method:\'POST\', headers:{\'Content-Type\':',
'\'application/json\',Authorization:\'Bearer \'+TOKEN},\n        body:JSON.stringify({frame})\n      });\n    }catch(_){ /* offline / transient — next tick retries */ }\n    finally{ _casting=false; }\n  }, 650);\n}\nfunction stopStudioCast(){ if(_castTimer){ clearInterval(_castTimer); _castTimer=null; } }\nasync function openTeach(){\n  document.getElementById(\'teachModal\').style.display=\'flex\';\n  const t=new Date(Date.now()+5*60000); t.setSeconds(0,0);\n  const tz=new Date(t.getTime()-t.ge',
'tTimezoneOffset()*60000).toISOString().slice(0,16);\n  const ti=document.getElementById(\'tNewTime\'); if(ti && !ti.value) ti.value=tz;\n  try{ const courses=await _loadUserCourses(true);\n    document.getElementById(\'tCourse\').innerHTML=\'<option value="">— pick a course —</option>\'+courses.map(c=>`<option value="${c.id}">${_esc(c.title||\'Course\')}</option>`).join(\'\');\n  }catch(e){}\n  // Populate the template picker from saved layouts so the teacher chooses\n  // which template to go l',
'ive with.\n  const tt=document.getElementById(\'tTemplate\');\n  if(tt){\n    const keys=Object.keys(localStorage).filter(k=>k.startsWith(\'jm_studio_tpl_\'));\n    tt.innerHTML=\'<option value="">— keep current studio layout —</option>\'+\n      keys.map(k=>`<option value="${_esc(k)}">${_esc(k.replace(\'jm_studio_tpl_\',\'\'))}</option>`).join(\'\');\n  }\n}\nasync function tLoadClasses(courseId){\n  const box=document.getElementById(\'tClasses\'); _tSelected=null; document.getElementById(\'tGo',
'Live\').disabled=true;\n  if(!courseId){ box.innerHTML=\'<div class="hint">Pick a course to list its scheduled classes.</div>\'; return; }\n  box.innerHTML=\'Loading…\';\n  try{\n    const r=await fetch(API+\'/live-classes/course/\'+courseId,{headers:{Authorization:\'Bearer \'+TOKEN}}).then(x=>x.json());\n    const list=(r.liveClasses||r.classes||[]).filter(c=>c.status!==\'cancelled\');\n    box.innerHTML=list.length? list.map(c=>{\n      const when=c.scheduled_time?new Date(c.scheduled_time).to',
'LocaleString():\'—\';\n      return `<div class="scene" id="tc_${c.id}" onclick="tSelectClass(\'${c.id}\',\'${_esc(c.title||\'Class\').replace(/\'/g,"\\\\\'")}\')"><div class="thumb">${c.status===\'live\'?\'🔴\':\'📡\'}</div><div class="nm">${_esc(c.title||\'Class\')}<div style="font-size:10px;color:var(--mut)">${when} · ${_esc(c.status||\'scheduled\')}</div></div></div>`;\n    }).join(\'\') : \'<div style="text-align:center;padding:14px 8px"><div style="font-size:13px;color:var(--mut);margin-bo',
'ttom:10px">No classes yet — connect one to teach.</div><button onclick="document.getElementById(\\\'tNewTitle\\\')?.focus();" style="background:linear-gradient(135deg,var(--pri),#a855f7);color:#fff;border:0;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(124,58,237,.35)">📡 Create live class</button></div>\';\n  }catch(e){ box.innerHTML=\'<div class="banner warn">Couldn\\\'t load classes: \'+_esc(e.message)+\'</div>\'; }\n}\nfunction tSe',
'lectClass(id, title){\n  _tSelected={id,title};\n  document.querySelectorAll(\'#tClasses .scene\').forEach(s=>s.classList.remove(\'active\'));\n  document.getElementById(\'tc_\'+id)?.classList.add(\'active\');\n  document.getElementById(\'tGoLive\').disabled=false;\n}\nasync function tCreateClass(){\n  const courseId=document.getElementById(\'tCourse\').value;\n  if(!courseId){ alert(\'Pick a course first.\'); return; }\n  const title=document.getElementById(\'tNewTitle\').value.trim()||\'Live c',
'lass\';\n  const when=document.getElementById(\'tNewTime\').value;\n  const scheduledTime=when?new Date(when).toISOString():new Date().toISOString();\n  try{\n    const r=await fetch(API+\'/live-classes\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\',Authorization:\'Bearer \'+TOKEN},body:JSON.stringify({courseId,title,scheduledTime,duration:60})}).then(x=>x.json());\n    const id=r.liveClass&&r.liveClass.id; if(!id) throw new Error(r.error&&r.error.message||r.error||\'Create fa',
'iled\');\n    await tLoadClasses(courseId);\n    tSelectClass(id,title);\n  }catch(e){ alert(\'Couldn\\\'t create class: \'+(e.message||e)); }\n}\n// Course-free instant live: generate a room id + shareable join link, save it\n// locally (works with no connection), copy the link, and open the room. Anyone\n// with the link joins — no course, no backend class record required.\n// Open a live room WITHOUT leaving the SPA: when embedded in /app, route the\n// shell to #/m/live/<id> (renders the roo',
'm in-shell); standalone Studio falls\n// back to the /app shell URL. No separate liveRoom.html tab.\nfunction _studioOpenLive(id){\n  const embed=new URLSearchParams(location.search).get(\'embed\')===\'1\';\n  if(embed){ try{ window.top.location.hash=\'#/m/live/\'+id; return; }catch(_){} }\n  window.location.href=location.origin+\'/app#/m/live/\'+id;\n}\nfunction tInstantLive(){\n  const title=(document.getElementById(\'tInstantTitle\')||{}).value.trim()||\'Instant Live Class\';\n  const roomId=',
'\'inst_\'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);\n  // Shareable in-shell link (renders inside /app — not a standalone html page).\n  const link=location.origin+\'/app#/m/live/\'+roomId;\n  // Persist locally so it survives offline; mark unsynced for a future backend sync.\n  try{ const k=\'jm_live_rooms\'; const list=JSON.parse(localStorage.getItem(k)||\'[]\'); list.push({roomId,title,link,createdAt:Date.now(),synced:false}); localStorage.setItem(k,JSON.stringify(list));',
' }catch(_){}\n  // Best-effort backend register when online; failure is fine (stays local).\n  if(navigator.onLine){ try{ fetch(API+\'/live-classes\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\',Authorization:\'Bearer \'+TOKEN},body:JSON.stringify({title,instant:true,roomId,scheduledTime:new Date().toISOString(),duration:60})}).then(()=>{ try{ const k=\'jm_live_rooms\'; const list=JSON.parse(localStorage.getItem(k)||\'[]\'); const it=list.find(r=>r.roomId===roomId); if(it) it.',
'synced=true; localStorage.setItem(k,JSON.stringify(list)); }catch(_){} }).catch(()=>{}); }catch(_){} }\n  try{ navigator.clipboard.writeText(link); }catch(_){}\n  document.getElementById(\'teachModal\').style.display=\'none\';\n  showToast(\'⚡ Live class started — invite link copied\');\n  _studioOpenLive(roomId);\n}\nasync function tGoLive(){\n  if(!_tSelected){ alert(\'Select or create a class first.\'); return; }\n  try{\n    // If the teacher chose a saved template for this live, load it fir',
'st so the\n    // scenes/format/crops are applied before we bind + start casting.\n    const tplKey=(document.getElementById(\'tTemplate\')||{}).value;\n    if(tplKey){ try{ _loadTemplateByKey(tplKey); }catch(_){} }\n    // Mark the class live (idempotent on the backend) and bind Studio to it.\n    await fetch(API+\'/live-classes/\'+_tSelected.id+\'/start\',{method:\'POST\',headers:{Authorization:\'Bearer \'+TOKEN}}).catch(()=>{});\n    await fetch(API+\'/live-classes/\'+_tSelected.id,{method:\'',
'PUT\',headers:{\'Content-Type\':\'application/json\',Authorization:\'Bearer \'+TOKEN},body:JSON.stringify({status:\'live\'})}).catch(()=>{});\n    _bindClass(_tSelected.id,_tSelected.title);\n    document.getElementById(\'teachModal\').style.display=\'none\';\n    showToast(\'📡 You\\\'re live with "\'+_tSelected.title+\'" — recordings save to this class\');\n    _studioOpenLive(_tSelected.id);   // render the room in-shell, not a new html tab\n  }catch(e){ alert(\'Couldn\\\'t go live: \'+(e.mes',
'sage||e)); }\n}\n\n// ── Scenes ─────────────────────────────────────────────────────────────\nfunction addScene(sourceId){ const sid=sourceId||activeScene?.sourceId||Object.keys(sources)[0]||\'\'; const sc={id:\'sc_\'+Date.now(),name:(sources[sid]?.label||\'Scene\')+\' \'+(scenes.length+1),sourceId:sid,corners:defaultCorners(),zoom:1,rotation:0}; scenes.push(sc); activeScene=sc; renderScenes(); loadEditor(); }\nfunction defaultCorners(){ return [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}]; }\nfunc',
'tion switchScene(id){ activeScene=scenes.find(s=>s.id===id); _selLayer=(activeScene&&activeScene.layers&&activeScene.layers[0])?activeScene.layers[0].id:null; renderScenes(); loadEditor(); document.getElementById(\'srcLabel\').textContent=(sources[activeScene?.sourceId]?.label||\'Source\'); drawCorners(); _updateCropOverlay(); renderLayerList(); drawLayout(); const isWb=activeScene&&sources[activeScene.sourceId]?.type===\'whiteboard\'; document.getElementById(\'wbToolbar\').style.display=isWb?\'',
'flex\':\'none\'; if(isWb){ wbSetTool(wbTool); _wbUpdatePageNav(sources[activeScene.sourceId]); } }\nfunction renderScenes(){\n  document.getElementById(\'sceneList\').innerHTML = scenes.map(s => {\n    const ic = {video:\'🎥\',screen:\'🖥\',whiteboard:\'🖍\',image:\'📄\'}[sources[s.sourceId]?.type] || \'🎬\';\n    return JM.SceneTile({\n      thumb: ic,\n      name: s.name || \'Scene\',\n      active: activeScene?.id === s.id,\n      onClick: `switchScene(\'${s.id}\')`,\n      actions: [{ label:',
' \'×\', onClick: `delScene(\'${s.id}\')` }]\n    });\n  }).join(\'\') || \'<div class="hint">No scenes yet.</div>\';\n}\nfunction delScene(id){ scenes=scenes.filter(s=>s.id!==id); if(activeScene?.id===id) activeScene=scenes[0]||null; renderScenes(); loadEditor(); }\nfunction updatePreset(k,v){ if(activeScene){ activeScene[k]=v; if(k===\'name\') renderScenes(); } }\nfunction loadEditor(){ const tb=document.getElementById(\'wbToolbar\'); if(!activeScene){ if(tb) tb.style.display=\'none\'; return; ',
'} document.getElementById(\'presetName\').value=activeScene.name||\'\'; document.getElementById(\'zoom\').value=activeScene.zoom||1; document.getElementById(\'rot\').value=activeScene.rotation||0; drawCorners(); const srcType=sources[activeScene.sourceId]?.type; if(tb) tb.style.display=srcType===\'whiteboard\'?\'flex\':\'none\'; }\nfunction resetCorners(){ if(activeScene){ activeScene.corners=defaultCorners(); drawCorners(); } }\n\n// ── Multi-element LAYOUT (compositor) ────────────────────────',
'───────────\n// A scene with layers[] renders as a COMPOSITE — each element drawn at its own\n// rect (normalized 0–1). A scene with no layers keeps the single-source +\n// perspective-correction mode, so this is fully backward compatible.\nlet _layoutMode=false, _selLayer=null;\nfunction _esc(s){ return String(s==null?\'\':s).replace(/[<>&"]/g,c=>({\'<\':\'&lt;\',\'>\':\'&gt;\',\'&\':\'&amp;\',\'"\':\'&quot;\'}[c])); }\nfunction _layers(){ if(activeScene && !activeScene.layers) activeScene.laye',
'rs=[]; return activeScene? activeScene.layers : []; }\nfunction addLayer(sourceId){\n  if(!sourceId) return;\n  if(!activeScene){ addScene(sourceId); }\n  const ls=_layers();\n  // First element fills the frame; extras drop in as a corner picture-in-picture.\n  const r = ls.length===0 ? {x:0,y:0,w:1,h:1} : {x:0.62,y:0.62,w:0.34,h:0.34};\n  const ly={id:\'ly_\'+(ls.length)+\'_\'+Math.floor(performance.now()), sourceId, x:r.x,y:r.y,w:r.w,h:r.h};\n  ls.push(ly); _selLayer=ly.id; renderScenes(); ren',
'derLayerList(); if(_layoutMode) drawLayout();\n}\nfunction delLayer(id){ const ls=_layers(); const i=ls.findIndex(l=>l.id===id); if(i>=0) ls.splice(i,1); if(_selLayer===id) _selLayer=ls[0]?ls[0].id:null; renderScenes(); renderLayerList(); drawLayout(); }\nfunction selectLayer(id){ _selLayer=id; renderLayerList(); drawLayout(); }\nfunction layerUp(id){ const ls=_layers(); const i=ls.findIndex(l=>l.id===id); if(i>=0 && i<ls.length-1){ const t=ls[i]; ls[i]=ls[i+1]; ls[i+1]=t; renderLayerList(); } }',
'\nfunction renderLayerList(){\n  const box=document.getElementById(\'layerList\'); if(!box) return;\n  const ls=_layers();\n  const ICO={video:\'🎥\',screen:\'🖥\',whiteboard:\'🖍\',image:\'📄\'};\n  const avail=Object.entries(sources);\n  const addBtns=avail.length\n    ? avail.map(([id,s])=>`<button class="btn" style="width:100%;margin-bottom:4px;font-size:12px" onclick="addLayer(\'${id}\')">+ ${ICO[s.type]||\'🎬\'} ${_esc(s.label||\'Source\')}</button>`).join(\'\')\n    : \'<div class="hint">',
'Add a source above first.</div>\';\n  const rows=ls.length\n    ? `<div style="font-size:11px;color:var(--mut);margin:4px 0">Elements (front-most last · drag on preview):</div>`+ls.map((l,i)=>{ const s=sources[l.sourceId]; const ic=ICO[s&&s.type]||\'🎬\'; return `<div class="scene ${_selLayer===l.id?\'active\':\'\'}" onclick="selectLayer(\'${l.id}\')"><div class="thumb">${ic}</div><div class="nm">${_esc(s&&s.label||\'Layer\')} <span style="color:var(--mut);font-size:10px">${i+1}</span></div><but',
'ton class="btn" style="padding:3px 6px" title="Bring forward" onclick="event.stopPropagation();layerUp(\'${l.id}\')">▲</button><button class="btn" style="padding:3px 6px" onclick="event.stopPropagation();delLayer(\'${l.id}\')">×</button></div>`; }).join(\'\')\n    : \'\';\n  box.innerHTML=rows+`<div style="font-size:11px;color:var(--mut);margin:8px 0 4px">Add element to layout:</div>`+addBtns;\n}\nfunction applyLayoutPreset(kind){\n  if(!activeScene) return;\n  const ids=Object.keys(sources); if',
'(!ids.length){ alert(\'Add at least one source first (camera, screen, whiteboard, image…).\'); return; }\n  const mk=(sourceId,x,y,w,h)=>({id:\'ly_\'+kind+ids.indexOf(sourceId)+\'_\'+Math.floor(performance.now()+Math.random()*1000),sourceId,x,y,w,h});\n  if(kind===\'pip\'){\n    const cam=ids.find(id=>sources[id].type===\'video\')||ids[0];\n    const base=ids.find(id=>id!==cam)||cam;\n    activeScene.layers=[ mk(base,0,0,1,1), mk(cam,0.70,0.68,0.28,0.28) ];\n  } else {\n    const a=ids[0], b=ids',
'[1]||ids[0];\n    activeScene.layers=[ mk(a,0,0.1,0.5,0.8), mk(b,0.5,0.1,0.5,0.8) ];\n  }\n  _selLayer=activeScene.layers[0].id; renderScenes(); renderLayerList(); if(_layoutMode) drawLayout();\n}\nfunction toggleLayout(){\n  _layoutMode=!_layoutMode;\n  document.getElementById(\'btnLayout\').classList.toggle(\'on\',_layoutMode);\n  // Layout and corner-adjust are mutually exclusive editing modes.\n  if(_layoutMode && _adjustMode){ _adjustMode=false; document.getElementById(\'btnAdjust\').classL',
'ist.remove(\'on\'); document.getElementById(\'adjustHint\').style.display=\'none\'; drawCorners(); }\n  if(_layoutMode && !_layers().length) document.getElementById(\'layoutHint\').innerHTML=\'Add elements below, then drag each box to move and the purple corner to resize.\';\n  drawLayout();\n}\nfunction drawLayout(){\n  const wrap=document.getElementById(\'outWrap\'); wrap.querySelectorAll(\'.lybox,.lyhandle\').forEach(e=>e.remove());\n  if(!_layoutMode || !activeScene || !_layers().length) ret',
'urn;\n  const rr=outRect();\n  _layers().forEach(l=>{\n    const sel=_selLayer===l.id;\n    const box=document.createElement(\'div\'); box.className=\'lybox\';\n    box.style.cssText=`position:absolute;border:2px solid ${sel?\'var(--jm-primary,#7c3aed)\':\'rgba(255,255,255,.55)\'};border-radius:4px;cursor:move;z-index:7;${sel?\'box-shadow:0 0 0 1px #fff\':\'\'}`;\n    const place=()=>{ box.style.left=(l.x*rr.width)+\'px\'; box.style.top=(l.y*rr.height)+\'px\'; box.style.width=(l.w*rr.width)+\'px\'; box.style.heig',
'ht=(l.h*rr.height)+\'px\'; };\n    place();\n    box.addEventListener(\'pointerdown\',(e)=>{ e.preventDefault(); e.stopPropagation(); _selLayer=l.id; renderLayerList(); drawLayout(); box.setPointerCapture?.(e.pointerId); let px=e.clientX,py=e.clientY;\n      const mv=(ev)=>{ const dx=(ev.clientX-px)/rr.width, dy=(ev.clientY-py)/rr.height; px=ev.clientX; py=ev.clientY; l.x=Math.max(0,Math.min(1-l.w,l.x+dx)); l.y=Math.max(0,Math.min(1-l.h,l.y+dy)); place(); _placeHandles(); };\n      const up=()=>',
'{ window.removeEventListener(\'pointermove\',mv); window.removeEventListener(\'pointerup\',up); };\n      window.addEventListener(\'pointermove\',mv); window.addEventListener(\'pointerup\',up); });\n    wrap.appendChild(box);\n    if(sel){\n      const rs=document.createElement(\'div\'); rs.className=\'lyhandle\';\n      rs.style.cssText=\'position:absolute;width:20px;height:20px;background:var(--jm-primary,#7c3aed);border:2px solid #fff;border-radius:3px;cursor:nwse-resize;z-index:8;touch-action:none\';\n      r',
's._layer=l;\n      rs.addEventListener(\'pointerdown\',(e)=>{ e.preventDefault(); e.stopPropagation(); rs.setPointerCapture?.(e.pointerId);\n        const mv=(ev)=>{ const nx=(ev.clientX-rr.left)/rr.width, ny=(ev.clientY-rr.top)/rr.height; l.w=Math.max(0.08,Math.min(1-l.x,nx-l.x)); l.h=Math.max(0.08,Math.min(1-l.y,ny-l.y)); place(); _placeHandles(); };\n        const up=()=>{ window.removeEventListener(\'pointermove\',mv); window.removeEventListener(\'pointerup\',up); };\n        window.addEvent',
'Listener(\'pointermove\',mv); window.addEventListener(\'pointerup\',up); });\n      wrap.appendChild(rs);\n    }\n  });\n  _placeHandles();\n}\nfunction _placeHandles(){ const rr=outRect(); const wrap=document.getElementById(\'outWrap\'); wrap.querySelectorAll(\'.lyhandle\').forEach(rs=>{ const l=rs._layer; if(!l) return; rs.style.left=((l.x+l.w)*rr.width-10)+\'px\'; rs.style.top=((l.y+l.h)*rr.height-10)+\'px\'; }); }\nwindow.addEventListener(\'resize\', drawLayout);\n// Composite renderer — dra',
'ws every layer at its rect (back-to-front).\nfunction renderComposite(scene){\n  for(const l of scene.layers){ const s=sources[l.sourceId]; if(!srcReady(s)) continue;\n    try{ octx.drawImage(s.el, l.x*out.width, l.y*out.height, l.w*out.width, l.h*out.height); }catch(e){}\n  }\n}\n\n// ── Corner adjustment on the BIG preview ───────────────────────────────\nfunction toggleAdjust(){ _adjustMode=!_adjustMode; document.getElementById(\'btnAdjust\').classList.toggle(\'on\',_adjustMode); document.get',
'ElementById(\'adjustHint\').style.display=_adjustMode?\'inline\':\'none\'; drawCorners(); }\nfunction outRect(){ return out.getBoundingClientRect(); }\nfunction _fmt(){ const [w,h]=(document.getElementById(\'fmtSelect\')?.value||\'1280x720\').split(\'x\').map(Number); return {w,h}; }\nfunction _ptsStr(){ const {w,h}=_fmt(); return activeScene.corners.map(c=>`${c.x*w},${c.y*h}`).join(\' \'); }\nfunction _redrawFrame(){ const svg=document.getElementById(\'cornerSvg\'); if(!svg||!activeScene) retur',
'n; const {w,h}=_fmt();\n  const pts=_ptsStr();\n  // Dim everything OUTSIDE the selected quad (evenodd) so the crop frame is obvious.\n  svg.innerHTML=`<path d="M0,0 H${w} V${h} H0 Z M${activeScene.corners.map(c=>(c.x*w)+\',\'+(c.y*h)).join(\' L\')} Z" fill="rgba(0,0,0,.5)" fill-rule="evenodd"/>\n    <polygon points="${pts}" fill="none" stroke="#fff" stroke-width="2"/>\n    <polygon points="${pts}" fill="none" stroke="var(--jm-primary,#7c3aed)" stroke-width="4" stroke-dasharray="10 6"/>`;\n}\nfunction drawCorners',
'(){\n  const wrap=document.getElementById(\'outWrap\'); wrap.querySelectorAll(\'.corner,.movehandle\').forEach(c=>c.remove());\n  const svg=document.getElementById(\'cornerSvg\'); svg.innerHTML=\'\';\n  if(!_adjustMode||!activeScene){ svg.style.display=\'none\'; return; }\n  const {w,h}=_fmt(); svg.setAttribute(\'viewBox\',\'0 0 \'+w+\' \'+h);\n  svg.style.display=\'block\'; _redrawFrame();\n  const place=(el,c)=>{ const rr=outRect(); el.style.left=(c.x*rr.width)+\'px\'; el.style.top=(c.y*rr.hei',
'ght)+\'px\'; };\n  // 4 corner handles\n  activeScene.corners.forEach((c)=>{\n    const el=document.createElement(\'div\'); el.className=\'corner\'; place(el,c);\n    el.addEventListener(\'pointerdown\',(e)=>{ e.preventDefault(); el.setPointerCapture?.(e.pointerId);\n      const mv=(ev)=>{ const rr=outRect(); c.x=Math.min(1,Math.max(0,(ev.clientX-rr.left)/rr.width)); c.y=Math.min(1,Math.max(0,(ev.clientY-rr.top)/rr.height)); place(el,c); _redrawFrame(); };\n      const up=()=>{ window.removeEven',
'tListener(\'pointermove\',mv); window.removeEventListener(\'pointerup\',up); };\n      window.addEventListener(\'pointermove\',mv); window.addEventListener(\'pointerup\',up); });\n    wrap.appendChild(el);\n  });\n  // Center MOVE handle — drag the whole crop frame.\n  const cx=activeScene.corners.reduce((s,c)=>s+c.x,0)/4, cy=activeScene.corners.reduce((s,c)=>s+c.y,0)/4;\n  const mh=document.createElement(\'div\'); mh.className=\'corner movehandle\';\n  mh.style.background=\'#fff\'; mh.style.wid',
'th=\'30px\'; mh.style.height=\'30px\'; mh.style.display=\'flex\'; mh.style.alignItems=\'center\'; mh.style.justifyContent=\'center\'; mh.style.color=\'var(--jm-primary,#7c3aed)\'; mh.style.fontSize=\'16px\'; mh.textContent=\'✥\';\n  place(mh,{x:cx,y:cy});\n  mh.addEventListener(\'pointerdown\',(e)=>{ e.preventDefault(); mh.setPointerCapture?.(e.pointerId); const rr0=outRect(); let lx=e.clientX, ly=e.clientY;\n    const mv=(ev)=>{ const dx=(ev.clientX-lx)/rr0.width, dy=(ev.clientY-ly)/rr0.height; lx=ev.clientX; ly',
'=ev.clientY;\n      // clamp so the whole quad stays in-frame\n      const minX=Math.min(...activeScene.corners.map(c=>c.x)), maxX=Math.max(...activeScene.corners.map(c=>c.x));\n      const minY=Math.min(...activeScene.corners.map(c=>c.y)), maxY=Math.max(...activeScene.corners.map(c=>c.y));\n      const ddx=Math.max(-minX,Math.min(1-maxX,dx)), ddy=Math.max(-minY,Math.min(1-maxY,dy));\n      activeScene.corners.forEach(c=>{ c.x+=ddx; c.y+=ddy; });\n      wrap.querySelectorAll(\'.corner:not(.moveh',
'andle)\').forEach((el,i)=>place(el,activeScene.corners[i]));\n      const c2={x:activeScene.corners.reduce((s,c)=>s+c.x,0)/4,y:activeScene.corners.reduce((s,c)=>s+c.y,0)/4}; place(mh,c2); _redrawFrame(); };\n    const up=()=>{ window.removeEventListener(\'pointermove\',mv); window.removeEventListener(\'pointerup\',up); };\n    window.addEventListener(\'pointermove\',mv); window.addEventListener(\'pointerup\',up); });\n  wrap.appendChild(mh);\n}\n\n// ── Format names for badge + toast ───────────',
'──────────────────────────\nconst FMT_LABELS={\n  \'1280x720\':\'16:9 · 720p\',\n  \'1920x1080\':\'16:9 · 1080p\',\n  \'1080x1920\':\'9:16 · Portrait\',\n  \'1080x1080\':\'1:1 · Square\',\n  \'960x720\':\'4:3 · Classic\'\n};\nlet _pendingFmt=null, _arCropBox={x:0.1,y:0.1,w:0.8,h:0.8};\n\nfunction _applyFormat(v){\n  const sel=document.getElementById(\'fmtSelect\'); if(sel&&sel.value!==v) sel.value=v;\n  const [w,h]=v.split(\'x\').map(Number); out.width=w; out.height=h;\n  if(glCanvas){ glCanvas.',
'width=w; glCanvas.height=h; }\n  out.style.aspectRatio=w+\' / \'+h; out.style.height=\'auto\';\n  const svg=document.getElementById(\'cornerSvg\'); if(svg) svg.setAttribute(\'viewBox\',\'0 0 \'+w+\' \'+h);\n  const badge=document.querySelector(\'.stage .badge+.badge\'); if(badge) badge.textContent=w+\'×\'+h;\n  const fb=document.getElementById(\'fmtBadge\'); if(fb) fb.textContent=FMT_LABELS[v]||v;\n  resetCorners();\n  showToast(\'Switched to \'+(FMT_LABELS[v]||v));\n  if(activeScene) drawCorner',
's();\n}\n\nconst AR_PLATFORM_HINTS={\n  \'1920x1080\':\'📺 16:9 — YouTube, Zoom, Google Meet, Teams, projectors\',\n  \'1280x720\' :\'📺 16:9 HD — YouTube, streaming, webinar recording\',\n  \'1080x1920\':\'📱 9:16 Vertical — Instagram Reels, TikTok, YouTube Shorts\',\n  \'1080x1080\':\'⬜ 1:1 Square — Instagram feed, Facebook posts\',\n  \'960x720\'  :\'📚 4:3 Classic — older projectors, some LMS platforms\'\n};\nconst AR_RATIO_LABEL={\n  \'1920x1080\':\'16:9\',\'1280x720\':\'16:9 HD\',\'1080x19',
'20\':\'9:16 Portrait\',\n  \'720x1280\':\'9:16 Portrait\',\'1080x1080\':\'1:1\',\'960x720\':\'4:3\'\n};\n\nfunction _arSetChips(fmt){\n  document.querySelectorAll(\'[data-arq]\').forEach(b=>{\n    const active=b.dataset.arq===fmt;\n    b.style.background=active?\'var(--jm-primary,#7c3aed)\':\'transparent\';\n    b.style.color=active?\'#fff\':\'#ccc\';\n    b.style.borderColor=active?\'var(--jm-primary,#7c3aed)\':\'#444\';\n  });\n  const lbl=document.getElementById(\'arCropLabel\');\n  if(lbl) lbl.textContent=(AR_PLATFORM_HINTS[fm',
't]||fmt);\n  const hint=document.getElementById(\'arPlatformHint\');\n  if(hint) hint.innerHTML=AR_PLATFORM_HINTS[fmt]||fmt;\n  const boxLbl=document.getElementById(\'arCropBoxLabel\');\n  if(boxLbl) boxLbl.textContent=AR_RATIO_LABEL[fmt]||fmt;\n}\n\nfunction arQuickSwitch(fmt){\n  // Stay in crop modal but re-init the crop box for the new format\n  _pendingFmt=fmt;\n  const [tw,th]=fmt.split(\'x\').map(Number);\n  const targetAR=tw/th;\n  const preview=document.getElementById(\'arCropPreview\')',
';\n  const srcAR=preview.width/preview.height||1;\n  let bw,bh;\n  if(targetAR>=srcAR){bw=1;bh=srcAR/targetAR;}else{bh=1;bw=targetAR/srcAR;}\n  _arCropBox={x:(1-bw)/2,y:(1-bh)/2,w:bw,h:bh};\n  _arSetChips(fmt);\n  _arUpdateBox(targetAR);\n  _arBindDrag(targetAR);\n}\n\nfunction openArCropSelector(newFmt){\n  _pendingFmt=newFmt;\n  const [tw,th]=newFmt.split(\'x\').map(Number);\n  const targetAR=tw/th;\n  const preview=document.getElementById(\'arCropPreview\');\n  // Snapshot the RAW source so r',
'e-selecting always shows the full original frame\n  const s=activeScene&&sources[activeScene.sourceId];\n  const srcEl=s?s.el:null;\n  const rawW=(srcEl&&(srcEl.videoWidth||srcEl.width))||out.width;\n  const rawH=(srcEl&&(srcEl.videoHeight||srcEl.height))||out.height;\n  preview.width=rawW; preview.height=rawH;\n  try{\n    const pc=preview.getContext(\'2d\');\n    pc.fillStyle=\'#222\'; pc.fillRect(0,0,rawW,rawH);\n    if(srcEl) pc.drawImage(srcEl,0,0,rawW,rawH);\n  }catch(e){}\n  const srcAR=r',
'awW/rawH||1;\n  let bw,bh;\n  if(targetAR>=srcAR){bw=1;bh=srcAR/targetAR;}else{bh=1;bw=targetAR/srcAR;}\n  _arCropBox={x:(1-bw)/2,y:(1-bh)/2,w:bw,h:bh};\n  _arSetChips(newFmt);\n  document.getElementById(\'arCropModal\').style.display=\'flex\';\n  let _tries=0;\n  function _waitLayout(){\n    if(preview.offsetWidth>0||_tries++>30){_arUpdateBox(targetAR);_arBindDrag(targetAR);}\n    else requestAnimationFrame(_waitLayout);\n  }\n  requestAnimationFrame(_waitLayout);\n}\n\nfunction _arUpdateBox(ar',
'){\n  const wrap=document.getElementById(\'arCropWrap\');\n  const box=document.getElementById(\'arCropBox\');\n  if(!wrap||!box) return;\n  // Use wrap dimensions — the canvas CSS-scales inside it\n  const pw=wrap.offsetWidth, ph=wrap.offsetHeight;\n  if(!pw||!ph) return;\n  const px=_arCropBox.x*pw, py=_arCropBox.y*ph;\n  const bw=_arCropBox.w*pw, bh=_arCropBox.h*ph;\n  box.style.left=px+\'px\'; box.style.top=py+\'px\';\n  box.style.width=bw+\'px\'; box.style.height=bh+\'px\';\n  const t=docum',
'ent.getElementById(\'arcDimT\'),b=document.getElementById(\'arcDimB\');\n  const l=document.getElementById(\'arcDimL\'),r=document.getElementById(\'arcDimR\');\n  if(t) t.style.height=py+\'px\';\n  if(b){b.style.top=(py+bh)+\'px\';b.style.height=(ph-py-bh)+\'px\';}\n  if(l){l.style.top=py+\'px\';l.style.height=bh+\'px\';l.style.width=px+\'px\';}\n  if(r){r.style.top=py+\'px\';r.style.height=bh+\'px\';r.style.left=(px+bw)+\'px\';r.style.width=(pw-px-bw)+\'px\';}\n}\n\nfunction _arBindDrag(targetA',
'R){\n  const wrap=document.getElementById(\'arCropWrap\');\n  const box=document.getElementById(\'arCropBox\');\n  const preview=document.getElementById(\'arCropPreview\');\n  if(!wrap||!box) return;\n  // targetAR is output W/H ratio; _arCropBox is in normalized SOURCE coords.\n  // In source-normalized space the crop box ratio nw/nh = outputAR/sourceAR.\n  const srcAR=(preview&&preview.height)?preview.width/preview.height:1;\n  const normAR=targetAR/srcAR;  // crop box nw/nh constraint in sour',
'ce coords\n  let drag=null;\n  box.onpointerdown=e=>{\n    if(e.target!==box) return;\n    e.preventDefault();\n    drag={sx:e.clientX,sy:e.clientY,ox:_arCropBox.x,oy:_arCropBox.y};\n    box.setPointerCapture(e.pointerId);\n  };\n  box.onpointermove=e=>{\n    if(!drag) return;\n    const pw=wrap.offsetWidth, ph=wrap.offsetHeight;\n    const dx=(e.clientX-drag.sx)/pw, dy=(e.clientY-drag.sy)/ph;\n    _arCropBox.x=Math.max(0,Math.min(1-_arCropBox.w,drag.ox+dx));\n    _arCropBox.y=Math.max(0,Math.mi',
'n(1-_arCropBox.h,drag.oy+dy));\n    _arUpdateBox(targetAR);\n  };\n  box.onpointerup=()=>{drag=null;};\n  document.querySelectorAll(\'.arc-h\').forEach(h=>{\n    let rd=null;\n    h.onpointerdown=e=>{\n      e.preventDefault(); e.stopPropagation();\n      rd={sx:e.clientX,sy:e.clientY,box:{..._arCropBox},id:h.id};\n      h.setPointerCapture(e.pointerId);\n    };\n    h.onpointermove=e=>{\n      if(!rd) return;\n      const pw=wrap.offsetWidth, ph=wrap.offsetHeight;\n      const dx=(e.clientX-rd.',
'sx)/pw, dy=(e.clientY-rd.sy)/ph;\n      let {x,y,w,h:bh2}=rd.box;\n      let nw,nh;\n      // normAR = nw/nh ratio for the crop box in source-normalized coords\n      if(rd.id===\'arc-tl\'){nw=Math.min(normAR,Math.max(0.05,w-dx));nh=nw/normAR;_arCropBox={x:x+w-nw,y:y+bh2-nh,w:nw,h:nh};}\n      else if(rd.id===\'arc-tr\'){nw=Math.min(normAR,Math.max(0.05,w+dx));nh=nw/normAR;_arCropBox={x,y:y+bh2-nh,w:nw,h:nh};}\n      else if(rd.id===\'arc-bl\'){nw=Math.min(normAR,Math.max(0.05,w-dx));nh=nw/normA',
'R;_arCropBox={x:x+w-nw,y,w:nw,h:nh};}\n      else{nw=Math.min(normAR,Math.max(0.05,w+dx));nh=nw/normAR;_arCropBox={x,y,w:nw,h:nh};}\n      _arCropBox.x=Math.max(0,Math.min(1-_arCropBox.w,_arCropBox.x));\n      _arCropBox.y=Math.max(0,Math.min(1-_arCropBox.h,_arCropBox.y));\n      _arUpdateBox(targetAR);\n    };\n    h.onpointerup=()=>{rd=null;};\n  });\n}\n\nfunction applyArCrop(){\n  _srcCrop={x:_arCropBox.x,y:_arCropBox.y,w:_arCropBox.w,h:_arCropBox.h};\n  _srcCropMode=true;\n  _applyFormat(_p',
'endingFmt);\n  document.getElementById(\'arCropModal\').style.display=\'none\';\n  const rb=document.getElementById(\'btnRecrop\'); if(rb) rb.style.display=\'inline-flex\';\n  showToast(\'Crop applied — use corner handles to refine perspective\');\n}\n\nfunction applyArCropFull(){\n  _srcCropMode=false;\n  _applyFormat(_pendingFmt);\n  document.getElementById(\'arCropModal\').style.display=\'none\';\n  const rb=document.getElementById(\'btnRecrop\'); if(rb) rb.style.display=\'none\';\n}\n\nfunct',
'ion cancelArCrop(){\n  document.getElementById(\'arCropModal\').style.display=\'none\';\n  _pendingFmt=null;\n}\n\nfunction setFormat(v){\n  if(activeScene&&sources[activeScene.sourceId]){\n    openArCropSelector(v);\n  } else {\n    _applyFormat(v);\n  }\n}\nwindow.addEventListener(\'resize\', drawCorners);\nfunction loadBrandLogo(input){ const f=input.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>brandImg=im; im.src=r.result; }; r.readA',
'sDataURL(f); }\n\n// ── Whiteboard tools ───────────────────────────────────────────────────\nlet wbDraw=false, wbLast=null, wbStart=null;\nlet wbTool=\'pen\', wbColor=\'#1a1a25\', wbSize=4, wbBg=\'white\';\nlet wbSnap=null; // snapshot before shape preview\n\nfunction _wbS(){ const s=activeScene&&sources[activeScene.sourceId]; return s&&s.type===\'whiteboard\'?s:null; }\nfunction wbPt(e){ const r=outRect(); const s=_wbS(); const cw=s?s.el.width:out.width; const ch=s?s.el.height:out.height; retu',
'rn {x:(e.clientX-r.left)/r.width*cw, y:(e.clientY-r.top)/r.height*ch}; }\n\n// Draw whiteboard background pattern\nfunction wbDrawBg(s, bg){\n  const ctx=s.ctx, W=s.el.width, H=s.el.height;\n  if(bg===\'white\'){ ctx.fillStyle=\'#ffffff\'; ctx.fillRect(0,0,W,H); }\n  else if(bg===\'custom\'){ ctx.fillStyle=_wbCustomBgColor||\'#ffffff\'; ctx.fillRect(0,0,W,H); }\n  else if(bg===\'black\'){ ctx.fillStyle=\'#1a1a2e\'; ctx.fillRect(0,0,W,H); }\n  else if(bg===\'grid\'){\n    ctx.fillStyle=\'#ffffff',
'; ctx.fillRect(0,0,W,H);\n    ctx.strokeStyle=\'#d0d0e0\'; ctx.lineWidth=1;\n    for(let x=0;x<=W;x+=40){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }\n    for(let y=0;y<=H;y+=40){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }\n  } else if(bg===\'dotgrid\'){\n    ctx.fillStyle=\'#ffffff\'; ctx.fillRect(0,0,W,H);\n    ctx.fillStyle=\'#b0b0c8\';\n    for(let x=0;x<=W;x+=40) for(let y=0;y<=H;y+=40){ ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill(); }\n  } ',
'else if(bg===\'graph\'){\n    ctx.fillStyle=\'#f0f8ff\'; ctx.fillRect(0,0,W,H);\n    // minor lines\n    ctx.strokeStyle=\'#c8ddf0\'; ctx.lineWidth=0.5;\n    for(let x=0;x<=W;x+=20){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }\n    for(let y=0;y<=H;y+=20){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }\n    // major lines\n    ctx.strokeStyle=\'#8ab4d4\'; ctx.lineWidth=1;\n    for(let x=0;x<=W;x+=100){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.strok',
'e(); }\n    for(let y=0;y<=H;y+=100){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }\n  } else if(bg===\'lines\'){\n    ctx.fillStyle=\'#fffef0\'; ctx.fillRect(0,0,W,H);\n    ctx.strokeStyle=\'#c0c8e0\'; ctx.lineWidth=1;\n    for(let y=60;y<=H;y+=40){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }\n    ctx.strokeStyle=\'#f0a0a0\'; ctx.lineWidth=1.5;\n    ctx.beginPath();ctx.moveTo(80,0);ctx.lineTo(80,H);ctx.stroke();\n  }\n}\n\nfunction wbSetBg(bg){\n  const s=_',
'wbS(); if(!s) return;\n  wbBg=bg;\n  wbDrawBg(s,bg);\n  document.querySelectorAll(\'.wb-bg-btn\').forEach(b=>b.classList.toggle(\'on\',b.dataset.bg===bg));\n}\n\nfunction wbClear(){\n  const s=_wbS(); if(!s) return;\n  wbDrawBg(s,wbBg);\n}\n\nfunction wbUndo(){\n  const s=_wbS(); if(!s||!s.undoStack||!s.undoStack.length) return;\n  if(!s.redoStack) s.redoStack=[];\n  s.redoStack.push(s.ctx.getImageData(0,0,s.el.width,s.el.height));\n  s.ctx.putImageData(s.undoStack.pop(),0,0);\n}\n\nfunction wbR',
'edo(){\n  const s=_wbS(); if(!s||!s.redoStack||!s.redoStack.length) return;\n  if(!s.undoStack) s.undoStack=[];\n  s.undoStack.push(s.ctx.getImageData(0,0,s.el.width,s.el.height));\n  s.ctx.putImageData(s.redoStack.pop(),0,0);\n}\n\nfunction _wbPushUndo(){\n  const s=_wbS(); if(!s) return;\n  if(!s.undoStack) s.undoStack=[];\n  if(s.undoStack.length>30) s.undoStack.shift();\n  s.undoStack.push(s.ctx.getImageData(0,0,s.el.width,s.el.height));\n  s.redoStack=[];  // any new draw clears redo histor',
'y\n}\n\nfunction wbSetTool(t){\n  wbTool=t;\n  document.querySelectorAll(\'.wb-tool\').forEach(b=>b.classList.toggle(\'on\',b.dataset.tool===t));\n  out.style.cursor=t===\'eraser\'?\'cell\':t===\'text\'?\'text\':\'crosshair\';\n  if(t!==\'text\') document.getElementById(\'wbTextWindow\').style.display=\'none\';\n}\nfunction wbToggleFillMode(){\n  wbFillMode=!wbFillMode;\n  const btn=document.getElementById(\'wbFillToggle\');\n  if(btn){ btn.textContent=wbFillMode?\'Filled\':\'Outline\'; btn.styl',
'e.color=wbFillMode?\'#c4b5fd\':\'#9098ac\'; btn.style.borderColor=wbFillMode?\'var(--jm-primary,#7c3aed)\':\'\'; }\n}\n\n// ── Color slot system (slot 1=primary/fg, slot 2=secondary/bg-of-text) ───\nlet _wbActiveSlot=1, _wbSlot1=\'#000000\', _wbSlot2=\'#ffffff\';\nlet wbFillMode=false;\n\nfunction _wbSyncSwatches(){\n  const s1=document.getElementById(\'wbColor1Swatch\'), s2=document.getElementById(\'wbColor2Swatch\');\n  const m1=document.getElementById(\'wbC1Mini\'),       m2=document.getElementById(\'wbC2Mini',
');\n  const lbl=document.getElementById(\'wbActiveSlotLabel\');\n  const pk=document.getElementById(\'wbColorPicker\');\n  if(s1){ s1.style.background=_wbSlot1; s1.style.boxShadow=_wbActiveSlot===1?\'0 0 0 2px var(--jm-primary,#7c3aed)\':\'none\'; }\n  if(s2){ s2.style.background=_wbSlot2; s2.style.boxShadow=_wbActiveSlot===2?\'0 0 0 2px var(--jm-primary,#7c3aed)\':\'none\'; }\n  if(m1) m1.style.background=_wbSlot1;\n  if(m2) m2.style.background=_wbSlot2;\n  if(lbl) lbl.textContent=_wbActiveSlot===1?\'Primary\':\'Secondary\';\n  ',
'if(pk)  pk.value=(_wbActiveSlot===1?_wbSlot1:_wbSlot2);\n  wbColor=_wbSlot1;\n}\nfunction wbSetColor(c){ _wbSlot1=c; wbColor=c; _wbSyncSwatches(); }\nfunction wbActivateSlot(n){ _wbActiveSlot=n; _wbSyncSwatches(); }\nfunction wbSetColorSlot(c){\n  if(_wbActiveSlot===1) _wbSlot1=c; else _wbSlot2=c;\n  _wbSyncSwatches();\n}\nfunction wbSwapColors(){\n  const t=_wbSlot1; _wbSlot1=_wbSlot2; _wbSlot2=t;\n  _wbSyncSwatches();\n}\n\nfunction wbSetSize(v){ wbSize=+v; }\nfunction wbSetSizePreset(v){\n  w',
'bSize=v;\n  const r=document.getElementById(\'wbSizeRange\'); if(r) r.value=v;\n  const lbl=document.getElementById(\'wbSizeVal\'); if(lbl) lbl.textContent=v;\n}\n\n// ── Toolbar group toggle / close ─────────────────────────────────────────\nfunction wbToggleGroup(name){\n  const drop=document.getElementById(\'wbgDrop-\'+name);\n  const btn=document.getElementById(\'wbgBtn-\'+name);\n  if(!drop) return;\n  const opening=!drop.classList.contains(\'open\');\n  wbCloseGroups();\n  if(opening){\n  ',
'  drop.classList.add(\'open\');\n    if(btn) btn.classList.add(\'open\');\n    // Position fixed relative to button so it escapes overflow:hidden containers\n    const r=btn ? btn.getBoundingClientRect() : drop.getBoundingClientRect();\n    drop.style.left = r.left+\'px\';\n    const spaceBelow = window.innerHeight - r.bottom;\n    if(spaceBelow >= 240){\n      drop.style.top = r.bottom+2+\'px\';\n      drop.style.bottom = \'\';\n    } else {\n      drop.style.bottom = window.innerHeight - r.top',
' + 2 + \'px\';\n      drop.style.top = \'\';\n    }\n  }\n}\nfunction wbCloseGroups(){\n  document.querySelectorAll(\'.wbg-drop.open\').forEach(d=>d.classList.remove(\'open\'));\n  document.querySelectorAll(\'.wbg-btn.open\').forEach(b=>b.classList.remove(\'open\'));\n}\ndocument.addEventListener(\'click\',function(e){\n  if(!e.target.closest(\'#wbToolbar\')) wbCloseGroups();\n});\n\n// Shape drawing helpers\nfunction _wbDrawShape(ctx,tool,x0,y0,x1,y1,color,size,fill){\n  ctx.strokeStyle=color; ',
'ctx.fillStyle=color; ctx.lineWidth=size; ctx.lineCap=\'round\'; ctx.lineJoin=\'round\';\n  ctx.beginPath();\n  if(tool===\'line\'){ ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke(); }\n  else if(tool===\'rect\'){\n    if(fill){ ctx.fillRect(x0,y0,x1-x0,y1-y0); } else { ctx.strokeRect(x0,y0,x1-x0,y1-y0); }\n  } else if(tool===\'circle\'){\n    const rx=(x1-x0)/2, ry=(y1-y0)/2;\n    ctx.ellipse(x0+rx,y0+ry,Math.abs(rx),Math.abs(ry),0,0,Math.PI*2);\n    if(fill){ ctx.fill(); } else { ctx.stroke()',
'; }\n  } else if(tool===\'arrow\'){\n    ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();\n    const angle=Math.atan2(y1-y0,x1-x0);\n    const hs=Math.max(size*4,16);\n    ctx.beginPath();\n    ctx.moveTo(x1,y1);\n    ctx.lineTo(x1-hs*Math.cos(angle-0.4),y1-hs*Math.sin(angle-0.4));\n    ctx.lineTo(x1-hs*Math.cos(angle+0.4),y1-hs*Math.sin(angle+0.4));\n    ctx.closePath(); ctx.fill();\n  }\n}\n\n// ── Selection + Move + Resize state ─────────────────────────────────────\nlet wbSelecting=false,',
' wbSelection=null;  // rubber-band / current selection {x,y,w,h}\nlet wbClipboard=null;                     // ImageData for copy/paste\nlet wbMoving=false, wbMoveOff=null, wbMoveData=null, wbMoveBg=null;\nlet wbResizing=false, wbResizeDir=null, wbResizeData=null, wbResizeBg=null, wbResizeOrig=null;\n\nfunction _wbBgColor(){ return wbBg===\'black\'?\'#1a1a2e\': wbBg===\'custom\'?_wbCustomBgColor:\'#ffffff\'; }\nlet _wbCustomBgColor=\'#ffffff\';\n\nfunction _wbUpdateSelBox(){\n  const box=documen',
't.getElementById(\'wbSelBox\');\n  if(!wbSelection||wbSelection.w<2||wbSelection.h<2){ box.style.display=\'none\'; return; }\n  const s=_wbS(); if(!s) return;\n  const outEl=document.getElementById(\'out\');\n  const r=outEl.getBoundingClientRect();\n  const parent=outEl.parentElement;\n  const pr=parent.getBoundingClientRect();\n  const scaleX=r.width/s.el.width;\n  const scaleY=r.height/s.el.height;\n  box.style.display=\'block\';\n  box.style.left=(r.left-pr.left+wbSelection.x*scaleX)+\'px\';',
'\n  box.style.top=(r.top-pr.top+wbSelection.y*scaleY)+\'px\';\n  box.style.width=(wbSelection.w*scaleX)+\'px\';\n  box.style.height=(wbSelection.h*scaleY)+\'px\';\n}\n\nfunction wbCopy(){\n  const s=_wbS(); if(!s||!wbSelection) return;\n  const {x,y,w,h}=wbSelection; if(w<1||h<1) return;\n  wbClipboard=s.ctx.getImageData(Math.round(x),Math.round(y),Math.round(w),Math.round(h));\n}\nfunction wbCut(){\n  const s=_wbS(); if(!s||!wbSelection) return;\n  wbCopy(); _wbPushUndo();\n  const {x,y,w,h}=wb',
'Selection;\n  s.ctx.fillStyle=_wbBgColor(); s.ctx.fillRect(x,y,w,h);\n  wbSelection=null; _wbUpdateSelBox();\n}\nfunction wbPaste(){\n  const s=_wbS(); if(!s||!wbClipboard) return;\n  _wbPushUndo();\n  const ox=Math.min(s.el.width-wbClipboard.width, 40);\n  const oy=Math.min(s.el.height-wbClipboard.height, 40);\n  s.ctx.putImageData(wbClipboard, ox, oy);\n  wbSelection={x:ox,y:oy,w:wbClipboard.width,h:wbClipboard.height};\n  _wbUpdateSelBox();\n}\n\nfunction _ptInSel(p){\n  if(!wbSelection) retu',
'rn false;\n  return p.x>=wbSelection.x && p.x<=wbSelection.x+wbSelection.w &&\n         p.y>=wbSelection.y && p.y<=wbSelection.y+wbSelection.h;\n}\n\n// ── Resize handle wiring ─────────────────────────────────────────────────\n(function _bindResizeHandles(){\n  document.querySelectorAll(\'.wb-rsz\').forEach(h=>{\n    h.addEventListener(\'pointerdown\',e=>{\n      e.stopPropagation(); e.preventDefault();\n      const s=_wbS(); if(!s||!wbSelection) return;\n      wbResizeDir=h.dataset.dir;\n     ',
' wbResizeOrig={...wbSelection};\n      // extract just the selected pixels\n      wbResizeData=s.ctx.getImageData(Math.round(wbSelection.x),Math.round(wbSelection.y),\n                                       Math.round(wbSelection.w),Math.round(wbSelection.h));\n      // background snapshot WITHOUT the selection (erase it first)\n      _wbPushUndo();\n      s.ctx.fillStyle=_wbBgColor();\n      s.ctx.fillRect(wbResizeOrig.x,wbResizeOrig.y,wbResizeOrig.w,wbResizeOrig.h);\n      wbResizeBg=s.ctx.get',
'ImageData(0,0,s.el.width,s.el.height);\n      wbResizing=true;\n      h.setPointerCapture(e.pointerId);\n    });\n    h.addEventListener(\'pointermove\',e=>{\n      if(!wbResizing) return;\n      const s=_wbS(); if(!s) return;\n      const p=wbPt(e);\n      const o=wbResizeOrig;\n      let nx=o.x,ny=o.y,nw=o.w,nh=o.h;\n      if(wbResizeDir.includes(\'e\')) nw=Math.max(10,p.x-o.x);\n      if(wbResizeDir.includes(\'s\')) nh=Math.max(10,p.y-o.y);\n      if(wbResizeDir.includes(\'w\')){ nx=Math.min(',
'p.x,o.x+o.w-10); nw=o.x+o.w-nx; }\n      if(wbResizeDir.includes(\'n\')){ ny=Math.min(p.y,o.y+o.h-10); nh=o.y+o.h-ny; }\n      nw=Math.round(Math.max(10,nw)); nh=Math.round(Math.max(10,nh));\n      nx=Math.round(nx); ny=Math.round(ny);\n      // restore bg, draw scaled content\n      s.ctx.putImageData(wbResizeBg,0,0);\n      const tmp=document.createElement(\'canvas\');\n      tmp.width=wbResizeOrig.w; tmp.height=wbResizeOrig.h;\n      tmp.getContext(\'2d\').putImageData(wbResizeData,0,0);\n   ',
'   s.ctx.drawImage(tmp,nx,ny,nw,nh);\n      wbSelection={x:nx,y:ny,w:nw,h:nh};\n      _wbUpdateSelBox();\n    });\n    h.addEventListener(\'pointerup\',()=>{ wbResizing=false; });\n  });\n})();\n\n// ── Canvas pointer events ─────────────────────────────────────────────────\nout.addEventListener(\'pointerdown\',e=>{\n  const s=_wbS(); if(_adjustMode||!s) return;\n  e.preventDefault();\n  const p=wbPt(e);\n\n  if(wbTool===\'text\'){\n    // Open text input window near the click point\n    const w',
'in=document.getElementById(\'wbTextWindow\');\n    const r=outRect();\n    const screenX=r.left + p.x/((activeScene&&sources[activeScene.sourceId]?.el?.width)||out.width)*r.width;\n    const screenY=r.top  + p.y/((activeScene&&sources[activeScene.sourceId]?.el?.height)||out.height)*r.height;\n    win.style.left=Math.min(screenX, window.innerWidth-300)+\'px\';\n    win.style.top=Math.min(screenY+8, window.innerHeight-260)+\'px\';\n    win.style.display=\'block\';\n    win._canvasX=p.x; win._canva',
'sY=p.y;\n    setTimeout(()=>document.getElementById(\'wbTextInput\').focus(),60);\n    return;\n  }\n\n  if(wbTool===\'select\'){\n    // If inside existing selection → start move\n    if(wbSelection && _ptInSel(p)){\n      _wbPushUndo();\n      wbMoveData=s.ctx.getImageData(Math.round(wbSelection.x),Math.round(wbSelection.y),\n                                     Math.round(wbSelection.w),Math.round(wbSelection.h));\n      // erase selection area, snapshot the result as bg\n      s.ctx.fillStyl',
'e=_wbBgColor();\n      s.ctx.fillRect(wbSelection.x,wbSelection.y,wbSelection.w,wbSelection.h);\n      wbMoveBg=s.ctx.getImageData(0,0,s.el.width,s.el.height);\n      wbMoveOff={x:p.x-wbSelection.x, y:p.y-wbSelection.y};\n      wbMoving=true;\n    } else {\n      // Start new rubber-band selection\n      wbSelection=null; _wbUpdateSelBox();\n      wbSelecting=true; wbStart=p;\n    }\n    out.setPointerCapture(e.pointerId);\n    return;\n  }\n\n  _wbPushUndo();\n  wbDraw=true; wbLast=p; wbStart=p',
';\n  if(wbTool===\'pen\'||wbTool===\'eraser\'){\n    s.ctx.beginPath(); s.ctx.moveTo(p.x,p.y);\n  } else {\n    wbSnap=s.ctx.getImageData(0,0,s.el.width,s.el.height);\n  }\n  out.setPointerCapture(e.pointerId);\n});\n\nout.addEventListener(\'pointermove\',e=>{\n  const s=_wbS(); if(!s) return;\n\n  // Move drag\n  if(wbMoving){\n    const p=wbPt(e);\n    const nx=Math.round(p.x-wbMoveOff.x), ny=Math.round(p.y-wbMoveOff.y);\n    s.ctx.putImageData(wbMoveBg,0,0);\n    s.ctx.putImageData(wbMoveData',
',nx,ny);\n    wbSelection={x:nx,y:ny,w:wbSelection.w,h:wbSelection.h};\n    _wbUpdateSelBox(); return;\n  }\n\n  // Rubber-band selection\n  if(wbSelecting){\n    const p=wbPt(e);\n    wbSelection={x:Math.min(wbStart.x,p.x),y:Math.min(wbStart.y,p.y),\n                 w:Math.abs(p.x-wbStart.x),h:Math.abs(p.y-wbStart.y)};\n    _wbUpdateSelBox(); return;\n  }\n\n  if(!wbDraw){\n    if(wbTool===\'select\'){\n      const hp=wbPt(e);\n      out.style.cursor=(_ptInSel(hp))?\'move\':\'crosshair\';\n   ',
' } else {\n      out.style.cursor=wbTool===\'eraser\'?\'cell\':\'crosshair\';\n    }\n    return;\n  }\n  const p=wbPt(e);\n  if(wbTool===\'pen\'){\n    s.ctx.strokeStyle=wbColor; s.ctx.lineWidth=wbSize; s.ctx.lineCap=\'round\'; s.ctx.lineJoin=\'round\';\n    s.ctx.lineTo(p.x,p.y); s.ctx.stroke(); s.ctx.beginPath(); s.ctx.moveTo(p.x,p.y);\n  } else if(wbTool===\'eraser\'){\n    s.ctx.globalCompositeOperation=\'destination-out\';\n    s.ctx.beginPath(); s.ctx.arc(p.x,p.y,wbSize*3,0,Math.PI*2); s.',
'ctx.fill();\n    s.ctx.globalCompositeOperation=\'destination-over\';\n    s.ctx.fillStyle=_wbBgColor();\n    s.ctx.beginPath(); s.ctx.arc(p.x,p.y,wbSize*3,0,Math.PI*2); s.ctx.fill();\n    s.ctx.globalCompositeOperation=\'source-over\';\n  } else {\n    if(wbSnap) s.ctx.putImageData(wbSnap,0,0);\n    _wbDrawShape(s.ctx,wbTool,wbStart.x,wbStart.y,p.x,p.y,wbColor,wbSize,wbFillMode);\n  }\n  wbLast=p;\n});\n\nwindow.addEventListener(\'pointerup\',e=>{\n  if(wbMoving){ wbMoving=false; wbMoveBg=null;',
' wbMoveData=null; _wbUpdateSelBox(); return; }\n  if(wbSelecting){ wbSelecting=false; _wbUpdateSelBox(); return; }\n  if(!wbDraw) return;\n  wbDraw=false; wbSnap=null;\n  const s=_wbS(); if(!s) return;\n  if(wbTool===\'pen\'||wbTool===\'eraser\') s.ctx.beginPath();\n});\n\n// Keyboard shortcuts: Ctrl+C/X/V/Z, S=select, P=pen, E=eraser\ndocument.addEventListener(\'keydown\',e=>{\n  if(!_wbS()||e.target.tagName===\'INPUT\'||e.target.tagName===\'TEXTAREA\') return;\n  if(e.ctrlKey||e.metaKey){\n   ',
' if(e.key===\'c\'){ e.preventDefault(); wbCopy(); }\n    else if(e.key===\'x\'){ e.preventDefault(); wbCut(); }\n    else if(e.key===\'v\'){ e.preventDefault(); wbPaste(); }\n    else if(e.key===\'z\'){ e.preventDefault(); wbUndo(); }\n    else if(e.key===\'y\'){ e.preventDefault(); wbRedo(); }\n  } else {\n    if(e.key===\'s\'||e.key===\'S\') wbSetTool(\'select\');\n    else if(e.key===\'p\'||e.key===\'P\') wbSetTool(\'pen\');\n    else if(e.key===\'e\'||e.key===\'E\') wbSetTool(\'eraser\');\n ',
'   else if(e.key===\'Delete\'||e.key===\'Backspace\'){ if(wbSelection) wbCut(); }\n  }\n});\n\n// ── Insert image onto board ──────────────────────────────────────────────\nfunction wbInsertImageFile(inp){\n  const f=inp.files[0]; if(!f) return;\n  const r=new FileReader();\n  r.onload=ev=>{\n    const img=new Image();\n    img.onload=()=>{\n      const s=_wbS(); if(!s) return;\n      _wbPushUndo();\n      const maxW=s.el.width*0.45, maxH=s.el.height*0.45;\n      const scale=Math.min(1, maxW/img',
'.width, maxH/img.height);\n      const dw=Math.round(img.width*scale), dh=Math.round(img.height*scale);\n      const dx=Math.round((s.el.width-dw)/2), dy=Math.round((s.el.height-dh)/2);\n      s.ctx.drawImage(img,dx,dy,dw,dh);\n      wbSelection={x:dx,y:dy,w:dw,h:dh};\n      wbSetTool(\'select\');\n      _wbUpdateSelBox();\n    };\n    img.src=ev.target.result;\n  };\n  r.readAsDataURL(f);\n  inp.value=\'\';\n}\n\n// ── Document reference panel (fixed overlay, draggable) ──────────────────\nlet ',
'_wbDocPages=[], _wbDocPageIdx=0;\nfunction wbOpenDocPanel(inp){\n  const f=inp.files[0]; if(!f) return;\n  const panel=document.getElementById(\'wbDocPanel\');\n  const imgEl=document.getElementById(\'wbDocImg\');\n  const pdfEl=document.getElementById(\'wbDocPdf\');\n  const noImg=document.getElementById(\'wbDocNoImg\');\n  const addBtn=document.getElementById(\'wbDocAddToBoard\');\n  function _show(){\n    panel.style.display=\'block\';\n    if(!panel._dragged){ panel.style.right=\'16px\'; pan',
'el.style.top=\'70px\'; panel.style.left=\'\'; }\n    if(noImg) noImg.style.display=\'none\';\n    if(addBtn) addBtn.style.display=\'inline-block\';\n  }\n  if(f.type===\'application/pdf\'||f.name.toLowerCase().endsWith(\'.pdf\')){\n    // Use object URL for PDF in iframe\n    const url=URL.createObjectURL(f);\n    if(imgEl){ imgEl.style.display=\'none\'; imgEl.src=\'\'; }\n    if(pdfEl){ pdfEl.src=url; pdfEl.style.display=\'block\'; }\n    _wbDocPages=[]; _wbDocPageIdx=0;\n    document.getElemen',
'tById(\'wbDocPageNum\').textContent=\'PDF\';\n    _show();\n  } else {\n    // Image\n    const r=new FileReader();\n    r.onload=ev=>{\n      const dataUrl=ev.target.result;\n      _wbDocPages=[dataUrl]; _wbDocPageIdx=0;\n      if(pdfEl){ pdfEl.style.display=\'none\'; pdfEl.src=\'\'; }\n      if(imgEl){ imgEl.src=dataUrl; imgEl.style.display=\'block\'; }\n      document.getElementById(\'wbDocPageNum\').textContent=\'1/1\';\n      _show();\n    };\n    r.readAsDataURL(f);\n  }\n  inp.value=\'\';',
'\n}\n\nfunction wbOpenWordPanel(inp){\n  const f=inp.files[0]; if(!f) return;\n  const panel=document.getElementById(\'wbDocPanel\');\n  const imgEl=document.getElementById(\'wbDocImg\');\n  const pdfEl=document.getElementById(\'wbDocPdf\');\n  const noImg=document.getElementById(\'wbDocNoImg\');\n  const addBtn=document.getElementById(\'wbDocAddToBoard\');\n  if(pdfEl){ pdfEl.style.display=\'none\'; pdfEl.src=\'\'; }\n  if(imgEl){ imgEl.style.display=\'none\'; imgEl.src=\'\'; }\n  // For text f',
'iles, read and show as text; for .doc/.docx, show download link\n  const r=new FileReader();\n  r.onload=ev=>{\n    const txt=ev.target.result;\n    if(noImg){ noImg.innerHTML=\'<pre style="text-align:left;white-space:pre-wrap;font-size:12px;color:var(--txt);max-height:460px;overflow:auto;padding:6px">\'+txt.replace(/</g,\'&lt;\')+\'</pre>\'; noImg.style.display=\'block\'; }\n    panel.style.display=\'block\';\n    if(!panel._dragged){ panel.style.right=\'16px\'; panel.style.top=\'70px\'; panel.sty',
'le.left=\'\'; }\n    if(addBtn) addBtn.style.display=\'none\';\n    document.getElementById(\'wbDocPageNum\').textContent=\'TXT\';\n  };\n  r.readAsText(f);\n  inp.value=\'\';\n}\n\nfunction wbDocAddToBoard(){\n  const imgEl=document.getElementById(\'wbDocImg\');\n  if(!imgEl||!imgEl.src||imgEl.style.display===\'none\') return;\n  const s=_wbS(); if(!s) return;\n  const img=new Image(); img.src=imgEl.src;\n  img.onload=()=>{\n    _wbPushUndo();\n    const ctx=s.ctx;\n    const scale=Math.min(s.e',
'l.width/img.width, s.el.height/img.height, 1)*0.6;\n    const w=img.width*scale, h=img.height*scale;\n    const x=(s.el.width-w)/2, y=(s.el.height-h)/2;\n    ctx.drawImage(img,x,y,w,h);\n    wbSelection={x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h)};\n    wbSetTool(\'select\'); _wbUpdateSelBox();\n  };\n}\nfunction wbDocPage(dir){\n  _wbDocPageIdx=Math.max(0,Math.min(_wbDocPages.length-1,_wbDocPageIdx+dir));\n  document.getElementById(\'wbDocImg\').src=_wbDocPages[_wbDocPageId',
'x];\n  document.getElementById(\'wbDocPageNum\').textContent=(_wbDocPageIdx+1)+\'/\'+_wbDocPages.length;\n}\n// Make doc panel draggable by its header\n(function _makeDocPanelDraggable(){\n  const panel=document.getElementById(\'wbDocPanel\');\n  const hdr=document.getElementById(\'wbDocPanelHeader\');\n  if(!panel||!hdr) return;\n  let ox=0,oy=0,mx=0,my=0;\n  hdr.addEventListener(\'pointerdown\',e=>{\n    e.preventDefault();\n    mx=e.clientX; my=e.clientY;\n    const r=panel.getBoundingClientR',
'ect();\n    panel.style.left=r.left+\'px\'; panel.style.top=r.top+\'px\';\n    panel.style.right=\'auto\';\n    panel._dragged=true;\n    hdr.setPointerCapture(e.pointerId);\n    hdr.addEventListener(\'pointermove\',onMove);\n    hdr.addEventListener(\'pointerup\',()=>hdr.removeEventListener(\'pointermove\',onMove),{once:true});\n  });\n  function onMove(e){\n    const dx=e.clientX-mx, dy=e.clientY-my;\n    mx=e.clientX; my=e.clientY;\n    panel.style.left=(panel.offsetLeft+dx)+\'px\';\n    pane',
'l.style.top=(panel.offsetTop+dy)+\'px\';\n  }\n})();\n\n// ── BG custom color ──────────────────────────────────────────────────────\nfunction wbSetBgColor(hex){\n  _wbCustomBgColor=hex;\n  document.getElementById(\'wbBgSwatch\').style.background=hex;\n  wbSetBg(\'custom\');\n}\n\n// Override wbSetBg to handle \'custom\' bg\nconst _wbSetBgOrig=wbSetBg;\nwbSetBg=function(bg){\n  wbBg=bg;\n  const s=_wbS(); if(s) wbDrawBg(s,bg);\n  document.querySelectorAll(\'.wb-bg-btn\').forEach(b=>b.classList.t',
'oggle(\'on\',b.dataset.bg===bg));\n};\n\n// ── Text tool ─────────────────────────────────────────────────────────────\n// Make text window draggable\n(function _makeTextWinDraggable(){\n  const win=document.getElementById(\'wbTextWindow\');\n  const hdr=document.getElementById(\'wbTextWindowHeader\');\n  if(!win||!hdr) return;\n  let mx=0,my=0;\n  hdr.addEventListener(\'pointerdown\',e=>{\n    if(e.target.tagName===\'BUTTON\') return;\n    e.preventDefault();\n    mx=e.clientX; my=e.clientY;\n ',
'   if(!win.style.left){ const r=win.getBoundingClientRect(); win.style.left=r.left+\'px\'; win.style.top=r.top+\'px\'; }\n    hdr.setPointerCapture(e.pointerId);\n    hdr.addEventListener(\'pointermove\',onM); hdr.addEventListener(\'pointerup\',()=>hdr.removeEventListener(\'pointermove\',onM),{once:true});\n  });\n  function onM(e){\n    const dx=e.clientX-mx, dy=e.clientY-my; mx=e.clientX; my=e.clientY;\n    win.style.left=(win.offsetLeft+dx)+\'px\'; win.style.top=(win.offsetTop+dy)+\'px\';\n  ',
'}\n})();\n\n// ── Rich Text Editor (RTE) for whiteboard text tool ─────────────────────\nfunction _rteEl(){ return document.getElementById(\'wbRteEditor\'); }\n\nfunction wbRteBlock(tag){\n  const ed=_rteEl(); if(!ed) return;\n  ed.focus();\n  document.execCommand(\'formatBlock\',false,\'<\'+tag+\'>\');\n}\nfunction wbRteFmt(cmd){\n  const ed=_rteEl(); if(!ed) return;\n  ed.focus();\n  document.execCommand(cmd,false,null);\n  _rteUpdateBar();\n}\nfunction wbRteAlign(a){\n  const ed=_rteEl(); if(',
'!ed) return;\n  ed.focus();\n  const map={left:\'justifyLeft\',center:\'justifyCenter\',right:\'justifyRight\'};\n  document.execCommand(map[a],false,null);\n  [\'Left\',\'Center\',\'Right\'].forEach(v=>{\n    const el=document.getElementById(\'rte\'+v);\n    if(el) el.style.background=v.toLowerCase()===a?\'var(--jm-primary,#7c3aed)\':\'#15171f\';\n  });\n}\nfunction wbRteColor(c){\n  const ed=_rteEl(); if(!ed) return;\n  ed.focus();\n  document.execCommand(\'foreColor\',false,c);\n  const bar=document.getElement',
'ById(\'wbTextColorBar\'); if(bar) bar.style.background=c;\n}\nfunction wbRteHighlight(c){\n  const ed=_rteEl(); if(!ed) return;\n  ed.focus();\n  document.execCommand(\'hiliteColor\',false,c);\n}\nfunction wbRteInsert(type){\n  const ed=_rteEl(); if(!ed) return;\n  ed.focus();\n  if(type===\'bullet\'){ document.execCommand(\'insertUnorderedList\',false,null); return; }\n  if(type===\'numbered\'){ document.execCommand(\'insertOrderedList\',false,null); return; }\n  if(type===\'quote\'){ document.',
'execCommand(\'formatBlock\',false,\'<blockquote>\'); return; }\n  if(type===\'link\'){\n    const url=prompt(\'Enter URL:\',\'https://\');\n    if(url) document.execCommand(\'createLink\',false,url);\n    return;\n  }\n  if(type===\'code\'){\n    const sel=window.getSelection();\n    if(sel&&sel.rangeCount){\n      const r=sel.getRangeAt(0);\n      const code=document.createElement(\'code\');\n      code.style.cssText=\'background:#2a2e3c;color:#f9a8d4;padding:1px 5px;border-radius:4px;font-fami',
'ly:monospace;font-size:.9em\';\n      try{ if(!r.collapsed){ r.surroundContents(code); } else { code.textContent=\'code\'; r.insertNode(code); } }catch(e){}\n    }\n    return;\n  }\n  if(type===\'table\'){\n    document.execCommand(\'insertHTML\',false,\'<table style="border-collapse:collapse;width:100%;margin:6px 0"><tr><td style="border:1px solid var(--bd);padding:5px 9px">Cell</td><td style="border:1px solid var(--bd);padding:5px 9px">Cell</td></tr><tr><td style="border:1px solid #3a3f55;padding',
':5px 9px">Cell</td><td style="border:1px solid var(--bd);padding:5px 9px">Cell</td></tr></table><p></p>\');\n    return;\n  }\n  if(type===\'callout\'){\n    document.execCommand(\'insertHTML\',false,\'<div style="background:rgba(124,58,237,.15);border-left:4px solid var(--jm-primary,#7c3aed);border-radius:6px;padding:9px 13px;margin:6px 0;color:#e8eaf0">💡 Key insight: write here</div><p></p>\');\n    return;\n  }\n  if(type===\'divider\'){\n    document.execCommand(\'insertHTML\',false,\'<hr style="border:none;bo',
'rder-top:2px solid #3a3f55;margin:10px 0"><p></p>\');\n    return;\n  }\n  if(type===\'add\'){\n    document.execCommand(\'insertHTML\',false,\'<p><br></p>\');\n    ed.focus();\n    return;\n  }\n}\nfunction wbRteInsertImage(inp){\n  const f=inp.files&&inp.files[0]; if(!f) return;\n  const rd=new FileReader();\n  rd.onload=()=>{\n    const ed=_rteEl(); if(!ed) return;\n    ed.focus();\n    document.execCommand(\'insertHTML\',false,\'<img src="\'+rd.result+\'" style="max-width:100%;border-radius:',
'6px;display:block;margin:5px 0"><p></p>\');\n  };\n  rd.readAsDataURL(f);\n  inp.value=\'\';\n}\nfunction _rteUpdateBar(){\n  [[\'bold\',\'rteB\'],[\'italic\',\'rteI\'],[\'underline\',\'rteU\'],[\'strikeThrough\',\'rteS\']].forEach(([cmd,id])=>{\n    try{\n      const active=document.queryCommandState(cmd);\n      const el=document.getElementById(id);\n      if(el) el.style.background=active?\'var(--jm-primary,#7c3aed)\':\'#15171f\';\n    }catch(e){}\n  });\n}\n\n// Wire close buttons and RTE init after DOM is re',
'ady\n(function(){\n  function _initRte(){\n    [\'wbTextWinClose\',\'wbTextCancelBtn\'].forEach(id=>{\n      const el=document.getElementById(id);\n      if(el) el.addEventListener(\'click\',()=>{ document.getElementById(\'wbTextWindow\').style.display=\'none\'; });\n    });\n    const ed=document.getElementById(\'wbRteEditor\');\n    if(ed){\n      ed.addEventListener(\'keyup\',_rteUpdateBar);\n      ed.addEventListener(\'mouseup\',_rteUpdateBar);\n    }\n  }\n  if(document.readyState===\'loadi',
'ng\') document.addEventListener(\'DOMContentLoaded\',_initRte); else _initRte();\n})();\n\n// Stamp the rich editor content onto the whiteboard canvas via SVG foreignObject\nfunction wbStampRte(){\n  const s=_wbS(); if(!s) return;\n  const ed=document.getElementById(\'wbRteEditor\');\n  const html=(ed?ed.innerHTML:\'\').trim();\n  if(!html||html===\'<br>\') return;\n  const chapterTitle=(document.getElementById(\'wbChapterTitle\')?.value||\'\').trim();\n  const win=document.getElementById(\'wbTe',
'xtWindow\');\n  const cx=Math.max(0,win._canvasX||Math.floor(s.el.width*0.04));\n  const cy=Math.max(0,win._canvasY||Math.floor(s.el.height*0.04));\n  const maxW=Math.min(Math.floor(s.el.width*0.65), 900);\n  const titleHtml=chapterTitle?\'<h2 style="margin:0 0 10px 0;font-size:26px;font-weight:900;color:#111827;border-bottom:3px solid var(--jm-primary,#7c3aed);padding-bottom:6px;font-family:system-ui,sans-serif">\'+chapterTitle+\'</h2>\':\'\';\n  const bodyStyle=\'font-size:17px;line-height:1.7;font-family:syste',
'm-ui,sans-serif;color:#111827\';\n  const pad=18;\n  const estimH=Math.min(Math.floor(s.el.height*0.85),1000);\n  const svgStr=\'<svg xmlns="http://www.w3.org/2000/svg" width="\'+maxW+\'" height="\'+estimH+\'">\'\n    +\'<foreignObject width="\'+maxW+\'" height="\'+estimH+\'">\'\n    +\'<div xmlns="http://www.w3.org/1999/xhtml" style="padding:\'+pad+\'px;background:rgba(255,255,252,0.97);border-radius:10px;box-sizing:border-box;width:\'+maxW+\'px">\'\n    +titleHtml+\'<div style="\'+bodyStyle+\'',
'">\'+html+\'</div>\'\n    +\'</div></foreignObject></svg>\';\n  _wbPushUndo();\n  const img=new Image();\n  img.onload=()=>{\n    s.ctx.drawImage(img,cx,cy);\n    wbSelection={x:cx,y:cy,w:maxW,h:estimH};\n    _wbUpdateSelBox();\n    wbSetTool(\'select\');\n  };\n  img.src=\'data:image/svg+xml;charset=utf-8,\'+encodeURIComponent(svgStr);\n  win.style.display=\'none\';\n}\n\n// Legacy stub — old textarea-based stamp, kept for backwards compat with any saved references\nfunction wbStampText(){\n  w',
'bStampRte();\n}\n\n// ── old text formatting state (no longer used but kept so nothing errors) ─\nconst _wbTxtFmt={bold:false,italic:false,underline:false,align:\'left\'};\nfunction wbToggleFmt(k){ wbRteFmt(k===\'bold\'?\'bold\':k===\'italic\'?\'italic\':\'underline\'); }\nfunction wbSetAlign(a){ wbRteAlign(a); }\nfunction wbTextColorChange(c){ wbRteColor(c); }\nfunction wbTextPreset(t){\n  const ed=_rteEl(); if(!ed) return;\n  ed.focus();\n  if(t===\'heading\'){ wbRteBlock(\'h2\'); }\n  else if',
'(t===\'bullet\'){ wbRteInsert(\'bullet\'); }\n  else if(t===\'note\'){ wbRteInsert(\'callout\'); }\n  else if(t===\'formula\'){ document.execCommand(\'insertHTML\',false,\'<p>∑ f(x) = …</p>\'); }\n}\n\n\n// ── Multi-page system ────────────────────────────────────────────────────\nfunction _wbSavePage(s){\n  if(!s.pages) s.pages=[]; if(s.currentPage===undefined) s.currentPage=0;\n  s.pages[s.currentPage]={imageData:s.ctx.getImageData(0,0,s.el.width,s.el.height), bg:wbBg};\n}\n\nfunction _wbLoadP',
'age(s, idx){\n  const pg=s.pages&&s.pages[idx];\n  if(pg){ s.ctx.putImageData(pg.imageData,0,0); wbBg=pg.bg; }\n  else { wbDrawBg(s,wbBg); }\n  document.querySelectorAll(\'.wb-bg-btn\').forEach(b=>b.classList.toggle(\'on\',b.dataset.bg===wbBg));\n  _wbUpdatePageNav(s);\n  wbSelection=null; _wbUpdateSelBox();\n}\n\nfunction _wbUpdatePageNav(s){\n  const total=s.pages?s.pages.length:1;\n  const cur=(s.currentPage||0)+1;\n  const el=document.getElementById(\'wbPageNum\'); if(el) el.textContent=cur+',
'\'/\'+total;\n}\n\nfunction wbAddPage(){\n  const s=_wbS(); if(!s) return;\n  if(!s.pages) s.pages=[]; if(s.currentPage===undefined) s.currentPage=0;\n  _wbSavePage(s);\n  const newIdx=s.pages.length;\n  s.currentPage=newIdx;\n  wbDrawBg(s,wbBg);\n  s.pages[newIdx]={imageData:s.ctx.getImageData(0,0,s.el.width,s.el.height),bg:wbBg};\n  _wbUpdatePageNav(s);\n}\n\nfunction wbGoPage(dir){\n  const s=_wbS(); if(!s) return;\n  if(!s.pages) s.pages=[]; if(s.currentPage===undefined) s.currentPage=0;\n  ',
'_wbSavePage(s);\n  const next=Math.max(0,Math.min(s.pages.length-1,s.currentPage+dir));\n  if(next===s.currentPage) return;\n  s.currentPage=next;\n  _wbLoadPage(s,next);\n}\n\nfunction wbDelPage(){\n  const s=_wbS(); if(!s) return;\n  if(!s.pages||s.pages.length<=1){ wbClear(); return; }\n  _wbSavePage(s);\n  s.pages.splice(s.currentPage,1);\n  s.currentPage=Math.max(0,s.currentPage-1);\n  _wbLoadPage(s,s.currentPage);\n}\n\n// ── PDF export ─────────────────────────────────────────────────────',
'──────\nfunction wbExportPdf(){\n  const s=_wbS(); if(!s) return;\n  _wbSavePage(s);\n  const pages=s.pages||[{imageData:s.ctx.getImageData(0,0,s.el.width,s.el.height),bg:wbBg}];\n  // Build data URLs for each page\n  const tmp=document.createElement(\'canvas\');\n  tmp.width=s.el.width; tmp.height=s.el.height;\n  const tc=tmp.getContext(\'2d\');\n  const imgs=pages.map(pg=>{ tc.putImageData(pg.imageData,0,0); return tmp.toDataURL(\'image/png\'); });\n  const w=window.open(\'\',\'_blank\');\n  i',
'f(!w) return;\n  const pw=s.el.width, ph=s.el.height;\n  const ratio=pw/ph;\n  w.document.write(`<!DOCTYPE html><html><head><title>Whiteboard</title>\n<style>*{margin:0;padding:0;box-sizing:border-box}\nbody{background:#eee}\n.page{width:100%;max-width:${pw}px;margin:12px auto;display:block;border:1px solid #ddd;box-shadow:0 2px 8px rgba(0,0,0,.2)}\n@media print{body{background:#fff}.page{margin:0;border:none;box-shadow:none;page-break-after:always}}\n</style></head><body>`);\n  imgs.forEach(src',
'=>{ w.document.write(`<img class="page" src="${src}">`); });\n  w.document.write(`<script>window.onload=function(){window.print();}<\\/script>'].join('');

function _init(container) {
const params=new URLSearchParams(location.search);
const CLASS_ID=params.get('class'); const TOKEN=localStorage.getItem('jm_token'); const API='/api';

// ── Dashboard connection: load user profile from localStorage ─────────────
(function _initUserProfile(){
  try{
    const u=JSON.parse(localStorage.getItem('jm_user')||'null');
    if(!u) return;
    const chip=document.getElementById('studioUserChip');
    if(chip){
      const role=u.user_type||u.role||'teacher';
      chip.textContent='👤 '+(u.full_name||u.name||u.email||'User')+' · '+role;
      chip.style.display='inline-flex';
      chip.title='Logged in as '+(u.full_name||u.email)+' — click to go to dashboard';
    }
  } catch(e){}
})();

// User courses cache (loaded lazily for "Save to course" + "Teach" flows)
let _userCourses=null;
async function _loadUserCourses(force){
  if(_userCourses&&!force) return _userCourses;
  try{
    const tok=localStorage.getItem('jm_token')||'';
    if(!tok) return [];
    const res=await fetch(API+'/courses?mine=1',{headers:{Authorization:'Bearer '+tok}});
    const data=await res.json();
    _userCourses=(data.courses||data||[]);
    return _userCourses;
  } catch(e){ return []; }
}
// The live class this Studio session is bound to. Starts from ?class= but can
// be (re)bound at runtime via the "Teach a course" flow, so recordings/streams
// attach to the right class even when Studio is opened standalone.
let _boundClass=CLASS_ID||null, _boundClassTitle='';
function crmKey(){ try{ const u=JSON.parse(localStorage.getItem('jm_user')||'{}'); return u&&u.id?('jm_crm_'+u.id):'jm_crm'; }catch(e){ return 'jm_crm'; } }
function getCrm(){ try{ let r=localStorage.getItem(crmKey()); if(r===null&&crmKey()!=='jm_crm') r=localStorage.getItem('jm_crm'); return JSON.parse(r||'{}'); }catch(e){ return {}; } }
let sources={}, scenes=[], activeScene=null, _adjustMode=false;
// Virtual background
let _vbgImg=null, _vbgColor='#000000', _vbgMode='none', _vbgFrame=0.85, _vbgFit='fill';
function clearVbg(){ _vbgMode='none'; _vbgImg=null; _vbgColor='#000'; document.getElementById('vbgHint').textContent='Background: none'; document.getElementById('vbgPositionBtns').style.display='none'; }
function setVbgColor(c){ _vbgColor=c; _vbgMode='color'; document.getElementById('vbgHint').textContent='Background: solid colour'; document.getElementById('vbgPositionBtns').style.display='none'; }
function loadVbgImage(input){ const f=input.files?.[0]; if(!f) return; const r=new Image(); r.onload=()=>{ _vbgImg=r; _vbgMode='image'; document.getElementById('vbgHint').textContent='Background: '+f.name; document.getElementById('vbgPositionBtns').style.display='block'; }; r.src=URL.createObjectURL(f); }
let gl=null, prog=null, tex=null, glCanvas=null, micStream=null, brandImg=null;
const out=document.getElementById('out'), octx=out.getContext('2d');

// ── Simple Crop mode ────────────────────────────────────────────────────
let _cropMode=false;
// Crop is PER-SCENE (like corners) — each scene keeps its own crop rect so
// switching scenes shows/applies the right one. _crop() lazily initialises it.
function _crop(){ if(!activeScene) return {x:0,y:0,w:1,h:1}; if(!activeScene.crop) activeScene.crop={x:0,y:0,w:1,h:1}; return activeScene.crop; }
// ── AR-based source crop: maps a region of the SOURCE to fill the OUTPUT ──
let _srcCropMode=false, _srcCrop={x:0,y:0,w:1,h:1};
function toggleCropMode(){
  _cropMode=!_cropMode;
  document.getElementById('btnSimpleCrop').classList.toggle('on',_cropMode);
  _updateCropOverlay();
}
function resetCrop(){ if(activeScene) activeScene.crop={x:0,y:0,w:1,h:1}; _updateCropOverlay(); }
function _updateCropOverlay(){
  const ov=document.getElementById('cropOverlay');
  if(!_cropMode){ ov.style.display='none'; return; }
  const rr=outRect(); const cr=_crop();
  ov.style.display='block';
  ov.style.left=(cr.x*rr.width)+'px';
  ov.style.top=(cr.y*rr.height)+'px';
  ov.style.width=(cr.w*rr.width)+'px';
  ov.style.height=(cr.h*rr.height)+'px';
  ov.style.pointerEvents='none';
  // Use CSS resize for the rectangle — achieved via a transparent inner resize handle
  _attachCropHandles(ov, rr);
}
function _attachCropHandles(ov, rr){
  // Remove old handles
  ov.querySelectorAll('.crop-handle').forEach(h=>h.remove());
  const corners=[
    {cx:0,cy:0,cursor:'nwse-resize'},
    {cx:1,cy:0,cursor:'nesw-resize'},
    {cx:0,cy:1,cursor:'nesw-resize'},
    {cx:1,cy:1,cursor:'nwse-resize'}
  ];
  ov.style.pointerEvents='auto';
  corners.forEach(({cx,cy,cursor})=>{
    const h=document.createElement('div');
    h.className='crop-handle';
    h.style.cssText=`position:absolute;width:14px;height:14px;background:var(--pri);border:2px solid #fff;border-radius:3px;cursor:${cursor};z-index:7;transform:translate(-50%,-50%);left:${cx*100}%;top:${cy*100}%`;
    h.addEventListener('pointerdown',e=>{
      e.preventDefault(); e.stopPropagation(); h.setPointerCapture?.(e.pointerId);
      const startX=e.clientX, startY=e.clientY;
      const orig={...rr, rc:{..._crop()}};
      const mv=ev=>{
        const dx=(ev.clientX-startX)/orig.width, dy=(ev.clientY-startY)/orig.height;
        const nr={...orig.rc};
        if(cx===0){ nr.x=Math.min(orig.rc.x+dx, orig.rc.x+orig.rc.w-0.05); nr.w=orig.rc.w-(nr.x-orig.rc.x); }
        else { nr.w=Math.max(0.05, orig.rc.w+dx); }
        if(cy===0){ nr.y=Math.min(orig.rc.y+dy, orig.rc.y+orig.rc.h-0.05); nr.h=orig.rc.h-(nr.y-orig.rc.y); }
        else { nr.h=Math.max(0.05, orig.rc.h+dy); }
        const cr=_crop(); cr.x=nr.x; cr.y=nr.y; cr.w=nr.w; cr.h=nr.h;
        const rr2=outRect();
        ov.style.left=(cr.x*rr2.width)+'px';
        ov.style.top=(cr.y*rr2.height)+'px';
        ov.style.width=(cr.w*rr2.width)+'px';
        ov.style.height=(cr.h*rr2.height)+'px';
      };
      const up=()=>{ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); };
      window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up);
    });
    ov.appendChild(h);
  });
  // Move handle in center
  const mh=document.createElement('div'); mh.className='crop-handle';
  mh.style.cssText='position:absolute;width:20px;height:20px;background:rgba(124,58,237,.5);border:2px solid #fff;border-radius:50%;cursor:move;z-index:7;transform:translate(-50%,-50%);left:50%;top:50%';
  mh.addEventListener('pointerdown',e=>{
    e.preventDefault(); e.stopPropagation(); mh.setPointerCapture?.(e.pointerId);
    let px=e.clientX, py=e.clientY;
    const mv=ev=>{
      const rr2=outRect();
      const dx=(ev.clientX-px)/rr2.width, dy=(ev.clientY-py)/rr2.height;
      px=ev.clientX; py=ev.clientY;
      const cr=_crop();
      cr.x=Math.max(0,Math.min(1-cr.w,cr.x+dx));
      cr.y=Math.max(0,Math.min(1-cr.h,cr.y+dy));
      ov.style.left=(cr.x*rr2.width)+'px';
      ov.style.top=(cr.y*rr2.height)+'px';
    };
    const up=()=>{ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); };
    window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up);
  });
  ov.appendChild(mh);
}
window.addEventListener('resize',()=>{ if(_cropMode) _updateCropOverlay(); });

// ── Welcome Guide ───────────────────────────────────────────────────────
function openGuide(){
  document.getElementById('studioGuide').style.display='flex';
  document.getElementById('guideTemplateArea').style.display='none';
}
function dismissGuide(){
  localStorage.setItem('studio_seen','1');
  document.getElementById('studioGuide').style.display='none';
}
function _showGuideTemplate(){
  const area=document.getElementById('guideTemplateArea');
  area.style.display='block';
  const keys=Object.keys(localStorage).filter(k=>k.startsWith('jm_studio_tpl_'));
  if(!keys.length){ area.innerHTML='<div class="hint">No saved templates yet.</div>'; return; }
  area.innerHTML=keys.map(k=>{
    const name=k.replace('jm_studio_tpl_','');
    return `<div class="tpl-row" onclick="_loadTemplateByKey('${k}');dismissGuide()"><div class="tpl-nm">${_esc(name)}</div><span style="color:var(--pri);font-size:12px">Load →</span></div>`;
  }).join('');
}
// Show guide on first load
if(!localStorage.getItem('studio_seen')){
  document.getElementById('studioGuide').style.display='flex';
}

// ── Toast ────────────────────────────────────────────────────────────────
let _toastTimer=null;
function showToast(msg){
  const t=document.getElementById('studioToast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(_toastTimer); _toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}

// ── Templates ───────────────────────────────────────────────────────────
function toggleTemplatePanel(){
  const p=document.getElementById('templatePanel');
  p.classList.toggle('open');
  if(p.classList.contains('open')) renderTemplateList();
}
// Close template panel when clicking outside
document.addEventListener('click',e=>{
  const wrap=document.getElementById('tplBtnWrap');
  if(wrap && !wrap.contains(e.target)) document.getElementById('templatePanel').classList.remove('open');
});
function saveTemplate(){
  const name=document.getElementById('tplNameInput').value.trim();
  if(!name){ alert('Enter a name for this template.'); return; }
  const data={
    format: document.getElementById('fmtSelect').value,
    vbgMode: _vbgMode,
    vbgColor: _vbgColor,
    scenes: scenes.map(s=>({name:s.name,zoom:s.zoom,rotation:s.rotation,corners:s.corners,crop:s.crop,layers:s.layers||[]}))
  };
  localStorage.setItem('jm_studio_tpl_'+name, JSON.stringify(data));
  document.getElementById('tplNameInput').value='';
  showToast('Template "'+name+'" saved!');
  renderTemplateList();
}
function renderTemplateList(){
  const box=document.getElementById('tplList');
  const keys=Object.keys(localStorage).filter(k=>k.startsWith('jm_studio_tpl_'));
  if(!keys.length){ box.innerHTML='<div class="hint">No templates yet.</div>'; return; }
  box.innerHTML=keys.map(k=>{
    const name=k.replace('jm_studio_tpl_','');
    return `<div class="tpl-row">
      <div class="tpl-nm" onclick="_loadTemplateByKey('${_esc(k)}')">${_esc(name)}</div>
      <button class="btn" style="padding:3px 8px;font-size:11px" onclick="_loadTemplateByKey('${_esc(k)}')">Load</button>
      <button class="btn" style="padding:3px 8px;font-size:11px" onclick="_deleteTemplate('${_esc(k)}')">×</button>
    </div>`;
  }).join('');
}
function _loadTemplateByKey(key){
  try{
    const data=JSON.parse(localStorage.getItem(key)||'{}');
    if(data.format) setFormat(data.format);
    if(data.vbgColor) _vbgColor=data.vbgColor;
    if(data.vbgMode) _vbgMode=data.vbgMode;
    if(Array.isArray(data.scenes) && data.scenes.length){
      // Restore scene layout (sources can't be restored — they're live streams)
      scenes=data.scenes.map((s,i)=>({
        id:'sc_'+Date.now()+'_'+i,
        name:s.name||'Scene '+(i+1),
        sourceId:activeScene?.sourceId||Object.keys(sources)[0]||'',
        corners:s.corners||defaultCorners(),
        crop:s.crop||{x:0,y:0,w:1,h:1},
        zoom:s.zoom||1,
        rotation:s.rotation||0,
        layers:s.layers||[]
      }));
      activeScene=scenes[0]||null;
      renderScenes(); loadEditor(); renderLayerList();
    }
    const name=key.replace('jm_studio_tpl_','');
    showToast('Template "'+name+'" loaded!');
    document.getElementById('templatePanel').classList.remove('open');
  }catch(e){ alert('Could not load template: '+e.message); }
}
function _deleteTemplate(key){
  const name=key.replace('jm_studio_tpl_','');
  if(!confirm('Delete template "'+name+'"?')) return;
  localStorage.removeItem(key);
  renderTemplateList();
}

(function(){ const crm=getCrm();
  if(crm.companyName && crm.companyName!=='JeetMantra Classes') document.getElementById('brandText').value=crm.companyName;
  if(crm.logo){ const im=new Image(); im.onload=()=>brandImg=im; im.src=crm.logo; }
})();

// ── Devices ────────────────────────────────────────────────────────────
async function enableDevices(){
  const b=document.getElementById('permBanner');
  try{ const s=await navigator.mediaDevices.getUserMedia({video:true,audio:true}); s.getTracks().forEach(t=>t.stop());
    b.className='banner ok'; b.innerHTML='✓ Devices unlocked. Pick a camera.'; document.getElementById('btnEnable').style.display='none';
    await refreshDevices(); const sel=document.getElementById('camSelect'); const f=[...sel.options].find(o=>o.value); if(f){ sel.value=f.value; startCamera(f.value); }
  }catch(e){ b.className='banner warn'; b.innerHTML='⚠️ '+(e.name==='NotAllowedError'?'Permission denied — allow camera/mic in the address bar.':e.name==='NotFoundError'?'No camera/mic found.':e.message); }
}
async function refreshDevices(){
  let devs=[]; try{ devs=await navigator.mediaDevices.enumerateDevices(); }catch(e){}
  const cams=devs.filter(d=>d.kind==='videoinput'), mics=devs.filter(d=>d.kind==='audioinput');
  document.getElementById('camSelect').innerHTML=cams.length?cams.map((d,i)=>`<option value="${d.deviceId}">${d.label||('Camera '+(i+1))}</option>`).join(''):'<option value="">No cameras — click Enable</option>';
  document.getElementById('micSelect').innerHTML='<option value="">Default mic</option>'+mics.map((d,i)=>`<option value="${d.deviceId}">${d.label||('Mic '+(i+1))}</option>`).join('');
}
if(navigator.mediaDevices) navigator.mediaDevices.addEventListener?.('devicechange', refreshDevices);
async function startCamera(deviceId){ if(!deviceId) return; if(sources[deviceId]){ pickSource(deviceId); return; }
  try{ const stream=await navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:deviceId},width:{ideal:1280},height:{ideal:720}},audio:false}); registerVideo(deviceId,stream,'Camera'); refreshDevices(); }
  catch(e){ alert('Could not open camera: '+(e.message||e.name)); } }
async function addScreen(){ try{ const stream=await navigator.mediaDevices.getDisplayMedia({video:{frameRate:30},audio:false}); const id='screen_'+Date.now(); registerVideo(id,stream,'Screen'); stream.getVideoTracks()[0].addEventListener('ended',()=>{ delete sources[id]; }); }catch(e){} }
function registerVideo(id,stream,label){ const v=document.createElement('video'); v.srcObject=stream; v.autoplay=true; v.muted=true; v.playsInline=true; v.setAttribute('playsinline',''); document.getElementById('srcHolder').appendChild(v); v.play().catch(()=>{}); sources[id]={el:v,type:'video',stream,label}; if(!scenes.length) addScene(id); else pickSource(id); }
// Whiteboard source — a drawable canvas.
function addWhiteboard(){
  const id='wb_'+Date.now();
  const cv=document.createElement('canvas'); cv.width=out.width||1280; cv.height=out.height||720;
  const c=cv.getContext('2d');
  c.fillStyle='#fff'; c.fillRect(0,0,cv.width,cv.height);
  sources[id]={el:cv,type:'whiteboard',ctx:c,label:'Whiteboard',undoStack:[],pages:[],currentPage:0};
  // save initial blank page
  sources[id].pages[0]={imageData:c.getImageData(0,0,cv.width,cv.height),bg:'white'};
  addScene(id); enableWbDraw(id);
}
// Image/document source.
function addImage(input){ const f=input.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>{ const id='img_'+Date.now(); sources[id]={el:im,type:'image',label:'Document'}; addScene(id); }; im.src=r.result; }; r.readAsDataURL(f); input.value=''; }
function addImageUrl(url,label){ const im=new Image(); im.crossOrigin='anonymous'; im.onload=()=>{ const id='img_'+Date.now(); sources[id]={el:im,type:'image',label:label||'Content'}; addScene(id); }; im.onerror=()=>alert('Could not load that content as an image (PDFs/links may not embed).'); im.src=url; }
function pickSource(id){ if(activeScene){ activeScene.sourceId=id; renderScenes(); } document.getElementById('srcLabel').textContent=(sources[id]?.label||'Source'); const isWb=sources[id]?.type==='whiteboard'; document.getElementById('wbToolbar').style.display=isWb?'flex':'none'; if(isWb&&sources[id]) _wbUpdatePageNav(sources[id]); }

// Whiteboard drawing (on the main preview when its scene is active).
function enableWbDraw(id){
  document.getElementById('wbToolbar').style.display='flex';
  wbSetTool('pen');
  const s=sources[id]; if(s) _wbUpdatePageNav(s);
  if(typeof _wbSyncSwatches==='function') _wbSyncSwatches();
}

// ── Course content picker ──────────────────────────────────────────────
async function openCoursePicker(){ document.getElementById('coursePicker').style.display='flex';
  try{ const courses=await _loadUserCourses(true);
    document.getElementById('cpCourse').innerHTML='<option value="">— pick a course —</option>'+courses.map(c=>`<option value="${c.id}">${(c.title||'Course')}</option>`).join('');
  }catch(e){}
}
async function cpLoad(courseId){ if(!courseId) return; const box=document.getElementById('cpItems'); box.innerHTML='Loading…';
  try{ const full=await fetch(API+'/course-content/'+courseId+'/full',{headers:{Authorization:'Bearer '+TOKEN}}).then(x=>x.json());
    const items=[]; (full.topics||[]).forEach(t=>(t.images||[]).forEach(u=>items.push({label:'🖼 '+(t.title||'Topic'),url:u})));
    (full.materials||[]).forEach(m=>{ if(m.url&&/\.(png|jpg|jpeg|webp|gif)$/i.test(m.url)) items.push({label:'📄 '+(m.title||'Material'),url:m.url}); });
    box.innerHTML=items.length?items.map((it,i)=>`<div style="display:flex;gap:10px;align-items:center;padding:8px;border:1px solid var(--bd);border-radius:8px;margin-bottom:6px;cursor:pointer" onclick="addImageUrl('${it.url.replace(/'/g,"\\'")}','${it.label.replace(/'/g,"\\'")}');document.getElementById('coursePicker').style.display='none'"><div style="flex:1">${it.label}</div><span style="color:var(--pri)">Add →</span></div>`).join(''):'<div class="hint">No image content in this course. Upload images to topics/materials to share them here.</div>';
  }catch(e){ box.innerHTML='Error: '+e.message; }
}

// ── Teach a course → connect Studio to a live class & go live ───────────
let _tSelected=null;
function _bindClass(id, title){
  _boundClass=id; _boundClassTitle=title||'';
  const b=document.getElementById('boundClassBadge');
  if(b){ if(id){ b.style.display='inline-block'; b.textContent='🔴 Live: '+(title||'class'); } else { b.style.display='none'; } }
  // Default the recording save-target to the class once connected.
  const st=document.getElementById('saveTarget'); if(st && id && st.value==='local') st.value='both';
  // Start/stop casting the composite to the live room (students see this view).
  if(id) startStudioCast(id); else stopStudioCast();
}
// ── Studio cast: push the composite canvas (#out) to the live room as periodic
// JPEG frames (~1.5 fps) so students see exactly what's on screen here. A
// lightweight alternative to a full WebRTC publish.
let _castTimer=null, _casting=false;
function startStudioCast(classId){
  stopStudioCast();
  const canvas=document.getElementById('out'); if(!canvas) return;
  _castTimer=setInterval(async ()=>{
    if(_casting) return;                 // skip if the previous POST is still in flight
    let frame; try{ frame=canvas.toDataURL('image/jpeg', 0.55); }catch(_){ return; }
    if(!frame || frame.length<100) return;
    _casting=true;
    try{
      await fetch(API+'/live-classes/'+classId+'/cast',{
        method:'POST', headers:{'Content-Type':'application/json',Authorization:'Bearer '+TOKEN},
        body:JSON.stringify({frame})
      });
    }catch(_){ /* offline / transient — next tick retries */ }
    finally{ _casting=false; }
  }, 650);
}
function stopStudioCast(){ if(_castTimer){ clearInterval(_castTimer); _castTimer=null; } }
async function openTeach(){
  document.getElementById('teachModal').style.display='flex';
  const t=new Date(Date.now()+5*60000); t.setSeconds(0,0);
  const tz=new Date(t.getTime()-t.getTimezoneOffset()*60000).toISOString().slice(0,16);
  const ti=document.getElementById('tNewTime'); if(ti && !ti.value) ti.value=tz;
  try{ const courses=await _loadUserCourses(true);
    document.getElementById('tCourse').innerHTML='<option value="">— pick a course —</option>'+courses.map(c=>`<option value="${c.id}">${_esc(c.title||'Course')}</option>`).join('');
  }catch(e){}
  // Populate the template picker from saved layouts so the teacher chooses
  // which template to go live with.
  const tt=document.getElementById('tTemplate');
  if(tt){
    const keys=Object.keys(localStorage).filter(k=>k.startsWith('jm_studio_tpl_'));
    tt.innerHTML='<option value="">— keep current studio layout —</option>'+
      keys.map(k=>`<option value="${_esc(k)}">${_esc(k.replace('jm_studio_tpl_',''))}</option>`).join('');
  }
}
async function tLoadClasses(courseId){
  const box=document.getElementById('tClasses'); _tSelected=null; document.getElementById('tGoLive').disabled=true;
  if(!courseId){ box.innerHTML='<div class="hint">Pick a course to list its scheduled classes.</div>'; return; }
  box.innerHTML='Loading…';
  try{
    const r=await fetch(API+'/live-classes/course/'+courseId,{headers:{Authorization:'Bearer '+TOKEN}}).then(x=>x.json());
    const list=(r.liveClasses||r.classes||[]).filter(c=>c.status!=='cancelled');
    box.innerHTML=list.length? list.map(c=>{
      const when=c.scheduled_time?new Date(c.scheduled_time).toLocaleString():'—';
      return `<div class="scene" id="tc_${c.id}" onclick="tSelectClass('${c.id}','${_esc(c.title||'Class').replace(/'/g,"\\'")}')"><div class="thumb">${c.status==='live'?'🔴':'📡'}</div><div class="nm">${_esc(c.title||'Class')}<div style="font-size:10px;color:var(--mut)">${when} · ${_esc(c.status||'scheduled')}</div></div></div>`;
    }).join('') : '<div style="text-align:center;padding:14px 8px"><div style="font-size:13px;color:var(--mut);margin-bottom:10px">No classes yet — connect one to teach.</div><button onclick="document.getElementById(\'tNewTitle\')?.focus();" style="background:linear-gradient(135deg,var(--pri),#a855f7);color:#fff;border:0;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(124,58,237,.35)">📡 Create live class</button></div>';
  }catch(e){ box.innerHTML='<div class="banner warn">Couldn\'t load classes: '+_esc(e.message)+'</div>'; }
}
function tSelectClass(id, title){
  _tSelected={id,title};
  document.querySelectorAll('#tClasses .scene').forEach(s=>s.classList.remove('active'));
  document.getElementById('tc_'+id)?.classList.add('active');
  document.getElementById('tGoLive').disabled=false;
}
async function tCreateClass(){
  const courseId=document.getElementById('tCourse').value;
  if(!courseId){ alert('Pick a course first.'); return; }
  const title=document.getElementById('tNewTitle').value.trim()||'Live class';
  const when=document.getElementById('tNewTime').value;
  const scheduledTime=when?new Date(when).toISOString():new Date().toISOString();
  try{
    const r=await fetch(API+'/live-classes',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+TOKEN},body:JSON.stringify({courseId,title,scheduledTime,duration:60})}).then(x=>x.json());
    const id=r.liveClass&&r.liveClass.id; if(!id) throw new Error(r.error&&r.error.message||r.error||'Create failed');
    await tLoadClasses(courseId);
    tSelectClass(id,title);
  }catch(e){ alert('Couldn\'t create class: '+(e.message||e)); }
}
// Course-free instant live: generate a room id + shareable join link, save it
// locally (works with no connection), copy the link, and open the room. Anyone
// with the link joins — no course, no backend class record required.
// Open a live room WITHOUT leaving the SPA: when embedded in /app, route the
// shell to #/m/live/<id> (renders the room in-shell); standalone Studio falls
// back to the /app shell URL. No separate liveRoom.html tab.
function _studioOpenLive(id){
  const embed=new URLSearchParams(location.search).get('embed')==='1';
  if(embed){ try{ window.top.location.hash='#/m/live/'+id; return; }catch(_){} }
  window.location.href=location.origin+'/app#/m/live/'+id;
}
function tInstantLive(){
  const title=(document.getElementById('tInstantTitle')||{}).value.trim()||'Instant Live Class';
  const roomId='inst_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  // Shareable in-shell link (renders inside /app — not a standalone html page).
  const link=location.origin+'/app#/m/live/'+roomId;
  // Persist locally so it survives offline; mark unsynced for a future backend sync.
  try{ const k='jm_live_rooms'; const list=JSON.parse(localStorage.getItem(k)||'[]'); list.push({roomId,title,link,createdAt:Date.now(),synced:false}); localStorage.setItem(k,JSON.stringify(list)); }catch(_){}
  // Best-effort backend register when online; failure is fine (stays local).
  if(navigator.onLine){ try{ fetch(API+'/live-classes',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+TOKEN},body:JSON.stringify({title,instant:true,roomId,scheduledTime:new Date().toISOString(),duration:60})}).then(()=>{ try{ const k='jm_live_rooms'; const list=JSON.parse(localStorage.getItem(k)||'[]'); const it=list.find(r=>r.roomId===roomId); if(it) it.synced=true; localStorage.setItem(k,JSON.stringify(list)); }catch(_){} }).catch(()=>{}); }catch(_){} }
  try{ navigator.clipboard.writeText(link); }catch(_){}
  document.getElementById('teachModal').style.display='none';
  showToast('⚡ Live class started — invite link copied');
  _studioOpenLive(roomId);
}
async function tGoLive(){
  if(!_tSelected){ alert('Select or create a class first.'); return; }
  try{
    // If the teacher chose a saved template for this live, load it first so the
    // scenes/format/crops are applied before we bind + start casting.
    const tplKey=(document.getElementById('tTemplate')||{}).value;
    if(tplKey){ try{ _loadTemplateByKey(tplKey); }catch(_){} }
    // Mark the class live (idempotent on the backend) and bind Studio to it.
    await fetch(API+'/live-classes/'+_tSelected.id+'/start',{method:'POST',headers:{Authorization:'Bearer '+TOKEN}}).catch(()=>{});
    await fetch(API+'/live-classes/'+_tSelected.id,{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+TOKEN},body:JSON.stringify({status:'live'})}).catch(()=>{});
    _bindClass(_tSelected.id,_tSelected.title);
    document.getElementById('teachModal').style.display='none';
    showToast('📡 You\'re live with "'+_tSelected.title+'" — recordings save to this class');
    _studioOpenLive(_tSelected.id);   // render the room in-shell, not a new html tab
  }catch(e){ alert('Couldn\'t go live: '+(e.message||e)); }
}

// ── Scenes ─────────────────────────────────────────────────────────────
function addScene(sourceId){ const sid=sourceId||activeScene?.sourceId||Object.keys(sources)[0]||''; const sc={id:'sc_'+Date.now(),name:(sources[sid]?.label||'Scene')+' '+(scenes.length+1),sourceId:sid,corners:defaultCorners(),zoom:1,rotation:0}; scenes.push(sc); activeScene=sc; renderScenes(); loadEditor(); }
function defaultCorners(){ return [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}]; }
function switchScene(id){ activeScene=scenes.find(s=>s.id===id); _selLayer=(activeScene&&activeScene.layers&&activeScene.layers[0])?activeScene.layers[0].id:null; renderScenes(); loadEditor(); document.getElementById('srcLabel').textContent=(sources[activeScene?.sourceId]?.label||'Source'); drawCorners(); _updateCropOverlay(); renderLayerList(); drawLayout(); const isWb=activeScene&&sources[activeScene.sourceId]?.type==='whiteboard'; document.getElementById('wbToolbar').style.display=isWb?'flex':'none'; if(isWb){ wbSetTool(wbTool); _wbUpdatePageNav(sources[activeScene.sourceId]); } }
function renderScenes(){
  document.getElementById('sceneList').innerHTML = scenes.map(s => {
    const ic = {video:'🎥',screen:'🖥',whiteboard:'🖍',image:'📄'}[sources[s.sourceId]?.type] || '🎬';
    return JM.SceneTile({
      thumb: ic,
      name: s.name || 'Scene',
      active: activeScene?.id === s.id,
      onClick: `switchScene('${s.id}')`,
      actions: [{ label: '×', onClick: `delScene('${s.id}')` }]
    });
  }).join('') || '<div class="hint">No scenes yet.</div>';
}
function delScene(id){ scenes=scenes.filter(s=>s.id!==id); if(activeScene?.id===id) activeScene=scenes[0]||null; renderScenes(); loadEditor(); }
function updatePreset(k,v){ if(activeScene){ activeScene[k]=v; if(k==='name') renderScenes(); } }
function loadEditor(){ const tb=document.getElementById('wbToolbar'); if(!activeScene){ if(tb) tb.style.display='none'; return; } document.getElementById('presetName').value=activeScene.name||''; document.getElementById('zoom').value=activeScene.zoom||1; document.getElementById('rot').value=activeScene.rotation||0; drawCorners(); const srcType=sources[activeScene.sourceId]?.type; if(tb) tb.style.display=srcType==='whiteboard'?'flex':'none'; }
function resetCorners(){ if(activeScene){ activeScene.corners=defaultCorners(); drawCorners(); } }

// ── Multi-element LAYOUT (compositor) ───────────────────────────────────
// A scene with layers[] renders as a COMPOSITE — each element drawn at its own
// rect (normalized 0–1). A scene with no layers keeps the single-source +
// perspective-correction mode, so this is fully backward compatible.
let _layoutMode=false, _selLayer=null;
function _esc(s){ return String(s==null?'':s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])); }
function _layers(){ if(activeScene && !activeScene.layers) activeScene.layers=[]; return activeScene? activeScene.layers : []; }
function addLayer(sourceId){
  if(!sourceId) return;
  if(!activeScene){ addScene(sourceId); }
  const ls=_layers();
  // First element fills the frame; extras drop in as a corner picture-in-picture.
  const r = ls.length===0 ? {x:0,y:0,w:1,h:1} : {x:0.62,y:0.62,w:0.34,h:0.34};
  const ly={id:'ly_'+(ls.length)+'_'+Math.floor(performance.now()), sourceId, x:r.x,y:r.y,w:r.w,h:r.h};
  ls.push(ly); _selLayer=ly.id; renderScenes(); renderLayerList(); if(_layoutMode) drawLayout();
}
function delLayer(id){ const ls=_layers(); const i=ls.findIndex(l=>l.id===id); if(i>=0) ls.splice(i,1); if(_selLayer===id) _selLayer=ls[0]?ls[0].id:null; renderScenes(); renderLayerList(); drawLayout(); }
function selectLayer(id){ _selLayer=id; renderLayerList(); drawLayout(); }
function layerUp(id){ const ls=_layers(); const i=ls.findIndex(l=>l.id===id); if(i>=0 && i<ls.length-1){ const t=ls[i]; ls[i]=ls[i+1]; ls[i+1]=t; renderLayerList(); } }
function renderLayerList(){
  const box=document.getElementById('layerList'); if(!box) return;
  const ls=_layers();
  const ICO={video:'🎥',screen:'🖥',whiteboard:'🖍',image:'📄'};
  const avail=Object.entries(sources);
  const addBtns=avail.length
    ? avail.map(([id,s])=>`<button class="btn" style="width:100%;margin-bottom:4px;font-size:12px" onclick="addLayer('${id}')">+ ${ICO[s.type]||'🎬'} ${_esc(s.label||'Source')}</button>`).join('')
    : '<div class="hint">Add a source above first.</div>';
  const rows=ls.length
    ? `<div style="font-size:11px;color:var(--mut);margin:4px 0">Elements (front-most last · drag on preview):</div>`+ls.map((l,i)=>{ const s=sources[l.sourceId]; const ic=ICO[s&&s.type]||'🎬'; return `<div class="scene ${_selLayer===l.id?'active':''}" onclick="selectLayer('${l.id}')"><div class="thumb">${ic}</div><div class="nm">${_esc(s&&s.label||'Layer')} <span style="color:var(--mut);font-size:10px">${i+1}</span></div><button class="btn" style="padding:3px 6px" title="Bring forward" onclick="event.stopPropagation();layerUp('${l.id}')">▲</button><button class="btn" style="padding:3px 6px" onclick="event.stopPropagation();delLayer('${l.id}')">×</button></div>`; }).join('')
    : '';
  box.innerHTML=rows+`<div style="font-size:11px;color:var(--mut);margin:8px 0 4px">Add element to layout:</div>`+addBtns;
}
function applyLayoutPreset(kind){
  if(!activeScene) return;
  const ids=Object.keys(sources); if(!ids.length){ alert('Add at least one source first (camera, screen, whiteboard, image…).'); return; }
  const mk=(sourceId,x,y,w,h)=>({id:'ly_'+kind+ids.indexOf(sourceId)+'_'+Math.floor(performance.now()+Math.random()*1000),sourceId,x,y,w,h});
  if(kind==='pip'){
    const cam=ids.find(id=>sources[id].type==='video')||ids[0];
    const base=ids.find(id=>id!==cam)||cam;
    activeScene.layers=[ mk(base,0,0,1,1), mk(cam,0.70,0.68,0.28,0.28) ];
  } else {
    const a=ids[0], b=ids[1]||ids[0];
    activeScene.layers=[ mk(a,0,0.1,0.5,0.8), mk(b,0.5,0.1,0.5,0.8) ];
  }
  _selLayer=activeScene.layers[0].id; renderScenes(); renderLayerList(); if(_layoutMode) drawLayout();
}
function toggleLayout(){
  _layoutMode=!_layoutMode;
  document.getElementById('btnLayout').classList.toggle('on',_layoutMode);
  // Layout and corner-adjust are mutually exclusive editing modes.
  if(_layoutMode && _adjustMode){ _adjustMode=false; document.getElementById('btnAdjust').classList.remove('on'); document.getElementById('adjustHint').style.display='none'; drawCorners(); }
  if(_layoutMode && !_layers().length) document.getElementById('layoutHint').innerHTML='Add elements below, then drag each box to move and the purple corner to resize.';
  drawLayout();
}
function drawLayout(){
  const wrap=document.getElementById('outWrap'); wrap.querySelectorAll('.lybox,.lyhandle').forEach(e=>e.remove());
  if(!_layoutMode || !activeScene || !_layers().length) return;
  const rr=outRect();
  _layers().forEach(l=>{
    const sel=_selLayer===l.id;
    const box=document.createElement('div'); box.className='lybox';
    box.style.cssText=`position:absolute;border:2px solid ${sel?'var(--jm-primary,#7c3aed)':'rgba(255,255,255,.55)'};border-radius:4px;cursor:move;z-index:7;${sel?'box-shadow:0 0 0 1px #fff':''}`;
    const place=()=>{ box.style.left=(l.x*rr.width)+'px'; box.style.top=(l.y*rr.height)+'px'; box.style.width=(l.w*rr.width)+'px'; box.style.height=(l.h*rr.height)+'px'; };
    place();
    box.addEventListener('pointerdown',(e)=>{ e.preventDefault(); e.stopPropagation(); _selLayer=l.id; renderLayerList(); drawLayout(); box.setPointerCapture?.(e.pointerId); let px=e.clientX,py=e.clientY;
      const mv=(ev)=>{ const dx=(ev.clientX-px)/rr.width, dy=(ev.clientY-py)/rr.height; px=ev.clientX; py=ev.clientY; l.x=Math.max(0,Math.min(1-l.w,l.x+dx)); l.y=Math.max(0,Math.min(1-l.h,l.y+dy)); place(); _placeHandles(); };
      const up=()=>{ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); };
      window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up); });
    wrap.appendChild(box);
    if(sel){
      const rs=document.createElement('div'); rs.className='lyhandle';
      rs.style.cssText='position:absolute;width:20px;height:20px;background:var(--jm-primary,#7c3aed);border:2px solid #fff;border-radius:3px;cursor:nwse-resize;z-index:8;touch-action:none';
      rs._layer=l;
      rs.addEventListener('pointerdown',(e)=>{ e.preventDefault(); e.stopPropagation(); rs.setPointerCapture?.(e.pointerId);
        const mv=(ev)=>{ const nx=(ev.clientX-rr.left)/rr.width, ny=(ev.clientY-rr.top)/rr.height; l.w=Math.max(0.08,Math.min(1-l.x,nx-l.x)); l.h=Math.max(0.08,Math.min(1-l.y,ny-l.y)); place(); _placeHandles(); };
        const up=()=>{ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); };
        window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up); });
      wrap.appendChild(rs);
    }
  });
  _placeHandles();
}
function _placeHandles(){ const rr=outRect(); const wrap=document.getElementById('outWrap'); wrap.querySelectorAll('.lyhandle').forEach(rs=>{ const l=rs._layer; if(!l) return; rs.style.left=((l.x+l.w)*rr.width-10)+'px'; rs.style.top=((l.y+l.h)*rr.height-10)+'px'; }); }
window.addEventListener('resize', drawLayout);
// Composite renderer — draws every layer at its rect (back-to-front).
function renderComposite(scene){
  for(const l of scene.layers){ const s=sources[l.sourceId]; if(!srcReady(s)) continue;
    try{ octx.drawImage(s.el, l.x*out.width, l.y*out.height, l.w*out.width, l.h*out.height); }catch(e){}
  }
}

// ── Corner adjustment on the BIG preview ───────────────────────────────
function toggleAdjust(){ _adjustMode=!_adjustMode; document.getElementById('btnAdjust').classList.toggle('on',_adjustMode); document.getElementById('adjustHint').style.display=_adjustMode?'inline':'none'; drawCorners(); }
function outRect(){ return out.getBoundingClientRect(); }
function _fmt(){ const [w,h]=(document.getElementById('fmtSelect')?.value||'1280x720').split('x').map(Number); return {w,h}; }
function _ptsStr(){ const {w,h}=_fmt(); return activeScene.corners.map(c=>`${c.x*w},${c.y*h}`).join(' '); }
function _redrawFrame(){ const svg=document.getElementById('cornerSvg'); if(!svg||!activeScene) return; const {w,h}=_fmt();
  const pts=_ptsStr();
  // Dim everything OUTSIDE the selected quad (evenodd) so the crop frame is obvious.
  svg.innerHTML=`<path d="M0,0 H${w} V${h} H0 Z M${activeScene.corners.map(c=>(c.x*w)+','+(c.y*h)).join(' L')} Z" fill="rgba(0,0,0,.5)" fill-rule="evenodd"/>
    <polygon points="${pts}" fill="none" stroke="#fff" stroke-width="2"/>
    <polygon points="${pts}" fill="none" stroke="var(--jm-primary,#7c3aed)" stroke-width="4" stroke-dasharray="10 6"/>`;
}
function drawCorners(){
  const wrap=document.getElementById('outWrap'); wrap.querySelectorAll('.corner,.movehandle').forEach(c=>c.remove());
  const svg=document.getElementById('cornerSvg'); svg.innerHTML='';
  if(!_adjustMode||!activeScene){ svg.style.display='none'; return; }
  const {w,h}=_fmt(); svg.setAttribute('viewBox','0 0 '+w+' '+h);
  svg.style.display='block'; _redrawFrame();
  const place=(el,c)=>{ const rr=outRect(); el.style.left=(c.x*rr.width)+'px'; el.style.top=(c.y*rr.height)+'px'; };
  // 4 corner handles
  activeScene.corners.forEach((c)=>{
    const el=document.createElement('div'); el.className='corner'; place(el,c);
    el.addEventListener('pointerdown',(e)=>{ e.preventDefault(); el.setPointerCapture?.(e.pointerId);
      const mv=(ev)=>{ const rr=outRect(); c.x=Math.min(1,Math.max(0,(ev.clientX-rr.left)/rr.width)); c.y=Math.min(1,Math.max(0,(ev.clientY-rr.top)/rr.height)); place(el,c); _redrawFrame(); };
      const up=()=>{ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); };
      window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up); });
    wrap.appendChild(el);
  });
  // Center MOVE handle — drag the whole crop frame.
  const cx=activeScene.corners.reduce((s,c)=>s+c.x,0)/4, cy=activeScene.corners.reduce((s,c)=>s+c.y,0)/4;
  const mh=document.createElement('div'); mh.className='corner movehandle';
  mh.style.background='#fff'; mh.style.width='30px'; mh.style.height='30px'; mh.style.display='flex'; mh.style.alignItems='center'; mh.style.justifyContent='center'; mh.style.color='var(--jm-primary,#7c3aed)'; mh.style.fontSize='16px'; mh.textContent='✥';
  place(mh,{x:cx,y:cy});
  mh.addEventListener('pointerdown',(e)=>{ e.preventDefault(); mh.setPointerCapture?.(e.pointerId); const rr0=outRect(); let lx=e.clientX, ly=e.clientY;
    const mv=(ev)=>{ const dx=(ev.clientX-lx)/rr0.width, dy=(ev.clientY-ly)/rr0.height; lx=ev.clientX; ly=ev.clientY;
      // clamp so the whole quad stays in-frame
      const minX=Math.min(...activeScene.corners.map(c=>c.x)), maxX=Math.max(...activeScene.corners.map(c=>c.x));
      const minY=Math.min(...activeScene.corners.map(c=>c.y)), maxY=Math.max(...activeScene.corners.map(c=>c.y));
      const ddx=Math.max(-minX,Math.min(1-maxX,dx)), ddy=Math.max(-minY,Math.min(1-maxY,dy));
      activeScene.corners.forEach(c=>{ c.x+=ddx; c.y+=ddy; });
      wrap.querySelectorAll('.corner:not(.movehandle)').forEach((el,i)=>place(el,activeScene.corners[i]));
      const c2={x:activeScene.corners.reduce((s,c)=>s+c.x,0)/4,y:activeScene.corners.reduce((s,c)=>s+c.y,0)/4}; place(mh,c2); _redrawFrame(); };
    const up=()=>{ window.removeEventListener('pointermove',mv); window.removeEventListener('pointerup',up); };
    window.addEventListener('pointermove',mv); window.addEventListener('pointerup',up); });
  wrap.appendChild(mh);
}

// ── Format names for badge + toast ─────────────────────────────────────
const FMT_LABELS={
  '1280x720':'16:9 · 720p',
  '1920x1080':'16:9 · 1080p',
  '1080x1920':'9:16 · Portrait',
  '1080x1080':'1:1 · Square',
  '960x720':'4:3 · Classic'
};
let _pendingFmt=null, _arCropBox={x:0.1,y:0.1,w:0.8,h:0.8};

function _applyFormat(v){
  const sel=document.getElementById('fmtSelect'); if(sel&&sel.value!==v) sel.value=v;
  const [w,h]=v.split('x').map(Number); out.width=w; out.height=h;
  if(glCanvas){ glCanvas.width=w; glCanvas.height=h; }
  out.style.aspectRatio=w+' / '+h; out.style.height='auto';
  const svg=document.getElementById('cornerSvg'); if(svg) svg.setAttribute('viewBox','0 0 '+w+' '+h);
  const badge=document.querySelector('.stage .badge+.badge'); if(badge) badge.textContent=w+'×'+h;
  const fb=document.getElementById('fmtBadge'); if(fb) fb.textContent=FMT_LABELS[v]||v;
  resetCorners();
  showToast('Switched to '+(FMT_LABELS[v]||v));
  if(activeScene) drawCorners();
}

const AR_PLATFORM_HINTS={
  '1920x1080':'📺 16:9 — YouTube, Zoom, Google Meet, Teams, projectors',
  '1280x720' :'📺 16:9 HD — YouTube, streaming, webinar recording',
  '1080x1920':'📱 9:16 Vertical — Instagram Reels, TikTok, YouTube Shorts',
  '1080x1080':'⬜ 1:1 Square — Instagram feed, Facebook posts',
  '960x720'  :'📚 4:3 Classic — older projectors, some LMS platforms'
};
const AR_RATIO_LABEL={
  '1920x1080':'16:9','1280x720':'16:9 HD','1080x1920':'9:16 Portrait',
  '720x1280':'9:16 Portrait','1080x1080':'1:1','960x720':'4:3'
};

function _arSetChips(fmt){
  document.querySelectorAll('[data-arq]').forEach(b=>{
    const active=b.dataset.arq===fmt;
    b.style.background=active?'var(--jm-primary,#7c3aed)':'transparent';
    b.style.color=active?'#fff':'#ccc';
    b.style.borderColor=active?'var(--jm-primary,#7c3aed)':'#444';
  });
  const lbl=document.getElementById('arCropLabel');
  if(lbl) lbl.textContent=(AR_PLATFORM_HINTS[fmt]||fmt);
  const hint=document.getElementById('arPlatformHint');
  if(hint) hint.innerHTML=AR_PLATFORM_HINTS[fmt]||fmt;
  const boxLbl=document.getElementById('arCropBoxLabel');
  if(boxLbl) boxLbl.textContent=AR_RATIO_LABEL[fmt]||fmt;
}

function arQuickSwitch(fmt){
  // Stay in crop modal but re-init the crop box for the new format
  _pendingFmt=fmt;
  const [tw,th]=fmt.split('x').map(Number);
  const targetAR=tw/th;
  const preview=document.getElementById('arCropPreview');
  const srcAR=preview.width/preview.height||1;
  let bw,bh;
  if(targetAR>=srcAR){bw=1;bh=srcAR/targetAR;}else{bh=1;bw=targetAR/srcAR;}
  _arCropBox={x:(1-bw)/2,y:(1-bh)/2,w:bw,h:bh};
  _arSetChips(fmt);
  _arUpdateBox(targetAR);
  _arBindDrag(targetAR);
}

function openArCropSelector(newFmt){
  _pendingFmt=newFmt;
  const [tw,th]=newFmt.split('x').map(Number);
  const targetAR=tw/th;
  const preview=document.getElementById('arCropPreview');
  // Snapshot the RAW source so re-selecting always shows the full original frame
  const s=activeScene&&sources[activeScene.sourceId];
  const srcEl=s?s.el:null;
  const rawW=(srcEl&&(srcEl.videoWidth||srcEl.width))||out.width;
  const rawH=(srcEl&&(srcEl.videoHeight||srcEl.height))||out.height;
  preview.width=rawW; preview.height=rawH;
  try{
    const pc=preview.getContext('2d');
    pc.fillStyle='#222'; pc.fillRect(0,0,rawW,rawH);
    if(srcEl) pc.drawImage(srcEl,0,0,rawW,rawH);
  }catch(e){}
  const srcAR=rawW/rawH||1;
  let bw,bh;
  if(targetAR>=srcAR){bw=1;bh=srcAR/targetAR;}else{bh=1;bw=targetAR/srcAR;}
  _arCropBox={x:(1-bw)/2,y:(1-bh)/2,w:bw,h:bh};
  _arSetChips(newFmt);
  document.getElementById('arCropModal').style.display='flex';
  let _tries=0;
  function _waitLayout(){
    if(preview.offsetWidth>0||_tries++>30){_arUpdateBox(targetAR);_arBindDrag(targetAR);}
    else requestAnimationFrame(_waitLayout);
  }
  requestAnimationFrame(_waitLayout);
}

function _arUpdateBox(ar){
  const wrap=document.getElementById('arCropWrap');
  const box=document.getElementById('arCropBox');
  if(!wrap||!box) return;
  // Use wrap dimensions — the canvas CSS-scales inside it
  const pw=wrap.offsetWidth, ph=wrap.offsetHeight;
  if(!pw||!ph) return;
  const px=_arCropBox.x*pw, py=_arCropBox.y*ph;
  const bw=_arCropBox.w*pw, bh=_arCropBox.h*ph;
  box.style.left=px+'px'; box.style.top=py+'px';
  box.style.width=bw+'px'; box.style.height=bh+'px';
  const t=document.getElementById('arcDimT'),b=document.getElementById('arcDimB');
  const l=document.getElementById('arcDimL'),r=document.getElementById('arcDimR');
  if(t) t.style.height=py+'px';
  if(b){b.style.top=(py+bh)+'px';b.style.height=(ph-py-bh)+'px';}
  if(l){l.style.top=py+'px';l.style.height=bh+'px';l.style.width=px+'px';}
  if(r){r.style.top=py+'px';r.style.height=bh+'px';r.style.left=(px+bw)+'px';r.style.width=(pw-px-bw)+'px';}
}

function _arBindDrag(targetAR){
  const wrap=document.getElementById('arCropWrap');
  const box=document.getElementById('arCropBox');
  const preview=document.getElementById('arCropPreview');
  if(!wrap||!box) return;
  // targetAR is output W/H ratio; _arCropBox is in normalized SOURCE coords.
  // In source-normalized space the crop box ratio nw/nh = outputAR/sourceAR.
  const srcAR=(preview&&preview.height)?preview.width/preview.height:1;
  const normAR=targetAR/srcAR;  // crop box nw/nh constraint in source coords
  let drag=null;
  box.onpointerdown=e=>{
    if(e.target!==box) return;
    e.preventDefault();
    drag={sx:e.clientX,sy:e.clientY,ox:_arCropBox.x,oy:_arCropBox.y};
    box.setPointerCapture(e.pointerId);
  };
  box.onpointermove=e=>{
    if(!drag) return;
    const pw=wrap.offsetWidth, ph=wrap.offsetHeight;
    const dx=(e.clientX-drag.sx)/pw, dy=(e.clientY-drag.sy)/ph;
    _arCropBox.x=Math.max(0,Math.min(1-_arCropBox.w,drag.ox+dx));
    _arCropBox.y=Math.max(0,Math.min(1-_arCropBox.h,drag.oy+dy));
    _arUpdateBox(targetAR);
  };
  box.onpointerup=()=>{drag=null;};
  document.querySelectorAll('.arc-h').forEach(h=>{
    let rd=null;
    h.onpointerdown=e=>{
      e.preventDefault(); e.stopPropagation();
      rd={sx:e.clientX,sy:e.clientY,box:{..._arCropBox},id:h.id};
      h.setPointerCapture(e.pointerId);
    };
    h.onpointermove=e=>{
      if(!rd) return;
      const pw=wrap.offsetWidth, ph=wrap.offsetHeight;
      const dx=(e.clientX-rd.sx)/pw, dy=(e.clientY-rd.sy)/ph;
      let {x,y,w,h:bh2}=rd.box;
      let nw,nh;
      // normAR = nw/nh ratio for the crop box in source-normalized coords
      if(rd.id==='arc-tl'){nw=Math.min(normAR,Math.max(0.05,w-dx));nh=nw/normAR;_arCropBox={x:x+w-nw,y:y+bh2-nh,w:nw,h:nh};}
      else if(rd.id==='arc-tr'){nw=Math.min(normAR,Math.max(0.05,w+dx));nh=nw/normAR;_arCropBox={x,y:y+bh2-nh,w:nw,h:nh};}
      else if(rd.id==='arc-bl'){nw=Math.min(normAR,Math.max(0.05,w-dx));nh=nw/normAR;_arCropBox={x:x+w-nw,y,w:nw,h:nh};}
      else{nw=Math.min(normAR,Math.max(0.05,w+dx));nh=nw/normAR;_arCropBox={x,y,w:nw,h:nh};}
      _arCropBox.x=Math.max(0,Math.min(1-_arCropBox.w,_arCropBox.x));
      _arCropBox.y=Math.max(0,Math.min(1-_arCropBox.h,_arCropBox.y));
      _arUpdateBox(targetAR);
    };
    h.onpointerup=()=>{rd=null;};
  });
}

function applyArCrop(){
  _srcCrop={x:_arCropBox.x,y:_arCropBox.y,w:_arCropBox.w,h:_arCropBox.h};
  _srcCropMode=true;
  _applyFormat(_pendingFmt);
  document.getElementById('arCropModal').style.display='none';
  const rb=document.getElementById('btnRecrop'); if(rb) rb.style.display='inline-flex';
  showToast('Crop applied — use corner handles to refine perspective');
}

function applyArCropFull(){
  _srcCropMode=false;
  _applyFormat(_pendingFmt);
  document.getElementById('arCropModal').style.display='none';
  const rb=document.getElementById('btnRecrop'); if(rb) rb.style.display='none';
}

function cancelArCrop(){
  document.getElementById('arCropModal').style.display='none';
  _pendingFmt=null;
}

function setFormat(v){
  if(activeScene&&sources[activeScene.sourceId]){
    openArCropSelector(v);
  } else {
    _applyFormat(v);
  }
}
window.addEventListener('resize', drawCorners);
function loadBrandLogo(input){ const f=input.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ const im=new Image(); im.onload=()=>brandImg=im; im.src=r.result; }; r.readAsDataURL(f); }

// ── Whiteboard tools ───────────────────────────────────────────────────
let wbDraw=false, wbLast=null, wbStart=null;
let wbTool='pen', wbColor='#1a1a25', wbSize=4, wbBg='white';
let wbSnap=null; // snapshot before shape preview

function _wbS(){ const s=activeScene&&sources[activeScene.sourceId]; return s&&s.type==='whiteboard'?s:null; }
function wbPt(e){ const r=outRect(); const s=_wbS(); const cw=s?s.el.width:out.width; const ch=s?s.el.height:out.height; return {x:(e.clientX-r.left)/r.width*cw, y:(e.clientY-r.top)/r.height*ch}; }

// Draw whiteboard background pattern
function wbDrawBg(s, bg){
  const ctx=s.ctx, W=s.el.width, H=s.el.height;
  if(bg==='white'){ ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,W,H); }
  else if(bg==='custom'){ ctx.fillStyle=_wbCustomBgColor||'#ffffff'; ctx.fillRect(0,0,W,H); }
  else if(bg==='black'){ ctx.fillStyle='#1a1a2e'; ctx.fillRect(0,0,W,H); }
  else if(bg==='grid'){
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#d0d0e0'; ctx.lineWidth=1;
    for(let x=0;x<=W;x+=40){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }
    for(let y=0;y<=H;y+=40){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }
  } else if(bg==='dotgrid'){
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#b0b0c8';
    for(let x=0;x<=W;x+=40) for(let y=0;y<=H;y+=40){ ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill(); }
  } else if(bg==='graph'){
    ctx.fillStyle='#f0f8ff'; ctx.fillRect(0,0,W,H);
    // minor lines
    ctx.strokeStyle='#c8ddf0'; ctx.lineWidth=0.5;
    for(let x=0;x<=W;x+=20){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }
    for(let y=0;y<=H;y+=20){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }
    // major lines
    ctx.strokeStyle='#8ab4d4'; ctx.lineWidth=1;
    for(let x=0;x<=W;x+=100){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }
    for(let y=0;y<=H;y+=100){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }
  } else if(bg==='lines'){
    ctx.fillStyle='#fffef0'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='#c0c8e0'; ctx.lineWidth=1;
    for(let y=60;y<=H;y+=40){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }
    ctx.strokeStyle='#f0a0a0'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(80,0);ctx.lineTo(80,H);ctx.stroke();
  }
}

function wbSetBg(bg){
  const s=_wbS(); if(!s) return;
  wbBg=bg;
  wbDrawBg(s,bg);
  document.querySelectorAll('.wb-bg-btn').forEach(b=>b.classList.toggle('on',b.dataset.bg===bg));
}

function wbClear(){
  const s=_wbS(); if(!s) return;
  wbDrawBg(s,wbBg);
}

function wbUndo(){
  const s=_wbS(); if(!s||!s.undoStack||!s.undoStack.length) return;
  if(!s.redoStack) s.redoStack=[];
  s.redoStack.push(s.ctx.getImageData(0,0,s.el.width,s.el.height));
  s.ctx.putImageData(s.undoStack.pop(),0,0);
}

function wbRedo(){
  const s=_wbS(); if(!s||!s.redoStack||!s.redoStack.length) return;
  if(!s.undoStack) s.undoStack=[];
  s.undoStack.push(s.ctx.getImageData(0,0,s.el.width,s.el.height));
  s.ctx.putImageData(s.redoStack.pop(),0,0);
}

function _wbPushUndo(){
  const s=_wbS(); if(!s) return;
  if(!s.undoStack) s.undoStack=[];
  if(s.undoStack.length>30) s.undoStack.shift();
  s.undoStack.push(s.ctx.getImageData(0,0,s.el.width,s.el.height));
  s.redoStack=[];  // any new draw clears redo history
}

function wbSetTool(t){
  wbTool=t;
  document.querySelectorAll('.wb-tool').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));
  out.style.cursor=t==='eraser'?'cell':t==='text'?'text':'crosshair';
  if(t!=='text') document.getElementById('wbTextWindow').style.display='none';
}
function wbToggleFillMode(){
  wbFillMode=!wbFillMode;
  const btn=document.getElementById('wbFillToggle');
  if(btn){ btn.textContent=wbFillMode?'Filled':'Outline'; btn.style.color=wbFillMode?'#c4b5fd':'#9098ac'; btn.style.borderColor=wbFillMode?'var(--jm-primary,#7c3aed)':''; }
}

// ── Color slot system (slot 1=primary/fg, slot 2=secondary/bg-of-text) ───
let _wbActiveSlot=1, _wbSlot1='#000000', _wbSlot2='#ffffff';
let wbFillMode=false;

function _wbSyncSwatches(){
  const s1=document.getElementById('wbColor1Swatch'), s2=document.getElementById('wbColor2Swatch');
  const m1=document.getElementById('wbC1Mini'),       m2=document.getElementById('wbC2Mini');
  const lbl=document.getElementById('wbActiveSlotLabel');
  const pk=document.getElementById('wbColorPicker');
  if(s1){ s1.style.background=_wbSlot1; s1.style.boxShadow=_wbActiveSlot===1?'0 0 0 2px var(--jm-primary,#7c3aed)':'none'; }
  if(s2){ s2.style.background=_wbSlot2; s2.style.boxShadow=_wbActiveSlot===2?'0 0 0 2px var(--jm-primary,#7c3aed)':'none'; }
  if(m1) m1.style.background=_wbSlot1;
  if(m2) m2.style.background=_wbSlot2;
  if(lbl) lbl.textContent=_wbActiveSlot===1?'Primary':'Secondary';
  if(pk)  pk.value=(_wbActiveSlot===1?_wbSlot1:_wbSlot2);
  wbColor=_wbSlot1;
}
function wbSetColor(c){ _wbSlot1=c; wbColor=c; _wbSyncSwatches(); }
function wbActivateSlot(n){ _wbActiveSlot=n; _wbSyncSwatches(); }
function wbSetColorSlot(c){
  if(_wbActiveSlot===1) _wbSlot1=c; else _wbSlot2=c;
  _wbSyncSwatches();
}
function wbSwapColors(){
  const t=_wbSlot1; _wbSlot1=_wbSlot2; _wbSlot2=t;
  _wbSyncSwatches();
}

function wbSetSize(v){ wbSize=+v; }
function wbSetSizePreset(v){
  wbSize=v;
  const r=document.getElementById('wbSizeRange'); if(r) r.value=v;
  const lbl=document.getElementById('wbSizeVal'); if(lbl) lbl.textContent=v;
}

// ── Toolbar group toggle / close ─────────────────────────────────────────
function wbToggleGroup(name){
  const drop=document.getElementById('wbgDrop-'+name);
  const btn=document.getElementById('wbgBtn-'+name);
  if(!drop) return;
  const opening=!drop.classList.contains('open');
  wbCloseGroups();
  if(opening){
    drop.classList.add('open');
    if(btn) btn.classList.add('open');
    // Position fixed relative to button so it escapes overflow:hidden containers
    const r=btn ? btn.getBoundingClientRect() : drop.getBoundingClientRect();
    drop.style.left = r.left+'px';
    const spaceBelow = window.innerHeight - r.bottom;
    if(spaceBelow >= 240){
      drop.style.top = r.bottom+2+'px';
      drop.style.bottom = '';
    } else {
      drop.style.bottom = window.innerHeight - r.top + 2 + 'px';
      drop.style.top = '';
    }
  }
}
function wbCloseGroups(){
  document.querySelectorAll('.wbg-drop.open').forEach(d=>d.classList.remove('open'));
  document.querySelectorAll('.wbg-btn.open').forEach(b=>b.classList.remove('open'));
}
document.addEventListener('click',function(e){
  if(!e.target.closest('#wbToolbar')) wbCloseGroups();
});

// Shape drawing helpers
function _wbDrawShape(ctx,tool,x0,y0,x1,y1,color,size,fill){
  ctx.strokeStyle=color; ctx.fillStyle=color; ctx.lineWidth=size; ctx.lineCap='round'; ctx.lineJoin='round';
  ctx.beginPath();
  if(tool==='line'){ ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke(); }
  else if(tool==='rect'){
    if(fill){ ctx.fillRect(x0,y0,x1-x0,y1-y0); } else { ctx.strokeRect(x0,y0,x1-x0,y1-y0); }
  } else if(tool==='circle'){
    const rx=(x1-x0)/2, ry=(y1-y0)/2;
    ctx.ellipse(x0+rx,y0+ry,Math.abs(rx),Math.abs(ry),0,0,Math.PI*2);
    if(fill){ ctx.fill(); } else { ctx.stroke(); }
  } else if(tool==='arrow'){
    ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
    const angle=Math.atan2(y1-y0,x1-x0);
    const hs=Math.max(size*4,16);
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x1-hs*Math.cos(angle-0.4),y1-hs*Math.sin(angle-0.4));
    ctx.lineTo(x1-hs*Math.cos(angle+0.4),y1-hs*Math.sin(angle+0.4));
    ctx.closePath(); ctx.fill();
  }
}

// ── Selection + Move + Resize state ─────────────────────────────────────
let wbSelecting=false, wbSelection=null;  // rubber-band / current selection {x,y,w,h}
let wbClipboard=null;                     // ImageData for copy/paste
let wbMoving=false, wbMoveOff=null, wbMoveData=null, wbMoveBg=null;
let wbResizing=false, wbResizeDir=null, wbResizeData=null, wbResizeBg=null, wbResizeOrig=null;

function _wbBgColor(){ return wbBg==='black'?'#1a1a2e': wbBg==='custom'?_wbCustomBgColor:'#ffffff'; }
let _wbCustomBgColor='#ffffff';

function _wbUpdateSelBox(){
  const box=document.getElementById('wbSelBox');
  if(!wbSelection||wbSelection.w<2||wbSelection.h<2){ box.style.display='none'; return; }
  const s=_wbS(); if(!s) return;
  const outEl=document.getElementById('out');
  const r=outEl.getBoundingClientRect();
  const parent=outEl.parentElement;
  const pr=parent.getBoundingClientRect();
  const scaleX=r.width/s.el.width;
  const scaleY=r.height/s.el.height;
  box.style.display='block';
  box.style.left=(r.left-pr.left+wbSelection.x*scaleX)+'px';
  box.style.top=(r.top-pr.top+wbSelection.y*scaleY)+'px';
  box.style.width=(wbSelection.w*scaleX)+'px';
  box.style.height=(wbSelection.h*scaleY)+'px';
}

function wbCopy(){
  const s=_wbS(); if(!s||!wbSelection) return;
  const {x,y,w,h}=wbSelection; if(w<1||h<1) return;
  wbClipboard=s.ctx.getImageData(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
}
function wbCut(){
  const s=_wbS(); if(!s||!wbSelection) return;
  wbCopy(); _wbPushUndo();
  const {x,y,w,h}=wbSelection;
  s.ctx.fillStyle=_wbBgColor(); s.ctx.fillRect(x,y,w,h);
  wbSelection=null; _wbUpdateSelBox();
}
function wbPaste(){
  const s=_wbS(); if(!s||!wbClipboard) return;
  _wbPushUndo();
  const ox=Math.min(s.el.width-wbClipboard.width, 40);
  const oy=Math.min(s.el.height-wbClipboard.height, 40);
  s.ctx.putImageData(wbClipboard, ox, oy);
  wbSelection={x:ox,y:oy,w:wbClipboard.width,h:wbClipboard.height};
  _wbUpdateSelBox();
}

function _ptInSel(p){
  if(!wbSelection) return false;
  return p.x>=wbSelection.x && p.x<=wbSelection.x+wbSelection.w &&
         p.y>=wbSelection.y && p.y<=wbSelection.y+wbSelection.h;
}

// ── Resize handle wiring ─────────────────────────────────────────────────
(function _bindResizeHandles(){
  document.querySelectorAll('.wb-rsz').forEach(h=>{
    h.addEventListener('pointerdown',e=>{
      e.stopPropagation(); e.preventDefault();
      const s=_wbS(); if(!s||!wbSelection) return;
      wbResizeDir=h.dataset.dir;
      wbResizeOrig={...wbSelection};
      // extract just the selected pixels
      wbResizeData=s.ctx.getImageData(Math.round(wbSelection.x),Math.round(wbSelection.y),
                                       Math.round(wbSelection.w),Math.round(wbSelection.h));
      // background snapshot WITHOUT the selection (erase it first)
      _wbPushUndo();
      s.ctx.fillStyle=_wbBgColor();
      s.ctx.fillRect(wbResizeOrig.x,wbResizeOrig.y,wbResizeOrig.w,wbResizeOrig.h);
      wbResizeBg=s.ctx.getImageData(0,0,s.el.width,s.el.height);
      wbResizing=true;
      h.setPointerCapture(e.pointerId);
    });
    h.addEventListener('pointermove',e=>{
      if(!wbResizing) return;
      const s=_wbS(); if(!s) return;
      const p=wbPt(e);
      const o=wbResizeOrig;
      let nx=o.x,ny=o.y,nw=o.w,nh=o.h;
      if(wbResizeDir.includes('e')) nw=Math.max(10,p.x-o.x);
      if(wbResizeDir.includes('s')) nh=Math.max(10,p.y-o.y);
      if(wbResizeDir.includes('w')){ nx=Math.min(p.x,o.x+o.w-10); nw=o.x+o.w-nx; }
      if(wbResizeDir.includes('n')){ ny=Math.min(p.y,o.y+o.h-10); nh=o.y+o.h-ny; }
      nw=Math.round(Math.max(10,nw)); nh=Math.round(Math.max(10,nh));
      nx=Math.round(nx); ny=Math.round(ny);
      // restore bg, draw scaled content
      s.ctx.putImageData(wbResizeBg,0,0);
      const tmp=document.createElement('canvas');
      tmp.width=wbResizeOrig.w; tmp.height=wbResizeOrig.h;
      tmp.getContext('2d').putImageData(wbResizeData,0,0);
      s.ctx.drawImage(tmp,nx,ny,nw,nh);
      wbSelection={x:nx,y:ny,w:nw,h:nh};
      _wbUpdateSelBox();
    });
    h.addEventListener('pointerup',()=>{ wbResizing=false; });
  });
})();

// ── Canvas pointer events ─────────────────────────────────────────────────
out.addEventListener('pointerdown',e=>{
  const s=_wbS(); if(_adjustMode||!s) return;
  e.preventDefault();
  const p=wbPt(e);

  if(wbTool==='text'){
    // Open text input window near the click point
    const win=document.getElementById('wbTextWindow');
    const r=outRect();
    const screenX=r.left + p.x/((activeScene&&sources[activeScene.sourceId]?.el?.width)||out.width)*r.width;
    const screenY=r.top  + p.y/((activeScene&&sources[activeScene.sourceId]?.el?.height)||out.height)*r.height;
    win.style.left=Math.min(screenX, window.innerWidth-300)+'px';
    win.style.top=Math.min(screenY+8, window.innerHeight-260)+'px';
    win.style.display='block';
    win._canvasX=p.x; win._canvasY=p.y;
    setTimeout(()=>document.getElementById('wbTextInput').focus(),60);
    return;
  }

  if(wbTool==='select'){
    // If inside existing selection → start move
    if(wbSelection && _ptInSel(p)){
      _wbPushUndo();
      wbMoveData=s.ctx.getImageData(Math.round(wbSelection.x),Math.round(wbSelection.y),
                                     Math.round(wbSelection.w),Math.round(wbSelection.h));
      // erase selection area, snapshot the result as bg
      s.ctx.fillStyle=_wbBgColor();
      s.ctx.fillRect(wbSelection.x,wbSelection.y,wbSelection.w,wbSelection.h);
      wbMoveBg=s.ctx.getImageData(0,0,s.el.width,s.el.height);
      wbMoveOff={x:p.x-wbSelection.x, y:p.y-wbSelection.y};
      wbMoving=true;
    } else {
      // Start new rubber-band selection
      wbSelection=null; _wbUpdateSelBox();
      wbSelecting=true; wbStart=p;
    }
    out.setPointerCapture(e.pointerId);
    return;
  }

  _wbPushUndo();
  wbDraw=true; wbLast=p; wbStart=p;
  if(wbTool==='pen'||wbTool==='eraser'){
    s.ctx.beginPath(); s.ctx.moveTo(p.x,p.y);
  } else {
    wbSnap=s.ctx.getImageData(0,0,s.el.width,s.el.height);
  }
  out.setPointerCapture(e.pointerId);
});

out.addEventListener('pointermove',e=>{
  const s=_wbS(); if(!s) return;

  // Move drag
  if(wbMoving){
    const p=wbPt(e);
    const nx=Math.round(p.x-wbMoveOff.x), ny=Math.round(p.y-wbMoveOff.y);
    s.ctx.putImageData(wbMoveBg,0,0);
    s.ctx.putImageData(wbMoveData,nx,ny);
    wbSelection={x:nx,y:ny,w:wbSelection.w,h:wbSelection.h};
    _wbUpdateSelBox(); return;
  }

  // Rubber-band selection
  if(wbSelecting){
    const p=wbPt(e);
    wbSelection={x:Math.min(wbStart.x,p.x),y:Math.min(wbStart.y,p.y),
                 w:Math.abs(p.x-wbStart.x),h:Math.abs(p.y-wbStart.y)};
    _wbUpdateSelBox(); return;
  }

  if(!wbDraw){
    if(wbTool==='select'){
      const hp=wbPt(e);
      out.style.cursor=(_ptInSel(hp))?'move':'crosshair';
    } else {
      out.style.cursor=wbTool==='eraser'?'cell':'crosshair';
    }
    return;
  }
  const p=wbPt(e);
  if(wbTool==='pen'){
    s.ctx.strokeStyle=wbColor; s.ctx.lineWidth=wbSize; s.ctx.lineCap='round'; s.ctx.lineJoin='round';
    s.ctx.lineTo(p.x,p.y); s.ctx.stroke(); s.ctx.beginPath(); s.ctx.moveTo(p.x,p.y);
  } else if(wbTool==='eraser'){
    s.ctx.globalCompositeOperation='destination-out';
    s.ctx.beginPath(); s.ctx.arc(p.x,p.y,wbSize*3,0,Math.PI*2); s.ctx.fill();
    s.ctx.globalCompositeOperation='destination-over';
    s.ctx.fillStyle=_wbBgColor();
    s.ctx.beginPath(); s.ctx.arc(p.x,p.y,wbSize*3,0,Math.PI*2); s.ctx.fill();
    s.ctx.globalCompositeOperation='source-over';
  } else {
    if(wbSnap) s.ctx.putImageData(wbSnap,0,0);
    _wbDrawShape(s.ctx,wbTool,wbStart.x,wbStart.y,p.x,p.y,wbColor,wbSize,wbFillMode);
  }
  wbLast=p;
});

window.addEventListener('pointerup',e=>{
  if(wbMoving){ wbMoving=false; wbMoveBg=null; wbMoveData=null; _wbUpdateSelBox(); return; }
  if(wbSelecting){ wbSelecting=false; _wbUpdateSelBox(); return; }
  if(!wbDraw) return;
  wbDraw=false; wbSnap=null;
  const s=_wbS(); if(!s) return;
  if(wbTool==='pen'||wbTool==='eraser') s.ctx.beginPath();
});

// Keyboard shortcuts: Ctrl+C/X/V/Z, S=select, P=pen, E=eraser
document.addEventListener('keydown',e=>{
  if(!_wbS()||e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
  if(e.ctrlKey||e.metaKey){
    if(e.key==='c'){ e.preventDefault(); wbCopy(); }
    else if(e.key==='x'){ e.preventDefault(); wbCut(); }
    else if(e.key==='v'){ e.preventDefault(); wbPaste(); }
    else if(e.key==='z'){ e.preventDefault(); wbUndo(); }
    else if(e.key==='y'){ e.preventDefault(); wbRedo(); }
  } else {
    if(e.key==='s'||e.key==='S') wbSetTool('select');
    else if(e.key==='p'||e.key==='P') wbSetTool('pen');
    else if(e.key==='e'||e.key==='E') wbSetTool('eraser');
    else if(e.key==='Delete'||e.key==='Backspace'){ if(wbSelection) wbCut(); }
  }
});

// ── Insert image onto board ──────────────────────────────────────────────
function wbInsertImageFile(inp){
  const f=inp.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{
    const img=new Image();
    img.onload=()=>{
      const s=_wbS(); if(!s) return;
      _wbPushUndo();
      const maxW=s.el.width*0.45, maxH=s.el.height*0.45;
      const scale=Math.min(1, maxW/img.width, maxH/img.height);
      const dw=Math.round(img.width*scale), dh=Math.round(img.height*scale);
      const dx=Math.round((s.el.width-dw)/2), dy=Math.round((s.el.height-dh)/2);
      s.ctx.drawImage(img,dx,dy,dw,dh);
      wbSelection={x:dx,y:dy,w:dw,h:dh};
      wbSetTool('select');
      _wbUpdateSelBox();
    };
    img.src=ev.target.result;
  };
  r.readAsDataURL(f);
  inp.value='';
}

// ── Document reference panel (fixed overlay, draggable) ──────────────────
let _wbDocPages=[], _wbDocPageIdx=0;
function wbOpenDocPanel(inp){
  const f=inp.files[0]; if(!f) return;
  const panel=document.getElementById('wbDocPanel');
  const imgEl=document.getElementById('wbDocImg');
  const pdfEl=document.getElementById('wbDocPdf');
  const noImg=document.getElementById('wbDocNoImg');
  const addBtn=document.getElementById('wbDocAddToBoard');
  function _show(){
    panel.style.display='block';
    if(!panel._dragged){ panel.style.right='16px'; panel.style.top='70px'; panel.style.left=''; }
    if(noImg) noImg.style.display='none';
    if(addBtn) addBtn.style.display='inline-block';
  }
  if(f.type==='application/pdf'||f.name.toLowerCase().endsWith('.pdf')){
    // Use object URL for PDF in iframe
    const url=URL.createObjectURL(f);
    if(imgEl){ imgEl.style.display='none'; imgEl.src=''; }
    if(pdfEl){ pdfEl.src=url; pdfEl.style.display='block'; }
    _wbDocPages=[]; _wbDocPageIdx=0;
    document.getElementById('wbDocPageNum').textContent='PDF';
    _show();
  } else {
    // Image
    const r=new FileReader();
    r.onload=ev=>{
      const dataUrl=ev.target.result;
      _wbDocPages=[dataUrl]; _wbDocPageIdx=0;
      if(pdfEl){ pdfEl.style.display='none'; pdfEl.src=''; }
      if(imgEl){ imgEl.src=dataUrl; imgEl.style.display='block'; }
      document.getElementById('wbDocPageNum').textContent='1/1';
      _show();
    };
    r.readAsDataURL(f);
  }
  inp.value='';
}

function wbOpenWordPanel(inp){
  const f=inp.files[0]; if(!f) return;
  const panel=document.getElementById('wbDocPanel');
  const imgEl=document.getElementById('wbDocImg');
  const pdfEl=document.getElementById('wbDocPdf');
  const noImg=document.getElementById('wbDocNoImg');
  const addBtn=document.getElementById('wbDocAddToBoard');
  if(pdfEl){ pdfEl.style.display='none'; pdfEl.src=''; }
  if(imgEl){ imgEl.style.display='none'; imgEl.src=''; }
  // For text files, read and show as text; for .doc/.docx, show download link
  const r=new FileReader();
  r.onload=ev=>{
    const txt=ev.target.result;
    if(noImg){ noImg.innerHTML='<pre style="text-align:left;white-space:pre-wrap;font-size:12px;color:var(--txt);max-height:460px;overflow:auto;padding:6px">'+txt.replace(/</g,'&lt;')+'</pre>'; noImg.style.display='block'; }
    panel.style.display='block';
    if(!panel._dragged){ panel.style.right='16px'; panel.style.top='70px'; panel.style.left=''; }
    if(addBtn) addBtn.style.display='none';
    document.getElementById('wbDocPageNum').textContent='TXT';
  };
  r.readAsText(f);
  inp.value='';
}

function wbDocAddToBoard(){
  const imgEl=document.getElementById('wbDocImg');
  if(!imgEl||!imgEl.src||imgEl.style.display==='none') return;
  const s=_wbS(); if(!s) return;
  const img=new Image(); img.src=imgEl.src;
  img.onload=()=>{
    _wbPushUndo();
    const ctx=s.ctx;
    const scale=Math.min(s.el.width/img.width, s.el.height/img.height, 1)*0.6;
    const w=img.width*scale, h=img.height*scale;
    const x=(s.el.width-w)/2, y=(s.el.height-h)/2;
    ctx.drawImage(img,x,y,w,h);
    wbSelection={x:Math.round(x),y:Math.round(y),w:Math.round(w),h:Math.round(h)};
    wbSetTool('select'); _wbUpdateSelBox();
  };
}
function wbDocPage(dir){
  _wbDocPageIdx=Math.max(0,Math.min(_wbDocPages.length-1,_wbDocPageIdx+dir));
  document.getElementById('wbDocImg').src=_wbDocPages[_wbDocPageIdx];
  document.getElementById('wbDocPageNum').textContent=(_wbDocPageIdx+1)+'/'+_wbDocPages.length;
}
// Make doc panel draggable by its header
(function _makeDocPanelDraggable(){
  const panel=document.getElementById('wbDocPanel');
  const hdr=document.getElementById('wbDocPanelHeader');
  if(!panel||!hdr) return;
  let ox=0,oy=0,mx=0,my=0;
  hdr.addEventListener('pointerdown',e=>{
    e.preventDefault();
    mx=e.clientX; my=e.clientY;
    const r=panel.getBoundingClientRect();
    panel.style.left=r.left+'px'; panel.style.top=r.top+'px';
    panel.style.right='auto';
    panel._dragged=true;
    hdr.setPointerCapture(e.pointerId);
    hdr.addEventListener('pointermove',onMove);
    hdr.addEventListener('pointerup',()=>hdr.removeEventListener('pointermove',onMove),{once:true});
  });
  function onMove(e){
    const dx=e.clientX-mx, dy=e.clientY-my;
    mx=e.clientX; my=e.clientY;
    panel.style.left=(panel.offsetLeft+dx)+'px';
    panel.style.top=(panel.offsetTop+dy)+'px';
  }
})();

// ── BG custom color ──────────────────────────────────────────────────────
function wbSetBgColor(hex){
  _wbCustomBgColor=hex;
  document.getElementById('wbBgSwatch').style.background=hex;
  wbSetBg('custom');
}

// Override wbSetBg to handle 'custom' bg
const _wbSetBgOrig=wbSetBg;
wbSetBg=function(bg){
  wbBg=bg;
  const s=_wbS(); if(s) wbDrawBg(s,bg);
  document.querySelectorAll('.wb-bg-btn').forEach(b=>b.classList.toggle('on',b.dataset.bg===bg));
};

// ── Text tool ─────────────────────────────────────────────────────────────
// Make text window draggable
(function _makeTextWinDraggable(){
  const win=document.getElementById('wbTextWindow');
  const hdr=document.getElementById('wbTextWindowHeader');
  if(!win||!hdr) return;
  let mx=0,my=0;
  hdr.addEventListener('pointerdown',e=>{
    if(e.target.tagName==='BUTTON') return;
    e.preventDefault();
    mx=e.clientX; my=e.clientY;
    if(!win.style.left){ const r=win.getBoundingClientRect(); win.style.left=r.left+'px'; win.style.top=r.top+'px'; }
    hdr.setPointerCapture(e.pointerId);
    hdr.addEventListener('pointermove',onM); hdr.addEventListener('pointerup',()=>hdr.removeEventListener('pointermove',onM),{once:true});
  });
  function onM(e){
    const dx=e.clientX-mx, dy=e.clientY-my; mx=e.clientX; my=e.clientY;
    win.style.left=(win.offsetLeft+dx)+'px'; win.style.top=(win.offsetTop+dy)+'px';
  }
})();

// ── Rich Text Editor (RTE) for whiteboard text tool ─────────────────────
function _rteEl(){ return document.getElementById('wbRteEditor'); }

function wbRteBlock(tag){
  const ed=_rteEl(); if(!ed) return;
  ed.focus();
  document.execCommand('formatBlock',false,'<'+tag+'>');
}
function wbRteFmt(cmd){
  const ed=_rteEl(); if(!ed) return;
  ed.focus();
  document.execCommand(cmd,false,null);
  _rteUpdateBar();
}
function wbRteAlign(a){
  const ed=_rteEl(); if(!ed) return;
  ed.focus();
  const map={left:'justifyLeft',center:'justifyCenter',right:'justifyRight'};
  document.execCommand(map[a],false,null);
  ['Left','Center','Right'].forEach(v=>{
    const el=document.getElementById('rte'+v);
    if(el) el.style.background=v.toLowerCase()===a?'var(--jm-primary,#7c3aed)':'#15171f';
  });
}
function wbRteColor(c){
  const ed=_rteEl(); if(!ed) return;
  ed.focus();
  document.execCommand('foreColor',false,c);
  const bar=document.getElementById('wbTextColorBar'); if(bar) bar.style.background=c;
}
function wbRteHighlight(c){
  const ed=_rteEl(); if(!ed) return;
  ed.focus();
  document.execCommand('hiliteColor',false,c);
}
function wbRteInsert(type){
  const ed=_rteEl(); if(!ed) return;
  ed.focus();
  if(type==='bullet'){ document.execCommand('insertUnorderedList',false,null); return; }
  if(type==='numbered'){ document.execCommand('insertOrderedList',false,null); return; }
  if(type==='quote'){ document.execCommand('formatBlock',false,'<blockquote>'); return; }
  if(type==='link'){
    const url=prompt('Enter URL:','https://');
    if(url) document.execCommand('createLink',false,url);
    return;
  }
  if(type==='code'){
    const sel=window.getSelection();
    if(sel&&sel.rangeCount){
      const r=sel.getRangeAt(0);
      const code=document.createElement('code');
      code.style.cssText='background:var(--bd);color:var(--jm-accent,#f9a8d4);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:.9em';
      try{ if(!r.collapsed){ r.surroundContents(code); } else { code.textContent='code'; r.insertNode(code); } }catch(e){}
    }
    return;
  }
  if(type==='table'){
    document.execCommand('insertHTML',false,'<table style="border-collapse:collapse;width:100%;margin:6px 0"><tr><td style="border:1px solid var(--bd);padding:5px 9px">Cell</td><td style="border:1px solid var(--bd);padding:5px 9px">Cell</td></tr><tr><td style="border:1px solid var(--bd);padding:5px 9px">Cell</td><td style="border:1px solid var(--bd);padding:5px 9px">Cell</td></tr></table><p></p>');
    return;
  }
  if(type==='callout'){
    document.execCommand('insertHTML',false,'<div style="background:rgba(124,58,237,.15);border-left:4px solid var(--jm-primary,#7c3aed);border-radius:6px;padding:9px 13px;margin:6px 0;color:#e8eaf0">💡 Key insight: write here</div><p></p>');
    return;
  }
  if(type==='divider'){
    document.execCommand('insertHTML',false,'<hr style="border:none;border-top:2px solid var(--bd);margin:10px 0"><p></p>');
    return;
  }
  if(type==='add'){
    document.execCommand('insertHTML',false,'<p><br></p>');
    ed.focus();
    return;
  }
}
function wbRteInsertImage(inp){
  const f=inp.files&&inp.files[0]; if(!f) return;
  const rd=new FileReader();
  rd.onload=()=>{
    const ed=_rteEl(); if(!ed) return;
    ed.focus();
    document.execCommand('insertHTML',false,'<img src="'+rd.result+'" style="max-width:100%;border-radius:6px;display:block;margin:5px 0"><p></p>');
  };
  rd.readAsDataURL(f);
  inp.value='';
}
function _rteUpdateBar(){
  [['bold','rteB'],['italic','rteI'],['underline','rteU'],['strikeThrough','rteS']].forEach(([cmd,id])=>{
    try{
      const active=document.queryCommandState(cmd);
      const el=document.getElementById(id);
      if(el) el.style.background=active?'var(--jm-primary,#7c3aed)':'#15171f';
    }catch(e){}
  });
}

// Wire close buttons and RTE init after DOM is ready
(function(){
  function _initRte(){
    ['wbTextWinClose','wbTextCancelBtn'].forEach(id=>{
      const el=document.getElementById(id);
      if(el) el.addEventListener('click',()=>{ document.getElementById('wbTextWindow').style.display='none'; });
    });
    const ed=document.getElementById('wbRteEditor');
    if(ed){
      ed.addEventListener('keyup',_rteUpdateBar);
      ed.addEventListener('mouseup',_rteUpdateBar);
    }
  }
  if(document.readyState==='loading') _initRte(); else _initRte();
})();

// Stamp the rich editor content onto the whiteboard canvas via SVG foreignObject
function wbStampRte(){
  const s=_wbS(); if(!s) return;
  const ed=document.getElementById('wbRteEditor');
  const html=(ed?ed.innerHTML:'').trim();
  if(!html||html==='<br>') return;
  const chapterTitle=(document.getElementById('wbChapterTitle')?.value||'').trim();
  const win=document.getElementById('wbTextWindow');
  const cx=Math.max(0,win._canvasX||Math.floor(s.el.width*0.04));
  const cy=Math.max(0,win._canvasY||Math.floor(s.el.height*0.04));
  const maxW=Math.min(Math.floor(s.el.width*0.65), 900);
  const titleHtml=chapterTitle?'<h2 style="margin:0 0 10px 0;font-size:26px;font-weight:900;color:#111827;border-bottom:3px solid var(--jm-primary,#7c3aed);padding-bottom:6px;font-family:system-ui,sans-serif">'+chapterTitle+'</h2>':'';
  const bodyStyle='font-size:17px;line-height:1.7;font-family:system-ui,sans-serif;color:#111827';
  const pad=18;
  const estimH=Math.min(Math.floor(s.el.height*0.85),1000);
  const svgStr='<svg xmlns="http://www.w3.org/2000/svg" width="'+maxW+'" height="'+estimH+'">'
    +'<foreignObject width="'+maxW+'" height="'+estimH+'">'
    +'<div xmlns="http://www.w3.org/1999/xhtml" style="padding:'+pad+'px;background:rgba(255,255,252,0.97);border-radius:10px;box-sizing:border-box;width:'+maxW+'px">'
    +titleHtml+'<div style="'+bodyStyle+'">'+html+'</div>'
    +'</div></foreignObject></svg>';
  _wbPushUndo();
  const img=new Image();
  img.onload=()=>{
    s.ctx.drawImage(img,cx,cy);
    wbSelection={x:cx,y:cy,w:maxW,h:estimH};
    _wbUpdateSelBox();
    wbSetTool('select');
  };
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgStr);
  win.style.display='none';
}

// Legacy stub — old textarea-based stamp, kept for backwards compat with any saved references
function wbStampText(){
  wbStampRte();
}

// ── old text formatting state (no longer used but kept so nothing errors) ─
const _wbTxtFmt={bold:false,italic:false,underline:false,align:'left'};
function wbToggleFmt(k){ wbRteFmt(k==='bold'?'bold':k==='italic'?'italic':'underline'); }
function wbSetAlign(a){ wbRteAlign(a); }
function wbTextColorChange(c){ wbRteColor(c); }
function wbTextPreset(t){
  const ed=_rteEl(); if(!ed) return;
  ed.focus();
  if(t==='heading'){ wbRteBlock('h2'); }
  else if(t==='bullet'){ wbRteInsert('bullet'); }
  else if(t==='note'){ wbRteInsert('callout'); }
  else if(t==='formula'){ document.execCommand('insertHTML',false,'<p>∑ f(x) = …</p>'); }
}


// ── Multi-page system ────────────────────────────────────────────────────
function _wbSavePage(s){
  if(!s.pages) s.pages=[]; if(s.currentPage===undefined) s.currentPage=0;
  s.pages[s.currentPage]={imageData:s.ctx.getImageData(0,0,s.el.width,s.el.height), bg:wbBg};
}

function _wbLoadPage(s, idx){
  const pg=s.pages&&s.pages[idx];
  if(pg){ s.ctx.putImageData(pg.imageData,0,0); wbBg=pg.bg; }
  else { wbDrawBg(s,wbBg); }
  document.querySelectorAll('.wb-bg-btn').forEach(b=>b.classList.toggle('on',b.dataset.bg===wbBg));
  _wbUpdatePageNav(s);
  wbSelection=null; _wbUpdateSelBox();
}

function _wbUpdatePageNav(s){
  const total=s.pages?s.pages.length:1;
  const cur=(s.currentPage||0)+1;
  const el=document.getElementById('wbPageNum'); if(el) el.textContent=cur+'/'+total;
}

function wbAddPage(){
  const s=_wbS(); if(!s) return;
  if(!s.pages) s.pages=[]; if(s.currentPage===undefined) s.currentPage=0;
  _wbSavePage(s);
  const newIdx=s.pages.length;
  s.currentPage=newIdx;
  wbDrawBg(s,wbBg);
  s.pages[newIdx]={imageData:s.ctx.getImageData(0,0,s.el.width,s.el.height),bg:wbBg};
  _wbUpdatePageNav(s);
}

function wbGoPage(dir){
  const s=_wbS(); if(!s) return;
  if(!s.pages) s.pages=[]; if(s.currentPage===undefined) s.currentPage=0;
  _wbSavePage(s);
  const next=Math.max(0,Math.min(s.pages.length-1,s.currentPage+dir));
  if(next===s.currentPage) return;
  s.currentPage=next;
  _wbLoadPage(s,next);
}

function wbDelPage(){
  const s=_wbS(); if(!s) return;
  if(!s.pages||s.pages.length<=1){ wbClear(); return; }
  _wbSavePage(s);
  s.pages.splice(s.currentPage,1);
  s.currentPage=Math.max(0,s.currentPage-1);
  _wbLoadPage(s,s.currentPage);
}

// ── PDF export ───────────────────────────────────────────────────────────
function wbExportPdf(){
  const s=_wbS(); if(!s) return;
  _wbSavePage(s);
  const pages=s.pages||[{imageData:s.ctx.getImageData(0,0,s.el.width,s.el.height),bg:wbBg}];
  // Build data URLs for each page
  const tmp=document.createElement('canvas');
  tmp.width=s.el.width; tmp.height=s.el.height;
  const tc=tmp.getContext('2d');
  const imgs=pages.map(pg=>{ tc.putImageData(pg.imageData,0,0); return tmp.toDataURL('image/png'); });
  const w=window.open('','_blank');
  if(!w) return;
  const pw=s.el.width, ph=s.el.height;
  const ratio=pw/ph;
  w.document.write(`<!DOCTYPE html><html><head><title>Whiteboard</title>
<style>*{margin:0;padding:0;box-sizing:border-box}
body{background:#eee}
.page{width:100%;max-width:${pw}px;margin:12px auto;display:block;border:1px solid #ddd;box-shadow:0 2px 8px rgba(0,0,0,.2)}
@media print{body{background:#fff}.page{margin:0;border:none;box-shadow:none;page-break-after:always}}
</style></head><body>`);
  imgs.forEach(src=>{ w.document.write(`<img class="page" src="${src}">`); });
  w.document.write(`<script>window.onload=function(){window.print();}<\/script></body></html>`);
  w.document.close();
}

// ── Save to course ────────────────────────────────────────────────────────
let _wbCourseTopicsCache={};

async function openWbSaveCourse(){
  const s=_wbS(); if(!s) return;
  document.getElementById('wbSaveCourseModal').style.display='flex';
  document.getElementById('wbSaveStatus').textContent='';
  document.getElementById('wbSaveTitle').value='Whiteboard — page '+(( s.currentPage||0)+1);
  const sel=document.getElementById('wbCourseSelect');
  sel.innerHTML='<option value="">Loading your courses…</option>';
  try{
    const tok=localStorage.getItem('jm_token')||'';
    if(!tok){ sel.innerHTML='<option value="">⚠ Not logged in — open Dashboard first, then return here</option>'; return; }
    const courses=await _loadUserCourses(true); // force=true clears cache each open
    if(!courses.length){
      sel.innerHTML='<option value="">⚠ No courses found — create one in Dashboard first</option>';
      return;
    }
    sel.innerHTML='<option value="">— pick a course —</option>';
    courses.forEach(c=>{ const o=document.createElement('option'); o.value=c.id; o.textContent=(c.title||c.name||c.id); sel.appendChild(o); });
    _wbCourseTopicsCache={};
  } catch(e){ sel.innerHTML='<option value="">Error: '+e.message+'</option>'; console.error('[wbSaveCourse]',e); }
}

async function wbLoadTopics(courseId){
  const sel=document.getElementById('wbTopicSelect');
  if(!courseId){ sel.innerHTML='<option value="">— pick a course first —</option>'; return; }
  sel.innerHTML='<option value="">Loading…</option>';
  try{
    const tok=localStorage.getItem('jm_token')||'';
    const res=await fetch(`/api/course-content?courseId=${courseId}`,{headers:{Authorization:'Bearer '+tok}});
    const data=await res.json();
    const topics=[...new Set((data.content||data||[]).map(c=>c.topic||c.section||'').filter(Boolean))];
    _wbCourseTopicsCache[courseId]=topics;
    sel.innerHTML='<option value="">— general / no topic —</option>';
    topics.forEach(t=>{ const o=document.createElement('option'); o.value=t; o.textContent=t; sel.appendChild(o); });
  } catch(e){ sel.innerHTML='<option value="">Error loading topics</option>'; }
}

async function wbDoSaveCourse(){
  const s=_wbS(); if(!s) return;
  const courseId=document.getElementById('wbCourseSelect').value;
  if(!courseId){ document.getElementById('wbSaveStatus').textContent='Please pick a course.'; return; }
  const topic=document.getElementById('wbNewTopic').value.trim()||document.getElementById('wbTopicSelect').value||'Whiteboard';
  const title=document.getElementById('wbSaveTitle').value.trim()||'Whiteboard';
  const saveAs=document.querySelector('input[name="wbSaveAs"]:checked').value;
  const statusEl=document.getElementById('wbSaveStatus');
  statusEl.textContent='Saving…';

  _wbSavePage(s);
  const pages=s.pages||[{imageData:s.ctx.getImageData(0,0,s.el.width,s.el.height),bg:wbBg}];
  const tmp=document.createElement('canvas'); tmp.width=s.el.width; tmp.height=s.el.height;
  const tc=tmp.getContext('2d');

  let fileData, fileType, fileName;
  if(saveAs==='pdf'){
    // Save all pages as separate images bundled as JSON manifest (real PDF needs jsPDF; send images)
    tc.putImageData(pages[0].imageData,0,0);
    fileData=tmp.toDataURL('image/png');
    fileType='image/png'; fileName=title.replace(/\s+/g,'_')+'.png';
  } else {
    tc.putImageData(pages[(s.currentPage||0)].imageData,0,0);
    fileData=tmp.toDataURL('image/png');
    fileType='image/png'; fileName=title.replace(/\s+/g,'_')+'.png';
  }

  try{
    const tok=localStorage.getItem('jm_token')||'';
    const res=await fetch('/api/course-content',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+tok},
      body:JSON.stringify({courseId,topic,title,type:'whiteboard',content:fileData,fileName,mimeType:fileType,pageCount:pages.length})
    });
    const data=await res.json();
    if(res.ok){ statusEl.textContent='✅ Saved to course!'; setTimeout(()=>document.getElementById('wbSaveCourseModal').style.display='none',1500); }
    else { statusEl.textContent='Error: '+(data.error||'Save failed'); }
  } catch(e){ statusEl.textContent='Network error: '+e.message; }
}

// ── Homography + WebGL ─────────────────────────────────────────────────
function solveHomography(src,dst){ const A=[],b=[]; for(let i=0;i<4;i++){ const {x,y}=src[i],{x:u,y:v}=dst[i]; A.push([x,y,1,0,0,0,-u*x,-u*y]); b.push(u); A.push([0,0,0,x,y,1,-v*x,-v*y]); b.push(v);} const h=gauss(A,b); h.push(1); return h; }
function gauss(A,b){ const n=b.length,M=A.map((r,i)=>[...r,b[i]]); for(let i=0;i<n;i++){ let p=i; for(let k=i+1;k<n;k++) if(Math.abs(M[k][i])>Math.abs(M[p][i])) p=k; [M[i],M[p]]=[M[p],M[i]]; const piv=M[i][i]||1e-9; for(let k=i;k<=n;k++) M[i][k]/=piv; for(let k=0;k<n;k++) if(k!==i){ const f=M[k][i]; for(let j=i;j<=n;j++) M[k][j]-=f*M[i][j]; } } return M.map(r=>r[n]); }
function initGL(){ glCanvas=document.createElement('canvas'); glCanvas.width=1280; glCanvas.height=720; gl=glCanvas.getContext('webgl'); if(!gl) return;
  const vs=`attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.0)/2.0,(1.0-p.y)/2.0);gl_Position=vec4(p,0.0,1.0);}`;
  const fs=`precision mediump float;varying vec2 uv;uniform sampler2D tex;uniform mat3 H;uniform float persp;void main(){vec2 o=uv;if(persp>0.5){vec3 s=H*vec3(uv,1.0);o=s.xy/s.z;}if(o.x<0.0||o.x>1.0||o.y<0.0||o.y>1.0)gl_FragColor=vec4(0.0,0.0,0.0,1.0);else gl_FragColor=texture2D(tex,o);}`;
  const c=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh;}; prog=gl.createProgram(); gl.attachShader(prog,c(gl.VERTEX_SHADER,vs)); gl.attachShader(prog,c(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(prog); gl.useProgram(prog);
  const pb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,pb); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW); const loc=gl.getAttribLocation(prog,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  // Cache uniform locations ONCE instead of re-querying them every frame.
  prog.uPersp=gl.getUniformLocation(prog,'persp');
  prog.uH=gl.getUniformLocation(prog,'H');
  prog.uTex=gl.getUniformLocation(prog,'tex');
}
// Homography cache — the Gauss solve only changes when the corners change, so
// recompute it on demand (dirty key) rather than every animation frame.
let _Hcache=null, _HcacheKey='';
function srcReady(s){ if(!s) return false; if(s.type==='video') return s.el.readyState>=2; return true; }
const _dst4=[{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}];

// Helper: draw VBG image respecting _vbgFit
function _drawVbgImage(){
  if(!_vbgImg) return;
  try{
    const iw=_vbgImg.naturalWidth||_vbgImg.width||1;
    const ih=_vbgImg.naturalHeight||_vbgImg.height||1;
    const ow=out.width, oh=out.height;
    if(_vbgFit==='contain'){
      const scale=Math.min(ow/iw,oh/ih);
      const dw=iw*scale,dh=ih*scale;
      octx.fillStyle='#000'; octx.fillRect(0,0,ow,oh);
      octx.drawImage(_vbgImg,(ow-dw)/2,(oh-dh)/2,dw,dh);
    } else if(_vbgFit==='center'){
      octx.fillStyle='#000'; octx.fillRect(0,0,ow,oh);
      octx.drawImage(_vbgImg,(ow-iw)/2,(oh-ih)/2,iw,ih);
    } else { // fill (default)
      octx.drawImage(_vbgImg,0,0,ow,oh);
    }
  }catch(e){ octx.fillStyle='#000'; octx.fillRect(0,0,out.width,out.height); }
}

function renderLoop(){ requestAnimationFrame(renderLoop);
  // Skip all paint work while the tab is hidden (rAF is already throttled, but
  // this avoids any stray work and is explicit).
  if(document.hidden) return;
  if(_vbgMode==='image'&&_vbgImg){ _drawVbgImage(); }
  else if(_vbgMode==='color'){ octx.fillStyle=_vbgColor; octx.fillRect(0,0,out.width,out.height); }
  else { octx.fillStyle='#000'; octx.fillRect(0,0,out.width,out.height); }
  // Composite mode: scene has multiple arranged elements → draw them all.
  if(activeScene && activeScene.layers && activeScene.layers.length){
    renderComposite(activeScene);
    if(!_adjustMode) drawBranding();
    return;
  }
  const s=activeScene&&sources[activeScene.sourceId];
  if(srcReady(s)){
    // Apply simple crop clipping if active
    if(_cropMode){
      const cr=_crop();
      const cx2=cr.x*out.width, cy2=cr.y*out.height;
      const cw2=cr.w*out.width, ch2=cr.h*out.height;
      octx.save(); octx.beginPath(); octx.rect(cx2,cy2,cw2,ch2); octx.clip();
    }
    // In adjust mode show the RAW source so corners line up with reality.
    if(_adjustMode || !gl){
      // VBG single-source mode: draw camera at reduced size
      if(_vbgMode!=='none' && !_adjustMode){
        const fw=_vbgFrame;
        const cw2=out.width*fw, ch2=out.height*fw;
        const cx2=(out.width-cw2)/2, cy2=(out.height-ch2)/2;
        try{ octx.drawImage(s.el,cx2,cy2,cw2,ch2); }catch(e){}
      } else if(_srcCropMode){
        // AR crop: scale selected source region to fill the full output canvas
        const el=s.el;
        const nw=el.videoWidth||el.width||out.width;
        const nh=el.videoHeight||el.height||out.height;
        try{ octx.drawImage(el,_srcCrop.x*nw,_srcCrop.y*nh,_srcCrop.w*nw,_srcCrop.h*nh,0,0,out.width,out.height); }catch(e){}
      } else {
        try{ octx.drawImage(s.el,0,0,out.width,out.height); }catch(e){}
      }
    }
    else {
      gl.bindTexture(gl.TEXTURE_2D,tex);
      try{ gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,s.el);
        // Reuse the solved homography unless the corners changed this frame.
        // When AR crop is active, use the crop region as GL source so homography
        // maps that region (not the full frame) to the output corners.
        const src4=_srcCropMode
          ? [{x:_srcCrop.x,y:_srcCrop.y},{x:_srcCrop.x+_srcCrop.w,y:_srcCrop.y},
             {x:_srcCrop.x+_srcCrop.w,y:_srcCrop.y+_srcCrop.h},{x:_srcCrop.x,y:_srcCrop.y+_srcCrop.h}]
          : _dst4;
        const ck=src4.map(p=>p.x.toFixed(4)+','+p.y.toFixed(4)).join(';')+';'+activeScene.corners.map(c=>c.x.toFixed(4)+','+c.y.toFixed(4)).join(';');
        let H; if(ck===_HcacheKey && _Hcache){ H=_Hcache; } else { H=solveHomography(src4,activeScene.corners); _Hcache=H; _HcacheKey=ck; }
        gl.uniform1f(prog.uPersp,document.getElementById('perspOn').checked?1:0);
        gl.uniformMatrix3fv(prog.uH,false,new Float32Array(H)); gl.uniform1i(prog.uTex,0);
        gl.viewport(0,0,glCanvas.width,glCanvas.height); gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        // VBG single-source mode: draw at reduced size
        if(_vbgMode!=='none'){
          const fw=_vbgFrame;
          const cw2=out.width*fw, ch2=out.height*fw;
          const cx2=(out.width-cw2)/2, cy2=(out.height-ch2)/2;
          octx.save(); octx.translate(out.width/2,out.height/2); octx.rotate((activeScene.rotation||0)*Math.PI/180); const z=activeScene.zoom||1; octx.scale(z,z); octx.drawImage(glCanvas,cx2-out.width/2,cy2-out.height/2,cw2,ch2); octx.restore();
        } else {
          // GL already baked the crop into the texture mapping — draw full glCanvas
          octx.save(); octx.translate(out.width/2,out.height/2); octx.rotate((activeScene.rotation||0)*Math.PI/180); const z=activeScene.zoom||1; octx.scale(z,z); octx.drawImage(glCanvas,-out.width/2,-out.height/2,out.width,out.height); octx.restore();
        }
      }catch(e){}
    }
    if(_cropMode) octx.restore();
  } else { octx.fillStyle='#555'; octx.font='20px sans-serif'; octx.textAlign='center'; octx.fillText('Pick a source (Enable camera, or add screen/whiteboard/document)', out.width/2, out.height/2); }
  if(!_adjustMode) drawBranding();
}
function drawBranding(){ if(!document.getElementById('brandOn')?.checked) return;
  const text=document.getElementById('brandText')?.value||''; if(!brandImg&&!text) return;
  const pos=document.getElementById('brandPos').value, size=+document.getElementById('brandSize').value, color=document.getElementById('brandColor').value, bgA=(+document.getElementById('brandBg').value)/100, lw=+document.getElementById('brandLogoSize').value;
  const pad=18, lhh=brandImg?lw*(brandImg.height/Math.max(1,brandImg.width)):0;
  octx.save(); octx.font='bold '+size+'px sans-serif'; const tw=text?octx.measureText(text).width:0;
  const w=Math.max(brandImg?lw:0,tw)+pad*2, h=(lhh?lhh+8:0)+(text?size+10:0)+pad;
  let x=pos.includes('l')?pad:out.width-w-pad, y=pos.includes('t')?pad:out.height-h-pad;
  if(bgA>0){ octx.fillStyle='rgba(0,0,0,'+bgA+')'; octx.beginPath(); if(octx.roundRect) octx.roundRect(x,y,w,h,10); else octx.rect(x,y,w,h); octx.fill(); }
  let cy=y+pad/2; if(brandImg){ try{ octx.drawImage(brandImg,x+(w-lw)/2,cy,lw,lhh); }catch(e){} cy+=lhh+8; }
  if(text){ octx.fillStyle=color; octx.textAlign='center'; octx.fillText(text,x+w/2,cy+size); }
  octx.restore();
}

// ── Recording ──────────────────────────────────────────────────────────
let rec=null,recChunks=[],recT0=0,recTimer=null,recExt='webm';
// Pick a container/codec the browser actually supports. Safari has no webm —
// without this fallback MediaRecorder throws and "recording never saves".
function pickRecMime(){
  const cands=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4;codecs=h264,aac','video/mp4'];
  if(window.MediaRecorder&&MediaRecorder.isTypeSupported){ for(const m of cands){ if(MediaRecorder.isTypeSupported(m)) return m; } }
  return '';
}
async function toggleRecord(){ const btn=document.getElementById('btnRec'); if(rec&&rec.state==='recording'){ rec.stop(); return; }
  let stream;
  try{ stream=out.captureStream(30); }catch(e){ alert('This browser can\'t capture the studio canvas for recording. Try Chrome or Edge.'); return; }
  const tracks=[...stream.getVideoTracks()]; if(!tracks.length){ alert('Nothing to record yet — enable a camera or add a source first.'); return; }
  const micId=document.getElementById('micSelect').value;
  try{ micStream=await navigator.mediaDevices.getUserMedia({audio:micId?{deviceId:{exact:micId}}:true}); tracks.push(...micStream.getAudioTracks()); }catch(e){ /* record video-only if mic denied */ }
  const mime=pickRecMime(); recExt=mime.includes('mp4')?'mp4':'webm';
  try{ rec=mime?new MediaRecorder(new MediaStream(tracks),{mimeType:mime}):new MediaRecorder(new MediaStream(tracks)); }
  catch(e){ alert('Recording isn\'t supported in this browser: '+(e.message||e.name)); if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null;} return; }
  recChunks=[]; rec.ondataavailable=e=>{ if(e.data?.size) recChunks.push(e.data); };
  rec.onerror=e=>{ console.error('recorder error',e); alert('Recording error: '+(e.error?.name||'unknown')); };
  rec.onstop=async()=>{ clearInterval(recTimer); document.getElementById('recStatus').style.display='none'; btn.textContent='⏺ Record'; btn.classList.remove('danger'); if(micStream){ micStream.getTracks().forEach(t=>t.stop()); micStream=null; }
    if(!recChunks.length){ alert('⚠️ No video data was captured. The recording was empty.'); return; }
    const blob=new Blob(recChunks,{type:mime||'video/webm'});
    const target=document.getElementById('saveTarget').value;
    let wantLocal=target==='local'||target==='both';
    const wantClass=(target==='class'||target==='both');
    // SAFETY NET: if the user picked "Save in app" only but the studio isn't
    // connected to a class (or isn't signed in), the cloud upload would silently
    // throw the recording away. Force a local download as a fallback so the
    // recording is never lost. We tell the user truthfully what happened.
    const cloudBlocked = wantClass && (!_boundClass || !TOKEN);
    if(cloudBlocked && !wantLocal){ wantLocal=true; }
    if(wantLocal){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='studio-recording-'+Date.now()+'.'+recExt; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }
    if(wantClass){
      if(!_boundClass){ alert('💾 Recording saved to your device.\n\nTo also save it inside the app, click "📡 Teach a course" to connect this Studio to a live class FIRST, then record.'); return; }
      if(!TOKEN){ alert('💾 Recording saved to your device.\n\nSign in to also save it in the app.'); return; }
      try{
        const fd=new FormData(); fd.append('recording',blob,'studio.'+recExt);
        const r=await fetch(API+'/live-classes/'+_boundClass+'/recording',{method:'POST',headers:{Authorization:'Bearer '+TOKEN},body:fd});
        if(!r.ok){ let msg='HTTP '+r.status; try{ const j=await r.json(); if(j&&j.error) msg=j.error; }catch(e){} throw new Error(msg); }
        alert('✓ Recording saved'+(wantLocal?' to your device and':'')+' to the class. Students can replay it from "Recordings".');
      }
      catch(e){ alert('⚠️ Couldn\'t upload to the class ('+(e.message||e.name)+').\n\n'+(wantLocal?'It is still saved to your device.':'Try "💾 Save to device" instead.')); }
    }
  };
  try{ rec.start(1000); }catch(e){ alert('Could not start recording: '+(e.message||e.name)); return; }
  recT0=Date.now(); document.getElementById('recStatus').style.display='inline'; btn.textContent='⏹ Stop'; btn.classList.add('danger');
  recTimer=setInterval(()=>{ const s=Math.floor((Date.now()-recT0)/1000); document.getElementById('recTime').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); },500);
}
initGL(); renderLoop(); renderScenes(); renderLayerList(); refreshDevices();
// If Studio was opened from a live class (?class=), show the bound-class badge.
if(CLASS_ID){ _bindClass(CLASS_ID,'class'); fetch(API+'/live-classes/'+CLASS_ID,{headers:{Authorization:'Bearer '+TOKEN}}).then(x=>x.json()).then(r=>{ const c=r.liveClass||r.class||r; if(c&&c.title) _bindClass(CLASS_ID,c.title); }).catch(()=>{}); }

/* ── Focus / clean teaching board ──────────────────────────────────────────
   Hide the topbar + both control columns so the board fills the screen. The
   floating top bar (exit) + bottom action bar keep the essential teaching
   controls one tap away; ⚙ Tools slides the source panel back in as a drawer. */
function toggleFocus(){
  const on = document.body.classList.toggle('focus');
  if(!on) document.body.classList.remove('panels');      // close the drawer on exit
  try{ const b=document.getElementById('focusFmtBadge'), src=document.getElementById('fmtBadge');
       if(b&&src) b.textContent = src.textContent; }catch(e){}
}
function studioFocusPanels(){ document.body.classList.toggle('panels'); }
document.addEventListener('keydown', function(e){
  if(e.key==='Escape' && document.body.classList.contains('focus')) toggleFocus();
});

/* Embed mode: when hosted inside the app shell (/studio.html?embed=1), hide the
   controls that would navigate OUT of the shell — the shell supplies the back
   affordance + chrome. Studio's own toolbar stays (it's the module's workspace). */
(function studioEmbed(){
  try{
    if(new URLSearchParams(location.search).get('embed')==='1'){
      document.documentElement.classList.add('embed');
      var es=document.createElement('style');
      es.textContent='html.embed [data-embed-hide]{display:none!important}';
      (document.head||document.documentElement).appendChild(es);
      const ex=document.getElementById('studioExitBtn'); if(ex) ex.style.display='none';
      const chip=document.getElementById('studioUserChip'); if(chip) chip.dataset.embed='1';
    }
  }catch(e){}
})();

function studioToggleCol(){}  // legacy no-op (panels are now in the one drawer)
function studioToggleDrawer(force){
  const d=document.getElementById('studioDrawer'), b=document.getElementById('studioDrawerBackdrop'); if(!d) return;
  const open=(force===undefined)?!d.classList.contains('open'):!!force;
  d.classList.toggle('open',open); if(b) b.classList.toggle('open',open);
}
/* ONE DRAWER: fold the separate left + right rails AND the secondary top-bar
   actions into a single ☰ Controls drawer, grouped by usage (most-used first).
   Controls are MOVED (not cloned) so every existing handler stays attached and
   nothing is duplicated; the stage then runs full-width. */
(function studioOneDrawer(){
  try{
    const topbar=document.querySelector('.topbar'); const main=document.querySelector('.main');
    const left=document.querySelector('.col.left'); const right=document.querySelector('.col.right');
    if(!topbar||!main) return;
    const backdrop=document.createElement('div'); backdrop.id='studioDrawerBackdrop'; backdrop.addEventListener('click',()=>studioToggleDrawer(false));
    const drawer=document.createElement('div'); drawer.id='studioDrawer';
    drawer.innerHTML='<div id="studioDrawerHead"><b>🎛 Studio controls</b><button class="btn" style="padding:4px 10px" onclick="studioToggleDrawer(false)">✕</button></div><div id="studioDrawerBody"></div>';
    document.body.appendChild(backdrop); document.body.appendChild(drawer);
    const dbody=drawer.querySelector('#studioDrawerBody');
    const group=(title)=>{ const g=document.createElement('div'); g.className='sd-group'; const t=document.createElement('div'); t.className='sd-gtitle'; t.textContent=title; const c=document.createElement('div'); c.className='sd-gbody'; g.appendChild(t); g.appendChild(c); dbody.appendChild(g); return c; };
    const moveById=(c,ids)=>ids.forEach(id=>{ const el=document.getElementById(id); if(el) c.appendChild(el); });
    const moveKids=(c,col)=>{ if(!col) return; [...col.children].forEach(ch=>{ if(!ch.classList.contains('col-toggle')) c.appendChild(ch); }); };
    // 1) Most-used live actions, top of the drawer.
    moveById(group('▶ Go live'),['btnEnable','btnRec','btnFocus','btnTeach']);
    // 2) Sources & scenes (former left rail).
    moveKids(group('🎬 Sources & scenes'), left);
    // 3) Adjust — perspective crop, simple crop, layout, AR recrop (former right rail top + top-bar crop/layout).
    const gAdj=group('🎯 Adjust'); moveById(gAdj,['btnAdjust','btnLayout']); moveKids(gAdj, right);
    // 4) Output & recording.
    moveById(group('🎞 Output & recording'),['fmtSelect','fmtBadge','btnRecrop','saveTarget','tplBtnWrap']);
    // 5) Help.
    const guide=document.querySelector('[onclick="openGuide()"]'); if(guide){ group('❔ Help').appendChild(guide); }
    // Retire the now-empty rails; stage goes full-width.
    if(left) left.style.display='none'; if(right) right.style.display='none';
    main.style.gridTemplateColumns='1fr';
    // ☰ entry point at the start of the (now slim) top bar.
    const menuBtn=document.createElement('button'); menuBtn.className='btn'; menuBtn.id='studioMenuBtn'; menuBtn.innerHTML='☰ Controls'; menuBtn.addEventListener('click',()=>studioToggleDrawer());
    topbar.insertBefore(menuBtn, topbar.firstChild);
    // One-click "Full board" — collapses all chrome so the board fills the screen
    // (great on small screens). Toggles the existing Focus mode (Esc to exit).
    const fullBtn=document.createElement('button'); fullBtn.className='btn'; fullBtn.id='studioFullBtn'; fullBtn.innerHTML='⛶ Full board'; fullBtn.title='Maximise the board — hides all controls (Esc to exit)'; fullBtn.addEventListener('click',()=>{ try{ toggleFocus(); }catch(_){} });
    topbar.insertBefore(fullBtn, menuBtn.nextSibling);
  }catch(e){ console.warn('studio drawer build failed', e); }
})();

/* Theme sync: the Studio is a dark broadcasting workspace, but its accent
   (buttons, active scene, corners) should match the brand primary the user set
   in Settings — not a hardcoded purple. Reads jm_settings and live-updates. */
(function studioBrand(){
  function apply(){
    try{
      const s = JSON.parse(localStorage.getItem('jm_settings')||'{}');
      if(s && /^#[0-9a-fA-F]{6}$/.test(s.primary||'')){
        document.documentElement.style.setProperty('--pri', s.primary);
      }
    }catch(_){}
  }
  apply();
  window.addEventListener('storage', e=>{ if(e.key==='jm_settings') apply(); });
})();

/* Collapsible setup sections — each <h4> in the right "Output & setup" column
   folds its controls into a popover-style accordion so the panel is a tidy list
   of options instead of a wall. Click a header to open it (others stay as you
   left them); the section closes again on the next click. */
(function studioAccordion(){
  try{
    const right = document.querySelector('.col.right'); if(!right) return;
    const heads = [...right.querySelectorAll('h4')];
    heads.forEach((h, i)=>{
      // Wrap everything between this h4 and the next into a collapsible body.
      const body = document.createElement('div');
      body.className = 'sec-body';
      let n = h.nextElementSibling;
      while(n && n.tagName !== 'H4'){ const next = n.nextElementSibling; body.appendChild(n); n = next; }
      h.after(body);
      h.classList.add('sec-head');
      h.style.cursor = 'pointer'; h.style.userSelect = 'none';
      const arrow = document.createElement('span');
      arrow.className = 'sec-arrow'; arrow.textContent = '▾';
      arrow.style.cssText = 'float:right;transition:transform .15s;color:var(--mut)';
      h.appendChild(arrow);
      // Start the first section open, the rest collapsed → tidy by default.
      const open = i === 0;
      body.style.display = open ? '' : 'none';
      arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(-90deg)';
      h.addEventListener('click', ()=>{
        const show = body.style.display === 'none';
        body.style.display = show ? '' : 'none';
        arrow.style.transform = show ? 'rotate(0deg)' : 'rotate(-90deg)';
      });
    });
  }catch(e){}
})();

  // Expose Studio functions to window for inline onclick handlers
  if(typeof _deleteTemplate==='function') window._deleteTemplate=_deleteTemplate;
  if(typeof _loadTemplateByKey==='function') window._loadTemplateByKey=_loadTemplateByKey;
  if(typeof _showGuideTemplate==='function') window._showGuideTemplate=_showGuideTemplate;
  if(typeof addImageUrl==='function') window.addImageUrl=addImageUrl;
  if(typeof addLayer==='function') window.addLayer=addLayer;
  if(typeof addScene==='function') window.addScene=addScene;
  if(typeof addScreen==='function') window.addScreen=addScreen;
  if(typeof addWhiteboard==='function') window.addWhiteboard=addWhiteboard;
  if(typeof applyArCrop==='function') window.applyArCrop=applyArCrop;
  if(typeof applyArCropFull==='function') window.applyArCropFull=applyArCropFull;
  if(typeof applyLayoutPreset==='function') window.applyLayoutPreset=applyLayoutPreset;
  if(typeof arQuickSwitch==='function') window.arQuickSwitch=arQuickSwitch;
  if(typeof cancelArCrop==='function') window.cancelArCrop=cancelArCrop;
  if(typeof clearVbg==='function') window.clearVbg=clearVbg;
  if(typeof dismissGuide==='function') window.dismissGuide=dismissGuide;
  if(typeof enableDevices==='function') window.enableDevices=enableDevices;
  if(typeof openArCropSelector==='function') window.openArCropSelector=openArCropSelector;
  if(typeof openCoursePicker==='function') window.openCoursePicker=openCoursePicker;
  if(typeof openGuide==='function') window.openGuide=openGuide;
  if(typeof openTeach==='function') window.openTeach=openTeach;
  if(typeof openWbSaveCourse==='function') window.openWbSaveCourse=openWbSaveCourse;
  if(typeof resetCorners==='function') window.resetCorners=resetCorners;
  if(typeof resetCrop==='function') window.resetCrop=resetCrop;
  if(typeof saveTemplate==='function') window.saveTemplate=saveTemplate;
  if(typeof selectLayer==='function') window.selectLayer=selectLayer;
  if(typeof setVbgColor==='function') window.setVbgColor=setVbgColor;
  if(typeof studioFocusPanels==='function') window.studioFocusPanels=studioFocusPanels;
  if(typeof studioToggleCol==='function') window.studioToggleCol=studioToggleCol;
  if(typeof studioToggleDrawer==='function') window.studioToggleDrawer=studioToggleDrawer;
  if(typeof tCreateClass==='function') window.tCreateClass=tCreateClass;
  if(typeof tGoLive==='function') window.tGoLive=tGoLive;
  if(typeof tInstantLive==='function') window.tInstantLive=tInstantLive;
  if(typeof tSelectClass==='function') window.tSelectClass=tSelectClass;
  if(typeof toggleCropMode==='function') window.toggleCropMode=toggleCropMode;
  if(typeof toggleAdjust==='function') window.toggleAdjust=toggleAdjust;
  if(typeof toggleFocus==='function') window.toggleFocus=toggleFocus;
  if(typeof toggleLayout==='function') window.toggleLayout=toggleLayout;
  if(typeof toggleRecord==='function') window.toggleRecord=toggleRecord;
  if(typeof toggleTemplatePanel==='function') window.toggleTemplatePanel=toggleTemplatePanel;
  if(typeof wbActivateSlot==='function') window.wbActivateSlot=wbActivateSlot;
  if(typeof wbAddPage==='function') window.wbAddPage=wbAddPage;
  if(typeof wbClear==='function') window.wbClear=wbClear;
  if(typeof wbCopy==='function') window.wbCopy=wbCopy;
  if(typeof wbCut==='function') window.wbCut=wbCut;
  if(typeof wbDelPage==='function') window.wbDelPage=wbDelPage;
  if(typeof wbDoSaveCourse==='function') window.wbDoSaveCourse=wbDoSaveCourse;
  if(typeof wbDocAddToBoard==='function') window.wbDocAddToBoard=wbDocAddToBoard;
  if(typeof wbDocPage==='function') window.wbDocPage=wbDocPage;
  if(typeof wbExportPdf==='function') window.wbExportPdf=wbExportPdf;
  if(typeof wbGoPage==='function') window.wbGoPage=wbGoPage;
  if(typeof wbPaste==='function') window.wbPaste=wbPaste;
  if(typeof wbRedo==='function') window.wbRedo=wbRedo;
  if(typeof wbRteAlign==='function') window.wbRteAlign=wbRteAlign;
  if(typeof wbRteBlock==='function') window.wbRteBlock=wbRteBlock;
  if(typeof wbRteFmt==='function') window.wbRteFmt=wbRteFmt;
  if(typeof wbRteInsert==='function') window.wbRteInsert=wbRteInsert;
  if(typeof wbSetBg==='function') window.wbSetBg=wbSetBg;
  if(typeof wbSetColorSlot==='function') window.wbSetColorSlot=wbSetColorSlot;
  if(typeof wbSetTool==='function') window.wbSetTool=wbSetTool;
  if(typeof wbStampRte==='function') window.wbStampRte=wbStampRte;
  if(typeof wbSwapColors==='function') window.wbSwapColors=wbSwapColors;
  if(typeof wbToggleFillMode==='function') window.wbToggleFillMode=wbToggleFillMode;
  if(typeof wbToggleGroup==='function') window.wbToggleGroup=wbToggleGroup;
  if(typeof wbUndo==='function') window.wbUndo=wbUndo;
  if(typeof refreshDevices==='function') window.refreshDevices=refreshDevices;
}

function mount(container) {
  if (!document.getElementById('jm-mod-studio-css')) {
    var s = document.createElement('style');
    s.id = 'jm-mod-studio-css';
    s.textContent = _CSS;
    document.head.appendChild(s);
  }
  // Suppress welcome guide when mounted inline in the shell (guide designed for standalone page)
  localStorage.setItem('studio_seen', '1');
  // body.focus .topbar hides ALL .topbar elements including the shell nav. Counter-rule restores it.
  if (!document.getElementById('jm-studio-shellfix')) {
    var shFix = document.createElement('style');
    shFix.id = 'jm-studio-shellfix';
    shFix.textContent = 'body.focus>.topbar{display:flex!important}body.focus>.sidebar{display:flex!important}body.focus>#shellModuleHost{display:flex!important}';
    document.head.appendChild(shFix);
  }
  container.innerHTML = _HTML;
  try { _init(container); } catch(e) { console.warn('studio init error:', e); }
  // Fix exit button to use shell navigation instead of full page redirect
  var _studioExit = document.getElementById('studioExitBtn');
  if (_studioExit) _studioExit.onclick = function() {
    if (document.body.classList.contains('focus') && typeof window.toggleFocus === 'function') window.toggleFocus();
    if (typeof window._exitModule === 'function') window._exitModule(); else location.hash = '';
  };
}

g.JM = g.JM || {}; g.JM.Modules = g.JM.Modules || {}; g.JM.Modules['studio'] = { mount: mount, unmount: function(c){ if(c) c.innerHTML=''; } };
})(window);
