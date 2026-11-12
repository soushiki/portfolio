/* Intro panels: reveal fallback (IntersectionObserver), count-up on the Proof panel, progress dots,
   and slide-to-next: when a native scroll ends between intro panels, finish the move in the
   direction the visitor was going (never intercepts wheel or touch input). */
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

  // Slide to the next/previous panel when a scroll ends between intro panels.
  // CSS snapping snapped short wheel steps and trackpad/touch swipes back to the panel the
  // visitor was leaving, so scrolling looked like it did nothing (Sebastian, 2026-11-11).
  var stops = Array.prototype.slice.call(panels).concat([document.getElementById('projects')]).filter(Boolean);
  var navH = function () { return parseFloat(getComputedStyle(root).scrollPaddingTop) || 0; };
  var tops = function () { return stops.map(function (el) { return Math.round(el.getBoundingClientRect().top + scrollY - navH()); }); };
  var startY = scrollY, settling = false, timer = 0;
  function settle() {
    if (settling || reduce.matches) return;
    var t = tops(), y = scrollY, last = t[t.length - 1];
    if (y <= t[0] - 4 || y >= last - 4) { startY = y; return; } // outside the intro: free scrolling
    for (var i = 0; i < t.length; i++) if (Math.abs(y - t[i]) < 6) { startY = y; return; } // already on a panel
    var below = 0; while (below < t.length - 1 && t[below + 1] <= y) below++;
    var moved = y - startY, target;
    if (moved > 40) target = t[below + 1];
    else if (moved < -40) target = t[below];
    else target = Math.abs(y - t[below]) < Math.abs(t[below + 1] - y) ? t[below] : t[below + 1];
    settling = true;
    window.scrollTo({ top: target, behavior: 'smooth' });
    setTimeout(function () { settling = false; startY = scrollY; }, 700);
  }
  var hasScrollEnd = 'onscrollend' in window;
  window.addEventListener('scroll', function () {
    if (settling) return;
    if (!hasScrollEnd) { clearTimeout(timer); timer = setTimeout(settle, 140); }
  }, { passive: true });
  if (hasScrollEnd) window.addEventListener('scrollend', settle);
  // A new gesture starts from where the page rests.
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, function () { if (!settling && !window.__introGesture) { window.__introGesture = true; startY = scrollY; setTimeout(function () { window.__introGesture = false; }, 400); } }, { passive: true });
  });
})();
