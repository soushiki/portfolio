# Section transitions spec (Fable 5.2, 2026-11-12)

Sebastian pointed to https://arsenals.com: "after a certain percentage scrolled it jumps to the full section immediately."

## What arsenals.com actually does (measured 2026-11-12)
- The page is one long native scroll (8200 px for an 800 px screen), driven by a scroll-scrubbed image sequence. **The scroll position never snaps**: a headless wheel probe left scrollY exactly where each wheel step put it (100, 250, 400, 800, -100 and -400 px; no spring-back after 2 s).
- The "jump" is in the content. Each text block has `in`/`out` triggers at scroll thresholds. When the scroll crosses a trigger, the block plays its whole rise-in **on a clock** (its own duration and stagger), not scrubbed by the scroll. A small scroll past the threshold shows the full section; a small scroll that doesn't reach it shows nothing new. Scrolling back past the threshold plays the `out`.
- The frames catch up at a capped rate (2.5 frames per tick) after a big jump, so fast flicks don't stutter.
- Reduced motion: loops and grain go "still"; scroll stays native.
- Wheel, trackpad and touch all go through native scroll; there is no wheel or touch handler.

## Decision for the portfolio intro
Our reveal is the opposite today. It uses `animation-timeline: view()`, so it's scrubbed: a short scroll leaves a panel half-faded. We take arsenals' idea and keep our own position commit:

1. **Threshold reveal, played on a clock (the arsenals part).** Once a panel is 20% in view, its children play the full rise (opacity 0→1, translateY 24px→0, 420 ms, `cubic-bezier(0.2, 0.7, 0.2, 1)`, 50 ms stagger). The reveal plays once and never reverses. Remove the `animation-timeline: view()` rule; the IntersectionObserver path becomes the only path (threshold 0.2), in every browser.
2. **Position commit, quicker and decisive.** Keep the settle-in-direction helper, but replace the browser's `behavior: 'smooth'` with our own rAF glide: 380 ms, ease-out cubic. Any `wheel`, `touchstart`, `pointerdown` or `keydown` during the glide cancels it immediately (never trap the visitor).
   - **Forward/back threshold:** commit in the gesture's direction when it moved ≥ 6% of `innerHeight` (about 48 px at 800 px, one wheel notch is 100–120 px). Under that it springs back to the nearest panel (it's a nudge).
   - **Touch:** don't settle while a finger is down (track `touchstart`/`touchend`). Settle on `scrollend` after the finger lifts and momentum ends.
   - **Keyboard:** Space, PageDown, ArrowDown and PageUp, ArrowUp, Shift+Space within the intro commit in their direction (an arrow key's 40 px step must not spring back). Home and End stay native.
   - **Safari without `scrollend`:** keep the debounced `scroll` fallback, 160 ms.
   - Outside the intro (above panel 1's top or at/after `#projects`) nothing settles, as now.
3. **Reduced motion:** no glide and no settling at all (free native scroll), and reveals are instant. This is unchanged.
4. **No JS:** everything visible, as now (`.js` class gate).

## Interaction-cost check (`~/.claude/knowledge/ui-ux-interaction-cost.md`)
- Red route name → role → proof → resume: one wheel notch or swipe per slide, and the proof is two gestures from the top. Resume stays in the nav on every slide.
- Familiar convention: scroll moves forward. Nothing intercepts or blocks wheel or touch. Keyboard and back-scroll keep working, and any input cancels a glide.
- No half-faded states mid-route; the content is either fully shown or not yet reached.

## Tasks
1. **`model: sonnet`**, files `public/js/intro.js` and `styles.css` only, branch `fable/section-snap` in `D:\Claude\portfolio-wt-doors`. Implement points 1–3. Keep the count-up and the progress dots as they are.
2. **Done means:**
   - `node D:\Claude\portfolio-3d\tools\scroll-test.mjs http://127.0.0.1:5097/ wheel 1280 800 5 120` lands intro → build → proof → projects, then free. The same at `360 740`.
   - With deltaPx 30 (`... 1280 800 3 30`) it springs back to `intro`.
   - Under `RM=1` it never settles.
   - No console errors. No horizontal overflow at 360.
   - All content is visible with JS off (`NOJS=1` phone-shot).
3. **Not in scope:** the 3D site, copy changes, the dots, the nav.
