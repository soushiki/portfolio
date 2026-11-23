# Portfolio layout and accessibility tests

Playwright checks (chromium + webkit) on index, services, secop and nyc311 at 320, 360, 768, 1280 and 800x400:
no sideways scroll, phone menu alignment, text centred in controls, target size, Netlify corner,
axe contrast/a11y, focus visible, reduced motion, transition speed.

    npm install
    npm run browsers   (browsers go to tests/.pw-browsers)
    npm test           (starts a local server on port 5076)
