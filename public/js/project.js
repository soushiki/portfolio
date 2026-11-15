/* Shared behaviour for project pages.
   1. One-time reveal on enter: adds .is-seen. In calm mode, or without IntersectionObserver,
      nothing is hidden (the page starts in its finished state).
   2. Step list: marks the section in view with aria-current="true" (CSS sticky only).
   3. Numbers: elements with data-num hold English formatting ("82.9%", "102,146");
      in Spanish they are shown as "82,9 %", "102.146". */
(function () {
  'use strict';
  var root = document.documentElement;
  var calm = root.classList.contains('motion-calm') ||
    (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasIO = 'IntersectionObserver' in window;
  var seenEls = document.querySelectorAll('.reveal, .waffle');

  function markAll() { seenEls.forEach(function (el) { el.classList.add('is-seen'); }); }

  if (calm || !hasIO) {
    markAll();
  } else {
    root.classList.add('pj-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    seenEls.forEach(function (el) { io.observe(el); });
    // Safety net: never leave content hidden.
    setTimeout(markAll, 6000);
  }

  // Step list highlight
  var links = Array.prototype.slice.call(document.querySelectorAll('.steplist a[href^="#"]'));
  if (links.length && hasIO) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = map[e.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id); if (s) sio.observe(s);
    });
  }

  // Number formatting per language
  function localize(lang) {
    document.querySelectorAll('[data-num]').forEach(function (el) {
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.textContent);
      var en = el.getAttribute('data-en');
      if (lang === 'es') {
        el.textContent = en.replace(/[.,]/g, function (c) { return c === '.' ? ',' : '.'; })
          .replace(/(\d)%/g, '$1 %');
      } else {
        el.textContent = en;
      }
    });
  }
  function init() {
    localize(window.I18N ? window.I18N.lang : root.lang);
    if (window.I18N) window.I18N.onChange(localize);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
