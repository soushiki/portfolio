# Home page copy for both audiences: build spec (Opus, 2026-11-12)

Decided by the user: the home page speaks to recruiters and freelance clients together ("selling to clients is a desirable hiring quality"). Phrase bank: `evaluation-2026-11-12.md`, sections 3 and 4. Builder: Sonnet. Check: Opus, in the browser at 360×640, 375×812 and 1280×800, in EN and ES.

## Slide 1 (#intro), in `index.html` plus the EN/ES strings wherever `data-i18n` keys are defined
| Element | EN | ES |
|---|---|---|
| h1 (unchanged) | Hi, I'm Sebastian Herrera | Hola, soy Sebastián Herrera (keep the current ES) |
| h2 `hero.h1` | I build websites and practical tools that help businesses work smarter. | Construyo páginas web y herramientas prácticas que ayudan a los negocios a trabajar mejor. |
| lead `hero.lead` | React and Python developer in Colombia · 160 automated tests on Minoscreto. | Desarrollador React y Python en Colombia · 160 pruebas automatizadas en Minoscreto. |
| pill 1 (keep) | Open to junior QA, data and developer roles · remote (short: Open to junior QA · data · dev) | (keep the current ES) |
| pill 2 (new, same style, next to pill 1, wraps under it on phones) | Available for freelance projects · Colombia and worldwide (short: Freelance: available) | Disponible para proyectos freelance · Colombia y el mundo (short: Freelance: disponible) |
| buttons, row 1 | Resume (PDF) (primary, unchanged) + **Let's discuss your project** (secondary style, WhatsApp icon) | Hoja de vida (PDF) + **Hablemos de tu proyecto** |
| buttons, row 2 | See my work · LinkedIn (unchanged) | (unchanged) |

- **"Let's discuss your project":** opens the same WhatsApp number the Services page already uses (copy that link, never invent one), as `https://wa.me/<number>?text=<encoded message>`. The message follows the page language:
  - EN: "Hi Sebastian! I'm interested in discussing a digital project for my business."
  - ES: "Hola, Sebastián. Me interesa conversar sobre un proyecto digital para mi negocio."
- **Phones:** Resume stays full width. "Let's discuss your project" goes full width under it. See my work and LinkedIn sit side by side. All four must fit on the first screen at 360×640 together with both pills. If they don't fit, put pill 2 inline after the lead instead.

## Slide 2 (#build) kind cards: add one benefit line each, under the description, in muted text
| Card | EN | ES |
|---|---|---|
| Browser tools | Clients' documents never leave their computer. | Los documentos del cliente nunca salen de su computador. |
| Data projects | Decisions backed by numbers, not guesses. | Decisiones respaldadas por datos, no por suposiciones. |
| Business tools | Less manual work: receipts and reports done in minutes. | Menos trabajo manual: recibos e informes en minutos. |

## Not in this task
Project cards as problem → solution → benefit, and the "How I work" process. Those come in a second pass, after the user sees this one.

## Done when
- No horizontal overflow, and each slide's content is centred on phones (the current behaviour is kept).
- The headings stay in order: one h1, then h2.
- Every text passes AA contrast.
- The WhatsApp link opens with the message in the right language.
- Nothing is committed or pushed without the user's OK.

## Progress in chunks
- [x] Chunk 1 (2026-11-12, Opus): slide 1 h2 and lead, EN and ES, on branch `opus/home-copy`. Not committed and not yet checked in the browser: the longer h2 may wrap to 3 lines at 360 px.
- [x] Chunk 2: freelance pill (EN/ES, long and short versions). Built by Sonnet, not yet browser-checked.
- [x] Chunk 3: "Let's discuss your project" WhatsApp button, reusing the Services page number, with the message in the page language. Built by Sonnet, not yet browser-checked.
- [x] Chunk 4: benefit lines on the three slide 2 cards. Built by Sonnet, not yet browser-checked.
- [x] Check at 360×640, 375×812 and 1280×800 in EN and ES (Opus, 2026-11-12): all fit on the first screen, no overflow, one h1 then h2, benefit lines 4.65:1, WhatsApp text follows the language. Committed; push waits for the user.

## Handoff (2026-11-12, after the usage reset; context cleared next)
- State: branch `opus/home-copy` in `D:\Claude\portfolio` (off main `09f2ac6`). Only chunk 1 is in the working tree, uncommitted. Live site = main `09f2ac6`.
- Facts found for chunks 2–4:
  - EN strings are inline in `index.html` (around line 165 onward). ES strings are a JSON block near the top of `index.html` (`hero.pill` at line 78, `hero.pill.s` at 41, `hero.see` at 81, `btn.resume` at 82, `build.*` at 62–63).
  - Pill markup: `index.html` line 167, `<p class="status-pill"><span class="long">…</span><span class="short">…</span></p>`. Phone pill CSS: `styles.css` lines 369 and 437 (`white-space: nowrap`). A second pill needs its own `<p>` or a wrapper that allows wrapping.
  - Buttons: `.hero-actions` at `index.html` lines 168–172. Phone grid: `styles.css` lines 379–381 (2 columns, the primary button spans both).
  - WhatsApp number (from the Services page, `services.html` line 228): `https://wa.me/573188022279`. Add `?text=` with the URL-encoded message in the page language. The ES text needs a key, plus a `data-i18n-attr="href:..."` like `url.resume` uses.
  - Slide 2 cards: `index.html` lines 182–198, with keys `b1.p`, `b2.p` and `b3.p`. Add a new `<p class="kind-benefit">` with keys `b1.v`, `b2.v`, `b3.v` and the muted-on-surface colour.
- Next: chunks 2 → 3 → 4, then a browser check (`python -m http.server 5102` in the user's terminal from the branch folder; the built-in browser at 360×640, 375×812, 1280×800; EN and ES; the h2 may wrap to 3 lines at 360). Then commit and ask the user to push.
