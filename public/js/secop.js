/* "Sort it yourself" sorter for /secop. Progressive enhancement:
   without JS the page lists all 4 texts with their answers.
   Markup: ol.sort-list > li.sort-card[data-answer=money|unclear|time|other]. */
(function () {
  'use strict';
  var S = {
    en: {
      progress: function (i, n) { return 'Text ' + i + ' of ' + n; },
      group: 'Choose a class',
      money: 'Adds money', unclear: 'Unclear', time: 'Time only', other: 'Other',
      right: 'Right', wrong: 'Not quite',
      yourAns: 'Your pick: ', rule: 'The rule says: ',
      next: 'Next text', again: 'Start again',
      done: "That's how the rules sorted all 101,570 amendments."
    },
    es: {
      progress: function (i, n) { return 'Texto ' + i + ' de ' + n; },
      group: 'Elige una clase',
      money: 'Suma dinero', unclear: 'No está claro', time: 'Solo tiempo', other: 'Otro',
      right: 'Correcto', wrong: 'No del todo',
      yourAns: 'Tu elección: ', rule: 'La regla dice: ',
      next: 'Siguiente texto', again: 'Empezar de nuevo',
      done: 'Así clasificaron las reglas las 101.570 modificaciones.'
    }
  };
  var KEYS = ['money', 'unclear', 'time', 'other'];

  var wrap = document.getElementById('sorter');
  if (!wrap) return;
  var cards = Array.prototype.slice.call(wrap.querySelectorAll('.sort-card'));
  if (!cards.length) return;

  function L() {
    var l = window.I18N ? window.I18N.lang : document.documentElement.lang;
    return S[l === 'es' ? 'es' : 'en'];
  }

  var ui = document.createElement('div');
  ui.className = 'sort-ui';
  var progress = document.createElement('p');
  progress.className = 'sort-progress';
  var group = document.createElement('div');
  group.className = 'sort-btns';
  group.setAttribute('role', 'group');
  var btns = KEYS.map(function (k) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('data-k', k);
    b.addEventListener('click', function () { answer(k); });
    group.appendChild(b);
    return b;
  });
  var result = document.createElement('div');
  result.className = 'sort-result';
  result.setAttribute('aria-live', 'polite');
  var next = document.createElement('button');
  next.type = 'button'; next.className = 'sort-next'; next.hidden = true;
  next.addEventListener('click', function () { go((cur + 1) % cards.length); });
  ui.appendChild(progress); ui.appendChild(group); ui.appendChild(result); ui.appendChild(next);
  wrap.appendChild(ui);

  var cur = 0, picked = null;

  function labels() {
    var s = L();
    group.setAttribute('aria-label', s.group);
    btns.forEach(function (b) { b.textContent = s[b.getAttribute('data-k')]; });
    progress.textContent = s.progress(cur + 1, cards.length);
    next.textContent = cur === cards.length - 1 ? s.again : s.next;
    if (picked) showResult();
  }

  function showResult() {
    var s = L();
    var ans = cards[cur].getAttribute('data-answer');
    var ok = picked === ans;
    result.textContent = '';
    var v = document.createElement('p');
    v.className = 'sort-verdict ' + (ok ? 'ok' : 'no');
    v.style.margin = '0';
    v.textContent = (ok ? '✓ ' + s.right : '✗ ' + s.wrong) +
      (ok ? '' : ' · ' + s.yourAns + s[picked]);
    var r = document.createElement('p');
    r.style.margin = '.25rem 0 0';
    r.textContent = s.rule + s[ans];
    result.appendChild(v); result.appendChild(r);
    if (cur === cards.length - 1) {
      var d = document.createElement('p');
      d.style.margin = '.5rem 0 0'; d.style.fontWeight = '600';
      d.textContent = s.done;
      result.appendChild(d);
    }
  }

  function answer(k) {
    if (picked) return;
    picked = k;
    cards[cur].classList.add('is-answered');
    btns.forEach(function (b) {
      b.disabled = true;
      b.setAttribute('aria-pressed', b.getAttribute('data-k') === k ? 'true' : 'false');
    });
    showResult();
    next.hidden = cur === cards.length - 1;
    if (!next.hidden) next.focus();
  }

  function go(i) {
    cards[cur].classList.remove('is-current', 'is-answered');
    cur = i; picked = null;
    cards[cur].classList.add('is-current');
    btns.forEach(function (b) { b.disabled = false; b.removeAttribute('aria-pressed'); });
    result.textContent = '';
    next.hidden = true;
    labels();
    btns[0].focus({ preventScroll: true });
  }

  cards[0].classList.add('is-current');
  labels();
  if (window.I18N) window.I18N.onChange(labels);
})();
