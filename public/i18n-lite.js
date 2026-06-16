// ============================================================
// JeetMantra i18n-lite — drop-in runtime localizer for any page.
// • Auto-injects a floating 🌐 language button (top-right) that opens a
//   12-language tile-grid picker.
// • Walks the DOM after language change and translates every visible string +
//   placeholder/title/aria-label via POST /api/ai/translate, observing further
//   DOM mutations so dynamic content also gets translated.
// • Caches translations per-user in localStorage so subsequent loads are
//   instant. Restores original English on switching back.
// • Skips inputs, contenteditable, code/pre, SVG, options, and any element
//   with `.no-i18n` (or an ancestor with it).
// • RTL languages flip `<html dir="rtl">`.
//
// Include with:
//   <script src="/i18n-lite.js" defer></script>
// No other markup is required. The dashboard has its own (richer) engine
// already wired — this file is for every other page.
// ============================================================
(function(){
  'use strict';
  if (window.__jmI18nLite) return; window.__jmI18nLite = true;

  // 12 languages — same shape as the dashboard's JM_LANGS.
  const JM_LANGS = [
    {c:'en', n:'English',  e:'English',   bcp:'en-IN', dir:'ltr'},
    {c:'hi', n:'हिन्दी',    e:'Hindi',     bcp:'hi-IN', dir:'ltr'},
    {c:'bn', n:'বাংলা',     e:'Bengali',   bcp:'bn-IN', dir:'ltr'},
    {c:'te', n:'తెలుగు',    e:'Telugu',    bcp:'te-IN', dir:'ltr'},
    {c:'mr', n:'मराठी',     e:'Marathi',   bcp:'mr-IN', dir:'ltr'},
    {c:'ta', n:'தமிழ்',     e:'Tamil',     bcp:'ta-IN', dir:'ltr'},
    {c:'gu', n:'ગુજરાતી',   e:'Gujarati',  bcp:'gu-IN', dir:'ltr'},
    {c:'kn', n:'ಕನ್ನಡ',     e:'Kannada',   bcp:'kn-IN', dir:'ltr'},
    {c:'ml', n:'മലയാളം',    e:'Malayalam', bcp:'ml-IN', dir:'ltr'},
    {c:'pa', n:'ਪੰਜਾਬੀ',   e:'Punjabi',   bcp:'pa-IN', dir:'ltr'},
    {c:'or', n:'ଓଡ଼ିଆ',     e:'Odia',      bcp:'or-IN', dir:'ltr'},
    {c:'ur', n:'اردو',     e:'Urdu',      bcp:'ur-IN', dir:'rtl'}
  ];
  const SET = new Set(JM_LANGS.map(l => l.c));

  // ── Per-user translation cache (localStorage; survives reloads) ──
  let cache = {}; try { cache = JSON.parse(localStorage.getItem('jm_i18n_cache') || '{}') || {}; } catch(e){}
  // Merge the baked-in seed dictionary (~120 common UI labels × 12 languages)
  // so the UI translates INSTANTLY on language switch with no API call.
  // Anything the user has already paid to translate (in localStorage) wins
  // over the seed; the seed wins over an empty cache.
  if (window.JM_I18N_SEED){
    for (const code in window.JM_I18N_SEED){
      cache[code] = cache[code] || {};
      const sd = window.JM_I18N_SEED[code];
      for (const k in sd){ if (cache[code][k] == null) cache[code][k] = sd[k]; }
    }
  }
  let saveT = null;
  function saveCache(){ clearTimeout(saveT); saveT = setTimeout(() => {
    try { localStorage.setItem('jm_i18n_cache', JSON.stringify(cache)); } catch(e){}
  }, 600); }

  // ── DOM walker rules ─────────────────────────────────────────────
  let applying = false;            // suppress observer during our own writes
  const SKIP_TAG = /^(SCRIPT|STYLE|NOSCRIPT|CODE|PRE|TEXTAREA|INPUT|SELECT|SVG|CANVAS|OPTION|META|LINK|TITLE)$/;
  const ATTRS = ['placeholder', 'title', 'aria-label'];

  function skip(el){
    for (let p = el; p && p !== document.body; p = p.parentElement){
      if (SKIP_TAG.test(p.tagName)) return true;
      if (p.isContentEditable) return true;
      if (p.classList && p.classList.contains('no-i18n')) return true;
    }
    return false;
  }

  function translatable(s){
    if (!s) return false;
    const t = s.trim();
    if (t.length < 2) return false;
    // need >=2 Latin letters → English source content (skip already-translated
    // text + symbols/digits/non-Latin)
    if (((t.match(/[A-Za-z]/g) || []).length) < 2) return false;
    if (/^[\d\s.,:%/()+\-_#*•|]+$/.test(t)) return false;
    if (/^https?:\/\//i.test(t) || /^[\w.+\-]+@[\w.\-]+$/.test(t)) return false;
    return true;
  }

  function collect(root, code){
    const cc = cache[code] || (cache[code] = {});
    const need = new Set();
    const appliers = [];
    const push = (key, apply) => {
      const tr = cc[key];
      if (tr != null) apply(tr);
      else { need.add(key); appliers.push({key, apply}); }
    };
    // text nodes
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n){
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (n.parentElement && skip(n.parentElement)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = tw.nextNode())){
      const orig = (n.__i18nOrig != null) ? n.__i18nOrig : n.nodeValue;
      // Find the first and last letter so leading/trailing emoji, arrows,
      // bullets, separators and stray punctuation are treated as decoration
      // and don't block a seed-dict match. E.g. "Continue →" → key "Continue".
      let first = -1, last = -1;
      try {
        const m = orig.match(/\p{L}/u);
        if (m){ first = m.index; }
        if (first >= 0){
          for (let i = orig.length - 1; i >= first; i--){ try { if (/\p{L}/u.test(orig[i])){ last = i; break; } } catch(e){ break; } }
        }
      } catch(e){
        // Older engines without /u\p{L}/ support — fall back to whitespace-only stripping.
        const pre0 = (orig.match(/^\s*/) || [''])[0];
        const post0 = (orig.match(/\s*$/) || [''])[0];
        first = pre0.length; last = orig.length - post0.length - 1;
      }
      if (first < 0 || last < first) continue;
      const pre = orig.slice(0, first), post = orig.slice(last + 1);
      const key = orig.slice(first, last + 1);
      if (!translatable(key)) continue;
      n.__i18nOrig = orig;
      const node = n;
      push(key, tr => { const out = pre + tr + post; if (node.nodeValue !== out) node.nodeValue = out; });
    }
    // translatable attributes
    if (root.querySelectorAll){
      const sel = '[' + ATTRS.join('],[') + ']';
      const els = (root.matches && root.matches(sel)) ? [root, ...root.querySelectorAll(sel)] : [...root.querySelectorAll(sel)];
      els.forEach(el => {
        if (skip(el)) return;
        ATTRS.forEach(a => {
          if (!el.hasAttribute(a)) return;
          const store = '__i18nA_' + a;
          const orig = (el[store] != null) ? el[store] : el.getAttribute(a);
          if (orig == null) return;
          const key = orig.trim();
          if (!translatable(key)) return;
          el[store] = orig;
          push(key, tr => { el.setAttribute(a, orig.replace(key, tr)); });
        });
      });
    }
    return { need, appliers, cc };
  }

  function restore(root){
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let n; while ((n = tw.nextNode())){ if (n.__i18nOrig != null && n.nodeValue !== n.__i18nOrig) n.nodeValue = n.__i18nOrig; }
    if (root.querySelectorAll) root.querySelectorAll('*').forEach(el => {
      ATTRS.forEach(a => { const store = '__i18nA_' + a; if (el[store] != null && el.getAttribute(a) !== el[store]) el.setAttribute(a, el[store]); });
    });
  }

  let warned = false;
  async function autoTranslate(root){
    root = root || document.body;
    const code = localStorage.getItem('jm_lang') || 'en';
    if (!SET.has(code)) return;
    if (code === 'en'){ applying = true; try { restore(root); } finally { applying = false; if (obs){ try{ obs.takeRecords(); }catch(e){} } } return; }
    let need, appliers, cc;
    applying = true;
    try { ({ need, appliers, cc } = collect(root, code)); } finally { applying = false; }
    if (!need.size) return;
    const tok = localStorage.getItem('jm_token');
    if (!tok) return;                                // require auth to call /api/ai/translate
    const list = [...need].slice(0, 240);            // bound first-load cost; observer handles the rest
    for (let i = 0; i < list.length; i += 60){
      const batch = list.slice(i, i + 60);
      let map = null;
      try {
        const r = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok },
          body: JSON.stringify({ q: batch, target: code, source: 'en' })
        });
        map = (await r.json()).map;
      } catch (e){ map = null; }
      if (!map){ if (!warned){ warned = true; console.warn('JM i18n: translation service unavailable — staying in source language.'); } continue; }
      let changed = false;
      for (const k in map){ if (map[k] != null){ cc[k] = map[k]; changed = true; } }
      if (changed) saveCache();
    }
    applying = true;
    try { for (const ap of appliers){ const tr = cc[ap.key]; if (tr != null) ap.apply(tr); } }
    finally { if (obs){ try { obs.takeRecords(); } catch(e){} } applying = false; }
  }

  // ── MutationObserver: translate dynamic content as it appears ───────
  let obs = null;
  const q = new Set();
  let qT = null;
  function installObs(){
    if (obs) return;
    obs = new MutationObserver(muts => {
      const code = localStorage.getItem('jm_lang') || 'en';
      if (code === 'en' || !SET.has(code)) return;
      if (applying) return;
      for (const m of muts){
        m.addedNodes && m.addedNodes.forEach(nd => {
          if (nd.nodeType === 1) q.add(nd);
          else if (nd.nodeType === 3 && nd.parentElement) q.add(nd.parentElement);
        });
        if (m.type === 'characterData' && m.target && m.target.parentElement && translatable(m.target.nodeValue || '')) q.add(m.target.parentElement);
      }
      if (!q.size) return;
      clearTimeout(qT);
      qT = setTimeout(() => { const ns = [...q]; q.clear(); ns.forEach(nd => { if (nd.isConnected) autoTranslate(nd); }); }, 350);
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  // ── Public setLang ───────────────────────────────────────────────
  function setLang(code){
    if (!SET.has(code)) code = 'en';
    localStorage.setItem('jm_lang', code);
    const meta = JM_LANGS.find(l => l.c === code) || JM_LANGS[0];
    document.documentElement.lang = code;
    document.documentElement.dir = meta.dir || 'ltr';
    // Update label on floating button (if it's the one we injected) or any
    // host-page button using the same id.
    const lbl = document.getElementById('langCurrNative');
    if (lbl) lbl.textContent = meta.n;
    installObs();
    autoTranslate(document.body);
  }

  // ── Picker UI ────────────────────────────────────────────────────
  function ensureCss(){
    if (document.getElementById('jmLangLiteCss')) return;
    const s = document.createElement('style'); s.id = 'jmLangLiteCss';
    s.textContent = `
      .jm-lang-fab{position:fixed;top:14px;right:14px;z-index:10000;display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border:1px solid rgba(124,58,237,.55);border-radius:10px;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#1a1a22;font-weight:700;font-size:12px;cursor:pointer;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;box-shadow:0 2px 12px rgba(0,0,0,.10);transition:transform .15s,box-shadow .15s,border-color .15s}
      .jm-lang-fab:hover{border-color:#7c3aed;color:#7c3aed;transform:translateY(-1px);box-shadow:0 4px 16px rgba(124,58,237,.22)}
      .jm-lang-fab:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
      @media (max-width:600px){.jm-lang-fab{top:10px;right:10px;font-size:11px;padding:5px 10px}}
      @media (prefers-color-scheme:dark){.jm-lang-fab{background:rgba(20,20,30,.88);color:#ececf5;border-color:rgba(167,139,250,.55)}.jm-lang-fab:hover{color:#a78bfa;border-color:#a78bfa}}
      .jm-lpov{position:fixed;inset:0;z-index:10040;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;padding:48px 16px;overflow-y:auto;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
      .jm-lpm{background:#fff;color:#1a1a22;border-radius:18px;width:100%;max-width:480px;box-shadow:0 12px 40px rgba(0,0,0,.32);animation:jmLpRise .22s cubic-bezier(.2,.9,.3,1)}
      @media (prefers-color-scheme:dark){.jm-lpm{background:#14141f;color:#ececf5}.jm-lph{border-bottom-color:#262636}.jm-lpt{border-color:#262636;background:#181826;color:#ececf5}.jm-lpt:hover{background:rgba(167,139,250,.12)}}
      @keyframes jmLpRise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      .jm-lph{padding:14px 18px;border-bottom:1px solid #e4e2dc;display:flex;align-items:center;justify-content:space-between}
      .jm-lph h3{font-size:16px;margin:0;font-weight:700}
      .jm-lpc{width:32px;height:32px;border-radius:8px;background:transparent;border:none;color:inherit;font-size:18px;cursor:pointer;opacity:.7}
      .jm-lpc:hover{opacity:1;background:rgba(0,0,0,.06)}
      .jm-lpg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:14px}
      .jm-lpt{padding:12px 8px;border:1.5px solid #e4e2dc;border-radius:12px;cursor:pointer;text-align:center;background:#fff;color:#1a1a22;transition:.15s;font-family:inherit}
      .jm-lpt:hover{border-color:#7c3aed;background:rgba(124,58,237,.06)}
      .jm-lpt.active{border-color:#7c3aed;background:#7c3aed;color:#fff}
      .jm-lpt-n{font-size:15px;font-weight:700;line-height:1.2;margin-bottom:2px}
      .jm-lpt-e{font-size:10px;opacity:.78}
      @media (max-width:420px){.jm-lpg{grid-template-columns:1fr 1fr}}
    `;
    document.head.appendChild(s);
  }

  function openLangPicker(){
    ensureCss();
    closeLangPicker();
    const cur = localStorage.getItem('jm_lang') || 'en';
    const ov = document.createElement('div'); ov.className = 'jm-lpov no-i18n'; ov.id = 'jmLpOv';
    const tiles = JM_LANGS.map(l =>
      `<button class="jm-lpt ${cur === l.c ? 'active' : ''}" data-code="${l.c}"><div class="jm-lpt-n">${l.n}</div><div class="jm-lpt-e">${l.e}</div></button>`
    ).join('');
    ov.innerHTML = `<div class="jm-lpm" onclick="event.stopPropagation()">
      <div class="jm-lph"><h3>🌐 Language / भाषा</h3><button class="jm-lpc" aria-label="Close">✕</button></div>
      <div class="jm-lpg">${tiles}</div>
    </div>`;
    // listeners (no inline handlers → strict CSP-friendly)
    ov.addEventListener('click', ev => { if (ev.target === ov) closeLangPicker(); });
    ov.querySelector('.jm-lpc').addEventListener('click', closeLangPicker);
    ov.querySelectorAll('.jm-lpt').forEach(b => {
      b.addEventListener('click', () => { setLang(b.dataset.code); closeLangPicker(); });
    });
    document.body.appendChild(ov);
  }
  function closeLangPicker(){ const o = document.getElementById('jmLpOv'); if (o) o.remove(); }

  // ── Floating language button (skipped if host page already has one) ──
  function injectFab(){
    if (document.getElementById('langCurrBtn')) return;             // host already provides one
    const cur = localStorage.getItem('jm_lang') || 'en';
    const meta = JM_LANGS.find(l => l.c === cur) || JM_LANGS[0];
    const btn = document.createElement('button');
    btn.id = 'langCurrBtn'; btn.className = 'jm-lang-fab no-i18n';
    btn.title = 'Language / भाषा';
    btn.innerHTML = `<span id="langCurrNative">${meta.n}</span> 🌐`;
    btn.addEventListener('click', openLangPicker);
    ensureCss();
    document.body.appendChild(btn);
  }

  // ── Init ─────────────────────────────────────────────────────────
  function init(){
    injectFab();
    const saved = localStorage.getItem('jm_lang') || 'en';
    setLang(saved);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // ── Public API ───────────────────────────────────────────────────
  window.JM_LANGS = window.JM_LANGS || JM_LANGS;
  window.setLang = window.setLang || setLang;
  window.openLangPicker = window.openLangPicker || openLangPicker;
  window.closeLangPicker = window.closeLangPicker || closeLangPicker;
  window.autoTranslate = window.autoTranslate || autoTranslate;
})();
