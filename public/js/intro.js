/* Intro panels: reveal (IntersectionObserver), count-up on the Proof panel, progress dots, and a
   full-page-slider snap: wheel, swipe and keys switch section at once (450 ms glide, one flick = one section)
   from the top of #intro to the top of #projects. A panel taller than the screen scrolls freely inside itself.
   Off for short landscape (height <= 500); hash links and focus scrolling stay native.
   On touch screens (pointer: coarse) the touch handlers do nothing: CSS native mandatory snapping does the swipe. */
(function () {
  'use strict';
  var root = document.documentElement;
  function calm() { return root.classList.contains('motion-calm'); }
  var panels = document.querySelectorAll('.panel');
  if (!('IntersectionObserver' in window)) { panels.forEach(function (p) { p.classList.add('is-in'); }); return; }

  // Reveal: once a panel is 20% in view its children play the full rise on a clock (CSS transition), once.
  var rev = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rev.unobserve(e.target); } });
  }, { threshold: 0.2 });
  panels.forEach(function (p) { rev.observe(p); });

  // Count-up once, full motion only
  var counts = document.querySelectorAll('.count[data-count]');
  var proof = document.getElementById('proof');
  if (proof && counts.length) {
    var done = false;
    var cio = new IntersectionObserver(function (es) {
      if (done || !es.some(function (e) { return e.isIntersecting; })) return;
      done = true; cio.disconnect();
      if (calm()) return;
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

  // ---- Snap between #intro, #build, #proof and #projects ----
  var els = ['intro', 'build', 'proof', 'projects'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (els.length < 2) return;
  var lastI = els.length - 1;
  var gliding = false, raf = 0, lockUntil = 0, lastWheel = 0, acc = 0;
  var touch = null, pendingPanel = -1, edgeTimer = 0, nativeTo = null;

  // Keep --nav-h equal to the real sticky nav height (it wraps to 66px on some widths), so the panel
  // heights, scroll-padding and the stops all agree and the first stop is 0.
  var navEl = document.querySelector('.nav');
  function syncNav() { if (navEl) root.style.setProperty('--nav-h', Math.round(navEl.getBoundingClientRect().height) + 'px'); }
  syncNav();
  window.addEventListener('resize', syncNav, { passive: true });
  function navH() { return navEl ? Math.round(navEl.getBoundingClientRect().height) : (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0); }
  // Recomputed on every gesture (no caching across resizes). bottom > top only for a panel taller than the screen.
  function layout() {
    var nh = navH(), vis = innerHeight - nh;
    return els.map(function (el, i) {
      var r = el.getBoundingClientRect(), top = Math.round(r.top + scrollY - nh), bottom = top;
      if (i < lastI && r.height > vis + 1) bottom = Math.round(top + r.height - vis);
      return { top: top, bottom: bottom };
    });
  }
  function flat(st) {
    var out = [];
    st.forEach(function (s) { out.push(s.top); if (s.bottom > s.top + 2) out.push(s.bottom); });
    return out;
  }
  window.__introSnap = { stops: function () { return flat(layout()); } };
  var coarse = window.matchMedia('(pointer: coarse) and (min-height: 501px)');
  function off() { return innerHeight <= 500; }
  function active(st, y, dir) {
    var pt = st[lastI].top;
    return y < pt - 2 || (dir < 0 && Math.abs(y - pt) <= 2);
  }
  function nextStop(st, y, dir) {
    var f = flat(st), i;
    if (dir > 0) { for (i = 0; i < f.length; i++) if (f[i] > y + 2) return f[i]; }
    else { for (i = f.length - 1; i >= 0; i--) if (f[i] < y - 2) return f[i]; }
    return null;
  }
  // Index of the tall panel whose free range holds y, or -1.
  function freeIdx(st, y) {
    for (var i = 0; i < lastI; i++) if (st[i].bottom > st[i].top + 2 && y >= st[i].top - 2 && y <= st[i].bottom + 2) return i;
    return -1;
  }
  // Can a move from y in direction dir still go inside that tall panel's range?
  function inward(st, i, y, dir) { return dir > 0 ? y < st[i].bottom - 2 : y > st[i].top + 2; }

  function cancelGlide() { if (gliding) { cancelAnimationFrame(raf); gliding = false; } }
  function glide(target) {
    cancelGlide();
    var from = scrollY, t0 = performance.now(), dur = calm() ? 600 : 450;
    if (Math.abs(target - from) < 1) return;
    gliding = true; acc = 0;
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur), e = calm() ? (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) : 1 - Math.pow(1 - k, 3);
      window.scrollTo({ top: from + (target - from) * e, behavior: 'instant' });
      if (k < 1) raf = requestAnimationFrame(step);
      else { gliding = false; lockUntil = performance.now() + 200; }
    })(t0);
  }

  window.addEventListener('wheel', function (e) {
    if (off() || e.ctrlKey || e.deltaY === 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    var dir = e.deltaY > 0 ? 1 : -1, st = layout(), y = scrollY;
    if (!active(st, y, dir)) return;
    var now = performance.now(), gap = now - lastWheel;
    lastWheel = now;
    if (gliding || now < lockUntil) { // eat trackpad inertia
      e.preventDefault();
      lockUntil = Math.max(lockUntil, now + 120);
      return;
    }
    var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
    var fi = freeIdx(st, y);
    if (fi >= 0 && inward(st, fi, y, dir)) {
      // Smooth native scrolling lags behind the wheel, so add up where the queued scroll will end.
      var base = (nativeTo !== null && gap < 400 && (nativeTo - y) * dir >= 0) ? nativeTo : y;
      var to = base + dy;
      if (dir > 0 && to > st[fi].bottom) { e.preventDefault(); nativeTo = null; glide(st[fi].bottom); }
      else if (dir < 0 && to < st[fi].top) { e.preventDefault(); nativeTo = null; glide(st[fi].top); }
      else { nativeTo = to; pendingPanel = fi; } // stays inside: native; scrollend clamps any overshoot
      return;
    }
    nativeTo = null;
    var t = nextStop(st, y, dir);
    if (t === null) return;
    e.preventDefault();
    if (gap > 200 || acc * dy < 0) acc = 0;
    acc += dy;
    if (Math.abs(acc) >= 24) glide(t);
  }, { passive: false });

  // Touch: the whole gesture is decided on the first move of >= 6 px.
  window.addEventListener('touchstart', function (e) {
    cancelGlide();
    var f = e.touches[0];
    touch = { y0: f.clientY, last: f.clientY, mode: '', panel: -1 };
  }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (!touch || !e.touches.length) return;
    if (coarse.matches) { touch.mode = 'native'; return; }
    var y = e.touches[0].clientY, dy = y - touch.y0;
    touch.last = y;
    if (!touch.mode) {
      if (Math.abs(dy) < 6) return;
      var dir = dy < 0 ? 1 : -1, st = layout(), sy = scrollY;
      if (off() || !active(st, sy, dir)) touch.mode = 'native';
      else {
        var fi = freeIdx(st, sy);
        if (fi >= 0 && inward(st, fi, sy, dir)) { touch.mode = 'free'; touch.panel = fi; }
        else touch.mode = 'snap';
      }
    }
    if (touch.mode === 'snap' && e.cancelable) e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', function () {
    var t = touch; touch = null;
    if (!t || coarse.matches) return;
    if (t.mode === 'snap') {
      var dy = t.last - t.y0;
      if (Math.abs(dy) >= 40 && !off()) {
        var to = nextStop(layout(), scrollY, dy < 0 ? 1 : -1);
        if (to !== null) glide(to);
      }
    } else if (t.mode === 'free') pendingPanel = t.panel;
  }, { passive: true });
  window.addEventListener('touchcancel', function () {
    var t = touch; touch = null;
    if (t && !coarse.matches && t.mode === 'free') pendingPanel = t.panel;
  }, { passive: true });
  // After a free scroll inside a tall panel: if momentum carried it past an edge, glide back to that edge.
  function settleEdge() {
    if (coarse.matches) { pendingPanel = -1; return; }
    if (pendingPanel < 0 || gliding || touch) return;
    var st = layout(), p = st[pendingPanel], y = scrollY;
    pendingPanel = -1;
    if (off() || !p) return;
    if (y > p.bottom + 2) glide(p.bottom);
    else if (y < p.top - 2) glide(p.top);
  }
  if ('onscrollend' in window) window.addEventListener('scrollend', settleEdge);
  else window.addEventListener('scroll', function () { clearTimeout(edgeTimer); edgeTimer = setTimeout(settleEdge, 140); }, { passive: true });

  window.addEventListener('pointerdown', cancelGlide, { passive: true });

  window.addEventListener('keydown', function (e) {
    if (off() || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var tg = e.target, tag = tg && tg.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (tg && tg.isContentEditable)) return;
    var k = e.key, dir = 0, page = false;
    if (k === 'ArrowDown') dir = 1;
    else if (k === 'ArrowUp') dir = -1;
    else if (k === 'PageDown') { dir = 1; page = true; }
    else if (k === 'PageUp') { dir = -1; page = true; }
    else if (k === ' ' || k === 'Spacebar') {
      // Space on a button or summary activates it: leave it alone.
      if (tag === 'BUTTON' || tag === 'SUMMARY' || (tg && tg.getAttribute && tg.getAttribute('role') === 'button')) return;
      dir = e.shiftKey ? -1 : 1; page = true;
    } else return;
    var st = layout(), y = scrollY;
    if (!active(st, y, dir)) return;
    var fi = freeIdx(st, y);
    if (fi >= 0 && inward(st, fi, y, dir)) {
      if (!page) return; // arrows stay native inside a tall panel
      e.preventDefault();
      var to = y + dir * (innerHeight - navH() - 60);
      glide(dir > 0 ? Math.min(to, st[fi].bottom) : Math.max(to, st[fi].top));
      return;
    }
    var t = nextStop(st, y, dir);
    if (t === null) return;
    e.preventDefault();
    if (!gliding) glide(t);
  });
})();
