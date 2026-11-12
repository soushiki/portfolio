# Motion debrief for the 2D portfolio (Opus, 2026-11-12)

Workflow (user's rule, 2026-11-12, "Briefing Fable" in `~/.claude/rules/fable-decides-others-build.md`): Opus researched references and writes this debrief. Fable then gets **one section at a time**: the reference animation below, that section's current markup/CSS and screenshots, and the limits. Fable answers how to build it here; Sonnet builds; Opus checks in the browser and the user checks a real swipe.

## Goal
The home page should feel like it moves forward on purpose: each section arrives with its own short, precise reveal ("restrained and precise", like the Spitzer portfolio), never loud. Recruiters must still reach name → role → proof → Resume in one screen and a few swipes; clients must see the WhatsApp button on screen 1.

## The site today (facts, measured 2026-11-12 on main 30cdf6a)
- Static HTML/CSS/vanilla JS, no framework, no animation library. Netlify from `main`. Repo `D:\Claude\portfolio`.
- Sections in order: `#intro` (name h1, role h2, lead, 2 pills, 4 buttons), `#build` (3 `.kind` cards with icon, h3, description, benefit line, link), `#proof` (3 `.stats` numbers: 160 / 3 / 2, count-up 0.8 s today), `#projects` (featured project cards), then `#more`, `#skills`, `#contact`, footer.
- Heights on phones: intro and proof = one screen; `#build` is taller than the screen at 360×640, 393×851 and 412×915 (1079 / 1023 / 997 px), so it scrolls freely inside.
- Section movement: desktop wheel/keys = JS glide in `public/js/intro.js` (450 ms ease-out, 600 ms ease-in-out in calm mode); touch screens = CSS `scroll-snap-type: y mandatory` (JS touch interception did not work on the user's Android).
- Reveal today: `.panel:not(#intro)` children fade + rise 24 px, 420 ms, 50 ms stagger, once, when 20 % in view (IntersectionObserver adds `.is-in`). Slide 1 is shown at once.
- Motion modes: `html.motion-calm` (set from `?motion=`, the saved Motion button choice, or the OS reduced-motion setting). Calm = opacity-only fades, no bob, no count-up. The user's own phone is in calm mode by default.

## Motion language (applies to every section)
- One easing family: expo.out for entrances (`cubic-bezier(0.16, 1, 0.3, 1)`), expo.inOut for anything that travels between two places.
- Entrances 0.8–1 s, stagger 0.01–0.1 s, played once on a clock when the section is in view (never scrubbed, so a short scroll never leaves a half-faded section).
- Masks over fades for text: text rises out of a clipped line instead of fading in.
- Calm mode: every entrance becomes an opacity fade of 300 ms with at most a 8 px move; nothing rotates, flips, scales or counts.
- No JS = everything visible.

## Reference per section

### 1. `#intro`: name and role reveal on load
Reference: Joffrey Spitzer portfolio, Codrops 2026-02-18 ("A Minimalist Astro + GSAP Build with Reveals, Flip Transitions and Subtle Motion").
- Titles split into characters, each inside a mask: from `yPercent: -120, scale: 1.2` to rest, duration 1 s, stagger 0.01 s, ease expo.out.
- Paragraphs split into lines, each in a mask: from `yPercent: 105`, duration 0.9 s, stagger 0.04 s, ease expo.out.
- For us: h1 name by characters, h2 role and the lead by lines; pills and buttons fade up after, total under 1.2 s. Buttons must be clickable at once (no pointer block during the reveal).

### 2. `#build`: three cards come together
Reference: Eduard Bodak portfolio, Codrops 2025-07-29 ("Built to Move").
- Three cards start spread out (right, centre, left: `x = -position × width × 1.15`), small (`scale 0.2`), tilted (`rotationZ 12 / 0 / -12`, `rotateX 24`), above their place; they fly in to `scale 0.8` with a smaller tilt (5 / 0 / -5), then settle flat at `scale 1`, with a flip (`rotationY -190` → `-180`, front/back faces). Stagger 0.012 per card. Keyframes at 0 / 40 / 55 / 75 / 82 / 100 %.
- He scrubs it over a 350vh sticky section and uses a separate phone timeline; his reduced-motion version just moves the cards slightly down and fades them.
- For us: played on a clock (not a 350vh scrub), about 1 s, no flip to a back face (our cards have one face); on phones the cards are stacked in one column, so each card plays its own smaller version as it enters (the section scrolls freely inside).

### 3. `#proof`: the numbers
Reference: Spitzer preloader counter.
- A number goes 0 → final value in visible "chunky" steps: `ease: steps(14)`, duration 3 s in his case.
- For us: 160 / 3 / 2 count in steps over about 1.2 s (3 and 2 need fewer steps, so they look stepped, not instant), label lines reveal with the line mask from section 1.

### 4. `#projects`: cards arrive in sequence
Reference: Spitzer gallery reveal.
- From `yPercent: 100, autoAlpha: 0` to rest, duration 0.8 s, ease power3.out, stagger 0.1 s.
- For us: each project card when it enters, image first then its text lines with the section 1 line mask.

## Limits for every brief
- Sizes checked: 360×640, 375×812, 768×1024, 1280×800, in EN and ES. Tap targets 44 px. WCAG 2.1 AA contrast. No horizontal overflow.
- Must not break: the touch snap (`scroll-snap-type` on `html`, `scroll-snap-align` on sections), the desktop glide in `intro.js`, the Motion button and `html.motion-calm`, the i18n swap (text re-renders on language change, so split text must re-split), the home copy.
- A library is allowed only if Fable says the effect needs it: pinned exact version from cdnjs or jsdelivr, loaded `defer`, and the page works without it.
- Output Fable returns: the plan (files, what each change does), the calm-mode version, and what could break.

## References used
- Codrops, "Built to Move: A Closer Look at the Animations Behind Eduard Bodak's Portfolio", 2025-07-29.
- Codrops, "Joffrey Spitzer Portfolio: A Minimalist Astro + GSAP Build with Reveals, Flip Transitions and Subtle Motion", 2026-02-18.
- andrevv.com (Andrew McCarthy): checked live; GSAP + ScrollTrigger, mandatory scroll snap, canvas. Its project-name scramble is an alternative for section 4 if the user prefers it.
