/* Intro panels: reveal fallback (IntersectionObserver), count-up on the Proof panel, progress dots. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window)) return;
  var root = document.documentElement;
  var panels = document.querySelectorAll('.panel');

  // Fallback reveal when CSS scroll-driven animations are missing
  if (!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'))) {
    root.classList.add('io');
    var rev = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rev.unobserve(e.target); } });
    }, { threshold: 0.25 });
    panels.forEach(function (p) { rev.observe(p); });
  }

  // Count-up once, full motion only
  var counts = document.querySelectorAll('.count[data-count]');
  var proof = document.getElementById('proof');
  if (proof && counts.length) {
    var done = false;
    var cio = new IntersectionObserver(function (es) {
      if (done || !es.some(function (e) { return e.isIntersecting; })) return;
      done = true; cio.disconnect();
      if (reduce.matches) return;
      var t0 = performance.now(), dur = 800;
      counts.forEach(function (c) { c.textContent = '0'; });
      (function tick(now) {
        var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        counts.forEach(function (c) { c.textContent = Math.round(+c.getAttribute('data-count') * e); });
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.25 });
    cio.observe(proof);
  }

  // Progress dots
  var links = document.querySelectorAll('.dots a');
  var secs = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });
  var dio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var i = secs.indexOf(e.target);
      links.forEach(function (a, j) { if (j === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  secs.forEach(function (s) { if (s) dio.observe(s); });
})();
