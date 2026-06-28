/* JeetMantra Module: bhasha-setu — Language Learning Hub
 * Auto-converted from bhasha-setu.html
 */
(function(g) {
  'use strict';

  var _CSS = "\n  :root{\n    --bg:#FFFCF5; --surface:#FFFFFF; --surface2:#FBF6EC;\n    --ink:#2A2118; --ink-soft:#6E6457; --line:#EadFce;\n    --primary:#1E8E5A; --primary-ink:#FFFFFF; --primary-soft:#E4F2EA;\n    --accent:#F5A623; --accent-soft:#FDF1D8;\n    --danger:#C0492F;\n    --radius:18px; --radius-sm:12px;\n    --fs:1; /* font scale, set by admin / student */\n    --shadow:0 6px 24px rgba(42,33,24,.08);\n    --maxw:560px;\n  }\n  html[data-dark=\"1\"]{\n    --bg:#15110C; --surface:#211B14; --surface2:#1A150F;\n    --ink:#F6EFE2; --ink-soft:#B6AB99; --line:#332A1E;\n    --primary-soft:#16352a; --accent-soft:#3a2e15;\n    --shadow:0 6px 24px rgba(0,0,0,.4);\n  }\n  *{box-sizing:border-box}\n  html,body{margin:0;padding:0}\n  body{\n    background:var(--bg); color:var(--ink);\n    font-family:\"Noto Sans\",\"Segoe UI\",system-ui,-apple-system,Roboto,Arial,sans-serif;\n    font-size:calc(17px * var(--fs)); line-height:1.55;\n    -webkit-text-size-adjust:100%; -webkit-tap-highlight-color:transparent;\n  }\n  .app{max-width:var(--maxw); margin:0 auto; min-height:100vh; min-height:100dvh; display:flex; flex-direction:column; position:relative}\n  button{font-family:inherit; font-size:inherit; cursor:pointer}\n  input,select,textarea{font-family:inherit; font-size:inherit}\n  a{color:var(--primary)}\n  ::selection{background:var(--accent-soft)}\n\n  /* ---------- shared ui ---------- */\n  .btn{border:none; border-radius:var(--radius-sm); padding:.85em 1.1em; font-weight:700;\n       background:var(--primary); color:var(--primary-ink); display:inline-flex; gap:.5em; align-items:center; justify-content:center}\n  .btn:active{transform:scale(.98)}\n  .btn.block{width:100%}\n  .btn.ghost{background:var(--surface2); color:var(--ink); border:1.5px solid var(--line)}\n  .btn.accent{background:var(--accent); color:#3a2a05}\n  .btn.danger{background:transparent; color:var(--danger); border:1.5px solid var(--danger)}\n  .btn.sm{padding:.5em .8em; font-size:.9em; border-radius:10px}\n  .field{display:block; margin:.4em 0 1em}\n  .field > span{display:block; font-weight:700; margin-bottom:.35em; font-size:.95em}\n  .field .hint{font-weight:400; color:var(--ink-soft); font-size:.85em}\n  input[type=text],input[type=password],input[type=url],select,textarea{\n    width:100%; padding:.8em .9em; border:1.5px solid var(--line); border-radius:var(--radius-sm);\n    background:var(--surface); color:var(--ink); outline:none}\n  input:focus,select:focus,textarea:focus{border-color:var(--primary); box-shadow:0 0 0 3px var(--primary-soft)}\n  textarea{min-height:120px; resize:vertical}\n  .card{background:var(--surface); border:1.5px solid var(--line); border-radius:var(--radius); padding:1.1em; box-shadow:var(--shadow)}\n  .row{display:flex; gap:.6em; align-items:center}\n  .between{justify-content:space-between}\n  .muted{color:var(--ink-soft)}\n  .pill{display:inline-flex; align-items:center; gap:.35em; background:var(--primary-soft); color:var(--primary);\n        padding:.25em .7em; border-radius:999px; font-weight:700; font-size:.82em}\n  .center{text-align:center}\n  .stack > * + *{margin-top:.9em}\n  .hidden{display:none !important}\n  :focus-visible{outline:3px solid var(--accent); outline-offset:2px}\n\n  /* ---------- header ---------- */\n  .topbar{position:sticky; top:0; z-index:20; background:var(--surface); border-bottom:1.5px solid var(--line);\n          padding:.7em .9em; display:flex; align-items:center; gap:.6em}\n  .logo{font-size:1.5em; line-height:1}\n  .brand{font-weight:800; letter-spacing:-.01em}\n  .brand small{display:block; font-weight:500; font-size:.62em; color:var(--ink-soft); letter-spacing:0}\n  .spacer{flex:1}\n  .iconbtn{background:var(--surface2); border:1.5px solid var(--line); border-radius:12px; width:2.4em; height:2.4em;\n           display:inline-flex; align-items:center; justify-content:center; font-size:1.05em; color:var(--ink)}\n\n  /* ---------- main scroll area ---------- */\n  .main{flex:1; padding:1em .9em 6em; overflow-y:auto}\n  .greet{font-size:1.35em; font-weight:800; margin:.2em 0 .1em}\n\n  /* ---------- class chips ---------- */\n  .chips{display:flex; flex-wrap:wrap; gap:.5em}\n  .chip{border:1.5px solid var(--line); background:var(--surface); border-radius:12px; padding:.55em .9em; font-weight:700}\n  .chip[aria-pressed=\"true\"]{background:var(--primary); color:var(--primary-ink); border-color:var(--primary)}\n\n  /* ---------- lesson list ---------- */\n  .lesson{display:flex; gap:.8em; align-items:center; width:100%; text-align:left; border:1.5px solid var(--line);\n          background:var(--surface); border-radius:var(--radius); padding:.9em; box-shadow:var(--shadow)}\n  .lesson .lico{font-size:1.6em; width:1.6em; text-align:center}\n  .lesson .lt{font-weight:800}\n  .lesson .ls{font-size:.85em; color:var(--ink-soft)}\n  .lesson .go{margin-left:auto; color:var(--primary); font-weight:800; font-size:1.3em}\n\n  /* ---------- reading (tap to hear) ---------- */\n  .reader{line-height:1.85; font-size:1.06em}\n  .rd{cursor:pointer; border-radius:6px; padding:.05em .12em; transition:background .15s; border-bottom:2px dotted transparent}\n  .rd:hover{border-bottom-color:var(--accent)}\n  .rd.speaking{background:var(--accent-soft); border-bottom-color:var(--accent)}\n  .ytwrap{position:relative; width:100%; aspect-ratio:16/9; border-radius:var(--radius-sm); overflow:hidden; background:#000}\n  .ytwrap iframe{position:absolute; inset:0; width:100%; height:100%; border:0}\n\n  /* ---------- chat ---------- */\n  .chat{display:flex; flex-direction:column; gap:.7em}\n  .msg{max-width:88%; padding:.7em .9em; border-radius:16px; line-height:1.5}\n  .msg.user{align-self:flex-end; background:var(--primary); color:var(--primary-ink); border-bottom-right-radius:5px}\n  .msg.bot{align-self:flex-start; background:var(--surface2); border:1.5px solid var(--line); border-bottom-left-radius:5px}\n  .msg .speakbtn{display:inline-flex; margin-top:.4em; font-size:.8em; gap:.3em; align-items:center;\n                 background:transparent; border:none; color:var(--primary); font-weight:700; padding:0}\n  .msg.bot .rd{display:inline}\n  .typing{display:inline-flex; gap:4px; padding:.5em 0}\n  .typing i{width:7px; height:7px; border-radius:50%; background:var(--ink-soft); animation:bnc 1s infinite}\n  .typing i:nth-child(2){animation-delay:.15s} .typing i:nth-child(3){animation-delay:.3s}\n  @keyframes bnc{0%,60%,100%{opacity:.3; transform:translateY(0)}30%{opacity:1; transform:translateY(-4px)}}\n  .composer{position:sticky; bottom:0; background:var(--surface); border-top:1.5px solid var(--line);\n            padding:.6em; display:flex; gap:.5em; align-items:flex-end}\n  .composer textarea{min-height:auto; height:2.6em; max-height:7em; padding:.6em .8em; border-radius:14px}\n\n  /* ---------- bottom nav ---------- */\n  .nav{position:sticky; bottom:0; background:var(--surface); border-top:1.5px solid var(--line);\n       display:flex; padding:.35em .35em calc(.35em + env(safe-area-inset-bottom)); z-index:15}\n  .nav button{flex:1; background:none; border:none; color:var(--ink-soft); padding:.4em; border-radius:12px;\n              display:flex; flex-direction:column; align-items:center; gap:.15em; font-size:.72em; font-weight:700}\n  .nav button .ni{font-size:1.4em}\n  .nav button[aria-current=\"true\"]{color:var(--primary); background:var(--primary-soft)}\n\n  /* ---------- login ---------- */\n  .hero{padding:2.2em 1.2em 1.2em; text-align:center}\n  .hero .logo{font-size:3em}\n  .hero h1{margin:.2em 0 .1em; font-size:1.7em; letter-spacing:-.02em}\n  .hero p{margin:0; color:var(--ink-soft)}\n  .rolepick{display:grid; gap:.8em; padding:0 1.1em 1.4em}\n  .rolecard{display:flex; gap:.9em; align-items:center; text-align:left; padding:1.1em; border-radius:var(--radius);\n            border:1.5px solid var(--line); background:var(--surface); box-shadow:var(--shadow)}\n  .rolecard .ri{font-size:2em}\n  .rolecard b{display:block}\n\n  /* ---------- admin ---------- */\n  .tabs{display:flex; gap:.4em; padding:.4em; background:var(--surface2); border-radius:14px; margin-bottom:1em}\n  .tabs button{flex:1; border:none; background:none; padding:.6em; border-radius:10px; font-weight:700; color:var(--ink-soft)}\n  .tabs button[aria-selected=\"true\"]{background:var(--surface); color:var(--ink); box-shadow:var(--shadow)}\n  .grid2{display:grid; grid-template-columns:1fr 1fr; gap:.6em}\n  .colorrow{display:flex; align-items:center; gap:.6em}\n  .colorrow input[type=color]{width:48px; height:42px; padding:2px; border-radius:10px; border:1.5px solid var(--line); background:var(--surface)}\n  .swatch{width:100%; height:40px; border-radius:10px; border:1.5px solid var(--line)}\n\n  /* ---------- toast / modal ---------- */\n  .toast{position:fixed; left:50%; transform:translateX(-50%); bottom:5.5em; background:var(--ink); color:var(--bg);\n         padding:.7em 1.1em; border-radius:999px; font-weight:700; z-index:50; opacity:0; transition:opacity .25s; pointer-events:none; max-width:90%}\n  .toast.show{opacity:.97}\n  .backdrop{position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:flex-end; justify-content:center; z-index:40; padding:0}\n  .sheet{background:var(--surface); width:100%; max-width:var(--maxw); border-radius:20px 20px 0 0; padding:1.1em 1em calc(1.1em + env(safe-area-inset-bottom)); max-height:88vh; overflow:auto}\n  @media(min-width:560px){ .backdrop{align-items:center} .sheet{border-radius:20px} }\n  .sheet h3{margin:.1em 0 .8em}\n\n  @media (prefers-reduced-motion: reduce){ *{animation:none !important; transition:none !important} }\n\n  /* ---------- voice bot (Talk screen) ---------- */\n  .talk-main{display:flex; flex-direction:column; align-items:center; gap:.8em; padding-top:1.2em}\n  .talk-status{font-weight:700; color:var(--ink-soft); min-height:1.6em; text-align:center}\n  .mic{width:160px; height:160px; border-radius:50%; border:none; font-size:4em; color:var(--primary-ink);\n       background:var(--primary); box-shadow:var(--shadow); position:relative; transition:transform .15s}\n  .mic:disabled{opacity:.45; cursor:not-allowed}\n  .mic:active{transform:scale(.96)}\n  .mic.listening{background:#C0492F; animation:pulse 1.4s infinite}\n  .mic.thinking{background:var(--ink-soft); animation:spin 1.2s linear infinite}\n  .mic.speaking{background:var(--accent); color:#3a2a05; animation:pulse 1.4s infinite}\n  @keyframes pulse{0%{box-shadow:0 0 0 0 currentColor}70%{box-shadow:0 0 0 22px transparent}100%{box-shadow:0 0 0 0 transparent}}\n  @keyframes spin{to{transform:rotate(360deg)}}\n  .vchat{width:100%; max-height:38vh; overflow-y:auto}\n  .talk-controls{width:100%; display:flex; justify-content:space-between; align-items:center; gap:.5em}\n  .talk-controls label{display:flex; align-items:center; gap:.4em; font-size:.9em; font-weight:700}\n  .talk-controls input[type=checkbox]{transform:scale(1.3); width:auto}\n\n  /* admin tab strip — allow horizontal scroll on small screens */\n  .tabs{overflow-x:auto; scrollbar-width:none}\n  .tabs::-webkit-scrollbar{display:none}\n  .tabs button{flex:0 0 auto; min-width:0; white-space:nowrap}\n\n  /* file picker */\n  .filepick{display:flex; align-items:center; gap:.6em; padding:.7em; border:1.5px dashed var(--line); border-radius:var(--radius-sm); background:var(--surface2)}\n  .filepick input[type=file]{flex:1; font-size:.85em}\n\n\n      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;color:#2A2118}\n      .card{border:2px dashed ${c.primary};border-radius:18px;padding:22px;max-width:340px;margin:0 auto}\n      h1{margin:0 0 4px;font-size:20px;color:${c.primary}}\n      .row{display:flex;justify-content:space-between;margin:10px 0;padding:8px 12px;background:#FBF6EC;border-radius:10px}\n      .row b{font-family:ui-monospace,Menlo,monospace;font-size:18px}\n      .muted{color:#6E6457;font-size:13px;margin:0}\n      .foot{margin-top:14px;text-align:center;font-size:12px;color:#6E6457}\n      @media print{ body{padding:0} .card{border-style:solid} }\n    ";
  var _HTML = "<div class=\"app\" id=\"app\"></div>\n<div class=\"toast\" id=\"toast\"></div>\n\n<script>\n\"use strict\";\n\n/* ============================================================\n   STORAGE + STATE\n   ============================================================ */\nconst KEY = { config:'bs_config', content:'bs_content', students:'bs_students', history:'bs_history', session:'bs_session', voice:'bs_voice' };\nconst VOICE_LESSON_ID = '__voice__'; // synthetic lesson id used for voice-bot history rows\nconst load = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch(e){ return def; } };\nconst save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };\n\nconst DEFAULT_CONFIG = {\n  orgName:'JeetMantra', appName:'Bhasha Setu', tagline:'Learn by reading and listening',\n  logo:'📖', primary:'#1E8E5A', accent:'#F5A623', dark:false, fontScale:1,\n  defaultLang:'en', webhook:'', adminPass:'admin', requireCode:false, schoolCode:''\n};\n\nconst SEED_CONTENT = [\n  { id:'seed1', cls:'5', kind:'doc', title:'The Sun and the Wind', language:'en',\n    reference:'One day the Sun and the Wind had an argument. Each one said, I am stronger than you. Just then they saw a traveller walking on the road. The Wind said, Let us see who can make him take off his coat. The Wind blew hard and cold. But the traveller only pulled his coat tighter. Then the Sun shone warm and bright. Soon the traveller felt hot and took off his coat. So the gentle Sun won. Kindness is stronger than force.' },\n  { id:'seed2', cls:'3', kind:'doc', title:'मेरा गाँव', language:'hi',\n    reference:'मेरा गाँव बहुत सुंदर है। यहाँ हरे-भरे खेत हैं। सुबह पक्षी मीठे गीत गाते हैं। नदी का पानी साफ और ठंडा है। सब लोग मिलकर रहते हैं। मुझे अपना गाँव बहुत पसंद है।' }\n];\n\nlet state = {\n  config:   { ...DEFAULT_CONFIG, ...load(KEY.config, {}) },\n  content:  load(KEY.content, SEED_CONTENT),\n  students: load(KEY.students, []),\n  history:  load(KEY.history, []),   // [{ts, studentId, lessonId, lessonTitle, role, text}]\n  voiceAgent: load(KEY.voice, []),   // [{id, cls, title, content, language}]\n  session:  load(KEY.session, null)  // {role, studentId, name, cls, appLang}\n};\nif (!localStorage.getItem(KEY.content)) save(KEY.content, state.content);\n\n/* migration: backfill loginId/password for students created before credentials existed */\n(function migrateStudents(){\n  let changed=false;\n  const letters='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';\n  const mkId = cls => { let s=''; for(let i=0;i<4;i++) s+=letters[Math.floor(Math.random()*letters.length)];\n    return 'C'+String(cls).padStart(2,'0')+'-'+s; };\n  const mkPw = ()=>{ const w=['sun','sky','tree','star','bird','river','moon','leaf','rain','fish','book','lion'];\n    return w[Math.floor(Math.random()*w.length)]+Math.floor(100+Math.random()*900); };\n  state.students.forEach(s=>{\n    if(!s.loginId){ let id; do{ id=mkId(s.cls); } while(state.students.some(x=>x.loginId===id)); s.loginId=id; changed=true; }\n    if(!s.password){ s.password=mkPw(); changed=true; }\n  });\n  if(changed) save(KEY.students, state.students);\n})();\n\n/* migration: voiceAgent records {content} → {kind:'doc', reference} for unified schema */\n(function migrateVoice(){\n  let changed=false;\n  state.voiceAgent.forEach(d=>{\n    if(!d.kind){ d.kind='doc'; changed=true; }\n    if(d.content!==undefined && d.reference===undefined){ d.reference=d.content; delete d.content; changed=true; }\n  });\n  if(changed) save(KEY.voice, state.voiceAgent);\n})();\n\nconst persist = () => { save(KEY.config,state.config); save(KEY.content,state.content); save(KEY.students,state.students); save(KEY.history,state.history); save(KEY.voice,state.voiceAgent); save(KEY.session,state.session); };\n\n/* ============================================================\n   i18n  (English + Hindi complete; others cover core strings)\n   ============================================================ */\nconst LANGS = [\n  {code:'en', label:'English'}, {code:'hi', label:'हिन्दी'}, {code:'bn', label:'বাংলা'},\n  {code:'mr', label:'मराठी'}, {code:'ta', label:'தமிழ்'}, {code:'te', label:'తెలుగు'},\n  {code:'gu', label:'ગુજરાતી'}, {code:'kn', label:'ಕನ್ನಡ'}, {code:'pa', label:'ਪੰਜਾਬੀ'}\n];\nconst BCP = { en:'en-IN', hi:'hi-IN', bn:'bn-IN', mr:'mr-IN', ta:'ta-IN', te:'te-IN', gu:'gu-IN', kn:'kn-IN', pa:'pa-IN' };\n\nconst T = {\n  en:{\n    chooseRole:'Who is learning today?', iAmStudent:'I am a student', studentSub:'Pick your class and start',\n    iAmTeacher:'I am a teacher / school', teacherSub:'Set up lessons and theme',\n    yourName:'Your name', selectClass:'Select your class', schoolCode:'School code', start:'Start learning',\n    back:'Back', adminPass:'Password', enter:'Enter', wrongPass:'Wrong password', needName:'Please type your name',\n    needClass:'Please select your class', wrongCode:'Wrong school code',\n    learn:'Learn', chat:'Practice', history:'History', logout:'Log out', language:'Language', textSize:'Text size',\n    hello:'Hello', classLabel:'Class', lessons:'Your lessons', noLessons:'No lessons yet for this class. Ask your teacher to add some.',\n    reference:'Reading', tapHint:'Tap any line to hear it', playAll:'Listen to all', stop:'Stop',\n    openLink:'Open reference', practice:'Practice & ask', askPlaceholder:'Ask a question…', send:'Send',\n    thinking:'Thinking…', noWebhook:'The teacher has not connected the AI tutor yet. You can still read and listen above.',\n    listen:'Listen', historyEmpty:'No history yet. Open a lesson and start practising.', clearHistory:'Clear history',\n    cleared:'History cleared', voiceUnsupported:'Voice is not available on this device',\n    adminTitle:'School setup', branding:'Branding', content:'Lessons',\n    orgName:'School / organisation name', appName:'App name', tagline:'Tagline', logoEmoji:'Logo (emoji)',\n    primaryColor:'Main colour', accentColor:'Highlight colour', darkMode:'Dark mode', defaultLanguage:'Default language',\n    fontSize:'Default text size', webhook:'AI tutor endpoint (n8n webhook URL)',\n    webhookHint:'Student questions are sent here. Your n8n flow does the RAG and replies, and can also save the conversation.',\n    changePass:'Admin password', requireCode:'Require a school code to log in', codeValue:'School code students must enter',\n    saveSettings:'Save settings', saved:'Saved', addLesson:'Add lesson', editLesson:'Edit lesson',\n    lTitle:'Lesson title', lClass:'Class', lType:'Type', tDoc:'Document text', tYoutube:'YouTube video', tWebsite:'Website link',\n    lText:'Paste the reading text', lUrl:'Paste the link', lLang:'Reading language', delete:'Delete', edit:'Edit',\n    save:'Save', cancel:'Cancel', confirmDel:'Delete this lesson?', noContent:'No lessons added yet.',\n    allClasses:'All', filterClass:'Show class',\n    students:'Students', addStudent:'Add student', editStudent:'Edit student',\n    studentId:'Student ID', password:'Password', loginId:'Student ID', loginPass:'Password',\n    wrongLogin:'Wrong ID or password', search:'Search by name or ID',\n    noStudents:'No students added yet.', resetPass:'Reset password', copyCreds:'Copy login',\n    printCard:'Print login card', confirmDelStu:'Delete this student? Their history will also be removed.',\n    credCopied:'Login copied', generatedId:'Generated ID', regenerate:'Regenerate',\n    syncing:'Saving to server…', syncedOk:'Saved to server', syncedFail:'Saved locally — server sync failed',\n    syncNow:'Sync now', lastSync:'Last sync', neverSynced:'Not synced yet',\n    talk:'Talk', tapToTalk:'Tap the mic to talk', listening:'Listening…', preparing:'Preparing…',\n    speaking:'Speaking…', handsFree:'Hands-free', repeat:'Repeat last', stopTalk:'Stop',\n    voiceTeacherGreet:\"Hello! I'm your language teacher. Tap the mic and say something to me.\",\n    micBlocked:'Please allow microphone access', sttUnsupported:'Voice input is not supported on this browser. Try Chrome on Android or desktop.',\n    voiceBot:'Voice Bot', voiceMaterials:'Voice Bot Material', addVoiceDoc:'Add voice document',\n    editVoiceDoc:'Edit voice document', uploadFile:'Upload file', orPaste:'…or paste below',\n    fileType:'Only .txt and .md files', voiceFlow:'How the teacher should teach',\n    voiceFlowHint:'Paste the lesson script, vocabulary, dialogues, or rules the AI teacher should follow for this class.',\n    noVoiceDocs:'No voice material yet for this class. The voice bot will use a generic greeting.',\n    playConversation:'Play conversation', stopPlayback:'Stop'\n  },\n  hi:{\n    chooseRole:'आज कौन सीख रहा है?', iAmStudent:'मैं विद्यार्थी हूँ', studentSub:'अपनी कक्षा चुनें और शुरू करें',\n    iAmTeacher:'मैं शिक्षक / विद्यालय हूँ', teacherSub:'पाठ और रूप-रंग सेट करें',\n    yourName:'आपका नाम', selectClass:'अपनी कक्षा चुनें', schoolCode:'विद्यालय कोड', start:'सीखना शुरू करें',\n    back:'वापस', adminPass:'पासवर्ड', enter:'प्रवेश', wrongPass:'गलत पासवर्ड', needName:'कृपया अपना नाम लिखें',\n    needClass:'कृपया अपनी कक्षा चुनें', wrongCode:'गलत विद्यालय कोड',\n    learn:'सीखें', chat:'अभ्यास', history:'इतिहास', logout:'लॉग आउट', language:'भाषा', textSize:'अक्षर का आकार',\n    hello:'नमस्ते', classLabel:'कक्षा', lessons:'आपके पाठ', noLessons:'इस कक्षा के लिए अभी कोई पाठ नहीं है। शिक्षक से जोड़ने को कहें।',\n    reference:'पठन सामग्री', tapHint:'सुनने के लिए किसी भी पंक्ति को छुएँ', playAll:'सब सुनें', stop:'रोकें',\n    openLink:'सामग्री खोलें', practice:'अभ्यास और प्रश्न', askPlaceholder:'कोई प्रश्न पूछें…', send:'भेजें',\n    thinking:'सोच रहा हूँ…', noWebhook:'शिक्षक ने अभी AI सहायक नहीं जोड़ा है। आप ऊपर पढ़ और सुन सकते हैं।',\n    listen:'सुनें', historyEmpty:'अभी कोई इतिहास नहीं। कोई पाठ खोलें और अभ्यास शुरू करें।', clearHistory:'इतिहास हटाएँ',\n    cleared:'इतिहास हटा दिया गया', voiceUnsupported:'इस डिवाइस पर आवाज़ उपलब्ध नहीं है',\n    adminTitle:'विद्यालय सेटअप', branding:'ब्रांडिंग', content:'पाठ',\n    orgName:'विद्यालय / संस्था का नाम', appName:'ऐप का नाम', tagline:'टैगलाइन', logoEmoji:'लोगो (इमोजी)',\n    primaryColor:'मुख्य रंग', accentColor:'हाइलाइट रंग', darkMode:'डार्क मोड', defaultLanguage:'डिफ़ॉल्ट भाषा',\n    fontSize:'डिफ़ॉल्ट अक्षर आकार', webhook:'AI सहायक एंडपॉइंट (n8n वेबहुक URL)',\n    webhookHint:'विद्यार्थी के प्रश्न यहाँ भेजे जाते हैं। आपका n8n फ्लो RAG करके उत्तर देता है और बातचीत सहेज सकता है।',\n    changePass:'एडमिन पासवर्ड', requireCode:'लॉगिन के लिए विद्यालय कोड आवश्यक करें', codeValue:'विद्यार्थी जो कोड डालेंगे',\n    saveSettings:'सेटिंग सहेजें', saved:'सहेजा गया', addLesson:'पाठ जोड़ें', editLesson:'पाठ संपादित करें',\n    lTitle:'पाठ का शीर्षक', lClass:'कक्षा', lType:'प्रकार', tDoc:'दस्तावेज़ पाठ', tYoutube:'YouTube वीडियो', tWebsite:'वेबसाइट लिंक',\n    lText:'पठन सामग्री यहाँ चिपकाएँ', lUrl:'लिंक यहाँ चिपकाएँ', lLang:'पठन भाषा', delete:'हटाएँ', edit:'संपादित करें',\n    save:'सहेजें', cancel:'रद्द करें', confirmDel:'यह पाठ हटाएँ?', noContent:'अभी कोई पाठ नहीं जोड़ा गया।',\n    allClasses:'सभी', filterClass:'कक्षा दिखाएँ',\n    students:'विद्यार्थी', addStudent:'विद्यार्थी जोड़ें', editStudent:'विद्यार्थी संपादित करें',\n    studentId:'विद्यार्थी ID', password:'पासवर्ड', loginId:'विद्यार्थी ID', loginPass:'पासवर्ड',\n    wrongLogin:'गलत ID या पासवर्ड', search:'नाम या ID से खोजें',\n    noStudents:'अभी कोई विद्यार्थी नहीं जोड़ा गया।', resetPass:'पासवर्ड रीसेट करें', copyCreds:'लॉगिन कॉपी करें',\n    printCard:'लॉगिन कार्ड प्रिंट करें', confirmDelStu:'इस विद्यार्थी को हटाएँ? उसका इतिहास भी हट जाएगा।',\n    credCopied:'लॉगिन कॉपी हो गया', generatedId:'जनरेट की गई ID', regenerate:'दोबारा बनाएँ',\n    syncing:'सर्वर पर सहेज रहे हैं…', syncedOk:'सर्वर पर सहेज दिया', syncedFail:'स्थानीय रूप से सहेजा — सर्वर सिंक विफल',\n    syncNow:'अभी सिंक करें', lastSync:'अंतिम सिंक', neverSynced:'अभी तक सिंक नहीं हुआ',\n    talk:'बातचीत', tapToTalk:'बोलने के लिए माइक छुएँ', listening:'सुन रहा हूँ…', preparing:'तैयार कर रहा हूँ…',\n    speaking:'बोल रहा हूँ…', handsFree:'हैंड्स-फ्री', repeat:'फिर से सुनाएँ', stopTalk:'रोकें',\n    voiceTeacherGreet:'नमस्ते! मैं आपकी भाषा शिक्षक हूँ। माइक छूकर मुझसे कुछ कहिए।',\n    micBlocked:'कृपया माइक्रोफ़ोन की अनुमति दें', sttUnsupported:'इस ब्राउज़र पर आवाज़ इनपुट उपलब्ध नहीं है। कृपया Chrome आज़माएँ।',\n    voiceBot:'वॉइस बॉट', voiceMaterials:'वॉइस बॉट सामग्री', addVoiceDoc:'वॉइस दस्तावेज़ जोड़ें',\n    editVoiceDoc:'वॉइस दस्तावेज़ संपादित करें', uploadFile:'फ़ाइल अपलोड करें', orPaste:'…या नीचे चिपकाएँ',\n    fileType:'केवल .txt और .md फ़ाइलें', voiceFlow:'शिक्षक कैसे पढ़ाए',\n    voiceFlowHint:'इस कक्षा के लिए AI शिक्षक को जो स्क्रिप्ट, शब्दावली, संवाद या नियम पालन करने हैं वे यहाँ चिपकाएँ।',\n    noVoiceDocs:'इस कक्षा के लिए अभी कोई वॉइस सामग्री नहीं है। वॉइस बॉट सामान्य अभिवादन से शुरू करेगा।',\n    playConversation:'बातचीत सुनें', stopPlayback:'रोकें'\n  },\n  bn:{ chooseRole:'আজ কে শিখছে?', iAmStudent:'আমি ছাত্র', studentSub:'তোমার শ্রেণি বেছে নাও',\n    iAmTeacher:'আমি শিক্ষক / স্কুল', teacherSub:'পাঠ ও থিম সেট করুন', yourName:'তোমার নাম', selectClass:'শ্রেণি বেছে নাও',\n    schoolCode:'স্কুল কোড', start:'শেখা শুরু করো', back:'পিছনে', learn:'শেখো', chat:'অনুশীলন', history:'ইতিহাস',\n    logout:'লগ আউট', language:'ভাষা', textSize:'অক্ষরের আকার', hello:'নমস্কার', classLabel:'শ্রেণি', lessons:'তোমার পাঠ',\n    reference:'পড়া', tapHint:'শুনতে যেকোনো লাইনে চাপো', playAll:'সব শোনো', send:'পাঠাও', listen:'শোনো', enter:'প্রবেশ' },\n  mr:{ chooseRole:'आज कोण शिकत आहे?', iAmStudent:'मी विद्यार्थी आहे', studentSub:'तुमचा वर्ग निवडा',\n    iAmTeacher:'मी शिक्षक / शाळा', teacherSub:'पाठ व रंगसंगती सेट करा', yourName:'तुमचे नाव', selectClass:'तुमचा वर्ग निवडा',\n    schoolCode:'शाळा कोड', start:'शिकायला सुरुवात करा', back:'मागे', learn:'शिका', chat:'सराव', history:'इतिहास',\n    logout:'लॉग आउट', language:'भाषा', textSize:'अक्षर आकार', hello:'नमस्कार', classLabel:'वर्ग', lessons:'तुमचे पाठ',\n    reference:'वाचन', tapHint:'ऐकण्यासाठी कोणत्याही ओळीला स्पर्श करा', playAll:'सर्व ऐका', send:'पाठवा', listen:'ऐका', enter:'प्रवेश' },\n  ta:{ chooseRole:'இன்று யார் கற்கிறார்?', iAmStudent:'நான் மாணவன்', studentSub:'உங்கள் வகுப்பைத் தேர்வு செய்க',\n    iAmTeacher:'நான் ஆசிரியர் / பள்ளி', teacherSub:'பாடம் மற்றும் தீம் அமைக்கவும்', yourName:'உங்கள் பெயர்', selectClass:'வகுப்பைத் தேர்வு செய்க',\n    schoolCode:'பள்ளி குறியீடு', start:'கற்க தொடங்கு', back:'பின்', learn:'கற்க', chat:'பயிற்சி', history:'வரலாறு',\n    logout:'வெளியேறு', language:'மொழி', textSize:'எழுத்து அளவு', hello:'வணக்கம்', classLabel:'வகுப்பு', lessons:'உங்கள் பாடங்கள்',\n    reference:'வாசிப்பு', tapHint:'கேட்க எந்த வரியையும் தொடவும்', playAll:'அனைத்தையும் கேள்', send:'அனுப்பு', listen:'கேள்', enter:'நுழை' },\n  te:{ chooseRole:'ఈరోజు ఎవరు నేర్చుకుంటున్నారు?', iAmStudent:'నేను విద్యార్థిని', studentSub:'మీ తరగతిని ఎంచుకోండి',\n    iAmTeacher:'నేను ఉపాధ్యాయుడు / పాఠశాల', teacherSub:'పాఠాలు, థీమ్ సెట్ చేయండి', yourName:'మీ పేరు', selectClass:'తరగతిని ఎంచుకోండి',\n    schoolCode:'పాఠశాల కోడ్', start:'నేర్చుకోవడం ప్రారంభించు', back:'వెనుకకు', learn:'నేర్చుకో', chat:'అభ్యాసం', history:'చరిత్ర',\n    logout:'లాగ్ అవుట్', language:'భాష', textSize:'అక్షర పరిమాణం', hello:'నమస్తే', classLabel:'తరగతి', lessons:'మీ పాఠాలు',\n    reference:'పఠనం', tapHint:'వినడానికి ఏ పంక్తినైనా తాకండి', playAll:'అన్నీ వినండి', send:'పంపు', listen:'వినండి', enter:'ప్రవేశించు' },\n  gu:{ chooseRole:'આજે કોણ શીખે છે?', iAmStudent:'હું વિદ્યાર્થી છું', yourName:'તમારું નામ', selectClass:'તમારો વર્ગ પસંદ કરો',\n    start:'શીખવાનું શરૂ કરો', back:'પાછળ', learn:'શીખો', chat:'અભ્યાસ', history:'ઇતિહાસ', logout:'લૉગ આઉટ',\n    language:'ભાષા', hello:'નમસ્તે', classLabel:'વર્ગ', lessons:'તમારા પાઠ', tapHint:'સાંભળવા કોઈપણ લીટી દબાવો',\n    playAll:'બધું સાંભળો', send:'મોકલો', listen:'સાંભળો' },\n  kn:{ chooseRole:'ಇಂದು ಯಾರು ಕಲಿಯುತ್ತಿದ್ದಾರೆ?', iAmStudent:'ನಾನು ವಿದ್ಯಾರ್ಥಿ', yourName:'ನಿಮ್ಮ ಹೆಸರು', selectClass:'ನಿಮ್ಮ ತರಗತಿ ಆಯ್ಕೆಮಾಡಿ',\n    start:'ಕಲಿಯಲು ಪ್ರಾರಂಭಿಸಿ', back:'ಹಿಂದೆ', learn:'ಕಲಿ', chat:'ಅಭ್ಯಾಸ', history:'ಇತಿಹಾಸ', logout:'ಲಾಗ್ ಔಟ್',\n    language:'ಭಾಷೆ', hello:'ನಮಸ್ಕಾರ', classLabel:'ತರಗತಿ', lessons:'ನಿಮ್ಮ ಪಾಠಗಳು', tapHint:'ಕೇಳಲು ಯಾವುದೇ ಸಾಲನ್ನು ಸ್ಪರ್ಶಿಸಿ',\n    playAll:'ಎಲ್ಲವನ್ನೂ ಕೇಳಿ', send:'ಕಳುಹಿಸಿ', listen:'ಕೇಳಿ' },\n  pa:{ chooseRole:'ਅੱਜ ਕੌਣ ਸਿੱਖ ਰਿਹਾ ਹੈ?', iAmStudent:'ਮੈਂ ਵਿਦਿਆਰਥੀ ਹਾਂ', yourName:'ਤੁਹਾਡਾ ਨਾਮ', selectClass:'ਆਪਣੀ ਜਮਾਤ ਚੁਣੋ',\n    start:'ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ', back:'ਪਿੱਛੇ', learn:'ਸਿੱਖੋ', chat:'ਅਭਿਆਸ', history:'ਇਤਿਹਾਸ', logout:'ਲੌਗ ਆਊਟ',\n    language:'ਭਾਸ਼ਾ', hello:'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', classLabel:'ਜਮਾਤ', lessons:'ਤੁਹਾਡੇ ਪਾਠ', tapHint:'ਸੁਣਨ ਲਈ ਕੋਈ ਵੀ ਲਾਈਨ ਛੂਹੋ',\n    playAll:'ਸਭ ਸੁਣੋ', send:'ਭੇਜੋ', listen:'ਸੁਣੋ' }\n};\nfunction appLang(){ return (state.session && state.session.appLang) || state.config.defaultLang || 'en'; }\nfunction t(k){ const l = appLang(); return (T[l] && T[l][k]) || T.en[k] || k; }\n\n/* ============================================================\n   HELPERS\n   ============================================================ */\nconst $ = sel => document.querySelector(sel);\nconst app = $('#app');\nconst escH = s => String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));\nconst escA = s => escH(s).replace(/'/g, '&#39;');\nconst uid = p => (p||'id') + '_' + Math.random().toString(36).slice(2,9);\nlet toastTimer;\nfunction toast(msg){ const el=$('#toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2200); }\n\nfunction applyTheme(){\n  const c = state.config, r = document.documentElement;\n  r.style.setProperty('--primary', c.primary);\n  r.style.setProperty('--accent', c.accent);\n  r.style.setProperty('--fs', c.fontScale || 1);\n  r.setAttribute('data-dark', c.dark ? '1' : '0');\n  document.title = (c.appName||'Bhasha Setu') + ' — ' + (c.orgName||'');\n}\n\n/* derive soft tints from primary so themes stay coherent */\nfunction syncSoftColors(){\n  // light tint for primary-soft / accent-soft when not dark\n  const r = document.documentElement;\n  if(!state.config.dark){\n    r.style.setProperty('--primary-soft', hexTint(state.config.primary, .88));\n    r.style.setProperty('--accent-soft', hexTint(state.config.accent, .85));\n  }\n}\nfunction hexTint(hex, amt){ // mix hex toward white by amt\n  try{ const h=hex.replace('#',''); const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);\n    let R=(n>>16)&255,G=(n>>8)&255,B=n&255;\n    R=Math.round(R+(255-R)*amt); G=Math.round(G+(255-G)*amt); B=Math.round(B+(255-B)*amt);\n    return '#'+[R,G,B].map(v=>v.toString(16).padStart(2,'0')).join(''); }catch(e){ return '#eee'; }\n}\n\n/* ---------- text-to-speech ---------- */\nlet voicesReady = false;\nfunction loadVoices(){ try{ const v=speechSynthesis.getVoices(); if(v&&v.length) voicesReady=true; }catch(e){} }\nif ('speechSynthesis' in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }\nfunction pickVoice(lang){\n  try{ const vs=speechSynthesis.getVoices(); if(!vs.length) return null;\n    return vs.find(v=>v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()))\n        || vs.find(v=>v.lang && v.lang.toLowerCase().startsWith((lang+'-')))\n        || null; }catch(e){ return null; }\n}\nlet stopSpeak = ()=>{};\nfunction speak(text, lang, spanEl){\n  if(!('speechSynthesis' in window)){ toast(t('voiceUnsupported')); return; }\n  speechSynthesis.cancel();\n  document.querySelectorAll('.rd.speaking').forEach(e=>e.classList.remove('speaking'));\n  const u = new SpeechSynthesisUtterance(text);\n  u.lang = BCP[lang] || lang || 'en-IN';\n  const v = pickVoice(lang||'en'); if(v) u.voice = v;\n  u.rate = 0.92;\n  if(spanEl){ spanEl.classList.add('speaking');\n    const clear=()=>spanEl.classList.remove('speaking'); u.onend=clear; u.onerror=clear; }\n  speechSynthesis.speak(u);\n}\n/* split into tappable sentences (works on older mobile browsers too) */\nfunction readable(text, lang){\n  const parts = String(text).match(/[^.!?।॥\\n]+[.!?।॥]*[\\s\\n]*/g) || [String(text)];\n  return parts.map(s => `<span class=\"rd\" data-lang=\"${escA(lang||'en')}\" data-text=\"${escA(s.trim())}\">${escH(s)}</span>`).join('');\n}\nfunction ytId(url){\n  const m = String(url).match(/(?:youtu\\.be\\/|v=|embed\\/|shorts\\/)([A-Za-z0-9_-]{6,})/);\n  return m ? m[1] : null;\n}\n\n/* ============================================================\n   AI TUTOR (n8n webhook)\n   ============================================================ */\nfunction extractReply(data){\n  if(!data) return null;\n  if(typeof data === 'string') return data;\n  if(Array.isArray(data)) return extractReply(data[0]);\n  return data.reply || data.output || data.text || data.message || data.answer ||\n         (data.data && extractReply(data.data)) || null;\n}\nasync function askBot(lesson, message, hist){\n  const c = state.config, s = state.session;\n  const payload = {\n    type:'chat', org:c.orgName, sessionId:s.studentId,\n    student:{ name:s.name, class:s.cls },\n    lesson:{ id:lesson.id, title:lesson.title, kind:lesson.kind, reference:lesson.reference, language:lesson.language },\n    language: appLang(),\n    message,\n    history: hist.slice(-10).map(h=>({role:h.role, text:h.text}))\n  };\n  // JeetMantra: tick lesson progress for \"My Results\"\n  try {\n    const ctx = window.JM_CTX || {};\n    const arr = JSON.parse(localStorage.getItem('jm_bhasha_progress')||'[]');\n    const key = (ctx.courseId||lesson.id);\n    const existing = arr.find(r => r.key===key);\n    if (existing) { existing.turns = (existing.turns||0)+1; existing.ts = Date.now(); }\n    else arr.unshift({ key, ts: Date.now(), courseId: ctx.courseId||null, title: lesson.title, topic: ctx.topic||'', lang: lesson.language||appLang(), turns: 1 });\n    localStorage.setItem('jm_bhasha_progress', JSON.stringify(arr.slice(0,100)));\n  } catch(e){}\n  // JeetMantra platform routing: prefer /api/ai/generate when logged in (no webhook needed)\n  const jmToken = (typeof localStorage!=='undefined') && localStorage.getItem('jm_token');\n  if(jmToken){\n    try{\n      const sys = `You are a kind language-learning tutor. Lesson title: \"${lesson.title}\". Lesson reference text/URL: \"\"\"${(lesson.reference||'').slice(0,4000)}\"\"\". Always reply in the student's chosen UI language (${appLang()}). Keep answers short, encouraging, and age-appropriate for a Class ${s.cls} student.`;\n      const res = await fetch('/api/ai/generate', {\n        method:'POST',\n        headers:{'Content-Type':'application/json','Authorization':'Bearer '+jmToken},\n        body: JSON.stringify({ systemPrompt: sys, prompt: message })\n      });\n      if(!res.ok) throw new Error('HTTP '+res.status);\n      const data = await res.json();\n      const reply = data.text || data.reply || extractReply(data) || '…';\n      return { ok:true, reply };\n    }catch(err){ /* fall through to webhook */ }\n  }\n  if(!c.webhook){ return { ok:false, reply:t('noWebhook') }; }\n  try{\n    const res = await fetch(c.webhook, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });\n    let data=null; try{ data = await res.json(); }catch(e){ data = await res.text().catch(()=>null); }\n    const reply = extractReply(data);\n    return { ok:true, reply: reply || '…' };\n  }catch(err){\n    return { ok:false, reply:'⚠️ '+ (appLang()==='hi'?'सहायक से जुड़ नहीं पाया। कृपया बाद में प्रयास करें।':'Could not reach the tutor. Please try again later.') };\n  }\n}\n\n/* ============================================================\n   ROUTER\n   ============================================================ */\nlet view = { name:'login', sub:'role', lessonId:null, adminTab:'branding', tmpClass:null, filterCls:'all' };\nfunction go(name, opts={}){ view = { ...view, name, ...opts }; render(); window.scrollTo(0,0); }\n\n/* ---------- sync to webhook (full snapshot or per-student) ---------- */\nlet syncing = false;\nasync function syncToWebhook(reason){\n  const c = state.config;\n  if(!c.webhook) return { ok:false, skipped:true };\n  const s = state.session;\n  const isStudent = s && s.role==='student';\n  const payload = isStudent ? {\n    type:'sync', reason, org:c.orgName, app:c.appName, ts:Date.now(),\n    scope:'student', sessionId:s.studentId,\n    student: state.students.find(x=>x.id===s.studentId) || { id:s.studentId, name:s.name, cls:s.cls },\n    history: state.history.filter(h=>h.studentId===s.studentId)\n  } : {\n    type:'sync', reason, org:c.orgName, app:c.appName, ts:Date.now(),\n    scope:'full',\n    config: { ...c, adminPass:undefined },           // never send the admin password\n    students: state.students, content: state.content, voiceAgent: state.voiceAgent, history: state.history\n  };\n  try{\n    const res = await fetch(c.webhook, { method:'POST', headers:{'Content-Type':'application/json'},\n      body: JSON.stringify(payload), keepalive:true });\n    if(!res.ok) throw new Error('HTTP '+res.status);\n    state.config.lastSyncAt = Date.now(); save(KEY.config, state.config);\n    return { ok:true };\n  }catch(err){ return { ok:false, error:String(err.message||err) }; }\n}\n\nasync function logout(){\n  if(syncing) return;\n  if(typeof stopVoice==='function') stopVoice();\n  speechSynthesis && speechSynthesis.cancel();\n  syncing = true;\n  const hadWebhook = !!state.config.webhook;\n  if(hadWebhook){ toast(t('syncing')); }\n  const r = await syncToWebhook('logout');\n  syncing = false;\n  if(hadWebhook){ toast(r.ok ? t('syncedOk') : t('syncedFail')); }\n  state.session = null; persist(); go('login',{sub:'role'});\n}\n\n/* best-effort sync when the tab is closed/backgrounded */\nwindow.addEventListener('pagehide', ()=>{\n  const c = state.config; if(!c.webhook || !state.session) return;\n  const s = state.session;\n  const payload = (s.role==='student') ? {\n    type:'sync', reason:'pagehide', org:c.orgName, ts:Date.now(), scope:'student',\n    sessionId:s.studentId, student: state.students.find(x=>x.id===s.studentId),\n    history: state.history.filter(h=>h.studentId===s.studentId)\n  } : null;\n  if(!payload) return;\n  try{ navigator.sendBeacon(c.webhook, new Blob([JSON.stringify(payload)], {type:'application/json'})); }catch(e){}\n});\n\n// JeetMantra deep-link + role gating. Students = learn only; Teacher/School/Coaching = configure lessons.\nwindow.JM_CTX = (() => {\n  try {\n    const p = new URLSearchParams(location.search);\n    let role=''; try { const u=JSON.parse(localStorage.getItem('jm_user')||'null'); role=(u&&(u.role||u.user_type))||''; } catch(e){}\n    return { courseId:p.get('courseId')||'', topic:p.get('topic')||'', title:p.get('title')||p.get('topic')||'', lang:(p.get('lang')||'').toLowerCase(), text:p.get('text')||'', role:(role||'guest').toLowerCase() };\n  } catch(e){ return { role:'guest' }; }\n})();\nwindow.JM_CAN_CONFIGURE = ['teacher','school','coaching','admin','partner'].includes(window.JM_CTX.role);\n\n// Auto-login per role so the in-page role pick is skipped.\nfunction jmAutoSession(){\n  const ctx = window.JM_CTX || {};\n  if (state.session) return;\n  if (ctx.role && ctx.role !== 'guest') {\n    if (window.JM_CAN_CONFIGURE) {\n      state.session = { role:'admin', name:'Teacher' };\n    } else {\n      let stu = (state.students||[])[0];\n      if (!stu) {\n        stu = { id:'jm_stu', name:'Student', cls:'8', loginId:'JM-AUTO', password:'auto' };\n        state.students.unshift(stu); save(KEY.students, state.students);\n      }\n      state.session = { role:'student', studentId:stu.id, name:stu.name, cls:stu.cls, appLang:ctx.lang||state.config.defaultLang||'en' };\n    }\n    save(KEY.session, state.session);\n  }\n}\n\nfunction jmSeedLessonFromCtx(){\n  const ctx = window.JM_CTX || {};\n  if (!ctx.title && !ctx.text) return;\n  try {\n    const existing = (state.content||[]).find(c => c.id === 'jm_'+(ctx.courseId||'ctx'));\n    const lesson = {\n      id: 'jm_'+(ctx.courseId||'ctx'),\n      cls: '8', kind: 'doc',\n      title: ctx.title || 'Course lesson',\n      language: ctx.lang || 'en',\n      reference: ctx.text || ctx.title || ''\n    };\n    if (existing) Object.assign(existing, lesson); else state.content.unshift(lesson);\n    save(KEY.content, state.content);\n    if (ctx.lang) { state.config.defaultLang = ctx.lang; save(KEY.config, state.config); }\n  } catch(e){}\n}\n\nfunction render(){\n  applyTheme(); syncSoftColors();\n  if (window.JM_CTX && (window.JM_CTX.title || window.JM_CTX.text) && !window.__jm_seeded) { window.__jm_seeded=true; jmSeedLessonFromCtx(); }\n  // JM role gating: auto-promote into admin or student based on JM session\n  if (window.JM_CTX && window.JM_CTX.role && window.JM_CTX.role!=='guest' && !state.session) jmAutoSession();\n  if(state.session && state.session.role==='admin') return renderAdmin();\n  if(state.session && state.session.role==='student') return renderStudent();\n  return renderLogin();\n}\n\n/* ---------- header used by student + admin ---------- */\nfunction headerHTML(opts={}){\n  const c = state.config;\n  const langOpts = LANGS.map(l=>`<option value=\"${l.code}\" ${appLang()===l.code?'selected':''}>${l.label}</option>`).join('');\n  return `<div class=\"topbar\">\n    <span class=\"logo\">${escH(c.logo||'📖')}</span>\n    <div class=\"brand\">${escH(c.appName||'Bhasha Setu')}<small>${escH(c.orgName||'')}</small></div>\n    <span class=\"spacer\"></span>\n    <select id=\"langSel\" class=\"iconbtn\" style=\"width:auto;padding:0 .5em\" aria-label=\"${escA(t('language'))}\">${langOpts}</select>\n    <button class=\"iconbtn\" id=\"sizeBtn\" aria-label=\"${escA(t('textSize'))}\">A</button>\n    <button class=\"iconbtn\" id=\"logoutBtn\" aria-label=\"${escA(t('logout'))}\">⎋</button>\n  </div>`;\n}\nfunction wireHeader(){\n  const ls = $('#langSel'); if(ls) ls.onchange = e=>{ state.session.appLang = e.target.value; persist(); render(); };\n  const sb = $('#sizeBtn'); if(sb) sb.onclick = ()=>{ const steps=[0.9,1,1.15,1.3]; let i=steps.indexOf(state.config.fontScale); i=(i+1)%steps.length; state.config.fontScale=steps[i]; persist(); applyTheme(); toast(t('textSize')+': '+Math.round(steps[i]*100)+'%'); };\n  const lo = $('#logoutBtn'); if(lo) lo.onclick = logout;\n}\n\n/* ============================================================\n   LOGIN\n   ============================================================ */\nfunction renderLogin(){\n  const c = state.config;\n  if(view.sub==='role'){\n    app.innerHTML = `\n      ${JM.Hero({logo:escH(c.logo||'📖'),title:escH(c.appName||'Bhasha Setu'),tagline:escH(c.tagline||'')})}\n      <div style=\"text-align:center;margin:-.4em 0 .6em\">${langPickerInline()}</div>\n      <h2 class=\"center\" style=\"font-size:1.1em;margin:.4em 0\">${t('chooseRole')}</h2>\n      ${JM.RolePicker({roles:[\n        { id: 'goStudent', icon: '🧑‍🎓', title: t('iAmStudent'), sub: t('studentSub') },\n        { id: 'goTeacher', icon: '🧑‍🏫', title: t('iAmTeacher'), sub: t('teacherSub') }\n      ]})}`;\n    wireLangPickerInline();\n    $('#goStudent').onclick = ()=>go('login',{sub:'student'});\n    $('#goTeacher').onclick = ()=>go('login',{sub:'admin'});\n    return;\n  }\n  if(view.sub==='student'){\n    app.innerHTML = `\n      ${JM.Hero({compact:true,logo:escH(c.logo||'📖'),title:t('iAmStudent')})}\n      <div class=\"main\" style=\"padding-top:0\">\n        <div class=\"card stack\">\n          <label class=\"field\"><span>${t('loginId')}</span><input type=\"text\" id=\"stuId\" autocomplete=\"username\" autocapitalize=\"characters\" placeholder=\"${escA(t('loginId'))}\"></label>\n          <label class=\"field\"><span>${t('loginPass')}</span><input type=\"password\" id=\"stuPass\" autocomplete=\"current-password\" placeholder=\"${escA(t('loginPass'))}\"></label>\n          <button class=\"btn block accent\" id=\"stuStart\">${t('start')} →</button>\n          <button class=\"btn ghost block\" id=\"stuBack\">← ${t('back')}</button>\n          <p class=\"muted center\" style=\"font-size:.82em;margin:0\">${t('iAmTeacher')} ➜ ${t('addStudent')}</p>\n        </div>\n      </div>`;\n    $('#stuBack').onclick = ()=>go('login',{sub:'role'});\n    const tryLogin = ()=>{\n      const sid = ($('#stuId').value||'').trim();\n      const pass = $('#stuPass').value||'';\n      if(!sid || !pass) return toast(t('wrongLogin'));\n      const stu = state.students.find(s => s.loginId && s.loginId.toLowerCase()===sid.toLowerCase() && s.password===pass);\n      if(!stu) return toast(t('wrongLogin'));\n      state.session = { role:'student', studentId:stu.id, name:stu.name, cls:stu.cls, appLang:appLang() };\n      persist(); go('home');\n    };\n    $('#stuStart').onclick = tryLogin;\n    $('#stuPass').addEventListener('keydown', e=>{ if(e.key==='Enter') tryLogin(); });\n    return;\n  }\n  if(view.sub==='admin'){\n    app.innerHTML = `\n      ${JM.Hero({compact:true,logo:escH(c.logo||'📖'),title:t('iAmTeacher')})}\n      <div class=\"main\" style=\"padding-top:0\">\n        <div class=\"card stack\">\n          <label class=\"field\"><span>${t('adminPass')}</span><input type=\"password\" id=\"adPass\" autocomplete=\"off\" placeholder=\"${escA(t('adminPass'))}\"></label>\n          <button class=\"btn block\" id=\"adEnter\">${t('enter')} →</button>\n          <button class=\"btn ghost block\" id=\"adBack\">← ${t('back')}</button>\n          <p class=\"muted center\" style=\"font-size:.82em;margin:0\">Default password: <b>admin</b></p>\n        </div>\n      </div>`;\n    $('#adBack').onclick = ()=>go('login',{sub:'role'});\n    const tryEnter = ()=>{ if($('#adPass').value === (c.adminPass||'admin')){ state.session={ role:'admin', appLang:appLang() }; persist(); go('admin'); } else toast(t('wrongPass')); };\n    $('#adEnter').onclick = tryEnter;\n    $('#adPass').addEventListener('keydown', e=>{ if(e.key==='Enter') tryEnter(); });\n    return;\n  }\n}\nfunction langPickerInline(){\n  return `<select id=\"langInline\" class=\"chip\" style=\"font-weight:700\">${LANGS.map(l=>`<option value=\"${l.code}\" ${appLang()===l.code?'selected':''}>🌐 ${l.label}</option>`).join('')}</select>`;\n}\nfunction wireLangPickerInline(){ const s=$('#langInline'); if(s) s.onchange=e=>{ if(state.session) state.session.appLang=e.target.value; else state.config.defaultLang=e.target.value; persist(); render(); }; }\n\n/* ============================================================\n   STUDENT\n   ============================================================ */\nfunction renderStudent(){\n  if(view.name==='lesson') return renderLesson();\n  if(view.name==='history') return renderHistory();\n  if(view.name==='talk') return renderTalk();\n  return renderHome();\n}\nfunction studentLessons(){ return state.content.filter(l=>l.cls===state.session.cls); }\n\nfunction renderHome(){\n  const s = state.session;\n  const lessons = studentLessons();\n  const list = lessons.length ? lessons.map(l=>{\n    const ico = l.kind==='youtube'?'▶️':(l.kind==='website'?'🔗':'📄');\n    const sub = l.kind==='youtube'?'YouTube':(l.kind==='website'?(t('openLink')):(LANGS.find(x=>x.code===l.language)||{}).label||'');\n    return `<button class=\"lesson\" data-id=\"${l.id}\"><span class=\"lico\">${ico}</span><span><span class=\"lt\">${escH(l.title)}</span><span class=\"ls\">${escH(sub)}</span></span><span class=\"go\">›</span></button>`;\n  }).join('') : `<div class=\"card center muted\">${t('noLessons')}</div>`;\n  app.innerHTML = headerHTML() + `\n    <div class=\"main stack\">\n      <div>\n        <div class=\"greet\">${t('hello')}, ${escH(s.name)} 👋</div>\n        <span class=\"pill\">${t('classLabel')} ${escH(s.cls)}</span>\n      </div>\n      <h2 style=\"font-size:1.05em;margin:.4em 0 0\">${t('lessons')}</h2>\n      <div class=\"stack\">${list}</div>\n    </div>` + navHTML('learn');\n  wireHeader(); wireNav();\n  app.querySelectorAll('.lesson').forEach(b=> b.onclick=()=>go('lesson',{lessonId:b.dataset.id}));\n}\n\nfunction renderLesson(){\n  const l = state.content.find(x=>x.id===view.lessonId);\n  if(!l){ return go('home'); }\n  let refHTML='';\n  if(l.kind==='youtube'){\n    const id = ytId(l.reference);\n    refHTML = id ? `<div class=\"ytwrap\"><iframe src=\"https://www.youtube.com/embed/${id}\" allow=\"encrypted-media; picture-in-picture\" allowfullscreen loading=\"lazy\"></iframe></div>`\n                 : `<a class=\"btn block\" href=\"${escA(l.reference)}\" target=\"_blank\" rel=\"noopener\">${t('openLink')} ↗</a>`;\n  } else if(l.kind==='website'){\n    refHTML = `<a class=\"btn block\" href=\"${escA(l.reference)}\" target=\"_blank\" rel=\"noopener\">${t('openLink')} ↗</a>\n               <p class=\"muted\" style=\"font-size:.85em\">${escH(l.reference)}</p>`;\n  } else {\n    refHTML = `<div class=\"row between\" style=\"margin-bottom:.5em\">\n        <span class=\"pill\">🔊 ${t('tapHint')}</span>\n        <button class=\"btn sm accent\" id=\"playAll\">▶ ${t('playAll')}</button></div>\n      <div class=\"reader\" id=\"docReader\">${readable(l.reference, l.language)}</div>`;\n  }\n  const hist = state.history.filter(h=>h.studentId===state.session.studentId && h.lessonId===l.id);\n  const chatHTML = hist.map(h=> msgHTML(h.role, h.text, l.language)).join('');\n  app.innerHTML = headerHTML() + `\n    <div class=\"main stack\">\n      <button class=\"btn ghost sm\" id=\"lback\" style=\"align-self:flex-start\">← ${t('back')}</button>\n      <h2 style=\"margin:.1em 0 0\">${escH(l.title)}</h2>\n      <span class=\"pill\">${t('classLabel')} ${escH(l.cls)}</span>\n      <div class=\"card\">${refHTML}</div>\n      <h3 style=\"margin:.3em 0 0;font-size:1em\">${t('practice')}</h3>\n      <div class=\"chat\" id=\"chat\">${chatHTML || ''}</div>\n    </div>\n    <div class=\"composer\">\n      <textarea id=\"msg\" rows=\"1\" placeholder=\"${escA(t('askPlaceholder'))}\"></textarea>\n      <button class=\"btn\" id=\"sendBtn\" aria-label=\"${escA(t('send'))}\">➤</button>\n    </div>` ;\n  wireHeader();\n  $('#lback').onclick = ()=>{ speechSynthesis.cancel(); go('home'); };\n  const playAll = $('#playAll'); if(playAll) playAll.onclick = ()=>speak(l.reference, l.language, null);\n  const ta = $('#msg');\n  ta.addEventListener('input', ()=>{ ta.style.height='auto'; ta.style.height=Math.min(ta.scrollHeight,112)+'px'; });\n  ta.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); doSend(l); } });\n  $('#sendBtn').onclick = ()=>doSend(l);\n  const chat = $('#chat'); chat.scrollTop = chat.scrollHeight;\n  $('.main').scrollTop = $('.main').scrollHeight;\n}\nfunction msgHTML(role, text, lang){\n  if(role==='user') return `<div class=\"msg user\">${escH(text)}</div>`;\n  return `<div class=\"msg bot\"><div>${readable(text, lang || appLang())}</div>\n          <button class=\"speakbtn\" data-speak=\"${escA(text)}\" data-lang=\"${escA(lang||appLang())}\">🔊 ${t('listen')}</button></div>`;\n}\nasync function doSend(lesson){\n  const ta = $('#msg'); const text = ta.value.trim(); if(!text) return;\n  ta.value=''; ta.style.height='auto';\n  const chat = $('#chat');\n  chat.insertAdjacentHTML('beforeend', msgHTML('user', text, lesson.language));\n  // save user turn\n  const turn = { ts:Date.now(), studentId:state.session.studentId, lessonId:lesson.id, lessonTitle:lesson.title, role:'user', text };\n  state.history.push(turn); persist();\n  // typing\n  chat.insertAdjacentHTML('beforeend', `<div class=\"msg bot\" id=\"typing\"><span class=\"typing\"><i></i><i></i><i></i></span></div>`);\n  chat.scrollTop = chat.scrollHeight; $('.main').scrollTop = $('.main').scrollHeight;\n  const hist = state.history.filter(h=>h.studentId===state.session.studentId && h.lessonId===lesson.id);\n  const res = await askBot(lesson, text, hist);\n  const ty = $('#typing'); if(ty) ty.remove();\n  chat.insertAdjacentHTML('beforeend', msgHTML('bot', res.reply, lesson.language || appLang()));\n  state.history.push({ ts:Date.now(), studentId:state.session.studentId, lessonId:lesson.id, lessonTitle:lesson.title, role:'bot', text:res.reply });\n  persist();\n  chat.scrollTop = chat.scrollHeight; $('.main').scrollTop = $('.main').scrollHeight;\n}\n\nfunction renderHistory(){\n  const all = state.history.filter(h=>h.studentId===state.session.studentId).slice().reverse();\n  let body;\n  if(!all.length){ body = `<div class=\"card center muted\">${t('historyEmpty')}</div>`; }\n  else {\n    // group by lesson\n    const groups = {};\n    all.forEach(h=>{ (groups[h.lessonId]=groups[h.lessonId]||{title:h.lessonTitle, items:[]}).items.push(h); });\n    body = Object.keys(groups).map(k=>{\n      const g=groups[k];\n      const isVoice = k===VOICE_LESSON_ID;\n      const groupTitle = isVoice ? '🎤 ' + t('talk') : g.title;\n      const last = g.items[0];\n      const when = new Date(last.ts).toLocaleString();\n      const chrono = g.items.slice().reverse(); // chronological\n      const preview = chrono.slice(-4).map(h=>`<div class=\"msg ${h.role}\" style=\"max-width:100%\">${escH(h.text.slice(0,220))}</div>`).join('');\n      const openLabel = isVoice ? t('talk') : t('chat');\n      const navTarget = isVoice ? 'data-opentalk=\"1\"' : `data-open=\"${escA(k)}\"`;\n      return `<div class=\"card stack\"><div class=\"row between\"><b>${escH(groupTitle)}</b><span class=\"muted\" style=\"font-size:.78em\">${escH(when)}</span></div>\n        <div class=\"row\" style=\"gap:.4em;flex-wrap:wrap\">\n          <button class=\"btn ghost sm\" ${navTarget}>${openLabel} →</button>\n          <button class=\"btn ghost sm\" data-playbtn data-key=\"${escA(k)}\" data-playing=\"0\">▶ ${t('playConversation')}</button>\n        </div>\n        <div class=\"chat\">${preview}</div></div>`;\n    }).join('');\n    // store chronological lists for playback\n    window.__histGroups = {};\n    Object.keys(groups).forEach(k=> window.__histGroups[k] = groups[k].items.slice().reverse());\n  }\n  app.innerHTML = headerHTML() + `\n    <div class=\"main stack\">\n      <div class=\"row between\"><h2 style=\"margin:.2em 0\">${t('history')}</h2>\n        ${all.length?`<button class=\"btn danger sm\" id=\"clearH\">🗑 ${t('clearHistory')}</button>`:''}</div>\n      ${body}\n    </div>` + navHTML('history');\n  wireHeader(); wireNav();\n  const ch=$('#clearH'); if(ch) ch.onclick=()=>{ state.history = state.history.filter(h=>h.studentId!==state.session.studentId); persist(); toast(t('cleared')); render(); };\n  app.querySelectorAll('[data-open]').forEach(b=> b.onclick=()=>go('lesson',{lessonId:b.dataset.open}));\n  app.querySelectorAll('[data-opentalk]').forEach(b=> b.onclick=()=>go('talk'));\n  app.querySelectorAll('[data-playbtn]').forEach(b=> b.onclick=()=>{\n    if(b.dataset.playing==='1'){ stopPlayback(); return; }\n    document.querySelectorAll('[data-playbtn]').forEach(x=>{ x.dataset.playing='0'; x.textContent='▶ '+t('playConversation'); });\n    b.dataset.playing='1'; b.textContent='⏹ '+t('stopPlayback');\n    const k = b.dataset.key;\n    const items = (window.__histGroups||{})[k] || [];\n    const lang = k===VOICE_LESSON_ID ? appLang() : (state.content.find(x=>x.id===k)||{}).language || appLang();\n    playConversation(items, lang);\n  });\n}\n\n/* ============================================================\n   VOICE BOT (Talk screen) — STT + TTS + webhook\n   ============================================================ */\nconst SR = window.SpeechRecognition || window.webkitSpeechRecognition;\nconst voice = { mode:'idle', rec:null, handsFree:false, lastReply:'', lang:'en' };\n\nfunction setMicState(mode){\n  voice.mode = mode;\n  const btn = $('#micBtn'); const status = $('#talkStatus');\n  if(!btn || !status) return;\n  btn.classList.remove('listening','thinking','speaking');\n  if(mode==='listening'){ btn.classList.add('listening'); btn.textContent='⏹'; status.textContent=t('listening'); }\n  else if(mode==='thinking'){ btn.classList.add('thinking'); btn.textContent='⋯'; status.textContent=t('preparing'); }\n  else if(mode==='speaking'){ btn.classList.add('speaking'); btn.textContent='🔊'; status.textContent=t('speaking'); }\n  else { btn.textContent='🎤'; status.textContent = SR ? t('tapToTalk') : t('sttUnsupported'); }\n}\nfunction stopVoice(){\n  try{ voice.rec && voice.rec.abort(); }catch(e){}\n  speechSynthesis && speechSynthesis.cancel();\n  voice.mode='idle';\n}\n\nfunction startListening(){\n  if(!SR){ toast(t('sttUnsupported')); return; }\n  if(voice.mode==='listening'){ try{ voice.rec.stop(); }catch(e){} return; }\n  speechSynthesis.cancel();\n  const rec = new SR();\n  voice.rec = rec;\n  rec.lang = BCP[voice.lang] || 'en-IN';\n  rec.continuous = false; rec.interimResults = false; rec.maxAlternatives = 1;\n  rec.onstart = ()=> setMicState('listening');\n  rec.onerror = ev=>{\n    setMicState('idle');\n    if(ev.error==='not-allowed' || ev.error==='service-not-allowed') toast(t('micBlocked'));\n  };\n  rec.onresult = ev=>{\n    const text = (ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript || '').trim();\n    if(text) handleSpoken(text);\n  };\n  rec.onend = ()=>{ if(voice.mode==='listening') setMicState('idle'); };\n  try{ rec.start(); }catch(e){ setMicState('idle'); }\n}\n\nasync function handleSpoken(text){\n  const s = state.session;\n  appendVoiceMsg('user', text);\n  state.history.push({ ts:Date.now(), studentId:s.studentId, lessonId:VOICE_LESSON_ID, lessonTitle:t('talk'), role:'user', text });\n  persist();\n  setMicState('thinking');\n  const res = await askVoiceBot(text);\n  appendVoiceMsg('bot', res.reply);\n  state.history.push({ ts:Date.now(), studentId:s.studentId, lessonId:VOICE_LESSON_ID, lessonTitle:t('talk'), role:'bot', text:res.reply });\n  persist();\n  voice.lastReply = res.reply;\n  speakReply(res.reply);\n}\n\nfunction speakReply(text){\n  if(!('speechSynthesis' in window)){ setMicState('idle'); return; }\n  if(view.name !== 'talk'){ return; }  // user navigated away — don't speak in the background\n  speechSynthesis.cancel();\n  const u = new SpeechSynthesisUtterance(text);\n  u.lang = BCP[voice.lang] || 'en-IN';\n  const v = pickVoice(voice.lang); if(v) u.voice = v;\n  u.rate = 0.92;\n  u.onstart = ()=> setMicState('speaking');\n  u.onend = ()=>{\n    setMicState('idle');\n    if(voice.handsFree && voice.mode==='idle' && document.getElementById('micBtn')) setTimeout(startListening, 450);\n  };\n  u.onerror = ()=> setMicState('idle');\n  speechSynthesis.speak(u);\n}\n\nfunction appendVoiceMsg(role, text){\n  const c = $('#voiceChat'); if(!c) return;\n  c.insertAdjacentHTML('beforeend', msgHTML(role, text, voice.lang));\n  c.scrollTop = c.scrollHeight;\n}\n\nasync function askVoiceBot(message){\n  const c = state.config, s = state.session;\n  const docs = state.voiceAgent.filter(d=>d.cls===s.cls);\n  const hist = state.history.filter(h=>h.studentId===s.studentId && h.lessonId===VOICE_LESSON_ID).slice(-12);\n  const payload = {\n    type:'voice', org:c.orgName, sessionId:s.studentId,\n    student:{ name:s.name, class:s.cls },\n    language: voice.lang,\n    voiceAgent: docs.map(d=>({ title:d.title, language:d.language, kind:d.kind||'doc', reference:d.reference||'' })),\n    message,\n    history: hist.map(h=>({role:h.role, text:h.text}))\n  };\n  if(!c.webhook){\n    return { ok:false, reply: t('voiceTeacherGreet') + ' ' + (appLang()==='hi' ? 'अभी सहायक नहीं जुड़ा है, इसलिए मैं केवल अभ्यास के लिए हूँ।' : 'The tutor is not connected yet, so I can only practise with you.') };\n  }\n  try{\n    const res = await fetch(c.webhook, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });\n    let data=null; try{ data = await res.json(); }catch(e){ data = await res.text().catch(()=>null); }\n    return { ok:true, reply: extractReply(data) || '…' };\n  }catch(err){\n    return { ok:false, reply:(appLang()==='hi'?'सहायक से जुड़ नहीं पाया।':'Could not reach the tutor.') };\n  }\n}\n\nfunction renderTalk(){\n  const s = state.session;\n  voice.lang = appLang();\n  const hist = state.history.filter(h=>h.studentId===s.studentId && h.lessonId===VOICE_LESSON_ID).slice(-30);\n  const chatHTML = hist.length ? hist.map(h=>msgHTML(h.role, h.text, voice.lang)).join('')\n    : `<div class=\"msg bot\">${escH(t('voiceTeacherGreet'))}</div>`;\n  app.innerHTML = headerHTML() + `\n    <div class=\"main talk-main\">\n      <div class=\"talk-status\" id=\"talkStatus\">${SR ? t('tapToTalk') : t('sttUnsupported')}</div>\n      <button class=\"mic\" id=\"micBtn\" aria-label=\"${escA(t('tapToTalk'))}\" ${SR?'':'disabled'}>🎤</button>\n      <div class=\"talk-controls\">\n        <label><input type=\"checkbox\" id=\"handsFree\" ${voice.handsFree?'checked':''}> ${t('handsFree')}</label>\n        <button class=\"btn ghost sm\" id=\"repeatBtn\">🔁 ${t('repeat')}</button>\n      </div>\n      <div class=\"card vchat\" id=\"voiceChat\">${chatHTML}</div>\n    </div>` + navHTML('talk');\n  wireHeader(); wireNav();\n  setMicState('idle');\n  const vc = $('#voiceChat'); vc.scrollTop = vc.scrollHeight;\n  $('#micBtn').onclick = ()=>{\n    if(voice.mode==='speaking'){ speechSynthesis.cancel(); setMicState('idle'); return; }\n    if(voice.mode==='listening'){ try{ voice.rec.stop(); }catch(e){} return; }\n    if(voice.mode==='thinking'){ return; }\n    startListening();\n  };\n  $('#handsFree').onchange = e=>{ voice.handsFree = e.target.checked; };\n  $('#repeatBtn').onclick = ()=>{ if(voice.lastReply) speakReply(voice.lastReply); };\n}\n\n/* ---------- history playback ---------- */\nconst playback = { stopFlag:false };\nfunction playConversation(items, lang){\n  playback.stopFlag = false;\n  speechSynthesis.cancel();\n  const queue = items.slice();\n  const next = ()=>{\n    if(playback.stopFlag || !queue.length) return finishPlayback();\n    const it = queue.shift();\n    const u = new SpeechSynthesisUtterance(it.text);\n    u.lang = BCP[lang] || 'en-IN';\n    const v = pickVoice(lang); if(v) u.voice = v;\n    u.rate = it.role==='user' ? 1.0 : 0.92;\n    u.onend = ()=> setTimeout(next, 250);\n    u.onerror = ()=> setTimeout(next, 250);\n    speechSynthesis.speak(u);\n  };\n  next();\n}\nfunction stopPlayback(){ playback.stopFlag = true; speechSynthesis.cancel(); finishPlayback(); }\nfunction finishPlayback(){\n  document.querySelectorAll('[data-playbtn]').forEach(b=>{ b.dataset.playing='0'; b.textContent = '▶ ' + t('playConversation'); });\n}\n\n\nfunction navHTML(active){\n  return `<nav class=\"nav\">\n    <button data-nav=\"learn\" aria-current=\"${active==='learn'}\"><span class=\"ni\">📚</span>${t('learn')}</button>\n    <button data-nav=\"talk\" aria-current=\"${active==='talk'}\"><span class=\"ni\">🎤</span>${t('talk')}</button>\n    <button data-nav=\"history\" aria-current=\"${active==='history'}\"><span class=\"ni\">🕘</span>${t('history')}</button>\n  </nav>`;\n}\nfunction wireNav(){ app.querySelectorAll('[data-nav]').forEach(b=> b.onclick=()=>{ stopVoice(); speechSynthesis.cancel(); const n=b.dataset.nav; go(n==='learn'?'home':n); }); }\n\n/* ============================================================\n   ADMIN\n   ============================================================ */\nfunction renderAdmin(){\n  const c = state.config;\n  app.innerHTML = headerHTML() + `\n    <div class=\"main stack\">\n      <h2 style=\"margin:.1em 0\">${t('adminTitle')}</h2>\n      <div class=\"tabs\" role=\"tablist\">\n        <button role=\"tab\" data-tab=\"branding\" aria-selected=\"${view.adminTab==='branding'}\">${t('branding')}</button>\n        <button role=\"tab\" data-tab=\"content\" aria-selected=\"${view.adminTab==='content'}\">${t('content')}</button>\n        <button role=\"tab\" data-tab=\"students\" aria-selected=\"${view.adminTab==='students'}\">${t('students')}</button>\n        <button role=\"tab\" data-tab=\"voice\" aria-selected=\"${view.adminTab==='voice'}\">${t('voiceBot')}</button>\n      </div>\n      <div id=\"adminBody\"></div>\n    </div>`;\n  wireHeader();\n  app.querySelectorAll('[data-tab]').forEach(b=> b.onclick=()=>go('admin',{adminTab:b.dataset.tab}));\n  if(view.adminTab==='content') renderAdminContent();\n  else if(view.adminTab==='students') renderAdminStudents();\n  else if(view.adminTab==='voice') renderAdminVoice();\n  else renderAdminBranding();\n}\n\nfunction renderAdminBranding(){\n  const c = state.config;\n  const langOpts = LANGS.map(l=>`<option value=\"${l.code}\" ${c.defaultLang===l.code?'selected':''}>${l.label}</option>`).join('');\n  $('#adminBody').innerHTML = `\n    <div class=\"card stack\">\n      <div class=\"row between\" style=\"gap:.5em\">\n        <div style=\"min-width:0\">\n          <b>${t('syncNow')}</b>\n          <div class=\"muted\" style=\"font-size:.82em\">${t('lastSync')}: ${c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleString() : t('neverSynced')}</div>\n        </div>\n        <button class=\"btn accent sm\" id=\"syncBtn\">☁ ${t('syncNow')}</button>\n      </div>\n      <hr style=\"border:none;border-top:1.5px solid var(--line);margin:.2em 0\">\n      <label class=\"field\"><span>${t('orgName')}</span><input type=\"text\" id=\"f_org\" value=\"${escA(c.orgName)}\"></label>\n      <label class=\"field\"><span>${t('appName')}</span><input type=\"text\" id=\"f_app\" value=\"${escA(c.appName)}\"></label>\n      <label class=\"field\"><span>${t('tagline')}</span><input type=\"text\" id=\"f_tag\" value=\"${escA(c.tagline)}\"></label>\n      <label class=\"field\"><span>${t('logoEmoji')}</span><input type=\"text\" id=\"f_logo\" value=\"${escA(c.logo)}\" maxlength=\"4\" style=\"width:5em\"></label>\n      <div class=\"grid2\">\n        <div><span class=\"field\" style=\"margin-bottom:.3em\"><span>${t('primaryColor')}</span></span><div class=\"colorrow\"><input type=\"color\" id=\"f_pri\" value=\"${c.primary}\"><div class=\"swatch\" id=\"sw_pri\" style=\"background:${c.primary}\"></div></div></div>\n        <div><span class=\"field\" style=\"margin-bottom:.3em\"><span>${t('accentColor')}</span></span><div class=\"colorrow\"><input type=\"color\" id=\"f_acc\" value=\"${c.accent}\"><div class=\"swatch\" id=\"sw_acc\" style=\"background:${c.accent}\"></div></div></div>\n      </div>\n      <label class=\"field row between\" style=\"margin-top:.6em\"><span>${t('darkMode')}</span><input type=\"checkbox\" id=\"f_dark\" ${c.dark?'checked':''} style=\"width:auto;transform:scale(1.4)\"></label>\n      <label class=\"field\"><span>${t('defaultLanguage')}</span><select id=\"f_lang\">${langOpts}</select></label>\n      <label class=\"field\"><span>${t('fontSize')}</span>\n        <select id=\"f_fs\"><option value=\"0.9\" ${c.fontScale==0.9?'selected':''}>Small</option><option value=\"1\" ${c.fontScale==1?'selected':''}>Normal</option><option value=\"1.15\" ${c.fontScale==1.15?'selected':''}>Large</option><option value=\"1.3\" ${c.fontScale==1.3?'selected':''}>Extra large</option></select></label>\n      <hr style=\"border:none;border-top:1.5px solid var(--line)\">\n      <label class=\"field\"><span>${t('webhook')}</span><input type=\"url\" id=\"f_hook\" value=\"${escA(c.webhook)}\" placeholder=\"https://work.mantravat.cloud/webhook/...\">\n        <span class=\"hint\">${t('webhookHint')}</span></label>\n      <label class=\"field\"><span>${t('changePass')}</span><input type=\"text\" id=\"f_pass\" value=\"${escA(c.adminPass)}\"></label>\n      <button class=\"btn block\" id=\"saveBrand\">💾 ${t('saveSettings')}</button>\n    </div>`;\n  const live=(id,prop,swId)=>{ const i=$('#'+id); i.oninput=()=>{ document.documentElement.style.setProperty(prop,i.value); if(swId)$('#'+swId).style.background=i.value; }; };\n  live('f_pri','--primary','sw_pri'); live('f_acc','--accent','sw_acc');\n  $('#syncBtn').onclick = async ()=>{\n    if(!state.config.webhook){ toast(t('webhook')); return; }\n    if(syncing) return;\n    const btn = $('#syncBtn'); const old = btn.innerHTML; btn.innerHTML = '⟳ '+t('syncing'); btn.disabled = true;\n    syncing = true;\n    const r = await syncToWebhook('manual');\n    syncing = false;\n    btn.disabled = false; btn.innerHTML = old;\n    toast(r.ok ? t('syncedOk') : t('syncedFail'));\n    if(r.ok) renderAdminBranding();\n  };\n  $('#saveBrand').onclick = ()=>{\n    Object.assign(state.config, {\n      orgName:$('#f_org').value.trim()||'School', appName:$('#f_app').value.trim()||'Bhasha Setu',\n      tagline:$('#f_tag').value.trim(), logo:$('#f_logo').value.trim()||'📖',\n      primary:$('#f_pri').value, accent:$('#f_acc').value, dark:$('#f_dark').checked,\n      defaultLang:$('#f_lang').value, fontScale:parseFloat($('#f_fs').value),\n      webhook:$('#f_hook').value.trim(), adminPass:$('#f_pass').value||'admin'\n    });\n    persist(); applyTheme(); syncSoftColors(); toast(t('saved')); render();\n  };\n}\n\nfunction renderAdminContent(){\n  const f = view.filterCls;\n  const filtered = f==='all' ? state.content : state.content.filter(l=>l.cls===f);\n  const clsOpts = `<option value=\"all\">${t('allClasses')}</option>` + Array.from({length:12},(_,i)=>`<option value=\"${i+1}\" ${f==String(i+1)?'selected':''}>${t('classLabel')} ${i+1}</option>`).join('');\n  const items = filtered.length ? filtered.map(l=>{\n    const ico = l.kind==='youtube'?'▶️':(l.kind==='website'?'🔗':'📄');\n    return `<div class=\"card row between\" style=\"gap:.6em\">\n      <div class=\"row\" style=\"gap:.6em;min-width:0\"><span style=\"font-size:1.4em\">${ico}</span>\n        <div style=\"min-width:0\"><b style=\"display:block;overflow:hidden;text-overflow:ellipsis\">${escH(l.title)}</b>\n        <span class=\"muted\" style=\"font-size:.82em\">${t('classLabel')} ${escH(l.cls)} · ${l.kind}</span></div></div>\n      <div class=\"row\" style=\"gap:.35em\">\n        <button class=\"btn ghost sm\" data-edit=\"${l.id}\">✏️</button>\n        <button class=\"btn danger sm\" data-del=\"${l.id}\">🗑</button></div>\n    </div>`;\n  }).join('') : `<div class=\"card center muted\">${t('noContent')}</div>`;\n  $('#adminBody').innerHTML = `\n    <div class=\"stack\">\n      <div class=\"row between\">\n        <select id=\"fltCls\" class=\"chip\" style=\"font-weight:700\">${clsOpts}</select>\n        <button class=\"btn accent sm\" id=\"addBtn\">＋ ${t('addLesson')}</button>\n      </div>\n      ${items}\n    </div>`;\n  $('#fltCls').onchange=e=>go('admin',{adminTab:'content', filterCls:e.target.value});\n  $('#addBtn').onclick=()=>openLessonSheet(null);\n  $('#adminBody').querySelectorAll('[data-edit]').forEach(b=> b.onclick=()=>openLessonSheet(b.dataset.edit));\n  $('#adminBody').querySelectorAll('[data-del]').forEach(b=> b.onclick=()=>{ if(confirm(t('confirmDel'))){ state.content=state.content.filter(x=>x.id!==b.dataset.del); persist(); renderAdminContent(); } });\n}\n\nfunction openLessonSheet(id){\n  const l = id ? state.content.find(x=>x.id===id) : { id:null, title:'', cls:'1', kind:'doc', reference:'', language:state.config.defaultLang };\n  const clsOpts = Array.from({length:12},(_,i)=>`<option value=\"${i+1}\" ${l.cls==String(i+1)?'selected':''}>${i+1}</option>`).join('');\n  const langOpts = LANGS.map(x=>`<option value=\"${x.code}\" ${l.language===x.code?'selected':''}>${x.label}</option>`).join('');\n  const back = document.createElement('div'); back.className='backdrop';\n  back.innerHTML = `<div class=\"sheet\">\n    <h3>${id?t('editLesson'):t('addLesson')}</h3>\n    <label class=\"field\"><span>${t('lTitle')}</span><input type=\"text\" id=\"s_title\" value=\"${escA(l.title)}\"></label>\n    <div class=\"grid2\">\n      <label class=\"field\"><span>${t('lClass')}</span><select id=\"s_cls\">${clsOpts}</select></label>\n      <label class=\"field\"><span>${t('lLang')}</span><select id=\"s_lang\">${langOpts}</select></label>\n    </div>\n    <label class=\"field\"><span>${t('lType')}</span>\n      <select id=\"s_kind\"><option value=\"doc\" ${l.kind==='doc'?'selected':''}>${t('tDoc')}</option><option value=\"youtube\" ${l.kind==='youtube'?'selected':''}>${t('tYoutube')}</option><option value=\"website\" ${l.kind==='website'?'selected':''}>${t('tWebsite')}</option></select></label>\n    <div id=\"s_refWrap\"></div>\n    <div class=\"row\" style=\"gap:.5em;margin-top:.6em\">\n      <button class=\"btn ghost block\" id=\"s_cancel\">${t('cancel')}</button>\n      <button class=\"btn block\" id=\"s_save\">💾 ${t('save')}</button>\n    </div>\n  </div>`;\n  document.body.appendChild(back);\n  const renderRef = ()=>{\n    const k = $('#s_kind').value;\n    $('#s_refWrap').innerHTML = (k==='doc')\n      ? `<label class=\"field\"><span>${t('lText')}</span><textarea id=\"s_ref\">${escH(l.reference)}</textarea></label>`\n      : `<label class=\"field\"><span>${t('lUrl')}</span><input type=\"url\" id=\"s_ref\" value=\"${escA(l.reference)}\" placeholder=\"https://...\"></label>`;\n  };\n  renderRef();\n  $('#s_kind').onchange = renderRef;\n  back.addEventListener('click', e=>{ if(e.target===back){ speechSynthesis.cancel(); back.remove(); } });\n  $('#s_cancel').onclick = ()=>back.remove();\n  $('#s_save').onclick = ()=>{\n    const title=$('#s_title').value.trim(); const ref=$('#s_ref').value.trim();\n    if(!title) return toast(t('lTitle'));\n    if(!ref) return toast(t('lText'));\n    const data = { id:l.id||uid('les'), title, cls:$('#s_cls').value, kind:$('#s_kind').value, reference:ref, language:$('#s_lang').value };\n    if(l.id){ const i=state.content.findIndex(x=>x.id===l.id); state.content[i]=data; } else state.content.push(data);\n    persist(); back.remove(); toast(t('saved')); renderAdminContent();\n  };\n}\n\n/* ---------- students management ---------- */\nfunction genStudentId(cls){\n  // e.g. C05-AB7K — short, easy to read aloud, hard to clash\n  const letters='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I\n  let s=''; for(let i=0;i<4;i++) s += letters[Math.floor(Math.random()*letters.length)];\n  const id = 'C'+String(cls).padStart(2,'0')+'-'+s;\n  return state.students.some(x=>x.loginId===id) ? genStudentId(cls) : id;\n}\nfunction genPassword(){\n  const w=['sun','sky','tree','star','bird','river','moon','leaf','rain','fish','book','lion'];\n  return w[Math.floor(Math.random()*w.length)] + Math.floor(100+Math.random()*900);\n}\n\nfunction renderAdminStudents(){\n  const q = (view.stuQuery||'').toLowerCase();\n  const f = view.stuFilterCls || 'all';\n  const filtered = state.students.filter(s=>{\n    if(f!=='all' && s.cls!==f) return false;\n    if(q && !(s.name.toLowerCase().includes(q) || (s.loginId||'').toLowerCase().includes(q))) return false;\n    return true;\n  }).sort((a,b)=> (a.cls-b.cls) || a.name.localeCompare(b.name));\n  const clsOpts = `<option value=\"all\">${t('allClasses')}</option>` + Array.from({length:12},(_,i)=>`<option value=\"${i+1}\" ${f==String(i+1)?'selected':''}>${t('classLabel')} ${i+1}</option>`).join('');\n  const rows = filtered.length ? filtered.map(s=>`\n    <div class=\"card stack\" style=\"padding:.85em\">\n      <div class=\"row between\" style=\"gap:.5em\">\n        <div style=\"min-width:0\">\n          <b style=\"display:block;overflow:hidden;text-overflow:ellipsis\">${escH(s.name)}</b>\n          <span class=\"muted\" style=\"font-size:.82em\">${t('classLabel')} ${escH(s.cls)} · <code style=\"font-family:ui-monospace,Menlo,monospace\">${escH(s.loginId||'')}</code></span>\n        </div>\n        <div class=\"row\" style=\"gap:.35em\">\n          <button class=\"btn ghost sm\" data-edit=\"${s.id}\" aria-label=\"${escA(t('edit'))}\">✏️</button>\n          <button class=\"btn danger sm\" data-del=\"${s.id}\" aria-label=\"${escA(t('delete'))}\">🗑</button>\n        </div>\n      </div>\n      <div class=\"row\" style=\"gap:.4em;flex-wrap:wrap\">\n        <span class=\"pill\">🔑 ${escH(s.password||'')}</span>\n        <button class=\"btn ghost sm\" data-copy=\"${s.id}\">📋 ${t('copyCreds')}</button>\n        <button class=\"btn ghost sm\" data-reset=\"${s.id}\">↻ ${t('resetPass')}</button>\n        <button class=\"btn ghost sm\" data-print=\"${s.id}\">🖨 ${t('printCard')}</button>\n      </div>\n    </div>`).join('') : `<div class=\"card center muted\">${t('noStudents')}</div>`;\n\n  $('#adminBody').innerHTML = `\n    <div class=\"stack\">\n      <div class=\"row between\" style=\"gap:.5em\">\n        <select id=\"stuFltCls\" class=\"chip\" style=\"font-weight:700\">${clsOpts}</select>\n        <button class=\"btn accent sm\" id=\"stuAdd\">＋ ${t('addStudent')}</button>\n      </div>\n      <input type=\"text\" id=\"stuSearch\" placeholder=\"${escA(t('search'))}\" value=\"${escA(view.stuQuery||'')}\">\n      ${rows}\n    </div>`;\n  $('#stuFltCls').onchange = e => go('admin',{adminTab:'students', stuFilterCls:e.target.value, stuQuery:view.stuQuery});\n  const sb = $('#stuSearch');\n  sb.addEventListener('input', e=>{ view.stuQuery = e.target.value; renderAdminStudents(); });\n  // keep caret position on re-render\n  setTimeout(()=>{ const el=$('#stuSearch'); if(el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 0);\n  $('#stuAdd').onclick = ()=>openStudentSheet(null);\n  $('#adminBody').querySelectorAll('[data-edit]').forEach(b=> b.onclick=()=>openStudentSheet(b.dataset.edit));\n  $('#adminBody').querySelectorAll('[data-del]').forEach(b=> b.onclick=()=>{\n    if(!confirm(t('confirmDelStu'))) return;\n    const id=b.dataset.del;\n    state.students = state.students.filter(x=>x.id!==id);\n    state.history  = state.history.filter(h=>h.studentId!==id);\n    persist(); renderAdminStudents();\n  });\n  $('#adminBody').querySelectorAll('[data-reset]').forEach(b=> b.onclick=()=>{\n    const s = state.students.find(x=>x.id===b.dataset.reset); if(!s) return;\n    s.password = genPassword(); persist(); toast(t('saved')); renderAdminStudents();\n  });\n  $('#adminBody').querySelectorAll('[data-copy]').forEach(b=> b.onclick=async ()=>{\n    const s = state.students.find(x=>x.id===b.dataset.copy); if(!s) return;\n    const txt = `${state.config.appName||'Bhasha Setu'} — ${state.config.orgName||''}\\n${t('studentId')}: ${s.loginId}\\n${t('password')}: ${s.password}\\n${t('classLabel')}: ${s.cls}`;\n    try{ await navigator.clipboard.writeText(txt); toast(t('credCopied')); }\n    catch(e){ prompt(t('copyCreds'), txt); }\n  });\n  $('#adminBody').querySelectorAll('[data-print]').forEach(b=> b.onclick=()=>printCard(b.dataset.print));\n}\n\nfunction openStudentSheet(id){\n  const s = id ? state.students.find(x=>x.id===id) : { id:null, name:'', cls:'1', loginId:'', password:'' };\n  if(!id){ s.loginId = genStudentId(s.cls); s.password = genPassword(); }\n  const clsOpts = Array.from({length:12},(_,i)=>`<option value=\"${i+1}\" ${s.cls==String(i+1)?'selected':''}>${i+1}</option>`).join('');\n  const back = document.createElement('div'); back.className='backdrop';\n  back.innerHTML = `<div class=\"sheet\">\n    <h3>${id?t('editStudent'):t('addStudent')}</h3>\n    <label class=\"field\"><span>${t('yourName')}</span><input type=\"text\" id=\"ss_name\" value=\"${escA(s.name)}\" autocomplete=\"off\"></label>\n    <label class=\"field\"><span>${t('lClass')}</span><select id=\"ss_cls\">${clsOpts}</select></label>\n    <label class=\"field\">\n      <span>${t('studentId')} <span class=\"hint\">${id?'':'· '+t('generatedId')}</span></span>\n      <div class=\"row\" style=\"gap:.4em\"><input type=\"text\" id=\"ss_id\" value=\"${escA(s.loginId)}\" autocapitalize=\"characters\" style=\"font-family:ui-monospace,Menlo,monospace;letter-spacing:.04em\">\n        <button class=\"btn ghost sm\" id=\"ss_regenId\" type=\"button\" title=\"${escA(t('regenerate'))}\">↻</button></div>\n    </label>\n    <label class=\"field\"><span>${t('password')}</span>\n      <div class=\"row\" style=\"gap:.4em\"><input type=\"text\" id=\"ss_pass\" value=\"${escA(s.password)}\">\n        <button class=\"btn ghost sm\" id=\"ss_regenPw\" type=\"button\" title=\"${escA(t('regenerate'))}\">↻</button></div>\n    </label>\n    <div class=\"row\" style=\"gap:.5em;margin-top:.6em\">\n      <button class=\"btn ghost block\" id=\"ss_cancel\">${t('cancel')}</button>\n      <button class=\"btn block\" id=\"ss_save\">💾 ${t('save')}</button>\n    </div>\n  </div>`;\n  document.body.appendChild(back);\n  back.addEventListener('click', e=>{ if(e.target===back) back.remove(); });\n  $('#ss_cancel').onclick = ()=>back.remove();\n  $('#ss_cls').onchange = ()=>{ if(!id) $('#ss_id').value = genStudentId($('#ss_cls').value); };\n  $('#ss_regenId').onclick = ()=> $('#ss_id').value = genStudentId($('#ss_cls').value);\n  $('#ss_regenPw').onclick = ()=> $('#ss_pass').value = genPassword();\n  $('#ss_save').onclick = ()=>{\n    const name=$('#ss_name').value.trim();\n    const cls=$('#ss_cls').value;\n    const loginId=($('#ss_id').value||'').trim().toUpperCase();\n    const password=$('#ss_pass').value;\n    if(!name) return toast(t('needName'));\n    if(!loginId || !password) return toast(t('wrongLogin'));\n    const clash = state.students.find(x=>x.loginId===loginId && x.id!==(s.id||''));\n    if(clash) return toast(t('studentId')+' ✗');\n    if(id){ Object.assign(s, {name, cls, loginId, password}); }\n    else { state.students.push({ id:uid('stu'), name, cls, loginId, password, created:Date.now() }); }\n    persist(); back.remove(); toast(t('saved')); renderAdminStudents();\n  };\n}\n\nfunction printCard(id){\n  const s = state.students.find(x=>x.id===id); if(!s) return;\n  const c = state.config;\n  const w = window.open('', '_blank', 'width=420,height=560');\n  if(!w){ toast('Pop-up blocked'); return; }\n  w.document.write(`<!doctype html><html><head><meta charset=\"utf-8\"><title>${escH(s.name)} — login</title>\n    <style>\n      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;color:#2A2118}\n      .card{border:2px dashed ${c.primary};border-radius:18px;padding:22px;max-width:340px;margin:0 auto}\n      h1{margin:0 0 4px;font-size:20px;color:${c.primary}}\n      .row{display:flex;justify-content:space-between;margin:10px 0;padding:8px 12px;background:#FBF6EC;border-radius:10px}\n      .row b{font-family:ui-monospace,Menlo,monospace;font-size:18px}\n      .muted{color:#6E6457;font-size:13px;margin:0}\n      .foot{margin-top:14px;text-align:center;font-size:12px;color:#6E6457}\n      @media print{ body{padding:0} .card{border-style:solid} }\n    </style></head><body>\n    <div class=\"card\">\n      <div style=\"font-size:28px;text-align:center\">${escH(c.logo||'📖')}</div>\n      <h1 style=\"text-align:center\">${escH(c.appName||'Bhasha Setu')}</h1>\n      <p class=\"muted\" style=\"text-align:center\">${escH(c.orgName||'')}</p>\n      <hr style=\"border:none;border-top:1px solid #EadFce;margin:14px 0\">\n      <p class=\"muted\">${escH(t('yourName'))}</p><div class=\"row\"><span></span><b>${escH(s.name)}</b></div>\n      <p class=\"muted\">${escH(t('classLabel'))}</p><div class=\"row\"><span></span><b>${escH(s.cls)}</b></div>\n      <p class=\"muted\">${escH(t('studentId'))}</p><div class=\"row\"><span></span><b>${escH(s.loginId)}</b></div>\n      <p class=\"muted\">${escH(t('password'))}</p><div class=\"row\"><span></span><b>${escH(s.password)}</b></div>\n      <p class=\"foot\">${new Date().toLocaleDateString()}</p>\n    </div>\n    <script>setTimeout(()=>window.print(),300)<\\/script>";

  function mount(container) {
    if (!document.getElementById('jm-mod-bhasha-setu-css')) {
      var s = document.createElement('style');
      s.id = 'jm-mod-bhasha-setu-css';
      s.textContent = _CSS;
      document.head.appendChild(s);
    }
    container.innerHTML = _HTML;
    try { _init(container); } catch(e) { console.warn('bhasha-setu init error:', e); }
  }

  function _init(container) {

/* ============================================================
   STORAGE + STATE
   ============================================================ */
const KEY = { config:'bs_config', content:'bs_content', students:'bs_students', history:'bs_history', session:'bs_session', voice:'bs_voice' };
const VOICE_LESSON_ID = '__voice__'; // synthetic lesson id used for voice-bot history rows
const load = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch(e){ return def; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };

const DEFAULT_CONFIG = {
  orgName:'JeetMantra', appName:'Bhasha Setu', tagline:'Learn by reading and listening',
  logo:'📖', primary:'#1E8E5A', accent:'#F5A623', dark:false, fontScale:1,
  defaultLang:'en', webhook:'', adminPass:'admin', requireCode:false, schoolCode:''
};

const SEED_CONTENT = [
  { id:'seed1', cls:'5', kind:'doc', title:'The Sun and the Wind', language:'en',
    reference:'One day the Sun and the Wind had an argument. Each one said, I am stronger than you. Just then they saw a traveller walking on the road. The Wind said, Let us see who can make him take off his coat. The Wind blew hard and cold. But the traveller only pulled his coat tighter. Then the Sun shone warm and bright. Soon the traveller felt hot and took off his coat. So the gentle Sun won. Kindness is stronger than force.' },
  { id:'seed2', cls:'3', kind:'doc', title:'मेरा गाँव', language:'hi',
    reference:'मेरा गाँव बहुत सुंदर है। यहाँ हरे-भरे खेत हैं। सुबह पक्षी मीठे गीत गाते हैं। नदी का पानी साफ और ठंडा है। सब लोग मिलकर रहते हैं। मुझे अपना गाँव बहुत पसंद है।' }
];

let state = {
  config:   { ...DEFAULT_CONFIG, ...load(KEY.config, {}) },
  content:  load(KEY.content, SEED_CONTENT),
  students: load(KEY.students, []),
  history:  load(KEY.history, []),   // [{ts, studentId, lessonId, lessonTitle, role, text}]
  voiceAgent: load(KEY.voice, []),   // [{id, cls, title, content, language}]
  session:  load(KEY.session, null)  // {role, studentId, name, cls, appLang}
};
if (!localStorage.getItem(KEY.content)) save(KEY.content, state.content);

/* migration: backfill loginId/password for students created before credentials existed */
(function migrateStudents(){
  let changed=false;
  const letters='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const mkId = cls => { let s=''; for(let i=0;i<4;i++) s+=letters[Math.floor(Math.random()*letters.length)];
    return 'C'+String(cls).padStart(2,'0')+'-'+s; };
  const mkPw = ()=>{ const w=['sun','sky','tree','star','bird','river','moon','leaf','rain','fish','book','lion'];
    return w[Math.floor(Math.random()*w.length)]+Math.floor(100+Math.random()*900); };
  state.students.forEach(s=>{
    if(!s.loginId){ let id; do{ id=mkId(s.cls); } while(state.students.some(x=>x.loginId===id)); s.loginId=id; changed=true; }
    if(!s.password){ s.password=mkPw(); changed=true; }
  });
  if(changed) save(KEY.students, state.students);
})();

/* migration: voiceAgent records {content} → {kind:'doc', reference} for unified schema */
(function migrateVoice(){
  let changed=false;
  state.voiceAgent.forEach(d=>{
    if(!d.kind){ d.kind='doc'; changed=true; }
    if(d.content!==undefined && d.reference===undefined){ d.reference=d.content; delete d.content; changed=true; }
  });
  if(changed) save(KEY.voice, state.voiceAgent);
})();

const persist = () => { save(KEY.config,state.config); save(KEY.content,state.content); save(KEY.students,state.students); save(KEY.history,state.history); save(KEY.voice,state.voiceAgent); save(KEY.session,state.session); };

/* ============================================================
   i18n  (English + Hindi complete; others cover core strings)
   ============================================================ */
const LANGS = [
  {code:'en', label:'English'}, {code:'hi', label:'हिन्दी'}, {code:'bn', label:'বাংলা'},
  {code:'mr', label:'मराठी'}, {code:'ta', label:'தமிழ்'}, {code:'te', label:'తెలుగు'},
  {code:'gu', label:'ગુજરાતી'}, {code:'kn', label:'ಕನ್ನಡ'}, {code:'pa', label:'ਪੰਜਾਬੀ'}
];
const BCP = { en:'en-IN', hi:'hi-IN', bn:'bn-IN', mr:'mr-IN', ta:'ta-IN', te:'te-IN', gu:'gu-IN', kn:'kn-IN', pa:'pa-IN' };

const T = {
  en:{
    chooseRole:'Who is learning today?', iAmStudent:'I am a student', studentSub:'Pick your class and start',
    iAmTeacher:'I am a teacher / school', teacherSub:'Set up lessons and theme',
    yourName:'Your name', selectClass:'Select your class', schoolCode:'School code', start:'Start learning',
    back:'Back', adminPass:'Password', enter:'Enter', wrongPass:'Wrong password', needName:'Please type your name',
    needClass:'Please select your class', wrongCode:'Wrong school code',
    learn:'Learn', chat:'Practice', history:'History', logout:'Log out', language:'Language', textSize:'Text size',
    hello:'Hello', classLabel:'Class', lessons:'Your lessons', noLessons:'No lessons yet for this class. Ask your teacher to add some.',
    reference:'Reading', tapHint:'Tap any line to hear it', playAll:'Listen to all', stop:'Stop',
    openLink:'Open reference', practice:'Practice & ask', askPlaceholder:'Ask a question…', send:'Send',
    thinking:'Thinking…', noWebhook:'The teacher has not connected the AI tutor yet. You can still read and listen above.',
    listen:'Listen', historyEmpty:'No history yet. Open a lesson and start practising.', clearHistory:'Clear history',
    cleared:'History cleared', voiceUnsupported:'Voice is not available on this device',
    adminTitle:'School setup', branding:'Branding', content:'Lessons',
    orgName:'School / organisation name', appName:'App name', tagline:'Tagline', logoEmoji:'Logo (emoji)',
    primaryColor:'Main colour', accentColor:'Highlight colour', darkMode:'Dark mode', defaultLanguage:'Default language',
    fontSize:'Default text size', webhook:'AI tutor endpoint (n8n webhook URL)',
    webhookHint:'Student questions are sent here. Your n8n flow does the RAG and replies, and can also save the conversation.',
    changePass:'Admin password', requireCode:'Require a school code to log in', codeValue:'School code students must enter',
    saveSettings:'Save settings', saved:'Saved', addLesson:'Add lesson', editLesson:'Edit lesson',
    lTitle:'Lesson title', lClass:'Class', lType:'Type', tDoc:'Document text', tYoutube:'YouTube video', tWebsite:'Website link',
    lText:'Paste the reading text', lUrl:'Paste the link', lLang:'Reading language', delete:'Delete', edit:'Edit',
    save:'Save', cancel:'Cancel', confirmDel:'Delete this lesson?', noContent:'No lessons added yet.',
    allClasses:'All', filterClass:'Show class',
    students:'Students', addStudent:'Add student', editStudent:'Edit student',
    studentId:'Student ID', password:'Password', loginId:'Student ID', loginPass:'Password',
    wrongLogin:'Wrong ID or password', search:'Search by name or ID',
    noStudents:'No students added yet.', resetPass:'Reset password', copyCreds:'Copy login',
    printCard:'Print login card', confirmDelStu:'Delete this student? Their history will also be removed.',
    credCopied:'Login copied', generatedId:'Generated ID', regenerate:'Regenerate',
    syncing:'Saving to server…', syncedOk:'Saved to server', syncedFail:'Saved locally — server sync failed',
    syncNow:'Sync now', lastSync:'Last sync', neverSynced:'Not synced yet',
    talk:'Talk', tapToTalk:'Tap the mic to talk', listening:'Listening…', preparing:'Preparing…',
    speaking:'Speaking…', handsFree:'Hands-free', repeat:'Repeat last', stopTalk:'Stop',
    voiceTeacherGreet:"Hello! I'm your language teacher. Tap the mic and say something to me.",
    micBlocked:'Please allow microphone access', sttUnsupported:'Voice input is not supported on this browser. Try Chrome on Android or desktop.',
    voiceBot:'Voice Bot', voiceMaterials:'Voice Bot Material', addVoiceDoc:'Add voice document',
    editVoiceDoc:'Edit voice document', uploadFile:'Upload file', orPaste:'…or paste below',
    fileType:'Only .txt and .md files', voiceFlow:'How the teacher should teach',
    voiceFlowHint:'Paste the lesson script, vocabulary, dialogues, or rules the AI teacher should follow for this class.',
    noVoiceDocs:'No voice material yet for this class. The voice bot will use a generic greeting.',
    playConversation:'Play conversation', stopPlayback:'Stop'
  },
  hi:{
    chooseRole:'आज कौन सीख रहा है?', iAmStudent:'मैं विद्यार्थी हूँ', studentSub:'अपनी कक्षा चुनें और शुरू करें',
    iAmTeacher:'मैं शिक्षक / विद्यालय हूँ', teacherSub:'पाठ और रूप-रंग सेट करें',
    yourName:'आपका नाम', selectClass:'अपनी कक्षा चुनें', schoolCode:'विद्यालय कोड', start:'सीखना शुरू करें',
    back:'वापस', adminPass:'पासवर्ड', enter:'प्रवेश', wrongPass:'गलत पासवर्ड', needName:'कृपया अपना नाम लिखें',
    needClass:'कृपया अपनी कक्षा चुनें', wrongCode:'गलत विद्यालय कोड',
    learn:'सीखें', chat:'अभ्यास', history:'इतिहास', logout:'लॉग आउट', language:'भाषा', textSize:'अक्षर का आकार',
    hello:'नमस्ते', classLabel:'कक्षा', lessons:'आपके पाठ', noLessons:'इस कक्षा के लिए अभी कोई पाठ नहीं है। शिक्षक से जोड़ने को कहें।',
    reference:'पठन सामग्री', tapHint:'सुनने के लिए किसी भी पंक्ति को छुएँ', playAll:'सब सुनें', stop:'रोकें',
    openLink:'सामग्री खोलें', practice:'अभ्यास और प्रश्न', askPlaceholder:'कोई प्रश्न पूछें…', send:'भेजें',
    thinking:'सोच रहा हूँ…', noWebhook:'शिक्षक ने अभी AI सहायक नहीं जोड़ा है। आप ऊपर पढ़ और सुन सकते हैं।',
    listen:'सुनें', historyEmpty:'अभी कोई इतिहास नहीं। कोई पाठ खोलें और अभ्यास शुरू करें।', clearHistory:'इतिहास हटाएँ',
    cleared:'इतिहास हटा दिया गया', voiceUnsupported:'इस डिवाइस पर आवाज़ उपलब्ध नहीं है',
    adminTitle:'विद्यालय सेटअप', branding:'ब्रांडिंग', content:'पाठ',
    orgName:'विद्यालय / संस्था का नाम', appName:'ऐप का नाम', tagline:'टैगलाइन', logoEmoji:'लोगो (इमोजी)',
    primaryColor:'मुख्य रंग', accentColor:'हाइलाइट रंग', darkMode:'डार्क मोड', defaultLanguage:'डिफ़ॉल्ट भाषा',
    fontSize:'डिफ़ॉल्ट अक्षर आकार', webhook:'AI सहायक एंडपॉइंट (n8n वेबहुक URL)',
    webhookHint:'विद्यार्थी के प्रश्न यहाँ भेजे जाते हैं। आपका n8n फ्लो RAG करके उत्तर देता है और बातचीत सहेज सकता है।',
    changePass:'एडमिन पासवर्ड', requireCode:'लॉगिन के लिए विद्यालय कोड आवश्यक करें', codeValue:'विद्यार्थी जो कोड डालेंगे',
    saveSettings:'सेटिंग सहेजें', saved:'सहेजा गया', addLesson:'पाठ जोड़ें', editLesson:'पाठ संपादित करें',
    lTitle:'पाठ का शीर्षक', lClass:'कक्षा', lType:'प्रकार', tDoc:'दस्तावेज़ पाठ', tYoutube:'YouTube वीडियो', tWebsite:'वेबसाइट लिंक',
    lText:'पठन सामग्री यहाँ चिपकाएँ', lUrl:'लिंक यहाँ चिपकाएँ', lLang:'पठन भाषा', delete:'हटाएँ', edit:'संपादित करें',
    save:'सहेजें', cancel:'रद्द करें', confirmDel:'यह पाठ हटाएँ?', noContent:'अभी कोई पाठ नहीं जोड़ा गया।',
    allClasses:'सभी', filterClass:'कक्षा दिखाएँ',
    students:'विद्यार्थी', addStudent:'विद्यार्थी जोड़ें', editStudent:'विद्यार्थी संपादित करें',
    studentId:'विद्यार्थी ID', password:'पासवर्ड', loginId:'विद्यार्थी ID', loginPass:'पासवर्ड',
    wrongLogin:'गलत ID या पासवर्ड', search:'नाम या ID से खोजें',
    noStudents:'अभी कोई विद्यार्थी नहीं जोड़ा गया।', resetPass:'पासवर्ड रीसेट करें', copyCreds:'लॉगिन कॉपी करें',
    printCard:'लॉगिन कार्ड प्रिंट करें', confirmDelStu:'इस विद्यार्थी को हटाएँ? उसका इतिहास भी हट जाएगा।',
    credCopied:'लॉगिन कॉपी हो गया', generatedId:'जनरेट की गई ID', regenerate:'दोबारा बनाएँ',
    syncing:'सर्वर पर सहेज रहे हैं…', syncedOk:'सर्वर पर सहेज दिया', syncedFail:'स्थानीय रूप से सहेजा — सर्वर सिंक विफल',
    syncNow:'अभी सिंक करें', lastSync:'अंतिम सिंक', neverSynced:'अभी तक सिंक नहीं हुआ',
    talk:'बातचीत', tapToTalk:'बोलने के लिए माइक छुएँ', listening:'सुन रहा हूँ…', preparing:'तैयार कर रहा हूँ…',
    speaking:'बोल रहा हूँ…', handsFree:'हैंड्स-फ्री', repeat:'फिर से सुनाएँ', stopTalk:'रोकें',
    voiceTeacherGreet:'नमस्ते! मैं आपकी भाषा शिक्षक हूँ। माइक छूकर मुझसे कुछ कहिए।',
    micBlocked:'कृपया माइक्रोफ़ोन की अनुमति दें', sttUnsupported:'इस ब्राउज़र पर आवाज़ इनपुट उपलब्ध नहीं है। कृपया Chrome आज़माएँ।',
    voiceBot:'वॉइस बॉट', voiceMaterials:'वॉइस बॉट सामग्री', addVoiceDoc:'वॉइस दस्तावेज़ जोड़ें',
    editVoiceDoc:'वॉइस दस्तावेज़ संपादित करें', uploadFile:'फ़ाइल अपलोड करें', orPaste:'…या नीचे चिपकाएँ',
    fileType:'केवल .txt और .md फ़ाइलें', voiceFlow:'शिक्षक कैसे पढ़ाए',
    voiceFlowHint:'इस कक्षा के लिए AI शिक्षक को जो स्क्रिप्ट, शब्दावली, संवाद या नियम पालन करने हैं वे यहाँ चिपकाएँ।',
    noVoiceDocs:'इस कक्षा के लिए अभी कोई वॉइस सामग्री नहीं है। वॉइस बॉट सामान्य अभिवादन से शुरू करेगा।',
    playConversation:'बातचीत सुनें', stopPlayback:'रोकें'
  },
  bn:{ chooseRole:'আজ কে শিখছে?', iAmStudent:'আমি ছাত্র', studentSub:'তোমার শ্রেণি বেছে নাও',
    iAmTeacher:'আমি শিক্ষক / স্কুল', teacherSub:'পাঠ ও থিম সেট করুন', yourName:'তোমার নাম', selectClass:'শ্রেণি বেছে নাও',
    schoolCode:'স্কুল কোড', start:'শেখা শুরু করো', back:'পিছনে', learn:'শেখো', chat:'অনুশীলন', history:'ইতিহাস',
    logout:'লগ আউট', language:'ভাষা', textSize:'অক্ষরের আকার', hello:'নমস্কার', classLabel:'শ্রেণি', lessons:'তোমার পাঠ',
    reference:'পড়া', tapHint:'শুনতে যেকোনো লাইনে চাপো', playAll:'সব শোনো', send:'পাঠাও', listen:'শোনো', enter:'প্রবেশ' },
  mr:{ chooseRole:'आज कोण शिकत आहे?', iAmStudent:'मी विद्यार्थी आहे', studentSub:'तुमचा वर्ग निवडा',
    iAmTeacher:'मी शिक्षक / शाळा', teacherSub:'पाठ व रंगसंगती सेट करा', yourName:'तुमचे नाव', selectClass:'तुमचा वर्ग निवडा',
    schoolCode:'शाळा कोड', start:'शिकायला सुरुवात करा', back:'मागे', learn:'शिका', chat:'सराव', history:'इतिहास',
    logout:'लॉग आउट', language:'भाषा', textSize:'अक्षर आकार', hello:'नमस्कार', classLabel:'वर्ग', lessons:'तुमचे पाठ',
    reference:'वाचन', tapHint:'ऐकण्यासाठी कोणत्याही ओळीला स्पर्श करा', playAll:'सर्व ऐका', send:'पाठवा', listen:'ऐका', enter:'प्रवेश' },
  ta:{ chooseRole:'இன்று யார் கற்கிறார்?', iAmStudent:'நான் மாணவன்', studentSub:'உங்கள் வகுப்பைத் தேர்வு செய்க',
    iAmTeacher:'நான் ஆசிரியர் / பள்ளி', teacherSub:'பாடம் மற்றும் தீம் அமைக்கவும்', yourName:'உங்கள் பெயர்', selectClass:'வகுப்பைத் தேர்வு செய்க',
    schoolCode:'பள்ளி குறியீடு', start:'கற்க தொடங்கு', back:'பின்', learn:'கற்க', chat:'பயிற்சி', history:'வரலாறு',
    logout:'வெளியேறு', language:'மொழி', textSize:'எழுத்து அளவு', hello:'வணக்கம்', classLabel:'வகுப்பு', lessons:'உங்கள் பாடங்கள்',
    reference:'வாசிப்பு', tapHint:'கேட்க எந்த வரியையும் தொடவும்', playAll:'அனைத்தையும் கேள்', send:'அனுப்பு', listen:'கேள்', enter:'நுழை' },
  te:{ chooseRole:'ఈరోజు ఎవరు నేర్చుకుంటున్నారు?', iAmStudent:'నేను విద్యార్థిని', studentSub:'మీ తరగతిని ఎంచుకోండి',
    iAmTeacher:'నేను ఉపాధ్యాయుడు / పాఠశాల', teacherSub:'పాఠాలు, థీమ్ సెట్ చేయండి', yourName:'మీ పేరు', selectClass:'తరగతిని ఎంచుకోండి',
    schoolCode:'పాఠశాల కోడ్', start:'నేర్చుకోవడం ప్రారంభించు', back:'వెనుకకు', learn:'నేర్చుకో', chat:'అభ్యాసం', history:'చరిత్ర',
    logout:'లాగ్ అవుట్', language:'భాష', textSize:'అక్షర పరిమాణం', hello:'నమస్తే', classLabel:'తరగతి', lessons:'మీ పాఠాలు',
    reference:'పఠనం', tapHint:'వినడానికి ఏ పంక్తినైనా తాకండి', playAll:'అన్నీ వినండి', send:'పంపు', listen:'వినండి', enter:'ప్రవేశించు' },
  gu:{ chooseRole:'આજે કોણ શીખે છે?', iAmStudent:'હું વિદ્યાર્થી છું', yourName:'તમારું નામ', selectClass:'તમારો વર્ગ પસંદ કરો',
    start:'શીખવાનું શરૂ કરો', back:'પાછળ', learn:'શીખો', chat:'અભ્યાસ', history:'ઇતિહાસ', logout:'લૉગ આઉટ',
    language:'ભાષા', hello:'નમસ્તે', classLabel:'વર્ગ', lessons:'તમારા પાઠ', tapHint:'સાંભળવા કોઈપણ લીટી દબાવો',
    playAll:'બધું સાંભળો', send:'મોકલો', listen:'સાંભળો' },
  kn:{ chooseRole:'ಇಂದು ಯಾರು ಕಲಿಯುತ್ತಿದ್ದಾರೆ?', iAmStudent:'ನಾನು ವಿದ್ಯಾರ್ಥಿ', yourName:'ನಿಮ್ಮ ಹೆಸರು', selectClass:'ನಿಮ್ಮ ತರಗತಿ ಆಯ್ಕೆಮಾಡಿ',
    start:'ಕಲಿಯಲು ಪ್ರಾರಂಭಿಸಿ', back:'ಹಿಂದೆ', learn:'ಕಲಿ', chat:'ಅಭ್ಯಾಸ', history:'ಇತಿಹಾಸ', logout:'ಲಾಗ್ ಔಟ್',
    language:'ಭಾಷೆ', hello:'ನಮಸ್ಕಾರ', classLabel:'ತರಗತಿ', lessons:'ನಿಮ್ಮ ಪಾಠಗಳು', tapHint:'ಕೇಳಲು ಯಾವುದೇ ಸಾಲನ್ನು ಸ್ಪರ್ಶಿಸಿ',
    playAll:'ಎಲ್ಲವನ್ನೂ ಕೇಳಿ', send:'ಕಳುಹಿಸಿ', listen:'ಕೇಳಿ' },
  pa:{ chooseRole:'ਅੱਜ ਕੌਣ ਸਿੱਖ ਰਿਹਾ ਹੈ?', iAmStudent:'ਮੈਂ ਵਿਦਿਆਰਥੀ ਹਾਂ', yourName:'ਤੁਹਾਡਾ ਨਾਮ', selectClass:'ਆਪਣੀ ਜਮਾਤ ਚੁਣੋ',
    start:'ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ', back:'ਪਿੱਛੇ', learn:'ਸਿੱਖੋ', chat:'ਅਭਿਆਸ', history:'ਇਤਿਹਾਸ', logout:'ਲੌਗ ਆਊਟ',
    language:'ਭਾਸ਼ਾ', hello:'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', classLabel:'ਜਮਾਤ', lessons:'ਤੁਹਾਡੇ ਪਾਠ', tapHint:'ਸੁਣਨ ਲਈ ਕੋਈ ਵੀ ਲਾਈਨ ਛੂਹੋ',
    playAll:'ਸਭ ਸੁਣੋ', send:'ਭੇਜੋ', listen:'ਸੁਣੋ' }
};
function appLang(){ return (state.session && state.session.appLang) || state.config.defaultLang || 'en'; }
function t(k){ const l = appLang(); return (T[l] && T[l][k]) || T.en[k] || k; }

/* ============================================================
   HELPERS
   ============================================================ */
const $ = sel => document.querySelector(sel);
const app = $('#app');
const escH = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const escA = s => escH(s).replace(/'/g, '&#39;');
const uid = p => (p||'id') + '_' + Math.random().toString(36).slice(2,9);
let toastTimer;
function toast(msg){ const el=$('#toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2200); }

function applyTheme(){
  const c = state.config, r = document.documentElement;
  r.style.setProperty('--primary', c.primary);
  r.style.setProperty('--accent', c.accent);
  r.style.setProperty('--fs', c.fontScale || 1);
  r.setAttribute('data-dark', c.dark ? '1' : '0');
  document.title = (c.appName||'Bhasha Setu') + ' — ' + (c.orgName||'');
}

/* derive soft tints from primary so themes stay coherent */
function syncSoftColors(){
  // light tint for primary-soft / accent-soft when not dark
  const r = document.documentElement;
  if(!state.config.dark){
    r.style.setProperty('--primary-soft', hexTint(state.config.primary, .88));
    r.style.setProperty('--accent-soft', hexTint(state.config.accent, .85));
  }
}
function hexTint(hex, amt){ // mix hex toward white by amt
  try{ const h=hex.replace('#',''); const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);
    let R=(n>>16)&255,G=(n>>8)&255,B=n&255;
    R=Math.round(R+(255-R)*amt); G=Math.round(G+(255-G)*amt); B=Math.round(B+(255-B)*amt);
    return '#'+[R,G,B].map(v=>v.toString(16).padStart(2,'0')).join(''); }catch(e){ return '#eee'; }
}

/* ---------- text-to-speech ---------- */
let voicesReady = false;
function loadVoices(){ try{ const v=speechSynthesis.getVoices(); if(v&&v.length) voicesReady=true; }catch(e){} }
if ('speechSynthesis' in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
function pickVoice(lang){
  try{ const vs=speechSynthesis.getVoices(); if(!vs.length) return null;
    return vs.find(v=>v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()))
        || vs.find(v=>v.lang && v.lang.toLowerCase().startsWith((lang+'-')))
        || null; }catch(e){ return null; }
}
let stopSpeak = ()=>{};
function speak(text, lang, spanEl){
  if(!('speechSynthesis' in window)){ toast(t('voiceUnsupported')); return; }
  speechSynthesis.cancel();
  document.querySelectorAll('.rd.speaking').forEach(e=>e.classList.remove('speaking'));
  const u = new SpeechSynthesisUtterance(text);
  u.lang = BCP[lang] || lang || 'en-IN';
  const v = pickVoice(lang||'en'); if(v) u.voice = v;
  u.rate = 0.92;
  if(spanEl){ spanEl.classList.add('speaking');
    const clear=()=>spanEl.classList.remove('speaking'); u.onend=clear; u.onerror=clear; }
  speechSynthesis.speak(u);
}
/* split into tappable sentences (works on older mobile browsers too) */
function readable(text, lang){
  const parts = String(text).match(/[^.!?।॥\n]+[.!?।॥]*[\s\n]*/g) || [String(text)];
  return parts.map(s => `<span class="rd" data-lang="${escA(lang||'en')}" data-text="${escA(s.trim())}">${escH(s)}</span>`).join('');
}
function ytId(url){
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

/* ============================================================
   AI TUTOR (n8n webhook)
   ============================================================ */
function extractReply(data){
  if(!data) return null;
  if(typeof data === 'string') return data;
  if(Array.isArray(data)) return extractReply(data[0]);
  return data.reply || data.output || data.text || data.message || data.answer ||
         (data.data && extractReply(data.data)) || null;
}
async function askBot(lesson, message, hist){
  const c = state.config, s = state.session;
  const payload = {
    type:'chat', org:c.orgName, sessionId:s.studentId,
    student:{ name:s.name, class:s.cls },
    lesson:{ id:lesson.id, title:lesson.title, kind:lesson.kind, reference:lesson.reference, language:lesson.language },
    language: appLang(),
    message,
    history: hist.slice(-10).map(h=>({role:h.role, text:h.text}))
  };
  // JeetMantra: tick lesson progress for "My Results"
  try {
    const ctx = window.JM_CTX || {};
    const arr = JSON.parse(localStorage.getItem('jm_bhasha_progress')||'[]');
    const key = (ctx.courseId||lesson.id);
    const existing = arr.find(r => r.key===key);
    if (existing) { existing.turns = (existing.turns||0)+1; existing.ts = Date.now(); }
    else arr.unshift({ key, ts: Date.now(), courseId: ctx.courseId||null, title: lesson.title, topic: ctx.topic||'', lang: lesson.language||appLang(), turns: 1 });
    localStorage.setItem('jm_bhasha_progress', JSON.stringify(arr.slice(0,100)));
  } catch(e){}
  // JeetMantra platform routing: prefer /api/ai/generate when logged in (no webhook needed)
  const jmToken = (typeof localStorage!=='undefined') && localStorage.getItem('jm_token');
  if(jmToken){
    try{
      const sys = `You are a kind language-learning tutor. Lesson title: "${lesson.title}". Lesson reference text/URL: """${(lesson.reference||'').slice(0,4000)}""". Always reply in the student's chosen UI language (${appLang()}). Keep answers short, encouraging, and age-appropriate for a Class ${s.cls} student.`;
      const res = await fetch('/api/ai/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+jmToken},
        body: JSON.stringify({ systemPrompt: sys, prompt: message })
      });
      if(!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      const reply = data.text || data.reply || extractReply(data) || '…';
      return { ok:true, reply };
    }catch(err){ /* fall through to webhook */ }
  }
  if(!c.webhook){ return { ok:false, reply:t('noWebhook') }; }
  try{
    const res = await fetch(c.webhook, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    let data=null; try{ data = await res.json(); }catch(e){ data = await res.text().catch(()=>null); }
    const reply = extractReply(data);
    return { ok:true, reply: reply || '…' };
  }catch(err){
    return { ok:false, reply:'⚠️ '+ (appLang()==='hi'?'सहायक से जुड़ नहीं पाया। कृपया बाद में प्रयास करें।':'Could not reach the tutor. Please try again later.') };
  }
}

/* ============================================================
   ROUTER
   ============================================================ */
let view = { name:'login', sub:'role', lessonId:null, adminTab:'branding', tmpClass:null, filterCls:'all' };
function go(name, opts={}){ view = { ...view, name, ...opts }; render(); window.scrollTo(0,0); }

/* ---------- sync to webhook (full snapshot or per-student) ---------- */
let syncing = false;
async function syncToWebhook(reason){
  const c = state.config;
  if(!c.webhook) return { ok:false, skipped:true };
  const s = state.session;
  const isStudent = s && s.role==='student';
  const payload = isStudent ? {
    type:'sync', reason, org:c.orgName, app:c.appName, ts:Date.now(),
    scope:'student', sessionId:s.studentId,
    student: state.students.find(x=>x.id===s.studentId) || { id:s.studentId, name:s.name, cls:s.cls },
    history: state.history.filter(h=>h.studentId===s.studentId)
  } : {
    type:'sync', reason, org:c.orgName, app:c.appName, ts:Date.now(),
    scope:'full',
    config: { ...c, adminPass:undefined },           // never send the admin password
    students: state.students, content: state.content, voiceAgent: state.voiceAgent, history: state.history
  };
  try{
    const res = await fetch(c.webhook, { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload), keepalive:true });
    if(!res.ok) throw new Error('HTTP '+res.status);
    state.config.lastSyncAt = Date.now(); save(KEY.config, state.config);
    return { ok:true };
  }catch(err){ return { ok:false, error:String(err.message||err) }; }
}

async function logout(){
  if(syncing) return;
  if(typeof stopVoice==='function') stopVoice();
  speechSynthesis && speechSynthesis.cancel();
  syncing = true;
  const hadWebhook = !!state.config.webhook;
  if(hadWebhook){ toast(t('syncing')); }
  const r = await syncToWebhook('logout');
  syncing = false;
  if(hadWebhook){ toast(r.ok ? t('syncedOk') : t('syncedFail')); }
  state.session = null; persist(); go('login',{sub:'role'});
}

/* best-effort sync when the tab is closed/backgrounded */
window.addEventListener('pagehide', ()=>{
  const c = state.config; if(!c.webhook || !state.session) return;
  const s = state.session;
  const payload = (s.role==='student') ? {
    type:'sync', reason:'pagehide', org:c.orgName, ts:Date.now(), scope:'student',
    sessionId:s.studentId, student: state.students.find(x=>x.id===s.studentId),
    history: state.history.filter(h=>h.studentId===s.studentId)
  } : null;
  if(!payload) return;
  try{ navigator.sendBeacon(c.webhook, new Blob([JSON.stringify(payload)], {type:'application/json'})); }catch(e){}
});

// JeetMantra deep-link + role gating. Students = learn only; Teacher/School/Coaching = configure lessons.
window.JM_CTX = (() => {
  try {
    const p = new URLSearchParams(location.search);
    let role=''; try { const u=JSON.parse(localStorage.getItem('jm_user')||'null'); role=(u&&(u.role||u.user_type))||''; } catch(e){}
    return { courseId:p.get('courseId')||'', topic:p.get('topic')||'', title:p.get('title')||p.get('topic')||'', lang:(p.get('lang')||'').toLowerCase(), text:p.get('text')||'', role:(role||'guest').toLowerCase() };
  } catch(e){ return { role:'guest' }; }
})();
window.JM_CAN_CONFIGURE = ['teacher','school','coaching','admin','partner'].includes(window.JM_CTX.role);

// Auto-login per role so the in-page role pick is skipped.
function jmAutoSession(){
  const ctx = window.JM_CTX || {};
  if (state.session) return;
  if (ctx.role && ctx.role !== 'guest') {
    if (window.JM_CAN_CONFIGURE) {
      state.session = { role:'admin', name:'Teacher' };
    } else {
      let stu = (state.students||[])[0];
      if (!stu) {
        stu = { id:'jm_stu', name:'Student', cls:'8', loginId:'JM-AUTO', password:'auto' };
        state.students.unshift(stu); save(KEY.students, state.students);
      }
      state.session = { role:'student', studentId:stu.id, name:stu.name, cls:stu.cls, appLang:ctx.lang||state.config.defaultLang||'en' };
    }
    save(KEY.session, state.session);
  }
}

function jmSeedLessonFromCtx(){
  const ctx = window.JM_CTX || {};
  if (!ctx.title && !ctx.text) return;
  try {
    const existing = (state.content||[]).find(c => c.id === 'jm_'+(ctx.courseId||'ctx'));
    const lesson = {
      id: 'jm_'+(ctx.courseId||'ctx'),
      cls: '8', kind: 'doc',
      title: ctx.title || 'Course lesson',
      language: ctx.lang || 'en',
      reference: ctx.text || ctx.title || ''
    };
    if (existing) Object.assign(existing, lesson); else state.content.unshift(lesson);
    save(KEY.content, state.content);
    if (ctx.lang) { state.config.defaultLang = ctx.lang; save(KEY.config, state.config); }
  } catch(e){}
}

function render(){
  applyTheme(); syncSoftColors();
  if (window.JM_CTX && (window.JM_CTX.title || window.JM_CTX.text) && !window.__jm_seeded) { window.__jm_seeded=true; jmSeedLessonFromCtx(); }
  // JM role gating: auto-promote into admin or student based on JM session
  if (window.JM_CTX && window.JM_CTX.role && window.JM_CTX.role!=='guest' && !state.session) jmAutoSession();
  if(state.session && state.session.role==='admin') return renderAdmin();
  if(state.session && state.session.role==='student') return renderStudent();
  return renderLogin();
}

/* ---------- header used by student + admin ---------- */
function headerHTML(opts={}){
  const c = state.config;
  const langOpts = LANGS.map(l=>`<option value="${l.code}" ${appLang()===l.code?'selected':''}>${l.label}</option>`).join('');
  return `<div class="topbar">
    <span class="logo">${escH(c.logo||'📖')}</span>
    <div class="brand">${escH(c.appName||'Bhasha Setu')}<small>${escH(c.orgName||'')}</small></div>
    <span class="spacer"></span>
    <select id="langSel" class="iconbtn" style="width:auto;padding:0 .5em" aria-label="${escA(t('language'))}">${langOpts}</select>
    <button class="iconbtn" id="sizeBtn" aria-label="${escA(t('textSize'))}">A</button>
    <button class="iconbtn" id="logoutBtn" aria-label="${escA(t('logout'))}">⎋</button>
  </div>`;
}
function wireHeader(){
  const ls = $('#langSel'); if(ls) ls.onchange = e=>{ state.session.appLang = e.target.value; persist(); render(); };
  const sb = $('#sizeBtn'); if(sb) sb.onclick = ()=>{ const steps=[0.9,1,1.15,1.3]; let i=steps.indexOf(state.config.fontScale); i=(i+1)%steps.length; state.config.fontScale=steps[i]; persist(); applyTheme(); toast(t('textSize')+': '+Math.round(steps[i]*100)+'%'); };
  const lo = $('#logoutBtn'); if(lo) lo.onclick = logout;
}

/* ============================================================
   LOGIN
   ============================================================ */
function renderLogin(){
  const c = state.config;
  if(view.sub==='role'){
    app.innerHTML = `
      ${JM.Hero({logo:escH(c.logo||'📖'),title:escH(c.appName||'Bhasha Setu'),tagline:escH(c.tagline||'')})}
      <div style="text-align:center;margin:-.4em 0 .6em">${langPickerInline()}</div>
      <h2 class="center" style="font-size:1.1em;margin:.4em 0">${t('chooseRole')}</h2>
      ${JM.RolePicker({roles:[
        { id: 'goStudent', icon: '🧑‍🎓', title: t('iAmStudent'), sub: t('studentSub') },
        { id: 'goTeacher', icon: '🧑‍🏫', title: t('iAmTeacher'), sub: t('teacherSub') }
      ]})}`;
    wireLangPickerInline();
    $('#goStudent').onclick = ()=>go('login',{sub:'student'});
    $('#goTeacher').onclick = ()=>go('login',{sub:'admin'});
    return;
  }
  if(view.sub==='student'){
    app.innerHTML = `
      ${JM.Hero({compact:true,logo:escH(c.logo||'📖'),title:t('iAmStudent')})}
      <div class="main" style="padding-top:0">
        <div class="card stack">
          <label class="field"><span>${t('loginId')}</span><input type="text" id="stuId" autocomplete="username" autocapitalize="characters" placeholder="${escA(t('loginId'))}"></label>
          <label class="field"><span>${t('loginPass')}</span><input type="password" id="stuPass" autocomplete="current-password" placeholder="${escA(t('loginPass'))}"></label>
          <button class="btn block accent" id="stuStart">${t('start')} →</button>
          <button class="btn ghost block" id="stuBack">← ${t('back')}</button>
          <p class="muted center" style="font-size:.82em;margin:0">${t('iAmTeacher')} ➜ ${t('addStudent')}</p>
        </div>
      </div>`;
    $('#stuBack').onclick = ()=>go('login',{sub:'role'});
    const tryLogin = ()=>{
      const sid = ($('#stuId').value||'').trim();
      const pass = $('#stuPass').value||'';
      if(!sid || !pass) return toast(t('wrongLogin'));
      const stu = state.students.find(s => s.loginId && s.loginId.toLowerCase()===sid.toLowerCase() && s.password===pass);
      if(!stu) return toast(t('wrongLogin'));
      state.session = { role:'student', studentId:stu.id, name:stu.name, cls:stu.cls, appLang:appLang() };
      persist(); go('home');
    };
    $('#stuStart').onclick = tryLogin;
    $('#stuPass').addEventListener('keydown', e=>{ if(e.key==='Enter') tryLogin(); });
    return;
  }
  if(view.sub==='admin'){
    app.innerHTML = `
      ${JM.Hero({compact:true,logo:escH(c.logo||'📖'),title:t('iAmTeacher')})}
      <div class="main" style="padding-top:0">
        <div class="card stack">
          <label class="field"><span>${t('adminPass')}</span><input type="password" id="adPass" autocomplete="off" placeholder="${escA(t('adminPass'))}"></label>
          <button class="btn block" id="adEnter">${t('enter')} →</button>
          <button class="btn ghost block" id="adBack">← ${t('back')}</button>
          <p class="muted center" style="font-size:.82em;margin:0">Default password: <b>admin</b></p>
        </div>
      </div>`;
    $('#adBack').onclick = ()=>go('login',{sub:'role'});
    const tryEnter = ()=>{ if($('#adPass').value === (c.adminPass||'admin')){ state.session={ role:'admin', appLang:appLang() }; persist(); go('admin'); } else toast(t('wrongPass')); };
    $('#adEnter').onclick = tryEnter;
    $('#adPass').addEventListener('keydown', e=>{ if(e.key==='Enter') tryEnter(); });
    return;
  }
}
function langPickerInline(){
  return `<select id="langInline" class="chip" style="font-weight:700">${LANGS.map(l=>`<option value="${l.code}" ${appLang()===l.code?'selected':''}>🌐 ${l.label}</option>`).join('')}</select>`;
}
function wireLangPickerInline(){ const s=$('#langInline'); if(s) s.onchange=e=>{ if(state.session) state.session.appLang=e.target.value; else state.config.defaultLang=e.target.value; persist(); render(); }; }

/* ============================================================
   STUDENT
   ============================================================ */
function renderStudent(){
  if(view.name==='lesson') return renderLesson();
  if(view.name==='history') return renderHistory();
  if(view.name==='talk') return renderTalk();
  return renderHome();
}
function studentLessons(){ return state.content.filter(l=>l.cls===state.session.cls); }

function renderHome(){
  const s = state.session;
  const lessons = studentLessons();
  const list = lessons.length ? lessons.map(l=>{
    const ico = l.kind==='youtube'?'▶️':(l.kind==='website'?'🔗':'📄');
    const sub = l.kind==='youtube'?'YouTube':(l.kind==='website'?(t('openLink')):(LANGS.find(x=>x.code===l.language)||{}).label||'');
    return `<button class="lesson" data-id="${l.id}"><span class="lico">${ico}</span><span><span class="lt">${escH(l.title)}</span><span class="ls">${escH(sub)}</span></span><span class="go">›</span></button>`;
  }).join('') : `<div class="card center muted">${t('noLessons')}</div>`;
  app.innerHTML = headerHTML() + `
    <div class="main stack">
      <div>
        <div class="greet">${t('hello')}, ${escH(s.name)} 👋</div>
        <span class="pill">${t('classLabel')} ${escH(s.cls)}</span>
      </div>
      <h2 style="font-size:1.05em;margin:.4em 0 0">${t('lessons')}</h2>
      <div class="stack">${list}</div>
    </div>` + navHTML('learn');
  wireHeader(); wireNav();
  app.querySelectorAll('.lesson').forEach(b=> b.onclick=()=>go('lesson',{lessonId:b.dataset.id}));
}

function renderLesson(){
  const l = state.content.find(x=>x.id===view.lessonId);
  if(!l){ return go('home'); }
  let refHTML='';
  if(l.kind==='youtube'){
    const id = ytId(l.reference);
    refHTML = id ? `<div class="ytwrap"><iframe src="https://www.youtube.com/embed/${id}" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`
                 : `<a class="btn block" href="${escA(l.reference)}" target="_blank" rel="noopener">${t('openLink')} ↗</a>`;
  } else if(l.kind==='website'){
    refHTML = `<a class="btn block" href="${escA(l.reference)}" target="_blank" rel="noopener">${t('openLink')} ↗</a>
               <p class="muted" style="font-size:.85em">${escH(l.reference)}</p>`;
  } else {
    refHTML = `<div class="row between" style="margin-bottom:.5em">
        <span class="pill">🔊 ${t('tapHint')}</span>
        <button class="btn sm accent" id="playAll">▶ ${t('playAll')}</button></div>
      <div class="reader" id="docReader">${readable(l.reference, l.language)}</div>`;
  }
  const hist = state.history.filter(h=>h.studentId===state.session.studentId && h.lessonId===l.id);
  const chatHTML = hist.map(h=> msgHTML(h.role, h.text, l.language)).join('');
  app.innerHTML = headerHTML() + `
    <div class="main stack">
      <button class="btn ghost sm" id="lback" style="align-self:flex-start">← ${t('back')}</button>
      <h2 style="margin:.1em 0 0">${escH(l.title)}</h2>
      <span class="pill">${t('classLabel')} ${escH(l.cls)}</span>
      <div class="card">${refHTML}</div>
      <h3 style="margin:.3em 0 0;font-size:1em">${t('practice')}</h3>
      <div class="chat" id="chat">${chatHTML || ''}</div>
    </div>
    <div class="composer">
      <textarea id="msg" rows="1" placeholder="${escA(t('askPlaceholder'))}"></textarea>
      <button class="btn" id="sendBtn" aria-label="${escA(t('send'))}">➤</button>
    </div>` ;
  wireHeader();
  $('#lback').onclick = ()=>{ speechSynthesis.cancel(); go('home'); };
  const playAll = $('#playAll'); if(playAll) playAll.onclick = ()=>speak(l.reference, l.language, null);
  const ta = $('#msg');
  ta.addEventListener('input', ()=>{ ta.style.height='auto'; ta.style.height=Math.min(ta.scrollHeight,112)+'px'; });
  ta.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); doSend(l); } });
  $('#sendBtn').onclick = ()=>doSend(l);
  const chat = $('#chat'); chat.scrollTop = chat.scrollHeight;
  $('.main').scrollTop = $('.main').scrollHeight;
}
function msgHTML(role, text, lang){
  if(role==='user') return `<div class="msg user">${escH(text)}</div>`;
  return `<div class="msg bot"><div>${readable(text, lang || appLang())}</div>
          <button class="speakbtn" data-speak="${escA(text)}" data-lang="${escA(lang||appLang())}">🔊 ${t('listen')}</button></div>`;
}
async function doSend(lesson){
  const ta = $('#msg'); const text = ta.value.trim(); if(!text) return;
  ta.value=''; ta.style.height='auto';
  const chat = $('#chat');
  chat.insertAdjacentHTML('beforeend', msgHTML('user', text, lesson.language));
  // save user turn
  const turn = { ts:Date.now(), studentId:state.session.studentId, lessonId:lesson.id, lessonTitle:lesson.title, role:'user', text };
  state.history.push(turn); persist();
  // typing
  chat.insertAdjacentHTML('beforeend', `<div class="msg bot" id="typing"><span class="typing"><i></i><i></i><i></i></span></div>`);
  chat.scrollTop = chat.scrollHeight; $('.main').scrollTop = $('.main').scrollHeight;
  const hist = state.history.filter(h=>h.studentId===state.session.studentId && h.lessonId===lesson.id);
  const res = await askBot(lesson, text, hist);
  const ty = $('#typing'); if(ty) ty.remove();
  chat.insertAdjacentHTML('beforeend', msgHTML('bot', res.reply, lesson.language || appLang()));
  state.history.push({ ts:Date.now(), studentId:state.session.studentId, lessonId:lesson.id, lessonTitle:lesson.title, role:'bot', text:res.reply });
  persist();
  chat.scrollTop = chat.scrollHeight; $('.main').scrollTop = $('.main').scrollHeight;
}

function renderHistory(){
  const all = state.history.filter(h=>h.studentId===state.session.studentId).slice().reverse();
  let body;
  if(!all.length){ body = `<div class="card center muted">${t('historyEmpty')}</div>`; }
  else {
    // group by lesson
    const groups = {};
    all.forEach(h=>{ (groups[h.lessonId]=groups[h.lessonId]||{title:h.lessonTitle, items:[]}).items.push(h); });
    body = Object.keys(groups).map(k=>{
      const g=groups[k];
      const isVoice = k===VOICE_LESSON_ID;
      const groupTitle = isVoice ? '🎤 ' + t('talk') : g.title;
      const last = g.items[0];
      const when = new Date(last.ts).toLocaleString();
      const chrono = g.items.slice().reverse(); // chronological
      const preview = chrono.slice(-4).map(h=>`<div class="msg ${h.role}" style="max-width:100%">${escH(h.text.slice(0,220))}</div>`).join('');
      const openLabel = isVoice ? t('talk') : t('chat');
      const navTarget = isVoice ? 'data-opentalk="1"' : `data-open="${escA(k)}"`;
      return `<div class="card stack"><div class="row between"><b>${escH(groupTitle)}</b><span class="muted" style="font-size:.78em">${escH(when)}</span></div>
        <div class="row" style="gap:.4em;flex-wrap:wrap">
          <button class="btn ghost sm" ${navTarget}>${openLabel} →</button>
          <button class="btn ghost sm" data-playbtn data-key="${escA(k)}" data-playing="0">▶ ${t('playConversation')}</button>
        </div>
        <div class="chat">${preview}</div></div>`;
    }).join('');
    // store chronological lists for playback
    window.__histGroups = {};
    Object.keys(groups).forEach(k=> window.__histGroups[k] = groups[k].items.slice().reverse());
  }
  app.innerHTML = headerHTML() + `
    <div class="main stack">
      <div class="row between"><h2 style="margin:.2em 0">${t('history')}</h2>
        ${all.length?`<button class="btn danger sm" id="clearH">🗑 ${t('clearHistory')}</button>`:''}</div>
      ${body}
    </div>` + navHTML('history');
  wireHeader(); wireNav();
  const ch=$('#clearH'); if(ch) ch.onclick=()=>{ state.history = state.history.filter(h=>h.studentId!==state.session.studentId); persist(); toast(t('cleared')); render(); };
  app.querySelectorAll('[data-open]').forEach(b=> b.onclick=()=>go('lesson',{lessonId:b.dataset.open}));
  app.querySelectorAll('[data-opentalk]').forEach(b=> b.onclick=()=>go('talk'));
  app.querySelectorAll('[data-playbtn]').forEach(b=> b.onclick=()=>{
    if(b.dataset.playing==='1'){ stopPlayback(); return; }
    document.querySelectorAll('[data-playbtn]').forEach(x=>{ x.dataset.playing='0'; x.textContent='▶ '+t('playConversation'); });
    b.dataset.playing='1'; b.textContent='⏹ '+t('stopPlayback');
    const k = b.dataset.key;
    const items = (window.__histGroups||{})[k] || [];
    const lang = k===VOICE_LESSON_ID ? appLang() : (state.content.find(x=>x.id===k)||{}).language || appLang();
    playConversation(items, lang);
  });
}

/* ============================================================
   VOICE BOT (Talk screen) — STT + TTS + webhook
   ============================================================ */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const voice = { mode:'idle', rec:null, handsFree:false, lastReply:'', lang:'en' };

function setMicState(mode){
  voice.mode = mode;
  const btn = $('#micBtn'); const status = $('#talkStatus');
  if(!btn || !status) return;
  btn.classList.remove('listening','thinking','speaking');
  if(mode==='listening'){ btn.classList.add('listening'); btn.textContent='⏹'; status.textContent=t('listening'); }
  else if(mode==='thinking'){ btn.classList.add('thinking'); btn.textContent='⋯'; status.textContent=t('preparing'); }
  else if(mode==='speaking'){ btn.classList.add('speaking'); btn.textContent='🔊'; status.textContent=t('speaking'); }
  else { btn.textContent='🎤'; status.textContent = SR ? t('tapToTalk') : t('sttUnsupported'); }
}
function stopVoice(){
  try{ voice.rec && voice.rec.abort(); }catch(e){}
  speechSynthesis && speechSynthesis.cancel();
  voice.mode='idle';
}

function startListening(){
  if(!SR){ toast(t('sttUnsupported')); return; }
  if(voice.mode==='listening'){ try{ voice.rec.stop(); }catch(e){} return; }
  speechSynthesis.cancel();
  const rec = new SR();
  voice.rec = rec;
  rec.lang = BCP[voice.lang] || 'en-IN';
  rec.continuous = false; rec.interimResults = false; rec.maxAlternatives = 1;
  rec.onstart = ()=> setMicState('listening');
  rec.onerror = ev=>{
    setMicState('idle');
    if(ev.error==='not-allowed' || ev.error==='service-not-allowed') toast(t('micBlocked'));
  };
  rec.onresult = ev=>{
    const text = (ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript || '').trim();
    if(text) handleSpoken(text);
  };
  rec.onend = ()=>{ if(voice.mode==='listening') setMicState('idle'); };
  try{ rec.start(); }catch(e){ setMicState('idle'); }
}

async function handleSpoken(text){
  const s = state.session;
  appendVoiceMsg('user', text);
  state.history.push({ ts:Date.now(), studentId:s.studentId, lessonId:VOICE_LESSON_ID, lessonTitle:t('talk'), role:'user', text });
  persist();
  setMicState('thinking');
  const res = await askVoiceBot(text);
  appendVoiceMsg('bot', res.reply);
  state.history.push({ ts:Date.now(), studentId:s.studentId, lessonId:VOICE_LESSON_ID, lessonTitle:t('talk'), role:'bot', text:res.reply });
  persist();
  voice.lastReply = res.reply;
  speakReply(res.reply);
}

function speakReply(text){
  if(!('speechSynthesis' in window)){ setMicState('idle'); return; }
  if(view.name !== 'talk'){ return; }  // user navigated away — don't speak in the background
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = BCP[voice.lang] || 'en-IN';
  const v = pickVoice(voice.lang); if(v) u.voice = v;
  u.rate = 0.92;
  u.onstart = ()=> setMicState('speaking');
  u.onend = ()=>{
    setMicState('idle');
    if(voice.handsFree && voice.mode==='idle' && document.getElementById('micBtn')) setTimeout(startListening, 450);
  };
  u.onerror = ()=> setMicState('idle');
  speechSynthesis.speak(u);
}

function appendVoiceMsg(role, text){
  const c = $('#voiceChat'); if(!c) return;
  c.insertAdjacentHTML('beforeend', msgHTML(role, text, voice.lang));
  c.scrollTop = c.scrollHeight;
}

async function askVoiceBot(message){
  const c = state.config, s = state.session;
  const docs = state.voiceAgent.filter(d=>d.cls===s.cls);
  const hist = state.history.filter(h=>h.studentId===s.studentId && h.lessonId===VOICE_LESSON_ID).slice(-12);
  const payload = {
    type:'voice', org:c.orgName, sessionId:s.studentId,
    student:{ name:s.name, class:s.cls },
    language: voice.lang,
    voiceAgent: docs.map(d=>({ title:d.title, language:d.language, kind:d.kind||'doc', reference:d.reference||'' })),
    message,
    history: hist.map(h=>({role:h.role, text:h.text}))
  };
  if(!c.webhook){
    return { ok:false, reply: t('voiceTeacherGreet') + ' ' + (appLang()==='hi' ? 'अभी सहायक नहीं जुड़ा है, इसलिए मैं केवल अभ्यास के लिए हूँ।' : 'The tutor is not connected yet, so I can only practise with you.') };
  }
  try{
    const res = await fetch(c.webhook, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    let data=null; try{ data = await res.json(); }catch(e){ data = await res.text().catch(()=>null); }
    return { ok:true, reply: extractReply(data) || '…' };
  }catch(err){
    return { ok:false, reply:(appLang()==='hi'?'सहायक से जुड़ नहीं पाया।':'Could not reach the tutor.') };
  }
}

function renderTalk(){
  const s = state.session;
  voice.lang = appLang();
  const hist = state.history.filter(h=>h.studentId===s.studentId && h.lessonId===VOICE_LESSON_ID).slice(-30);
  const chatHTML = hist.length ? hist.map(h=>msgHTML(h.role, h.text, voice.lang)).join('')
    : `<div class="msg bot">${escH(t('voiceTeacherGreet'))}</div>`;
  app.innerHTML = headerHTML() + `
    <div class="main talk-main">
      <div class="talk-status" id="talkStatus">${SR ? t('tapToTalk') : t('sttUnsupported')}</div>
      <button class="mic" id="micBtn" aria-label="${escA(t('tapToTalk'))}" ${SR?'':'disabled'}>🎤</button>
      <div class="talk-controls">
        <label><input type="checkbox" id="handsFree" ${voice.handsFree?'checked':''}> ${t('handsFree')}</label>
        <button class="btn ghost sm" id="repeatBtn">🔁 ${t('repeat')}</button>
      </div>
      <div class="card vchat" id="voiceChat">${chatHTML}</div>
    </div>` + navHTML('talk');
  wireHeader(); wireNav();
  setMicState('idle');
  const vc = $('#voiceChat'); vc.scrollTop = vc.scrollHeight;
  $('#micBtn').onclick = ()=>{
    if(voice.mode==='speaking'){ speechSynthesis.cancel(); setMicState('idle'); return; }
    if(voice.mode==='listening'){ try{ voice.rec.stop(); }catch(e){} return; }
    if(voice.mode==='thinking'){ return; }
    startListening();
  };
  $('#handsFree').onchange = e=>{ voice.handsFree = e.target.checked; };
  $('#repeatBtn').onclick = ()=>{ if(voice.lastReply) speakReply(voice.lastReply); };
}

/* ---------- history playback ---------- */
const playback = { stopFlag:false };
function playConversation(items, lang){
  playback.stopFlag = false;
  speechSynthesis.cancel();
  const queue = items.slice();
  const next = ()=>{
    if(playback.stopFlag || !queue.length) return finishPlayback();
    const it = queue.shift();
    const u = new SpeechSynthesisUtterance(it.text);
    u.lang = BCP[lang] || 'en-IN';
    const v = pickVoice(lang); if(v) u.voice = v;
    u.rate = it.role==='user' ? 1.0 : 0.92;
    u.onend = ()=> setTimeout(next, 250);
    u.onerror = ()=> setTimeout(next, 250);
    speechSynthesis.speak(u);
  };
  next();
}
function stopPlayback(){ playback.stopFlag = true; speechSynthesis.cancel(); finishPlayback(); }
function finishPlayback(){
  document.querySelectorAll('[data-playbtn]').forEach(b=>{ b.dataset.playing='0'; b.textContent = '▶ ' + t('playConversation'); });
}


function navHTML(active){
  return `<nav class="nav">
    <button data-nav="learn" aria-current="${active==='learn'}"><span class="ni">📚</span>${t('learn')}</button>
    <button data-nav="talk" aria-current="${active==='talk'}"><span class="ni">🎤</span>${t('talk')}</button>
    <button data-nav="history" aria-current="${active==='history'}"><span class="ni">🕘</span>${t('history')}</button>
  </nav>`;
}
function wireNav(){ app.querySelectorAll('[data-nav]').forEach(b=> b.onclick=()=>{ stopVoice(); speechSynthesis.cancel(); const n=b.dataset.nav; go(n==='learn'?'home':n); }); }

/* ============================================================
   ADMIN
   ============================================================ */
function renderAdmin(){
  const c = state.config;
  app.innerHTML = headerHTML() + `
    <div class="main stack">
      <h2 style="margin:.1em 0">${t('adminTitle')}</h2>
      <div class="tabs" role="tablist">
        <button role="tab" data-tab="branding" aria-selected="${view.adminTab==='branding'}">${t('branding')}</button>
        <button role="tab" data-tab="content" aria-selected="${view.adminTab==='content'}">${t('content')}</button>
        <button role="tab" data-tab="students" aria-selected="${view.adminTab==='students'}">${t('students')}</button>
        <button role="tab" data-tab="voice" aria-selected="${view.adminTab==='voice'}">${t('voiceBot')}</button>
      </div>
      <div id="adminBody"></div>
    </div>`;
  wireHeader();
  app.querySelectorAll('[data-tab]').forEach(b=> b.onclick=()=>go('admin',{adminTab:b.dataset.tab}));
  if(view.adminTab==='content') renderAdminContent();
  else if(view.adminTab==='students') renderAdminStudents();
  else if(view.adminTab==='voice') renderAdminVoice();
  else renderAdminBranding();
}

function renderAdminBranding(){
  const c = state.config;
  const langOpts = LANGS.map(l=>`<option value="${l.code}" ${c.defaultLang===l.code?'selected':''}>${l.label}</option>`).join('');
  $('#adminBody').innerHTML = `
    <div class="card stack">
      <div class="row between" style="gap:.5em">
        <div style="min-width:0">
          <b>${t('syncNow')}</b>
          <div class="muted" style="font-size:.82em">${t('lastSync')}: ${c.lastSyncAt ? new Date(c.lastSyncAt).toLocaleString() : t('neverSynced')}</div>
        </div>
        <button class="btn accent sm" id="syncBtn">☁ ${t('syncNow')}</button>
      </div>
      <hr style="border:none;border-top:1.5px solid var(--line);margin:.2em 0">
      <label class="field"><span>${t('orgName')}</span><input type="text" id="f_org" value="${escA(c.orgName)}"></label>
      <label class="field"><span>${t('appName')}</span><input type="text" id="f_app" value="${escA(c.appName)}"></label>
      <label class="field"><span>${t('tagline')}</span><input type="text" id="f_tag" value="${escA(c.tagline)}"></label>
      <label class="field"><span>${t('logoEmoji')}</span><input type="text" id="f_logo" value="${escA(c.logo)}" maxlength="4" style="width:5em"></label>
      <div class="grid2">
        <div><span class="field" style="margin-bottom:.3em"><span>${t('primaryColor')}</span></span><div class="colorrow"><input type="color" id="f_pri" value="${c.primary}"><div class="swatch" id="sw_pri" style="background:${c.primary}"></div></div></div>
        <div><span class="field" style="margin-bottom:.3em"><span>${t('accentColor')}</span></span><div class="colorrow"><input type="color" id="f_acc" value="${c.accent}"><div class="swatch" id="sw_acc" style="background:${c.accent}"></div></div></div>
      </div>
      <label class="field row between" style="margin-top:.6em"><span>${t('darkMode')}</span><input type="checkbox" id="f_dark" ${c.dark?'checked':''} style="width:auto;transform:scale(1.4)"></label>
      <label class="field"><span>${t('defaultLanguage')}</span><select id="f_lang">${langOpts}</select></label>
      <label class="field"><span>${t('fontSize')}</span>
        <select id="f_fs"><option value="0.9" ${c.fontScale==0.9?'selected':''}>Small</option><option value="1" ${c.fontScale==1?'selected':''}>Normal</option><option value="1.15" ${c.fontScale==1.15?'selected':''}>Large</option><option value="1.3" ${c.fontScale==1.3?'selected':''}>Extra large</option></select></label>
      <hr style="border:none;border-top:1.5px solid var(--line)">
      <label class="field"><span>${t('webhook')}</span><input type="url" id="f_hook" value="${escA(c.webhook)}" placeholder="https://work.mantravat.cloud/webhook/...">
        <span class="hint">${t('webhookHint')}</span></label>
      <label class="field"><span>${t('changePass')}</span><input type="text" id="f_pass" value="${escA(c.adminPass)}"></label>
      <button class="btn block" id="saveBrand">💾 ${t('saveSettings')}</button>
    </div>`;
  const live=(id,prop,swId)=>{ const i=$('#'+id); i.oninput=()=>{ document.documentElement.style.setProperty(prop,i.value); if(swId)$('#'+swId).style.background=i.value; }; };
  live('f_pri','--primary','sw_pri'); live('f_acc','--accent','sw_acc');
  $('#syncBtn').onclick = async ()=>{
    if(!state.config.webhook){ toast(t('webhook')); return; }
    if(syncing) return;
    const btn = $('#syncBtn'); const old = btn.innerHTML; btn.innerHTML = '⟳ '+t('syncing'); btn.disabled = true;
    syncing = true;
    const r = await syncToWebhook('manual');
    syncing = false;
    btn.disabled = false; btn.innerHTML = old;
    toast(r.ok ? t('syncedOk') : t('syncedFail'));
    if(r.ok) renderAdminBranding();
  };
  $('#saveBrand').onclick = ()=>{
    Object.assign(state.config, {
      orgName:$('#f_org').value.trim()||'School', appName:$('#f_app').value.trim()||'Bhasha Setu',
      tagline:$('#f_tag').value.trim(), logo:$('#f_logo').value.trim()||'📖',
      primary:$('#f_pri').value, accent:$('#f_acc').value, dark:$('#f_dark').checked,
      defaultLang:$('#f_lang').value, fontScale:parseFloat($('#f_fs').value),
      webhook:$('#f_hook').value.trim(), adminPass:$('#f_pass').value||'admin'
    });
    persist(); applyTheme(); syncSoftColors(); toast(t('saved')); render();
  };
}

function renderAdminContent(){
  const f = view.filterCls;
  const filtered = f==='all' ? state.content : state.content.filter(l=>l.cls===f);
  const clsOpts = `<option value="all">${t('allClasses')}</option>` + Array.from({length:12},(_,i)=>`<option value="${i+1}" ${f==String(i+1)?'selected':''}>${t('classLabel')} ${i+1}</option>`).join('');
  const items = filtered.length ? filtered.map(l=>{
    const ico = l.kind==='youtube'?'▶️':(l.kind==='website'?'🔗':'📄');
    return `<div class="card row between" style="gap:.6em">
      <div class="row" style="gap:.6em;min-width:0"><span style="font-size:1.4em">${ico}</span>
        <div style="min-width:0"><b style="display:block;overflow:hidden;text-overflow:ellipsis">${escH(l.title)}</b>
        <span class="muted" style="font-size:.82em">${t('classLabel')} ${escH(l.cls)} · ${l.kind}</span></div></div>
      <div class="row" style="gap:.35em">
        <button class="btn ghost sm" data-edit="${l.id}">✏️</button>
        <button class="btn danger sm" data-del="${l.id}">🗑</button></div>
    </div>`;
  }).join('') : `<div class="card center muted">${t('noContent')}</div>`;
  $('#adminBody').innerHTML = `
    <div class="stack">
      <div class="row between">
        <select id="fltCls" class="chip" style="font-weight:700">${clsOpts}</select>
        <button class="btn accent sm" id="addBtn">＋ ${t('addLesson')}</button>
      </div>
      ${items}
    </div>`;
  $('#fltCls').onchange=e=>go('admin',{adminTab:'content', filterCls:e.target.value});
  $('#addBtn').onclick=()=>openLessonSheet(null);
  $('#adminBody').querySelectorAll('[data-edit]').forEach(b=> b.onclick=()=>openLessonSheet(b.dataset.edit));
  $('#adminBody').querySelectorAll('[data-del]').forEach(b=> b.onclick=()=>{ if(confirm(t('confirmDel'))){ state.content=state.content.filter(x=>x.id!==b.dataset.del); persist(); renderAdminContent(); } });
}

function openLessonSheet(id){
  const l = id ? state.content.find(x=>x.id===id) : { id:null, title:'', cls:'1', kind:'doc', reference:'', language:state.config.defaultLang };
  const clsOpts = Array.from({length:12},(_,i)=>`<option value="${i+1}" ${l.cls==String(i+1)?'selected':''}>${i+1}</option>`).join('');
  const langOpts = LANGS.map(x=>`<option value="${x.code}" ${l.language===x.code?'selected':''}>${x.label}</option>`).join('');
  const back = document.createElement('div'); back.className='backdrop';
  back.innerHTML = `<div class="sheet">
    <h3>${id?t('editLesson'):t('addLesson')}</h3>
    <label class="field"><span>${t('lTitle')}</span><input type="text" id="s_title" value="${escA(l.title)}"></label>
    <div class="grid2">
      <label class="field"><span>${t('lClass')}</span><select id="s_cls">${clsOpts}</select></label>
      <label class="field"><span>${t('lLang')}</span><select id="s_lang">${langOpts}</select></label>
    </div>
    <label class="field"><span>${t('lType')}</span>
      <select id="s_kind"><option value="doc" ${l.kind==='doc'?'selected':''}>${t('tDoc')}</option><option value="youtube" ${l.kind==='youtube'?'selected':''}>${t('tYoutube')}</option><option value="website" ${l.kind==='website'?'selected':''}>${t('tWebsite')}</option></select></label>
    <div id="s_refWrap"></div>
    <div class="row" style="gap:.5em;margin-top:.6em">
      <button class="btn ghost block" id="s_cancel">${t('cancel')}</button>
      <button class="btn block" id="s_save">💾 ${t('save')}</button>
    </div>
  </div>`;
  document.body.appendChild(back);
  const renderRef = ()=>{
    const k = $('#s_kind').value;
    $('#s_refWrap').innerHTML = (k==='doc')
      ? `<label class="field"><span>${t('lText')}</span><textarea id="s_ref">${escH(l.reference)}</textarea></label>`
      : `<label class="field"><span>${t('lUrl')}</span><input type="url" id="s_ref" value="${escA(l.reference)}" placeholder="https://..."></label>`;
  };
  renderRef();
  $('#s_kind').onchange = renderRef;
  back.addEventListener('click', e=>{ if(e.target===back){ speechSynthesis.cancel(); back.remove(); } });
  $('#s_cancel').onclick = ()=>back.remove();
  $('#s_save').onclick = ()=>{
    const title=$('#s_title').value.trim(); const ref=$('#s_ref').value.trim();
    if(!title) return toast(t('lTitle'));
    if(!ref) return toast(t('lText'));
    const data = { id:l.id||uid('les'), title, cls:$('#s_cls').value, kind:$('#s_kind').value, reference:ref, language:$('#s_lang').value };
    if(l.id){ const i=state.content.findIndex(x=>x.id===l.id); state.content[i]=data; } else state.content.push(data);
    persist(); back.remove(); toast(t('saved')); renderAdminContent();
  };
}

/* ---------- students management ---------- */
function genStudentId(cls){
  // e.g. C05-AB7K — short, easy to read aloud, hard to clash
  const letters='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I
  let s=''; for(let i=0;i<4;i++) s += letters[Math.floor(Math.random()*letters.length)];
  const id = 'C'+String(cls).padStart(2,'0')+'-'+s;
  return state.students.some(x=>x.loginId===id) ? genStudentId(cls) : id;
}
function genPassword(){
  const w=['sun','sky','tree','star','bird','river','moon','leaf','rain','fish','book','lion'];
  return w[Math.floor(Math.random()*w.length)] + Math.floor(100+Math.random()*900);
}

function renderAdminStudents(){
  const q = (view.stuQuery||'').toLowerCase();
  const f = view.stuFilterCls || 'all';
  const filtered = state.students.filter(s=>{
    if(f!=='all' && s.cls!==f) return false;
    if(q && !(s.name.toLowerCase().includes(q) || (s.loginId||'').toLowerCase().includes(q))) return false;
    return true;
  }).sort((a,b)=> (a.cls-b.cls) || a.name.localeCompare(b.name));
  const clsOpts = `<option value="all">${t('allClasses')}</option>` + Array.from({length:12},(_,i)=>`<option value="${i+1}" ${f==String(i+1)?'selected':''}>${t('classLabel')} ${i+1}</option>`).join('');
  const rows = filtered.length ? filtered.map(s=>`
    <div class="card stack" style="padding:.85em">
      <div class="row between" style="gap:.5em">
        <div style="min-width:0">
          <b style="display:block;overflow:hidden;text-overflow:ellipsis">${escH(s.name)}</b>
          <span class="muted" style="font-size:.82em">${t('classLabel')} ${escH(s.cls)} · <code style="font-family:ui-monospace,Menlo,monospace">${escH(s.loginId||'')}</code></span>
        </div>
        <div class="row" style="gap:.35em">
          <button class="btn ghost sm" data-edit="${s.id}" aria-label="${escA(t('edit'))}">✏️</button>
          <button class="btn danger sm" data-del="${s.id}" aria-label="${escA(t('delete'))}">🗑</button>
        </div>
      </div>
      <div class="row" style="gap:.4em;flex-wrap:wrap">
        <span class="pill">🔑 ${escH(s.password||'')}</span>
        <button class="btn ghost sm" data-copy="${s.id}">📋 ${t('copyCreds')}</button>
        <button class="btn ghost sm" data-reset="${s.id}">↻ ${t('resetPass')}</button>
        <button class="btn ghost sm" data-print="${s.id}">🖨 ${t('printCard')}</button>
      </div>
    </div>`).join('') : `<div class="card center muted">${t('noStudents')}</div>`;

  $('#adminBody').innerHTML = `
    <div class="stack">
      <div class="row between" style="gap:.5em">
        <select id="stuFltCls" class="chip" style="font-weight:700">${clsOpts}</select>
        <button class="btn accent sm" id="stuAdd">＋ ${t('addStudent')}</button>
      </div>
      <input type="text" id="stuSearch" placeholder="${escA(t('search'))}" value="${escA(view.stuQuery||'')}">
      ${rows}
    </div>`;
  $('#stuFltCls').onchange = e => go('admin',{adminTab:'students', stuFilterCls:e.target.value, stuQuery:view.stuQuery});
  const sb = $('#stuSearch');
  sb.addEventListener('input', e=>{ view.stuQuery = e.target.value; renderAdminStudents(); });
  // keep caret position on re-render
  setTimeout(()=>{ const el=$('#stuSearch'); if(el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 0);
  $('#stuAdd').onclick = ()=>openStudentSheet(null);
  $('#adminBody').querySelectorAll('[data-edit]').forEach(b=> b.onclick=()=>openStudentSheet(b.dataset.edit));
  $('#adminBody').querySelectorAll('[data-del]').forEach(b=> b.onclick=()=>{
    if(!confirm(t('confirmDelStu'))) return;
    const id=b.dataset.del;
    state.students = state.students.filter(x=>x.id!==id);
    state.history  = state.history.filter(h=>h.studentId!==id);
    persist(); renderAdminStudents();
  });
  $('#adminBody').querySelectorAll('[data-reset]').forEach(b=> b.onclick=()=>{
    const s = state.students.find(x=>x.id===b.dataset.reset); if(!s) return;
    s.password = genPassword(); persist(); toast(t('saved')); renderAdminStudents();
  });
  $('#adminBody').querySelectorAll('[data-copy]').forEach(b=> b.onclick=async ()=>{
    const s = state.students.find(x=>x.id===b.dataset.copy); if(!s) return;
    const txt = `${state.config.appName||'Bhasha Setu'} — ${state.config.orgName||''}\n${t('studentId')}: ${s.loginId}\n${t('password')}: ${s.password}\n${t('classLabel')}: ${s.cls}`;
    try{ await navigator.clipboard.writeText(txt); toast(t('credCopied')); }
    catch(e){ prompt(t('copyCreds'), txt); }
  });
  $('#adminBody').querySelectorAll('[data-print]').forEach(b=> b.onclick=()=>printCard(b.dataset.print));
}

function openStudentSheet(id){
  const s = id ? state.students.find(x=>x.id===id) : { id:null, name:'', cls:'1', loginId:'', password:'' };
  if(!id){ s.loginId = genStudentId(s.cls); s.password = genPassword(); }
  const clsOpts = Array.from({length:12},(_,i)=>`<option value="${i+1}" ${s.cls==String(i+1)?'selected':''}>${i+1}</option>`).join('');
  const back = document.createElement('div'); back.className='backdrop';
  back.innerHTML = `<div class="sheet">
    <h3>${id?t('editStudent'):t('addStudent')}</h3>
    <label class="field"><span>${t('yourName')}</span><input type="text" id="ss_name" value="${escA(s.name)}" autocomplete="off"></label>
    <label class="field"><span>${t('lClass')}</span><select id="ss_cls">${clsOpts}</select></label>
    <label class="field">
      <span>${t('studentId')} <span class="hint">${id?'':'· '+t('generatedId')}</span></span>
      <div class="row" style="gap:.4em"><input type="text" id="ss_id" value="${escA(s.loginId)}" autocapitalize="characters" style="font-family:ui-monospace,Menlo,monospace;letter-spacing:.04em">
        <button class="btn ghost sm" id="ss_regenId" type="button" title="${escA(t('regenerate'))}">↻</button></div>
    </label>
    <label class="field"><span>${t('password')}</span>
      <div class="row" style="gap:.4em"><input type="text" id="ss_pass" value="${escA(s.password)}">
        <button class="btn ghost sm" id="ss_regenPw" type="button" title="${escA(t('regenerate'))}">↻</button></div>
    </label>
    <div class="row" style="gap:.5em;margin-top:.6em">
      <button class="btn ghost block" id="ss_cancel">${t('cancel')}</button>
      <button class="btn block" id="ss_save">💾 ${t('save')}</button>
    </div>
  </div>`;
  document.body.appendChild(back);
  back.addEventListener('click', e=>{ if(e.target===back) back.remove(); });
  $('#ss_cancel').onclick = ()=>back.remove();
  $('#ss_cls').onchange = ()=>{ if(!id) $('#ss_id').value = genStudentId($('#ss_cls').value); };
  $('#ss_regenId').onclick = ()=> $('#ss_id').value = genStudentId($('#ss_cls').value);
  $('#ss_regenPw').onclick = ()=> $('#ss_pass').value = genPassword();
  $('#ss_save').onclick = ()=>{
    const name=$('#ss_name').value.trim();
    const cls=$('#ss_cls').value;
    const loginId=($('#ss_id').value||'').trim().toUpperCase();
    const password=$('#ss_pass').value;
    if(!name) return toast(t('needName'));
    if(!loginId || !password) return toast(t('wrongLogin'));
    const clash = state.students.find(x=>x.loginId===loginId && x.id!==(s.id||''));
    if(clash) return toast(t('studentId')+' ✗');
    if(id){ Object.assign(s, {name, cls, loginId, password}); }
    else { state.students.push({ id:uid('stu'), name, cls, loginId, password, created:Date.now() }); }
    persist(); back.remove(); toast(t('saved')); renderAdminStudents();
  };
}

function printCard(id){
  const s = state.students.find(x=>x.id===id); if(!s) return;
  const c = state.config;
  const w = window.open('', '_blank', 'width=420,height=560');
  if(!w){ toast('Pop-up blocked'); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escH(s.name)} — login</title>
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;color:#2A2118}
      .card{border:2px dashed ${c.primary};border-radius:18px;padding:22px;max-width:340px;margin:0 auto}
      h1{margin:0 0 4px;font-size:20px;color:${c.primary}}
      .row{display:flex;justify-content:space-between;margin:10px 0;padding:8px 12px;background:#FBF6EC;border-radius:10px}
      .row b{font-family:ui-monospace,Menlo,monospace;font-size:18px}
      .muted{color:#6E6457;font-size:13px;margin:0}
      .foot{margin-top:14px;text-align:center;font-size:12px;color:#6E6457}
      @media print{ body{padding:0} .card{border-style:solid} }
    </style></head><body>
    <div class="card">
      <div style="font-size:28px;text-align:center">${escH(c.logo||'📖')}</div>
      <h1 style="text-align:center">${escH(c.appName||'Bhasha Setu')}</h1>
      <p class="muted" style="text-align:center">${escH(c.orgName||'')}</p>
      <hr style="border:none;border-top:1px solid #EadFce;margin:14px 0">
      <p class="muted">${escH(t('yourName'))}</p><div class="row"><span></span><b>${escH(s.name)}</b></div>
      <p class="muted">${escH(t('classLabel'))}</p><div class="row"><span></span><b>${escH(s.cls)}</b></div>
      <p class="muted">${escH(t('studentId'))}</p><div class="row"><span></span><b>${escH(s.loginId)}</b></div>
      <p class="muted">${escH(t('password'))}</p><div class="row"><span></span><b>${escH(s.password)}</b></div>
      <p class="foot">${new Date().toLocaleDateString()}</p>
    </div>
    <script>setTimeout(()=>window.print(),300)<\/script>
  </body></html>`);
  w.document.close();
}

function renderAdminVoice(){
  const f = view.voiceFilterCls || 'all';
  const filtered = f==='all' ? state.voiceAgent : state.voiceAgent.filter(d=>d.cls===f);
  const clsOpts = `<option value="all">${t('allClasses')}</option>` + Array.from({length:12},(_,i)=>`<option value="${i+1}" ${f==String(i+1)?'selected':''}>${t('classLabel')} ${i+1}</option>`).join('');
  const items = filtered.length ? filtered.slice().sort((a,b)=>a.cls-b.cls).map(d=>{
    const langLabel = (LANGS.find(x=>x.code===d.language)||{}).label||'';
    const kind = d.kind||'doc';
    const ico = kind==='youtube'?'▶️':(kind==='website'?'🔗':'📄');
    const ref = d.reference||'';
    const preview = (kind==='doc' ? ref.slice(0,120) : ref).replace(/\s+/g,' ');
    const meta = kind==='doc' ? `${ref.length} chars` : kind;
    return `<div class="card stack" style="padding:.85em">
      <div class="row between" style="gap:.5em">
        <div style="min-width:0">
          <b style="display:block;overflow:hidden;text-overflow:ellipsis">${ico} ${escH(d.title)}</b>
          <span class="muted" style="font-size:.82em">${t('classLabel')} ${escH(d.cls)} · ${escH(langLabel)} · ${escH(meta)}</span>
        </div>
        <div class="row" style="gap:.35em">
          <button class="btn ghost sm" data-vedit="${d.id}">✏️</button>
          <button class="btn danger sm" data-vdel="${d.id}">🗑</button>
        </div>
      </div>
      <p class="muted" style="font-size:.85em;margin:0;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escH(preview)}${(kind==='doc' && ref.length>120)?'…':''}</p>
    </div>`;
  }).join('') : `<div class="card center muted">${t('noVoiceDocs')}</div>`;
  $('#adminBody').innerHTML = `
    <div class="stack">
      <p class="muted" style="margin:.1em 0 .3em;font-size:.9em">${t('voiceFlowHint')}</p>
      <div class="row between">
        <select id="voiceFltCls" class="chip" style="font-weight:700">${clsOpts}</select>
        <button class="btn accent sm" id="voiceAddBtn">＋ ${t('addVoiceDoc')}</button>
      </div>
      ${items}
    </div>`;
  $('#voiceFltCls').onchange = e=>go('admin',{adminTab:'voice', voiceFilterCls:e.target.value});
  $('#voiceAddBtn').onclick = ()=>openVoiceSheet(null);
  $('#adminBody').querySelectorAll('[data-vedit]').forEach(b=> b.onclick=()=>openVoiceSheet(b.dataset.vedit));
  $('#adminBody').querySelectorAll('[data-vdel]').forEach(b=> b.onclick=()=>{
    if(!confirm(t('confirmDel'))) return;
    state.voiceAgent = state.voiceAgent.filter(x=>x.id!==b.dataset.vdel);
    persist(); renderAdminVoice();
  });
}

function openVoiceSheet(id){
  const d = id ? state.voiceAgent.find(x=>x.id===id)
              : { id:null, cls:'1', kind:'doc', title:'', reference:'', language:state.config.defaultLang };
  const clsOpts = Array.from({length:12},(_,i)=>`<option value="${i+1}" ${d.cls==String(i+1)?'selected':''}>${i+1}</option>`).join('');
  const langOpts = LANGS.map(x=>`<option value="${x.code}" ${d.language===x.code?'selected':''}>${x.label}</option>`).join('');
  const back = document.createElement('div'); back.className='backdrop';
  back.innerHTML = `<div class="sheet">
    <h3>${id?t('editVoiceDoc'):t('addVoiceDoc')}</h3>
    <p class="muted" style="margin:.1em 0 .8em;font-size:.85em">${t('voiceFlowHint')}</p>
    <label class="field"><span>${t('lTitle')}</span><input type="text" id="v_title" value="${escA(d.title)}" placeholder="${escA(t('voiceFlow'))}"></label>
    <div class="grid2">
      <label class="field"><span>${t('lClass')}</span><select id="v_cls">${clsOpts}</select></label>
      <label class="field"><span>${t('lLang')}</span><select id="v_lang">${langOpts}</select></label>
    </div>
    <label class="field"><span>${t('lType')}</span>
      <select id="v_kind">
        <option value="doc" ${d.kind==='doc'?'selected':''}>${t('tDoc')}</option>
        <option value="youtube" ${d.kind==='youtube'?'selected':''}>${t('tYoutube')}</option>
        <option value="website" ${d.kind==='website'?'selected':''}>${t('tWebsite')}</option>
      </select></label>
    <div id="v_refWrap"></div>
    <div class="row" style="gap:.5em;margin-top:.6em">
      <button class="btn ghost block" id="v_cancel">${t('cancel')}</button>
      <button class="btn block" id="v_save">💾 ${t('save')}</button>
    </div>
  </div>`;
  document.body.appendChild(back);

  const renderRef = ()=>{
    const k = $('#v_kind').value;
    if(k==='doc'){
      $('#v_refWrap').innerHTML = `
        <div class="field">
          <span>${t('uploadFile')} <span class="hint">· ${t('fileType')}</span></span>
          <div class="filepick"><input type="file" id="v_file" accept=".txt,.md,text/plain,text/markdown"><span class="muted" id="v_fileInfo" style="font-size:.8em"></span></div>
        </div>
        <label class="field"><span>${t('lText')} <span class="hint">${t('orPaste')}</span></span>
          <textarea id="v_ref" style="min-height:160px">${escH(d.reference||'')}</textarea>
        </label>`;
      $('#v_file').addEventListener('change', async e=>{
        const f = e.target.files[0]; if(!f) return;
        if(f.size > 1024*1024){ toast(t('fileType')); return; }
        try{
          const txt = await f.text();
          const cur = $('#v_ref').value;
          $('#v_ref').value = cur ? (cur + '\n\n' + txt) : txt;
          $('#v_fileInfo').textContent = f.name + ' · ' + Math.round(f.size/1024) + ' KB';
          if(!$('#v_title').value) $('#v_title').value = f.name.replace(/\.[^.]+$/,'');
        }catch(err){ toast(String(err.message||err)); }
      });
    } else {
      $('#v_refWrap').innerHTML = `<label class="field"><span>${t('lUrl')}</span>
        <input type="url" id="v_ref" value="${escA(d.reference||'')}" placeholder="https://..."></label>`;
    }
  };
  renderRef();
  $('#v_kind').onchange = renderRef;

  back.addEventListener('click', e=>{ if(e.target===back) back.remove(); });
  $('#v_cancel').onclick = ()=>back.remove();
  $('#v_save').onclick = ()=>{
    const title = $('#v_title').value.trim();
    const kind  = $('#v_kind').value;
    const reference = ($('#v_ref').value||'').trim();
    if(!title) return toast(t('lTitle'));
    if(!reference) return toast(kind==='doc' ? t('lText') : t('lUrl'));
    const rec = { id: d.id||uid('vag'), cls:$('#v_cls').value, kind, language:$('#v_lang').value, title, reference };
    if(d.id){ const i=state.voiceAgent.findIndex(x=>x.id===d.id); state.voiceAgent[i]=rec; }
    else state.voiceAgent.push(rec);
    persist(); back.remove(); toast(t('saved')); renderAdminVoice();
  };
}


document.addEventListener('click', e=>{
  const rd = e.target.closest('.rd');
  if(rd){ speak(rd.dataset.text, rd.dataset.lang, rd); return; }
  const sp = e.target.closest('[data-speak]');
  if(sp){ speak(sp.dataset.speak, sp.dataset.lang, null); }
});

applyTheme(); syncSoftColors(); render();

  }

  g.JM = g.JM || {};
  g.JM.Modules = g.JM.Modules || {};
  g.JM.Modules['bhashaS'] = { mount: mount, unmount: function(c){ if(c) c.innerHTML = ''; } };
})(window);
