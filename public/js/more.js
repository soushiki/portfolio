/* Phone "More" buttons: clamps long paragraphs to 3 lines at <= 600px and adds a toggle.
   Strings: i18n keys more.btn / less.btn (English defaults here). */
(function () {
  'use strict';
  var SEL = ['.card-body > p', '.drive-cta p', '.contact > p', '.skills-proof', '.earlier-list li > span:not(.earlier-links)',
    '.offer p', '.example p', '.steps span', '.contact-box > p', '.section-sub', '.promise', '.lead',
    '.demo-step > p', '.demo-why', '.cs-hero .lead'].join(',');
  var mq = window.matchMedia('(max-width: 600px), (max-height: 500px) and (max-width: 900px)');
  var lastW = -1, n = 0, timer;
  function t(k, f) { return window.I18N ? window.I18N.t(k, f) : f; }
  function build() {
    document.querySelectorAll('.more-btn').forEach(function (b) { b.remove(); });
    document.querySelectorAll('.is-clamped').forEach(function (e) { e.classList.remove('is-clamped'); });
    lastW = window.innerWidth;
    if (!mq.matches) return;
    document.querySelectorAll(SEL).forEach(function (el) {
      if (!el.offsetParent) return;
      el.classList.add('is-clamped');
      if (el.scrollHeight <= el.clientHeight + 1) { el.classList.remove('is-clamped'); return; }
      if (!el.id) el.id = 'more-' + (++n);
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'more-btn';
      b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', el.id);
      b.textContent = t('more.btn', 'More');
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
        el.classList.toggle('is-clamped', !open);
        b.textContent = open ? t('less.btn', 'Less') : t('more.btn', 'More');
      });
      el.insertAdjacentElement('afterend', b);
    });
  }
  function later() { clearTimeout(timer); timer = setTimeout(build, 60); }
  window.addEventListener('resize', function () { if (window.innerWidth !== lastW) later(); });
  window.addEventListener('load', later);
  document.addEventListener('toggle', later, true);
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[role="tab"], .lang-toggle')) later(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  if (window.I18N) window.I18N.onChange(later);
  build();
})();
