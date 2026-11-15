/* /nyc311 page behaviour. Progressive enhancement; nothing here calls an API.
   1. Request anatomy: URL parts become buttons; the matching explanation is copied into a live panel.
      Without JS all explanations are visible as a list.
   2. Break-it record: a plain JS check of required keys, mirroring schemas/service_request.json "required". */
(function () {
  'use strict';

  function lang() {
    var l = window.I18N ? window.I18N.lang : document.documentElement.lang;
    return l === 'es' ? 'es' : 'en';
  }

  /* ---------- 1. Request anatomy ---------- */
  var anat = document.getElementById('anat');
  if (anat) {
    var items = Array.prototype.slice.call(anat.querySelectorAll('.anat-list > li'));
    var ui = document.createElement('div');
    ui.className = 'anat-ui';
    var url = document.createElement('p');
    url.className = 'anat-url';
    url.style.margin = '0';
    var panel = document.createElement('div');
    panel.className = 'anat-panel';
    panel.id = 'anat-panel';
    panel.setAttribute('aria-live', 'polite');

    function code(text) {
      var c = document.createElement('code');
      c.textContent = text;
      return c;
    }
    url.appendChild(code('https://data.cityofnewyork.us/resource/'));
    var seps = ['', '?', '&'];
    var chips = items.map(function (li, i) {
      if (seps[i]) url.appendChild(code(seps[i]));
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'anat-chip';
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-controls', 'anat-panel');
      var hid = document.createElement('span');
      hid.className = 'sr-only';
      b.appendChild(hid);
      b.appendChild(document.createTextNode(li.getAttribute('data-chip')));
      b.addEventListener('click', function () { select(i); });
      url.appendChild(b);
      return b;
    });
    ui.appendChild(url);
    ui.appendChild(panel);
    anat.insertBefore(ui, anat.firstChild);

    var cur = 0;
    var sync = function () {
      items.forEach(function (li, i) {
        var s = li.querySelector('strong');
        chips[i].firstChild.textContent = (s ? s.textContent : '') + ': ';
      });
      panel.innerHTML = items[cur].innerHTML;
      // The copy is already translated; keep i18n.js from tracking it.
      panel.querySelectorAll('[data-i18n]').forEach(function (el) { el.removeAttribute('data-i18n'); });
    };
    var select = function (i) {
      cur = i;
      chips.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      sync();
    };
    chips[0].setAttribute('aria-pressed', 'true');
    sync();
    if (window.I18N) window.I18N.onChange(sync);
  }

  /* ---------- 2. Break-it record ---------- */
  var box = document.getElementById('brk');
  if (box) {
    var S = {
      en: {
        pass: '✓ Pass',
        fail: function (m) { return '✗ Fail: missing ' + m.join(', '); },
        on: 'present', off: 'removed'
      },
      es: {
        pass: '✓ Pasa',
        fail: function (m) { return '✗ Falla: ' + (m.length > 1 ? 'faltan ' : 'falta ') + m.join(', '); },
        on: 'presente', off: 'quitado'
      }
    };
    // Mirrors "required" in schemas/service_request.json
    var REQUIRED = ['unique_key', 'created_date', 'agency', 'agency_name', 'complaint_type', 'status', 'borough'];
    var inputs = Array.prototype.slice.call(box.querySelectorAll('input[type="checkbox"]'));
    var verdict = document.getElementById('brk-verdict');
    var reset = document.getElementById('brk-reset');

    var missingKeys = function (rec) {
      return REQUIRED.filter(function (k) { return !Object.prototype.hasOwnProperty.call(rec, k); });
    };
    var update = function () {
      var s = S[lang()];
      var rec = {};
      inputs.forEach(function (inp) {
        var on = inp.checked;
        if (on) rec[inp.getAttribute('data-f')] = inp.value;
        var row = inp.closest('.brk-row');
        row.classList.toggle('is-off', !on);
        row.querySelector('.brk-state').textContent = on ? s.on : s.off;
      });
      var miss = missingKeys(rec);
      verdict.textContent = miss.length ? s.fail(miss) : s.pass;
      verdict.classList.toggle('is-fail', miss.length > 0);
      verdict.classList.toggle('is-pass', miss.length === 0);
    };
    inputs.forEach(function (inp) {
      inp.disabled = false;
      inp.addEventListener('change', update);
    });
    if (reset) {
      reset.addEventListener('click', function () {
        inputs.forEach(function (inp) { inp.checked = true; });
        update();
      });
    }
    update();
    if (window.I18N) window.I18N.onChange(update);
  }
})();
