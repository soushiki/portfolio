/* Motion button: switches full/calm animations at runtime. The mode itself is decided in the <head> script
   of index.html (?motion= > localStorage 'p2d-motion' > OS setting) and shown as html.motion-calm. */
(function () {
  'use strict';
  var root = document.documentElement, btn = null;
  var EN = { full: 'Motion: full', calm: 'Motion: calm', help: 'Switch between full and calm animations' };
  function t(k) { return window.I18N ? window.I18N.t('motion.' + k, EN[k]) : EN[k]; }
  function render() {
    if (!btn) return;
    var calm = root.classList.contains('motion-calm');
    btn.textContent = t(calm ? 'calm' : 'full');
    btn.setAttribute('aria-pressed', calm ? 'false' : 'true');
    btn.title = t('help');
  }
  function init() {
    var lang = document.querySelector('.nav-links .lang-toggle');
    if (!lang) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'motion-toggle';
    btn.addEventListener('click', function () {
      var calm = !root.classList.contains('motion-calm');
      root.classList.toggle('motion-calm', calm);
      try { localStorage.setItem('p2d-motion', calm ? 'calm' : 'full'); } catch (e) {}
      window.__motion = { mode: calm ? 'calm' : 'full', source: 'saved' };
      render();
    });
    lang.parentNode.insertBefore(btn, lang.nextSibling);
    render();
    if (window.I18N) window.I18N.onChange(render);
  }
  // i18n.js (deferred, loaded first) creates the lang toggle on DOMContentLoaded; run after it.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
