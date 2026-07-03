/**
 * ui/screens/LangPicker.js — Language selection modal.
 * Replaces openLangPicker(). closeLangPicker() updated to call closeAnyModal().
 * CSS injected lazily in afterMount (#jmLangPickCss).
 */
JM.Screens.register({
  id: 'lang-picker',
  title: '🌐 Language / भाषा',
  surface: 'modal',
  model: JM.Models.LangPicker,
  render: function () {
    var cur = localStorage.getItem('jm_lang') || 'en';
    var langs = (typeof JM_LANGS !== 'undefined' ? JM_LANGS : []);
    return '<div class="lang-grid">'
      + langs.map(function (l) {
          return '<div class="lang-tile ' + (cur === l.c ? 'active' : '') + '"'
            + ' onclick="setLang(\'' + l.c + '\');closeLangPicker()">'
            + '<div class="lt-native">' + l.n + '</div>'
            + '<div class="lt-en">' + l.e + '</div>'
            + '</div>';
        }).join('')
      + '</div>';
  },
  afterMount: function () {
    if (!document.getElementById('jmLangPickCss')) {
      var s = document.createElement('style');
      s.id = 'jmLangPickCss';
      s.textContent = '.lang-curr-btn:hover{border-color:var(--jm-primary)!important;color:var(--jm-primary)!important}'
        + '.lang-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:4px 0}'
        + '.lang-tile{padding:12px 8px;border:1.5px solid var(--jm-border);border-radius:12px;cursor:pointer;text-align:center;background:var(--jm-surface);color:var(--jm-text);transition:.15s}'
        + '.lang-tile:hover{border-color:var(--jm-primary);background:var(--jm-primary-tint)}'
        + '.lang-tile.active{border-color:var(--jm-primary);background:var(--jm-primary);color:#fff}'
        + '.lt-native{font-size:15px;font-weight:700;line-height:1.2;margin-bottom:2px}'
        + '.lt-en{font-size:10px;opacity:.78}'
        + '@media(max-width:480px){.lang-grid{grid-template-columns:1fr 1fr}}';
      document.head.appendChild(s);
    }
  }
});
