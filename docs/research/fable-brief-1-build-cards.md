# Fable brief 1: "What I build" cards (#build) — READY TO SEND after the usage reset

Send to Fable (Agent, model fable) with: this file, `docs/research/motion-debrief-2026-11-12.md` (section 2 + "Motion language" + "Limits"), and the markup/CSS below. Before sending: take screenshots of #build at 360×640 and 1280×800 from main (local server `python -m http.server 5102` from D:\Claude\portfolio), save to `docs/research/shots/build-360.png` / `build-1280.png`, and give Fable those paths. Fable does not browse or screenshot.

## Ask
How would you build the Bodak "cards come together" entrance (debrief section 2) for our three `.kind` cards? Return: files to change and what each change does; the full-motion version on desktop (3 columns) and phone (1 column, section taller than the screen); the calm-mode version; whether it needs GSAP (if yes, exact pinned CDN version and why CSS/WAAPI can't do it); what could break.

## Fixed (don't change)
Card content and order, the card styles below, the existing reveal of the section heading, touch scroll-snap on `html`, the desktop glide in `public/js/intro.js`, `html.motion-calm`, the i18n swap, tap targets 44 px, AA contrast. Played once on a clock when in view, never scrubbed. Under 1.2 s total. Content visible without JS.

## Markup (index.html, main 30cdf6a, lines 201–230)
```html
<section class="panel panel-wide" id="build" aria-labelledby="build-h" tabindex="-1">
  <div class="panel-head">
    <h2 id="build-h" data-i18n="build.h">…and I check my own work.</h2>
    <p data-i18n="build.sub">Three kinds of work:</p>
  </div>
  <div class="kinds">
    <article class="kind">
      <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
      <h3 data-i18n="b1.t">Browser tools</h3>
      <p data-i18n="b1.p">Private tools that run in your browser, like Minoscreto.</p>
      <p class="kind-benefit" data-i18n="b1.v">Clients' documents never leave their computer.</p>
      <a href="#projects"><span data-i18n="b1.a">See Minoscreto</span> <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
    </article>
    <!-- two more .kind articles: Data projects, Business tools -->
  </div>
  <a class="next-link" href="#proof"><span data-i18n="next.proof">The proof</span> <i class="fa-solid fa-arrow-down" aria-hidden="true"></i></a>
</section>
```

## CSS (styles.css)
```css
.kinds { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.kind { display: flex; flex-direction: column; align-items: flex-start; gap: 0.6rem; padding: 1.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
@media (max-width: 1024px) { .kinds, .stats { gap: 1rem; } }
@media (max-width: 800px) { .kinds { grid-template-columns: 1fr; } }
/* phones (≤600px): .kinds { gap: var(--s3); } .kind { padding: var(--s3); } */
/* current reveal, all panels except #intro: */
.js .panel:not(#intro) > * { transition: opacity 420ms cubic-bezier(0.2,0.7,0.2,1), transform 420ms cubic-bezier(0.2,0.7,0.2,1); transition-delay: calc(var(--i,0) * 50ms); }
.js .panel:not(#intro):not(.is-in) > * { opacity: 0; transform: translateY(24px); }
.js .panel.is-in > * { opacity: 1; transform: none; }
/* calm: opacity 300ms only, no transform */
```
Note: `.kinds` is a direct child of `.panel`, so it currently fades in as one block; the cards' own entrance replaces that for `.kinds`.

## Measured
#build height on phones: 1079 px at 360×640, 1023 at 393×851, 997 at 412×915 (taller than the screen; free scroll inside, then snap).
