(function(g) {
var _CSS = [
  ':root{--jm-primary:#7c3aed;--jm-bg:#0f0f17;--jm-surface:#1a1a25;--jm-border:#2a2a3a;--jm-text:#e4e4f0;--jm-text-muted:#9090a8;--jm-danger:#ef4444;--jm-success:#10b981}',
  '*{box-sizing:border-box;margin:0;padding:0}',
  'html{overflow-x:hidden}',
  'body{font-family:-apple-system,\'Segoe UI\',sans-serif;background:var(--jm-bg);color:var(--jm-text);height:100vh;overflow:hidden;display:flex;flex-direction:column;position:relative}',
  '.live-topbar{background:var(--jm-surface);padding:10px 18px;display:flex;align-items:center;gap:14px;border-bottom:1px solid var(--jm-border);min-height:56px}',
  '.live-topbar .title{font-weight:700;font-size:15px;flex:1}',
  '.live-topbar .sub{font-size:12px;color:var(--jm-text-muted)}',
  '.badge{padding:4px 10px;border-radius:12px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px}',
  '.badge.live{background:#7f1d1d;color:#fecaca}.badge.live::before{content:"";width:8px;height:8px;border-radius:50%;background:#ef4444;animation:pulse 1.5s infinite}',
  '.badge.scheduled{background:#1e3a8a;color:#dbeafe}',
  '.badge.paused{background:#78350f;color:#fed7aa}',
  '.badge.completed{background:#14532d;color:#bbf7d0}',
  '@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}',
  '.btn{padding:8px 16px;border-radius:8px;border:1px solid var(--jm-border);background:transparent;color:var(--jm-text);font-weight:600;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:6px}',
  '.btn:hover{background:#262635}',
  '.btn:active{transform:scale(.97)}',
  '.btn.primary{background:var(--jm-primary);border-color:var(--jm-primary)}',
  '.btn.primary:hover{background:#6d28d9}',
  '.btn.danger{background:var(--jm-danger);border-color:var(--jm-danger)}',
  '.btn.warn{background:#f59e0b;border-color:#f59e0b;color:#1a1a25}',
  '.btn:disabled{opacity:.5;cursor:not-allowed}',
  '.live-main{flex:1;display:grid;grid-template-columns:1fr minmax(280px,320px);overflow:hidden}',
  '.stage{position:relative;background:#000;display:flex;align-items:center;justify-content:center}',
  '#jitsi-frame{width:100%;height:100%;border:0}',
  '.placeholder{text-align:center;color:#666;padding:30px}',
  '.placeholder .icon{font-size:64px;margin-bottom:14px}',
  '.sidebar{background:var(--jm-surface);border-left:1px solid var(--jm-border);display:flex;flex-direction:column;overflow:hidden}',
  '.tabs{display:flex;border-bottom:1px solid var(--jm-border)}',
  '.tab{flex:1;padding:12px;background:transparent;border:0;color:var(--jm-text-muted);cursor:pointer;font-weight:600;font-size:13px}',
  '.tab:hover{background:rgba(255,255,255,.04)}',
  '.tab.active{color:var(--jm-text);border-bottom:2px solid var(--jm-primary);background:rgba(255,255,255,.03)}',
  '.tab:focus-visible{outline:2px solid var(--jm-primary);outline-offset:-2px}',
  '.btn:focus-visible{outline:2px solid var(--jm-primary);outline-offset:2px}',
  '.tab-body{flex:1;overflow-y:auto;padding:14px}',
  '.attendee{display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;font-size:13px}',
  '.attendee:hover{background:#262635}',
  '.attendee .dot{width:8px;height:8px;border-radius:50%;background:var(--jm-success)}',
  '.chat-msg{padding:8px;margin-bottom:6px;background:#262635;border-radius:6px;font-size:13px}',
  '.chat-msg .who{font-weight:600;font-size:11px;color:var(--jm-text-muted);margin-bottom:2px}',
  '.chat-input{display:flex;gap:6px;padding:10px;border-top:1px solid var(--jm-border)}',
  '.chat-input input{flex:1;padding:8px;border-radius:6px;border:1px solid var(--jm-border);background:var(--jm-bg);color:var(--jm-text)}',
  '.controls{display:flex;gap:8px;flex-wrap:wrap}',
  '.notice{background:#1e3a8a;color:#dbeafe;padding:10px 14px;border-radius:6px;font-size:13px;margin-bottom:10px}',
  '.notice.warn{background:#78350f;color:#fed7aa}',
  '.summary{font-size:12px;color:var(--jm-text-muted);line-height:1.7;margin-top:10px;padding:10px;background:var(--jm-bg);border-radius:6px}',
  '.sidebar-toggle-btn{display:none}',
  '@media(max-width:900px){.live-main{grid-template-columns:1fr}.sidebar{position:absolute;right:0;top:56px;bottom:0;width:90%;max-width:340px;transform:translateX(100%);transition:transform .25s;z-index:10}.sidebar.open{transform:translateX(0)}.sidebar-toggle-btn{display:inline-flex}.live-topbar{flex-wrap:wrap;gap:8px}.live-topbar .title{font-size:14px}.controls{order:5;width:100%;justify-content:center}}',
  '@media(max-width:480px){.sidebar{width:100%;max-width:none;top:0;z-index:20}.btn{padding:8px 12px;font-size:12px;min-height:44px}.live-topbar{padding:8px 10px}}',
  '@media(max-width:560px){.live-topbar .sub{display:none}#timer{display:none}.btn{padding:8px 11px;font-size:12px;min-height:44px}}',
  '@media(min-width:2200px){.live-main{grid-template-columns:1fr minmax(420px,560px)}.btn{font-size:16px;padding:12px 22px}.tab{font-size:16px;padding:16px}.live-topbar{min-height:72px}.live-topbar .title{font-size:20px}}',
  '@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}'
].join('');

var _HTML = [
  '<div class="live-topbar">',
  '  <button class="btn" onclick="leaveRoom()">← Leave</button>',
  '  <button class="btn" onclick="copyInvite()" title="Copy invite link">🔗 Invite</button>',
  '  <button class="btn" onclick="toggleWhiteboard()" title="Whiteboard for explanation">🖍 Board</button>',
  '  <button class="btn" onclick="window.open(\'/studio.html?class=\'+CLASS_ID,\'_blank\')" title="Smart camera studio (perspective correction, scenes, recording)">🎥 Studio</button>',
  '  <button class="btn" id="btnRaiseHand" onclick="raiseHand()" title="Raise hand">✋ Hand</button>',
  '  <div style="flex:1">',
  '    <div class="title" id="classTitle">Loading…</div>',
  '    <div class="sub" id="classSub">—</div>',
  '  </div>',
  '  <span id="statusBadgeWrap"><span class="badge scheduled" id="statusBadge">scheduled</span></span>',
  '  <span id="timer" style="font-family:monospace;color:var(--jm-text-muted);font-size:13px">00:00</span>',
  '  <div class="controls" id="teacherControls" style="display:none">',
  '    <button class="btn primary" id="btnStart" onclick="startClass()">▶ Start Class</button>',
  '    <button class="btn" id="btnShareScreen" onclick="shareScreen()" style="display:none" title="Share your screen">🖥 Share</button>',
  '    <button class="btn" id="btnShareContent" onclick="openShareContent()" style="display:none" title="Share a document / course content">📎 Content</button>',
  '    <button class="btn" id="btnMuteAll" onclick="muteAll()" style="display:none" title="Mute everyone">🔇 Mute all</button>',
  '    <button class="btn warn" id="btnPause" onclick="togglePause()" style="display:none">⏸ Pause</button>',
  '    <button class="btn" id="btnRecord" onclick="toggleRecording()" style="display:none">⏺ Record</button>',
  '    <button class="btn danger" id="btnEnd" onclick="endClass()" style="display:none">⏹ End Class</button>',
  '  </div>',
  '  <button class="btn sidebar-toggle-btn" onclick="toggleSidebar()" id="sidebarToggle" title="Toggle panel" aria-label="Toggle attendees and chat panel">📋</button>',
  '</div>',
  '<div class="live-main">',
  '  <div class="stage" id="stage">',
  '    <div class="placeholder">',
  '      <div class="icon">📡</div>',
  '      <div style="font-size:18px;font-weight:600;margin-bottom:6px">Loading live class…</div>',
  '      <div style="font-size:13px">Preparing video room</div>',
  '    </div>',
  '  </div>',
  '  <div class="sidebar" id="sidebar">',
  '    <div id="jm-tabbar-liveroom"></div>',
  '    <div class="chat-input" id="chatInputBox" style="display:none">',
  '      <input id="chatInput" placeholder="Message everyone…" aria-label="Type a message to everyone" onkeydown="if(event.key===\'Enter\')sendChatMsg()">',
  '      <button class="btn primary" onclick="sendChatMsg()">Send</button>',
  '    </div>',
  '  </div>',
  '</div>'
].join('');

function _init(container) {
  // Load external scripts needed
  var head = document.head;
  function loadScript(src) {
    return new Promise(function(resolve) {
      if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = resolve;
      head.appendChild(s);
    });
  }

  // Build TabBar HTML inline (since document.write won't work in module context)
  var tabBarWrap = container.querySelector('#jm-tabbar-liveroom');
  if (tabBarWrap) {
    tabBarWrap.innerHTML =
      '<div class="tabs">' +
        '<button class="tab active" onclick="showTab(\'attendees\')">👥 Attendees (<span id="attCount">0</span>)</button>' +
        '<button class="tab" onclick="showTab(\'chat\')">💬 Chat</button>' +
        '<button class="tab" onclick="showTab(\'polls\')">📊 Polls</button>' +
      '</div>' +
      '<div class="tab-body" id="tab-attendees">' +
        '<div id="attendeesList"><div style="color:var(--jm-text-muted);font-size:13px">No one\'s joined yet.</div></div>' +
        '<div class="summary" id="classSummary"></div>' +
      '</div>' +
      '<div class="tab-body" id="tab-chat" style="display:none"><div id="chatList" style="margin-bottom:10px"></div></div>' +
      '<div class="tab-body" id="tab-polls" style="display:none"><div id="pollPanel" style="font-size:13px"></div></div>';
  }

  var API = window.JM_API_BASE || '/api';
  var params = new URLSearchParams(location.search);
  var CLASS_ID = params.get('class');
  var ROOM_ID = params.get('room');
  var ROOM_TITLE = params.get('title') || 'Instant Live Class';
  var TOKEN = localStorage.getItem('jm_token');
  var _activePollId = null;

  async function refreshPolls(){
    var panel = document.getElementById('pollPanel');
    if (!panel) return;
    var isTeacher = ((window.JMRoles && window.JMRoles.CAN_TEACH_OR_SELL) || ['teacher','school','coaching','admin','partner']).includes(USER.role);
    var head2 = '';
    if (isTeacher) {
      head2 = '<button class="btn primary" onclick="createPoll()" style="margin-bottom:10px">+ New poll</button>';
    }
    if (_activePollId) {
      try {
        var r = await fetch(API + '/eduos/polls/' + _activePollId + '/results',
          { headers: { 'Authorization': 'Bearer ' + TOKEN } }).then(function(x){ return x.json(); });
        var total = r.total || 0;
        var rows = (r.poll.options || []).map(function(o) {
          var v = r.tally[o] || 0;
          var pct = total ? Math.round(100 * v / total) : 0;
          return '<div style="margin:6px 0">' +
            (isTeacher ? '' : '<button class="btn" onclick="vote(\'' + o.replace(/'/g,"\\'") + '\')">' + o + '</button>') +
            (isTeacher ? '<strong>' + o + '</strong>' : '') +
            '<div style="background:rgba(124,58,237,.1);height:14px;border-radius:7px;margin-top:4px;overflow:hidden">' +
              '<div style="width:' + pct + '%;height:100%;background:var(--jm-primary)"></div>' +
            '</div>' +
            '<small style="color:var(--jm-text-muted)">' + v + ' (' + pct + '%)</small>' +
          '</div>';
        }).join('');
        panel.innerHTML = head2 + '<div><strong>' + r.poll.question + '</strong></div>' + rows +
          (isTeacher ? '<button class="btn" onclick="closePoll()" style="margin-top:8px">Close poll</button>' : '');
      } catch (_) { panel.innerHTML = head2 + '<div>Poll unavailable</div>'; }
    } else {
      panel.innerHTML = head2 + '<div style="color:var(--jm-text-muted)">No active poll.</div>';
    }
  }

  async function createPoll(){
    var q = prompt('Poll question?'); if (!q) return;
    var optsRaw = prompt('Options (comma-separated):', 'Yes,No'); if (!optsRaw) return;
    var options = optsRaw.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
    if (options.length < 2) return alert('Need ≥2 options');
    var r = await fetch(API + '/eduos/polls', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: CLASS_ID, question: q, options: options })
    }).then(function(x){ return x.json(); });
    if (r.poll) { _activePollId = r.poll.id; refreshPolls(); }
    else alert(r.error || 'Failed');
  }

  async function vote(choice){
    await fetch(API + '/eduos/polls/' + _activePollId + '/vote', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ choice: choice })
    });
    refreshPolls();
  }

  async function closePoll(){
    if (!_activePollId) return;
    await fetch(API + '/eduos/polls/' + _activePollId + '/close', {
      method: 'POST', headers: { 'Authorization': 'Bearer ' + TOKEN }
    });
    _activePollId = null; refreshPolls();
  }

  var _activePollTimer = setInterval(function(){ if (_activePollId) refreshPolls(); }, 5000);
  var USER = JSON.parse(localStorage.getItem('jm_user') || '{}');
  var ROLE = USER.user_type || USER.role || 'student';
  var IS_TEACHER = ((window.JMRoles && window.JMRoles.CAN_TEACH_OR_SELL) || ['teacher','partner','school','coaching','admin']).includes(ROLE);

  if (!ROOM_ID && (!CLASS_ID || !TOKEN)) { location.href = '/login.html'; }

  var _class = null, _jitsiApi = null, _pollTimer = null, _startedAt = null, _timerInterval = null, _paused = false;

  async function api(path, method, body) {
    var r = await fetch(API + path, {
      method: method || 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN },
      body: body ? JSON.stringify(body) : undefined
    });
    if (r.status === 401) {
      localStorage.removeItem('jm_token');
      location.href = '/login.html?redirect=' + encodeURIComponent(location.pathname + location.search);
      throw new Error('Session expired');
    }
    if (r.status === 403) {
      throw new Error('You don\'t have access to this live class.');
    }
    var j = await r.json().catch(function(){ return {}; });
    if (!r.ok) throw new Error((j.error && j.error.message) || j.error || j.message || ('HTTP ' + r.status));
    return j;
  }

  function setStatus(s) {
    var wrap = document.getElementById('statusBadgeWrap');
    if (wrap && window.JM && JM.StatusBadge) {
      wrap.innerHTML = JM.StatusBadge(s, { id: 'statusBadge' });
    } else {
      var b = document.getElementById('statusBadge');
      if (b) { b.className = 'badge ' + s; b.textContent = s; }
    }
  }

  function fmtTime(secs) {
    var h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
    return (h ? String(h).padStart(2,'0') + ':' : '') + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  }

  function startTimer() {
    _startedAt = _startedAt || new Date();
    clearInterval(_timerInterval);
    _timerInterval = setInterval(function() {
      if (_paused) return;
      var elapsed = Math.floor((Date.now() - _startedAt.getTime()) / 1000);
      document.getElementById('timer').textContent = fmtTime(elapsed);
    }, 1000);
  }

  function ensureJitsiScript() {
    return new Promise(function(resolve, reject) {
      if (window.JitsiMeetExternalAPI) return resolve();
      var s = document.createElement('script');
      s.src = 'https://meet.jit.si/external_api.js';
      s.onload = resolve;
      s.onerror = function() { reject(new Error('Failed to load Jitsi')); };
      document.head.appendChild(s);
    });
  }

  async function mountJitsi() {
    await ensureJitsiScript();
    var stage = document.getElementById('stage');
    stage.innerHTML = '';
    var roomName = 'jeetmantra-' + (CLASS_ID || ROOM_ID || '').replace(/[^a-zA-Z0-9]/g, '');
    var displayName = USER.fullName || USER.full_name || USER.email || (IS_TEACHER ? 'Teacher' : 'Student');
    _jitsiApi = new JitsiMeetExternalAPI('meet.jit.si', {
      roomName: roomName, parentNode: stage,
      width: '100%', height: '100%',
      userInfo: { displayName: displayName, email: USER.email || '' },
      configOverwrite: {
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        startWithAudioMuted: !IS_TEACHER,
        startWithVideoMuted: !IS_TEACHER,
        enableWelcomePage: false
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: IS_TEACHER
          ? ['microphone','camera','desktop','fullscreen','hangup','chat','raisehand','tileview','settings','stats','recording','sharedvideo','toggle-camera','select-background']
          : ['microphone','camera','fullscreen','hangup','chat','raisehand','tileview','settings'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        DEFAULT_REMOTE_DISPLAY_NAME: 'Participant'
      }
    });
    _startCastViewer(stage);
    _jitsiApi.addListener('readyToClose', function() { leaveRoom(); });
    _jitsiApi.addListener('endpointTextMessageReceived', function(e) {
      try {
        var txt = (e && e.data && e.data.eventData && e.data.eventData.text) || (e && e.data && e.data.text);
        if (!txt) return;
        var msg = JSON.parse(txt);
        if (msg && msg.__wb) wbApplyRemote(msg);
      } catch (_) {}
    });
    _jitsiApi.addListener('videoConferenceJoined', function() {
      if (IS_TEACHER && _class && _class.status !== 'live') {
        // Don't auto-start
      }
    });
  }

  async function loadClass() {
    try {
      var r = await api('/live-classes/' + CLASS_ID);
      _class = r.liveClass;
      document.getElementById('classTitle').textContent = _class.title || 'Live Class';
      document.getElementById('classSub').textContent = ((_class.courses && _class.courses.title) || '') +
        ' · ' + new Date(_class.scheduled_time).toLocaleString() +
        ' · ' + (_class.duration || 60) + ' min';
      setStatus(_class.status || 'scheduled');
      if (_class.status === 'completed') {
        document.getElementById('stage').innerHTML = '<div class="placeholder"><div class="icon">⏹</div><div style="font-size:18px;font-weight:600">This class has ended.</div><div style="font-size:13px;margin-top:6px">Ended ' + (_class.ended_at ? new Date(_class.ended_at).toLocaleString() : '') + '</div></div>';
        renderSummary();
        return;
      }
      if (IS_TEACHER) {
        document.getElementById('teacherControls').style.display = '';
        if (_class.status === 'scheduled') {
          document.getElementById('btnStart').style.display = '';
          document.getElementById('btnPause').style.display = 'none';
          document.getElementById('btnEnd').style.display = 'none';
        } else if (_class.status === 'live') {
          document.getElementById('btnStart').style.display = 'none';
          ['btnPause','btnEnd','btnRecord','btnShareScreen','btnShareContent','btnMuteAll'].forEach(function(id){ var b=document.getElementById(id); if(b) b.style.display=''; });
          _startedAt = _class.started_at ? new Date(_class.started_at) : new Date();
          startTimer();
          await mountJitsi();
        }
      } else {
        if (_class.status === 'live' || _class.status === 'scheduled') {
          try { await api('/live-classes/' + CLASS_ID + '/join', 'POST', {}); } catch (_) {}
          await mountJitsi();
          if (_class.started_at) { _startedAt = new Date(_class.started_at); startTimer(); }
        } else {
          document.getElementById('stage').innerHTML = '<div class="placeholder"><div class="icon">⏳</div><div style="font-size:18px;font-weight:600">Class hasn\'t started yet</div><div style="font-size:13px;margin-top:6px">Scheduled for ' + new Date(_class.scheduled_time).toLocaleString() + '</div></div>';
        }
      }
      if (IS_TEACHER) startAttendeePoll();
    } catch (e) {
      document.getElementById('stage').innerHTML = '<div class="placeholder"><div class="icon">⚠️</div><div style="font-size:14px;color:#fca5a5">' + e.message + '</div></div>';
    }
  }

  async function startClass() {
    try {
      document.getElementById('btnStart').disabled = true;
      await api('/live-classes/' + CLASS_ID + '/start', 'POST', {});
      setStatus('live');
      _startedAt = new Date();
      startTimer();
      document.getElementById('btnStart').style.display = 'none';
      ['btnPause','btnEnd','btnRecord','btnShareScreen','btnShareContent','btnMuteAll'].forEach(function(id){ var b=document.getElementById(id); if(b) b.style.display=''; });
      await mountJitsi();
    } catch (e) { alert('Failed to start: ' + e.message); document.getElementById('btnStart').disabled = false; }
  }

  function shareScreen(){ if(_jitsiApi){ try{ _jitsiApi.executeCommand('toggleShareScreen'); }catch(e){ alert('Screen share unavailable'); } } }
  function muteAll(){ if(_jitsiApi){ try{ _jitsiApi.executeCommand('muteEveryone','audio'); toast('🔇 Muted everyone'); }catch(e){} } }
  function raiseHand(){ if(_jitsiApi){ try{ _jitsiApi.executeCommand('toggleRaiseHand'); }catch(e){} } }
  function toast(m){ var t=document.createElement('div'); t.textContent=m; t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1a1a25;color:#fff;padding:10px 18px;border-radius:8px;z-index:9999;font-size:13px'; document.body.appendChild(t); setTimeout(function(){ t.remove(); },2200); }

  async function openShareContent(){
    var host=document.getElementById('shareContentModal');
    if(!host){ host=document.createElement('div'); host.id='shareContentModal'; host.style.cssText='position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px'; host.onclick=function(e){ if(e.target===host) host.remove(); }; document.body.appendChild(host); }
    host.innerHTML='<div style="background:#15151f;color:#e4e4f0;border-radius:12px;max-width:560px;width:100%;max-height:80vh;overflow:auto;padding:20px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong>📎 Share content with class</strong><button class="btn" onclick="document.getElementById(\'shareContentModal\').remove()">×</button></div><div id="shareContentBody">Loading course content…</div></div>';
    try{
      var courseId=_class && _class.course_id; if(!courseId){ document.getElementById('shareContentBody').innerHTML='No course linked to this class.'; return; }
      var full=await api('/course-content/'+courseId+'/full');
      var items=[];
      (full.materials||[]).forEach(function(m){ items.push({label:'📄 '+(m.title||'Material'), url:m.url, sub:m.type}); });
      (full.lectures||[]).forEach(function(l){ if(l.video_url) items.push({label:'🎬 '+(l.title||'Lecture'), url:l.video_url, sub:'lecture'}); });
      (full.topics||[]).forEach(function(t){ (t.attachments||[]).forEach(function(a){ items.push({label:'📎 '+(a.name||t.title||'Attachment'), url:a.url||a, sub:'topic'}); }); });
      var body=document.getElementById('shareContentBody');
      body.innerHTML=items.length?items.map(function(it,i){ return '<div onclick="shareContentItem('+i+')" style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid #2a2a3a;border-radius:8px;margin-bottom:8px;cursor:pointer"><div style="flex:1;min-width:0"><div style="font-size:14px">'+it.label.replace(/[<>]/g,'')+'</div><div style="font-size:11px;color:#9090a8">'+(it.sub||'')+'</div></div><span style="color:#7c3aed">Share →</span></div>'; }).join(''):'<div style="color:#9090a8">No shareable documents/links in this course yet.</div>';
      window._shareItems=items;
    }catch(e){ document.getElementById('shareContentBody').innerHTML='Error: '+e.message; }
  }

  function shareContentItem(i){
    var it=(window._shareItems||[])[i]; if(!it) return;
    var url=it.url&&/^https?:/.test(it.url)?it.url:(location.origin+(it.url||''));
    var msg='📎 Shared: '+it.label.replace(/^[^\s]+\s/,'')+' → '+url;
    if(_jitsiApi){ try{ _jitsiApi.executeCommand('sendChatMessage', msg); }catch(e){} }
    try{ api('/live-classes/'+CLASS_ID+'/chat','POST',{message:msg}); }catch(e){}
    window.open(url,'_blank');
    var scm=document.getElementById('shareContentModal'); if(scm) scm.remove();
    toast('✓ Shared with class');
  }

  var _recorder = null, _recChunks = [], _recStream = null;
  async function toggleRecording() {
    var btn = document.getElementById('btnRecord');
    if (_recorder && _recorder.state === 'recording') {
      _recorder.stop();
      return;
    }
    try {
      var display = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15 }, audio: true });
      var mic = null;
      try { mic = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (_) {}
      var tracks = [...display.getVideoTracks(), ...display.getAudioTracks()];
      if (mic) tracks.push(...mic.getAudioTracks());
      _recStream = new MediaStream(tracks);
      _recChunks = [];
      _recorder = new MediaRecorder(_recStream, { mimeType: 'video/webm;codecs=vp8,opus' });
      _recorder.ondataavailable = function(e) { if (e.data && e.data.size) _recChunks.push(e.data); };
      _recorder.onstop = async function() {
        btn.textContent = '⬆ Uploading…'; btn.disabled = true;
        _recStream.getTracks().forEach(function(t) { t.stop(); });
        var blob = new Blob(_recChunks, { type: 'video/webm' });
        var fd = new FormData(); fd.append('recording', blob, 'class.webm');
        try {
          var r2 = await fetch(API + '/live-classes/' + CLASS_ID + '/recording', {
            method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN }, body: fd
          });
          var j = await r2.json();
          if (!r2.ok) throw new Error(j.error || 'upload failed');
          btn.textContent = '✓ Saved'; setTimeout(function() { btn.textContent = '⏺ Record'; btn.disabled = false; }, 2500);
        } catch (e) { alert('Recording upload failed: ' + e.message); btn.textContent = '⏺ Record'; btn.disabled = false; }
        _recorder = null;
      };
      display.getVideoTracks()[0].addEventListener('ended', function() { if (_recorder && _recorder.state === 'recording') _recorder.stop(); });
      _recorder.start(1000);
      btn.textContent = '⏹ Stop rec'; btn.classList.add('danger');
    } catch (e) {
      alert('Could not start recording: ' + e.message);
    }
  }

  function togglePause() {
    _paused = !_paused;
    var btn = document.getElementById('btnPause');
    if (_paused) {
      setStatus('paused');
      btn.textContent = '▶ Resume';
      if (_jitsiApi) {
        try { _jitsiApi.executeCommand('muteEveryone'); _jitsiApi.executeCommand('toggleVideo'); } catch(_){}
      }
    } else {
      setStatus('live');
      btn.textContent = '⏸ Pause';
      if (_jitsiApi) { try { _jitsiApi.executeCommand('toggleVideo'); } catch(_){} }
    }
  }

  async function endClass() {
    if (!confirm('End the class for everyone?')) return;
    if (_recorder && _recorder.state === 'recording') { _recorder.stop(); }
    try {
      document.getElementById('btnEnd').disabled = true;
      document.getElementById('btnRecord').style.display = 'none';
      await api('/live-classes/' + CLASS_ID + '/end', 'POST', {});
      setStatus('completed');
      clearInterval(_timerInterval);
      if (_jitsiApi) { try { _jitsiApi.dispose(); } catch(_){} _jitsiApi = null; }
      document.getElementById('btnPause').style.display = 'none';
      document.getElementById('btnEnd').style.display = 'none';
      document.getElementById('stage').innerHTML =
        '<div style="padding:30px;max-width:680px;color:#e4e4f0">' +
          '<div style="font-size:48px;text-align:center;margin-bottom:14px">✅</div>' +
          '<h2 style="text-align:center;margin-bottom:20px">Class ended</h2>' +
          '<div id="summaryWrap">' +
            '<div style="background:#1a1a25;padding:16px;border-radius:8px;margin-bottom:14px">' +
              '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
                '<strong>📝 AI Summary for students</strong>' +
                '<button class="btn primary" id="genSummaryBtn" onclick="genSummary()">✨ Generate</button>' +
              '</div>' +
              '<div id="summaryBody" style="font-size:13px;color:#9090a8">Click Generate to create post-class notes from this session.</div>' +
            '</div>' +
            '<textarea id="summaryNotes" placeholder="(optional) paste your own notes / transcript here, then click Generate" rows="3" style="width:100%;padding:8px;background:#1a1a25;color:#e4e4f0;border:1px solid #2a2a3a;border-radius:6px;font-family:inherit"></textarea>' +
          '</div>' +
          '<div style="text-align:center;margin-top:18px"><button class="btn" onclick="leaveRoom()">Back to dashboard</button></div>' +
        '</div>';
      renderSummary();
      setTimeout(function() { try { genSummary(); } catch (_) {} }, 600);
    } catch (e) { alert('Failed to end: ' + e.message); document.getElementById('btnEnd').disabled = false; }
  }

  async function genSummary(){
    var btn=document.getElementById('genSummaryBtn');
    var body=document.getElementById('summaryBody');
    if(!btn||!body) return;
    btn.disabled=true; btn.textContent='Thinking…';
    body.textContent='Generating notes…';
    try{
      var transcript=(document.getElementById('summaryNotes') && document.getElementById('summaryNotes').value) || '';
      var r=await api('/live-classes/'+CLASS_ID+'/summary','POST',{transcript:transcript});
      var html=(r.summary||'').replace(/^### (.*)$/gm,'<strong>$1</strong>')
        .replace(/^## (.*)$/gm,'<strong>$1</strong>')
        .replace(/^# (.*)$/gm,'<strong style="font-size:14px">$1</strong>')
        .replace(/^\* (.*)$/gm,'• $1').replace(/\n/g,'<br>');
      body.innerHTML=html||'<em>No summary generated</em>';
      btn.textContent='♻ Regenerate';
      btn.disabled=false;
    }catch(e){
      body.innerHTML='<span style="color:#fca5a5">'+e.message+'</span>';
      btn.disabled=false; btn.textContent='✨ Generate';
    }
  }

  async function copyInvite() {
    var url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert('✓ Invite link copied:\n' + url);
    } catch (_) {
      prompt('Copy this invite link:', url);
    }
  }

  var _wb = null;
  function toggleWhiteboard() {
    if (_wb) { _wb.root.remove(); _wb = null; return; }
    var stage = document.getElementById('stage');
    var root = document.createElement('div');
    root.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;background:rgba(255,255,255,.96);z-index:30';
    var swatches = ['#1a1a25','#e11d48','#2563eb','#16a34a','#f59e0b','#ffffff']
      .map(function(c,i){ return '<button class="wbsw" data-c="'+c+'" onclick="wbPick(\''+c+'\')" title="'+c+'" style="width:24px;height:24px;border-radius:5px;background:'+c+';border:2px solid '+(i===0?'#7c3aed':'#d1d5db')+';cursor:pointer;padding:0"></button>'; }).join('');
    root.innerHTML =
      '<div id="wb-bar" style="padding:8px 12px;display:flex;gap:8px;align-items:center;border-bottom:1px solid #e5e3ed;background:#fff;flex-wrap:wrap">' +
        '<strong style="color:#1a1325">🖍 Whiteboard</strong>' +
        '<div style="display:flex;gap:5px">' + swatches + '</div>' +
        '<input type="color" id="wb-color" value="#1a1a25" oninput="wbPick(this.value)" style="width:30px;height:30px;padding:0;border:1px solid #ccc;border-radius:5px">' +
        '<select id="wb-size" style="padding:5px 8px;border:1px solid #ccc;border-radius:5px;color:#1a1325">' +
          '<option value="2">Thin</option><option value="5" selected>Medium</option><option value="10">Thick</option><option value="18">Marker</option>' +
        '</select>' +
        '<button class="btn" id="wb-mode-pen" style="background:#7c3aed;color:#fff" onclick="wbMode(\'pen\')">✏️ Pen</button>' +
        '<button class="btn" id="wb-mode-erase" onclick="wbMode(\'erase\')" style="color:#1a1325;background:#f3f4f6">🧹 Erase</button>' +
        '<button class="btn" onclick="wbUndo()" style="color:#1a1325;background:#f3f4f6">↩ Undo</button>' +
        '<button class="btn" onclick="wbClear()" style="color:#1a1325;background:#f3f4f6">🗑 Clear</button>' +
        '<div style="flex:1"></div>' +
        '<button class="btn" onclick="toggleWhiteboard()" style="color:#1a1325;background:#f3f4f6">× Close</button>' +
      '</div>' +
      '<canvas id="wb-canvas" style="flex:1;cursor:crosshair;touch-action:none;background:#fff"></canvas>';
    stage.style.position = 'relative';
    stage.appendChild(root);
    var canvas = root.querySelector('#wb-canvas');
    var ctx = canvas.getContext('2d');
    function resize() {
      var r2 = canvas.getBoundingClientRect();
      var img = canvas.width ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
      canvas.width = r2.width; canvas.height = r2.height;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (img) ctx.putImageData(img, 0, 0);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    }
    resize(); window.addEventListener('resize', resize);
    var drawing = false, mode = 'pen', lastP = null, cur = null;
    var strokes = [];
    var pt = function(e) { var r2 = canvas.getBoundingClientRect(); var t = (e.touches && e.touches[0]) || e; return { x: t.clientX - r2.left, y: t.clientY - r2.top }; };
    function start(e) { if (_wb && _wb.readOnly) return; e.preventDefault(); drawing = true; lastP = pt(e); cur = []; ctx.beginPath(); ctx.moveTo(lastP.x, lastP.y); }
    function move(e) {
      if (!drawing || (_wb && _wb.readOnly)) return; e.preventDefault();
      var p = pt(e);
      var color = mode === 'erase' ? '#fff' : document.getElementById('wb-color').value;
      var size = mode === 'erase' ? 24 : Number(document.getElementById('wb-size').value);
      ctx.strokeStyle = color; ctx.lineWidth = size;
      ctx.lineTo(p.x, p.y); ctx.stroke();
      if (lastP) { var seg = { a: 'd', x0: lastP.x / canvas.width, y0: lastP.y / canvas.height, x1: p.x / canvas.width, y1: p.y / canvas.height, c: color, w: size }; if (cur) cur.push(seg); wbBroadcast(seg); }
      lastP = p;
    }
    function end() { if (cur && cur.length) strokes.push(cur); drawing = false; lastP = null; cur = null; }
    canvas.addEventListener('mousedown', start); canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end); canvas.addEventListener('mouseleave', end);
    canvas.addEventListener('touchstart', start); canvas.addEventListener('touchmove', move);
    canvas.addEventListener('touchend', end);
    function redraw() { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; strokes.forEach(function(st){ st.forEach(function(s){ ctx.strokeStyle = s.c; ctx.lineWidth = s.w; ctx.beginPath(); ctx.moveTo(s.x0 * canvas.width, s.y0 * canvas.height); ctx.lineTo(s.x1 * canvas.width, s.y1 * canvas.height); ctx.stroke(); }); }); }
    _wb = { root: root, canvas: canvas, ctx: ctx, readOnly: false, strokes: strokes, redraw: redraw, setMode: function(m) { mode = m;
        var pen = document.getElementById('wb-mode-pen'), er = document.getElementById('wb-mode-erase');
        if (pen) { pen.style.background = m === 'pen' ? '#7c3aed' : '#f3f4f6'; pen.style.color = m === 'pen' ? '#fff' : '#1a1325'; }
        if (er) { er.style.background = m === 'erase' ? '#7c3aed' : '#f3f4f6'; er.style.color = m === 'erase' ? '#fff' : '#1a1325'; } } };
  }

  function wbPick(c) { var i = document.getElementById('wb-color'); if (i) i.value = c; document.querySelectorAll('#wb-bar .wbsw').forEach(function(b){ b.style.borderColor = (b.dataset.c === c) ? '#7c3aed' : '#d1d5db'; }); if (_wb) _wb.setMode('pen'); }
  function wbMode(m) { if (_wb) _wb.setMode(m); }
  function wbClear() { if (!_wb) return; if (_wb.strokes) _wb.strokes.length = 0; var c = _wb.canvas; _wb.ctx.fillStyle = '#fff'; _wb.ctx.fillRect(0, 0, c.width, c.height); wbBroadcast({ a: 'c' }); }
  function wbUndo() { if (!_wb || !_wb.strokes || !_wb.strokes.length) return; _wb.strokes.pop(); _wb.redraw(); wbBroadcast({ a: 'c' }); _wb.strokes.forEach(function(st){ st.forEach(function(s){ wbBroadcast(s); }); }); }
  function wbBroadcast(obj) {
    if (!_jitsiApi) return;
    try { _jitsiApi.executeCommand('sendEndpointTextMessage', '', JSON.stringify(Object.assign({ __wb: 1 }, obj))); } catch (_) {}
  }
  function wbApplyRemote(msg) {
    if (!_wb) {
      toggleWhiteboard();
      if (_wb) {
        _wb.readOnly = true;
        var bar = _wb.root.firstElementChild;
        if (bar) bar.innerHTML = '<strong style="color:#1a1325;flex:1">🖍 Presenter\'s board</strong><button class="btn" onclick="toggleWhiteboard()" style="color:#1a1325;background:#f3f4f6">× Close</button>';
        _wb.canvas.style.cursor = 'default';
      }
    }
    if (!_wb) return;
    var c = _wb.canvas, ctx2 = _wb.ctx;
    if (msg.a === 'c') { ctx2.fillStyle = '#fff'; ctx2.fillRect(0, 0, c.width, c.height); return; }
    if (msg.a === 'd') {
      ctx2.strokeStyle = msg.c || '#7c3aed'; ctx2.lineWidth = msg.w || 5;
      ctx2.lineCap = 'round'; ctx2.lineJoin = 'round';
      ctx2.beginPath(); ctx2.moveTo(msg.x0 * c.width, msg.y0 * c.height);
      ctx2.lineTo(msg.x1 * c.width, msg.y1 * c.height); ctx2.stroke();
    }
  }

  function _teardownRoom() {
    if (_jitsiApi) { try { _jitsiApi.dispose(); } catch(_){} }
    clearInterval(_pollTimer); clearInterval(_timerInterval); clearInterval(_activePollTimer);
    _stopCastViewer();
  }

  var _castTimer=null, _castShown=false;
  function _startCastViewer(stage){
    if(!CLASS_ID) return;
    _stopCastViewer();
    var ov=document.getElementById('castOverlay');
    if(!ov){
      ov=document.createElement('div');
      ov.id='castOverlay';
      ov.style.cssText='position:absolute;inset:0;z-index:30;display:none;background:#000;flex-direction:column';
      ov.innerHTML=
        '<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:rgba(0,0,0,.55);color:#fff;font-size:12px;font-weight:700">'+
          '<span style="display:inline-flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block;animation:none"></span>📡 Studio view</span>'+
          '<button onclick="_toggleCast()" style="margin-left:auto;background:rgba(255,255,255,.15);color:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font-weight:700">Show room</button>'+
        '</div>'+
        '<img id="castImg" alt="Studio view" style="flex:1;min-height:0;width:100%;object-fit:contain;background:#000" />';
      (stage||document.getElementById('stage')).appendChild(ov);
    }
    var img=ov.querySelector('#castImg');
    var castDismissed = false;
    var tick=async function(){
      try{
        var r=await fetch(API+'/live-classes/'+CLASS_ID+'/cast',{headers:{Authorization:'Bearer '+TOKEN}});
        if(r.status===200){
          var j=await r.json();
          if(j && j.frame){ img.src=j.frame; if(!castDismissed){ ov.style.display='flex'; _castShown=true; } }
        } else {
          ov.style.display='none'; _castShown=false;
        }
      }catch(_){ /* transient */ }
    };
    tick();
    _castTimer=setInterval(tick, 800);
    window._castDismissed_ref = function(v){ castDismissed = v; };
  }

  var _castDismissed=false;
  function _toggleCast(){
    var ov=document.getElementById('castOverlay'); if(!ov) return;
    if(ov.style.display==='none'){ _castDismissed=false; if(window._castDismissed_ref) window._castDismissed_ref(false); ov.style.display='flex'; }
    else { _castDismissed=true; if(window._castDismissed_ref) window._castDismissed_ref(true); ov.style.display='none'; }
  }
  function _stopCastViewer(){ if(_castTimer){ clearInterval(_castTimer); _castTimer=null; } var ov=document.getElementById('castOverlay'); if(ov) ov.remove(); _castShown=false; }

  function leaveRoom() {
    _teardownRoom();
    window.location.href = '/app';
  }

  window.addEventListener('pagehide', _teardownRoom);

  function startAttendeePoll() {
    loadAttendees();
    clearInterval(_pollTimer);
    _pollTimer = setInterval(loadAttendees, 7000);
  }

  async function loadAttendees() {
    try {
      var r = await api('/live-classes/' + CLASS_ID + '/attendees');
      var list = r.attendees || [];
      document.getElementById('attCount').textContent = list.length;
      document.getElementById('attendeesList').innerHTML = list.length
        ? list.map(function(a){ return '<div class="attendee"><span class="dot"></span><div style="flex:1"><div>'+escape2(a.full_name || a.email || (a.student_id && a.student_id.slice(0,8)))+'</div><div style="font-size:11px;color:var(--jm-text-muted)">Joined '+(a.joined_at ? new Date(a.joined_at).toLocaleTimeString() : '')+'</div></div></div>'; }).join('')
        : '<div style="color:var(--jm-text-muted);font-size:13px;padding:8px">No one\'s joined yet.</div>';
    } catch (e) { /* polling errors are non-fatal */ }
  }

  function escape2(s) { return String(s || '').replace(/[<>&"]/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]; }); }

  function showTab(name) {
    if (window.JM && JM.TabBar) JM.TabBar.show(name);
    // Simple tab switching
    ['attendees','chat','polls'].forEach(function(t){
      var el = document.getElementById('tab-' + t);
      if (el) el.style.display = t === name ? '' : 'none';
    });
    container.querySelectorAll('.tab').forEach(function(btn, i){
      var names = ['attendees','chat','polls'];
      btn.classList.toggle('active', names[i] === name);
    });
    document.getElementById('chatInputBox').style.display = name === 'chat' ? '' : 'none';
    if (name === 'polls') refreshPolls();
  }

  function renderSummary() {
    if (!_class) return;
    var el = document.getElementById('classSummary');
    if (!el) return;
    var dur = (_class.started_at && _class.ended_at) ? Math.round((new Date(_class.ended_at) - new Date(_class.started_at)) / 60000) : null;
    el.innerHTML =
      '<div><strong>Status:</strong> ' + _class.status + '</div>' +
      (_class.started_at ? '<div><strong>Started:</strong> ' + new Date(_class.started_at).toLocaleTimeString() + '</div>' : '') +
      (_class.ended_at ? '<div><strong>Ended:</strong> ' + new Date(_class.ended_at).toLocaleTimeString() + '</div>' : '') +
      (dur != null ? '<div><strong>Duration:</strong> ' + dur + ' min</div>' : '');
  }

  function sendChatMsg() {
    var input = document.getElementById('chatInput');
    if (!input.value.trim()) return;
    var el = document.createElement('div');
    el.className = 'chat-msg';
    el.innerHTML = '<div class="who">You</div>' + escape2(input.value);
    document.getElementById('chatList').appendChild(el);
    if (_jitsiApi) { try { _jitsiApi.executeCommand('sendChatMessage', input.value, '', false); } catch (_) {} }
    input.value = '';
  }

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  }

  async function initInstantRoom(){
    document.getElementById('classTitle').textContent = ROOM_TITLE;
    document.getElementById('classSub').textContent = 'Instant live · share the link to invite anyone';
    setStatus('live');
    await mountJitsi();
    _startedAt = new Date(); startTimer();
  }

  // Embed mode
  (function(){
    try{
      if(new URLSearchParams(location.search).get('embed')!=='1') return;
      document.documentElement.classList.add('embed');
      var s=document.createElement('style');
      s.textContent='html.embed a[href$="/dashboard.html"],html.embed a[href="/app"],html.embed [data-embed-hide]{display:none!important}';
      (document.head||document.documentElement).appendChild(s);
      var hide=function(){ document.querySelectorAll('[onclick]').forEach(function(el){ var o=el.getAttribute('onclick')||''; if(o.indexOf('dashboard.html')>-1 || /[\'"]\/app[\'"]/g.test(o)) el.style.display='none'; }); };
      hide();
    }catch(e){}
  })();

  // Expose functions globally so inline onclick handlers work
  window.leaveRoom = leaveRoom;
  window.copyInvite = copyInvite;
  window.toggleWhiteboard = toggleWhiteboard;
  window.raiseHand = raiseHand;
  window.startClass = startClass;
  window.shareScreen = shareScreen;
  window.openShareContent = openShareContent;
  window.muteAll = muteAll;
  window.togglePause = togglePause;
  window.toggleRecording = toggleRecording;
  window.endClass = endClass;
  window.toggleSidebar = toggleSidebar;
  window.showTab = showTab;
  window.sendChatMsg = sendChatMsg;
  window.genSummary = genSummary;
  window.wbPick = wbPick;
  window.wbMode = wbMode;
  window.wbClear = wbClear;
  window.wbUndo = wbUndo;
  window.createPoll = createPoll;
  window.vote = vote;
  window.closePoll = closePoll;
  window.shareContentItem = shareContentItem;
  window._toggleCast = _toggleCast;

  window.addEventListener('beforeunload', function() { if (_jitsiApi) { try { _jitsiApi.dispose(); } catch(_){} } });

  if (ROOM_ID && !CLASS_ID) { initInstantRoom(); } else { loadClass(); }
}

function mount(container) {
  if (!document.getElementById('jm-mod-liveRoom-css')) {
    var s = document.createElement('style');
    s.id = 'jm-mod-liveRoom-css';
    s.textContent = _CSS;
    document.head.appendChild(s);
  }
  container.innerHTML = _HTML;
  try { _init(container); } catch(e) { console.warn('liveRoom init error:', e); }
}

g.JM = g.JM || {}; g.JM.Modules = g.JM.Modules || {}; g.JM.Modules['liveRoom'] = { mount: mount, unmount: function(c){ if(c) c.innerHTML=''; } };
})(window);
