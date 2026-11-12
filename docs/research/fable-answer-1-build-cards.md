# Fable's answer to brief 1: #build cards entrance (2026-11-12)

Accepted by Opus as written: same gesture as Bodak (apart, small, tilted, above → together and flat) at about a fifth of the amplitude; the full effect would need a pinned section (a goal change, not taken).

## Design
- Trigger: each `.kind` gets `.is-seen` once from its own IntersectionObserver (threshold 0.25, rootMargin `0px 0px -8% 0px`).
- Desktop (≥801 px): start `opacity 0; transform: perspective(900px) translate3d(X, -28px, 0) rotateX(18deg) scale(.86)` plus individual `rotate: R`. X/R: left −20px/−4deg, centre 0/0, right 20px/4deg.
  - `kind-in` 900 ms `cubic-bezier(0.16,1,0.3,1)`: 0 % start, 35 % opacity 1, 100 % `perspective(900px) translate3d(0,0,0) rotateX(0) scale(1)`.
  - `kind-flat` 900 ms `cubic-bezier(0.87,0,0.13,1)`: 0–40 % `rotate: R`, 100 % `0deg`.
  - Stagger 70 ms, `animation-fill-mode: backwards`; total 1040 ms, no transform left after.
- Phone/tablet (≤800 px) and short landscape (max-height 500px): X 0, Y +24px, rotateX 10deg, scale .95, R −1.5/0/1.5deg, 700 ms, same stagger.
- Calm: no keyframes; transition opacity/transform 300 ms ease from `opacity 0; translateY(8px)`, delay `--k × 40ms`.
- No JS / no IO: rules sit under `.js`; the no-IO branch adds `.is-seen` to all cards.

## Build (CSS keyframes + ~12 lines JS, no GSAP)
- styles.css, new block after line 552:
  - `.js #build.panel.panel-wide > .kinds { opacity:1; transform:none; transition:none; }` (must beat the reveal rule; confirm in computed styles).
  - `.kind` vars: `--k` 0/1/2, `--x`, `--r` by nth-child; defaults `--y:-28px; --rx:18deg; --s:.86; --d:900ms`; in `@media (max-width:800px), (max-height:500px)`: `--x:0px; --y:24px; --rx:10deg; --s:.95; --d:700ms; --r` ∓1.5deg.
  - `.js #build .kind:not(.is-seen) { opacity:0; }`
  - `.js #build .kind.is-seen { animation: kind-in var(--d) cubic-bezier(0.16,1,0.3,1) calc(var(--k,0)*70ms) backwards, kind-flat var(--d) cubic-bezier(0.87,0,0.13,1) calc(var(--k,0)*70ms) backwards; }`
  - Calm: `html.motion-calm.js #build .kind { transition: opacity 300ms ease, transform 300ms ease; transition-delay: calc(var(--k,0)*40ms); }` and `html.motion-calm.js #build .kind:not(.is-seen) { opacity:0; transform: translateY(8px); }`
- public/js/intro.js: before the early return (line ~11) add `.is-seen` to all `#build .kind`; otherwise observe each card, add `.is-seen`, unobserve; a `focusin` listener on each card adds `.is-seen`.

## Checks (Opus)
scrollWidth mid-animation at 801×600, 1024×768, 1280×800 (side cards start 4–8 px out; report, don't clip); `.kinds` computed opacity before `.is-in`; 360×640 card 3 hidden until scrolled to; 768×1024 two cards with 70 ms stagger; `?motion=calm` → animation-name none, no rotate/scale; Motion toggle mid-play leaves cards visible; Tab into a hidden card reveals it; EN/ES swap doesn't replay or hide; computed transform none at the end.
