# Second pass of the ChatGPT selling advice: build spec (Opus, 2026-11-12)

Follows `home-copy-spec.md` (pass 1, live as 0f94717). Source of the advice: `evaluation-2026-11-12.md` sections 3–4. Builder: Sonnet. Check: Opus at 360×640, 375×812, 1280×800, EN and ES. Branch `opus/project-cases` off main 30cdf6a.

## Facts behind the copy (from memory and project files, 2026-11-12)
- Ingresos App: built for a real restaurant (receipts, POS closings, report for its accountant). Not stated as paid, so never "client".
- Formato Médico: built for a practising doctor (its README names him; don't name him on the site).
- Minoscreto and Data science: personal projects.
- Featured set stays Minoscreto, Ingresos App, Formato Médico, Data science (the 3D tour shows the same set).

## 1. Featured project cards (#projects): problem → solution → what it changes
Replace each card's description paragraph (`c.minoscreto`, `c.ingresos`, `c.formato`, `c.data`) with a `<dl class="case">` of three rows. Tags and links stay as they are. Labels: EN Problem / Solution / What it changes; ES Problema / Solución / Qué cambia (keys `case.p`, `case.s`, `case.v`). Labels in bold `--text`, values in the current muted-on-surface colour. Section subheading `proj.sub` becomes EN "What each one solves, and for whom." / ES "Qué resuelve cada uno y para quién."

| Card | Row | EN | ES |
|---|---|---|---|
| Minoscreto `m.p/m.s/m.v` | Problem | Pasting a document into an AI chat exposes the real names in it. | Pegar un documento en un chat de IA expone los nombres reales que contiene. |
| | Solution | Swaps names for placeholders in your browser, then puts the real names back into the AI's answer. | Cambia los nombres por marcadores en tu navegador y después devuelve los nombres reales a la respuesta de la IA. |
| | What it changes | You can use AI on real documents and the names never leave your computer. 160 automated tests. | Puedes usar IA con documentos reales sin que los nombres salgan de tu computador. 160 pruebas automatizadas. |
| Ingresos App `i.p/i.s/i.v` | Problem | A restaurant typed its receipts and POS cash-closing reports into the books by hand. | Un restaurante pasaba a mano sus recibos y cierres de caja del POS a la contabilidad. |
| | Solution | Built for that restaurant: reads photos and PDFs with OCR and a local vision model and builds the day's ledger in Excel. | Hecha para ese restaurante: lee fotos y PDF con OCR y un modelo de visión local y arma el libro del día en Excel. |
| | What it changes | The month's papers become a ledger ready for the accountant, with the cash closing checked against the receipts. | Los papeles del mes quedan como un libro listo para el contador, con el cierre de caja cuadrado contra los recibos. |
| Formato Médico `f.p/f.s/f.v` | Problem | A doctor's lab orders, prescriptions and certificates have to match his printed form exactly. | Las órdenes de laboratorio, recetas y certificados de un médico deben coincidir exactamente con su formato impreso. |
| | Solution | Built for that doctor: fills them as PDFs identical to the form, with an offline ICD-10 search, on web and Android. | Hecha para ese médico: los llena como PDF idénticos al formato, con buscador CIE-10 sin internet, en web y Android. |
| | What it changes | Each document comes out ready to print or send from the phone. | Cada documento sale listo para imprimir o enviar desde el celular. |
| Data science `d.p/d.s/d.v` | Problem | Agencies and businesses need to know what to fix first and what demand to expect. | Entidades y negocios necesitan saber qué atender primero y qué demanda esperar. |
| | Solution | Three projects on real public data: which NYC 311 complaints will fall behind, Britain's electricity demand forecast against the grid operator, and an email A/B uplift test. | Tres proyectos con datos públicos reales: qué quejas del 311 de Nueva York se van a atrasar, el pronóstico de demanda eléctrica de Gran Bretaña frente al operador de la red y una prueba A/B de correos. |
| | What it changes | Each one says what won, what lost and against which baseline, so a decision can rest on it. | Cada uno dice qué ganó, qué perdió y contra qué línea base, para poder decidir con eso. |

## 2. New "How I work" section, after the 3D tour box and before #more
`<section class="section" id="how" aria-labelledby="how-h-home">`, heading h2. Reuse the Services page's three steps and its EN/ES text exactly (keys `s1.h … s3.p`, `how.h` from `services.html` lines 58–64 and 211–216; add them to the index `I18N_ES` block). Copy the `.steps` styles from `public/css/services.css` into `styles.css` only if index doesn't load services.css (check). Under the steps: the closing line EN "Have an idea or a business process you'd like to improve? Let's talk about it." / ES "¿Tienes una idea o un proceso de tu negocio que te gustaría mejorar? Conversemos." (`how.cta`) and a link "See services and prices" / "Ver servicios y precios" (`how.svc`) to `./services.html`.

## 3. Contact section (#contact): WhatsApp and email first
Keep the heading. Text `ct.p` becomes EN "For a project: WhatsApp or email. For a job: LinkedIn or my resume." / ES "Para un proyecto: WhatsApp o correo. Para un empleo: LinkedIn o mi hoja de vida." Buttons in this order: "Let's discuss your project" (primary, same WhatsApp link and `url.discuss` key as the hero), Email (`mailto:` the address already on services.html), LinkedIn, GitHub. Same phone grid as the hero (primary full width, others two per row).

## Must not break
Touch snap: add `#how` to the `scroll-snap-align: start` list in the `(pointer: coarse)` block. Reveal, Motion button, calm mode, i18n, 44 px targets, AA contrast, no horizontal overflow. Don't change the hero, slides 2–3, tags or card links.

## Not in this pass
The 3D tour copy (sync it after the user sees this), packages and prices on the home page (they live on services.html).
