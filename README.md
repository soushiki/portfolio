# Sebastian Herrera · Portfolio

**Live:** https://sebherr.netlify.app · **3D version:** https://sebherr-3d.netlify.app

My main portfolio as a junior developer in Colombia (QA, data and web development). It shows my featured projects (Minoscreto, Ingresos App, Formato Médico, Whisker Gacha and others), my skills and how to contact me, in English and Spanish.

## What's on the page

- **Hero:** who I am, with links to my work, GitHub and my resume (English or Spanish).
- **Featured projects:** cards with a short description, the stack, and Live / Case study / Code links. The case studies live in `public/html/`.
- **More projects:** smaller React apps from my learning path.
- **Skills:** grouped as Frontend, Backend & data, and Tools. Each one is backed by a project; Spring Boot, Angular, PostgreSQL and Docker are used in [Stockroom](https://github.com/soushiki/stockroom).
- **Contact:** LinkedIn and GitHub.
- **3D tour:** a link to [Planets of Code](https://github.com/soushiki/portfolio-3d), a guided Three.js tour of the same projects.

## Stack

Plain HTML, CSS and JavaScript, with no framework or build step. Fonts come from Google Fonts and icons from Font Awesome.

- `index.html`: the page. The Spanish strings sit in `window.I18N_ES` at the top.
- `styles.css`: layout, light and dark themes (`prefers-color-scheme`), and the phone, tablet and short-screen rules.
- `public/js/i18n.js`: the EN/ES toggle. It swaps the `data-i18n`, `data-i18n-html` and `data-i18n-attr` values and remembers the choice (`?lang=es` or the browser's local storage).
- `public/html/`: the case studies and the English and Spanish resumes.
- `assets/images/`: project screenshots.

## Accessibility

- A "Skip to content" link is the first thing the keyboard reaches.
- Every link and button shows a visible focus ring.
- When the system asks for reduced motion, smooth scrolling, hover lifts and the icon animation are off.
- Links inside sentences are underlined, so colour is never the only cue.

## Run it locally

Any static server works, for example:

```bash
python -m http.server 8765
```

Then open http://127.0.0.1:8765. Netlify deploys the `main` branch as it is.
