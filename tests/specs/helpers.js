export const PAGES = ['/index.html', '/services.html', '/secop.html', '/nyc311.html'];
export const VIEWPORTS = [
  { w: 320, h: 568 },
  { w: 360, h: 740 },
  { w: 768, h: 1024 },
  { w: 1280, h: 800 },
  { w: 800, h: 400 },
];

export async function load(page, url, vp) {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
}

export async function openMenu(page) {
  const t = page.locator('.nav-toggle');
  if (await t.isVisible()) {
    if ((await t.getAttribute('aria-expanded')) !== 'true') await t.click();
    await page.waitForTimeout(400);
    return true;
  }
  return false;
}

export const raf2 = (page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

export function fmt(list) {
  return list.length ? '\n  ' + list.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n  ') : '';
}
