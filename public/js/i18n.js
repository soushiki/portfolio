/* Tiny dependency-free i18n helper. English = the page's original markup.
   Spanish dictionary: window.I18N_ES = { key: "texto" }.
   Attributes: data-i18n (textContent), data-i18n-html (innerHTML, authored strings only),
   data-i18n-attr="aria-label:key;href:key2". Keys "meta.title" / "meta.description" update <title>/meta. */
(function () {
  'use strict';
  var dict = window.I18N_ES || {};
  var originals = new WeakMap();
  var listeners = [];

  function detect() {
    var m = /[?&]lang=(es|en)\b/.exec(location.search);
    if (m) return m[1];
    try { var s = localStorage.getItem('lang'); if (s === 'es' || s === 'en') return s; } catch (e) {}
    return /^es/i.test(navigator.language || '') ? 'es' : 'en';
  }

  var lang = detect();

  function orig(el) {
    var o = originals.get(el);
    if (!o) { o = {}; originals.set(el, o); }
    return o;
  }

  function tr(key, o, field, fallback) {
    return lang === 'es' && Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : o[field];
  }

  function withLang(href) {
    if (!href || /^(#|mailto:|tel:|javascript:|[a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) return href;
    var hash = '', q = '', i = href.indexOf('#');
    if (i >= 0) { hash = href.slice(i); href = href.slice(0, i); }
    i = href.indexOf('?');
    if (i >= 0) { q = href.slice(i + 1); href = href.slice(0, i); }
    var parts = q ? q.split('&').filter(function (p) { return p && p.split('=')[0] !== 'lang'; }) : [];
    parts.push('lang=' + lang);
    return href + '?' + parts.join('&') + hash;
  }

  function apply() {
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var o = orig(el); if (!('text' in o)) o.text = el.textContent;
      el.textContent = tr(el.getAttribute('data-i18n'), o, 'text');
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var o = orig(el); if (!('html' in o)) o.html = el.innerHTML;
      el.innerHTML = tr(el.getAttribute('data-i18n-html'), o, 'html');
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var o = orig(el); o.attrs = o.attrs || {};
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var idx = pair.indexOf(':'); if (idx < 0) return;
        var attr = pair.slice(0, idx).trim(), key = pair.slice(idx + 1).trim();
        if (!(attr in o.attrs)) o.attrs[attr] = el.getAttribute(attr);
        var v = tr(key, { v: o.attrs[attr] }, 'v');
        if (v !== null && v !== undefined) el.setAttribute(attr, v);
      });
    });

    // Document title and meta description
    if (!('title' in originals)) originals.title = document.title;
    document.title = lang === 'es' && dict['meta.title'] ? dict['meta.title'] : originals.title;
    var md = document.querySelector('meta[name="description"]');
    if (md) {
      var o = orig(md); if (!('c' in o)) o.c = md.getAttribute('content');
      md.setAttribute('content', lang === 'es' && dict['meta.description'] ? dict['meta.description'] : o.c);
    }

    // Carry lang across same-site links
    document.querySelectorAll('a[href]').forEach(function (a) {
      var o = orig(a); o.attrs = o.attrs || {};
      var base = (a.hasAttribute('data-i18n-attr') && /(^|;)\s*href:/.test(a.getAttribute('data-i18n-attr')))
        ? tr(a.getAttribute('data-i18n-attr').split(';').map(function (p) { return p.trim(); })
            .filter(function (p) { return p.indexOf('href:') === 0; })[0].slice(5).trim(), { v: o.attrs.href }, 'v')
        : (o.baseHref !== undefined ? o.baseHref : (o.baseHref = a.getAttribute('href')));
      var next = withLang(base);
      if (next !== a.getAttribute('href')) a.setAttribute('href', next);
    });

    updateToggles();
    listeners.forEach(function (fn) { try { fn(lang); } catch (e) {} });
  }

  var toggles = [];
  function updateToggles() {
    toggles.forEach(function (b) {
      b.querySelectorAll('span').forEach(function (s) {
        var on = s.getAttribute('data-l') === lang;
        s.classList.toggle('is-active', on);
      });
      b.setAttribute('aria-label', 'Cambiar idioma / Change language');
      b.setAttribute('title', lang === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish');
    });
  }

  function makeToggle() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-toggle';
    b.innerHTML = '<span data-l="en">EN</span><span data-l="es">ES</span>';
    b.addEventListener('click', function () { set(lang === 'es' ? 'en' : 'es'); });
    toggles.push(b);
    return b;
  }

  function set(l) {
    if (l !== 'es' && l !== 'en') return;
    lang = l;
    try { localStorage.setItem('lang', l); } catch (e) {}
    try {
      var u = new URL(location.href); u.searchParams.set('lang', l);
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (e) {}
    apply();
  }

  function init() {
    var nav = document.querySelector('.nav-links');
    if (nav) { var li = document.createElement('li'); li.appendChild(makeToggle()); nav.appendChild(li); }
    document.querySelectorAll('[data-lang-toggle]').forEach(function (h) { h.appendChild(makeToggle()); });
    apply();
  }

  window.I18N = {
    get lang() { return lang; },
    t: function (key, fallback) { return lang === 'es' && dict[key] !== undefined ? dict[key] : fallback; },
    set: set,
    apply: apply,
    onChange: function (fn) { listeners.push(fn); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
