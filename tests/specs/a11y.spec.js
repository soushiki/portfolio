import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES, load, fmt } from './helpers.js';

const AXE_VPS = [{ w: 360, h: 740 }, { w: 1280, h: 800 }];
const DESK = { w: 1280, h: 800 };

for (const url of PAGES) {
  for (const vp of AXE_VPS) {
    test.describe(`${url} @ ${vp.w}x${vp.h}`, () => {
      test('6 axe contrast and a11y', async ({ page }) => {
        await load(page, url, vp);
        const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        const lines = res.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} nodes; ` + v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | '));
        expect(lines, `axe violations:${fmt(lines)}`).toEqual([]);
      });

      test('8 reduced motion', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await load(page, url, vp);
        await page.waitForTimeout(500);
        const bad = await page.evaluate(() =>
          document.getAnimations().filter((a) => {
            if (a.playState !== 'running') return false;
            const t = a.effect?.getComputedTiming?.();
            if (!t) return false;
            return t.iterations === Infinity || (typeof t.duration === 'number' && t.duration > 300);
          }).map((a) => {
            const t = a.effect.getComputedTiming();
            const el = a.effect.target;
            return `${a.animationName || a.transitionProperty || a.constructor.name} on ${el?.tagName?.toLowerCase()}.${String(el?.className?.baseVal ?? el?.className).split(' ')[0]} duration=${t.duration} iterations=${t.iterations}`;
          }));
        expect(bad, `running animations under reduced motion:${fmt(bad)}`).toEqual([]);
      });
    });
  }

  test.describe(`${url} @ 1280x800`, () => {
    test('7 focus visible', async ({ page }) => {
      await load(page, url, DESK);
      const bad = [];
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        const r = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const cs = getComputedStyle(el);
          const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
          const shadow = cs.boxShadow !== 'none';
          return { ok: outline || shadow, id: `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${el.textContent.trim().slice(0, 20)}"`, outline: `${cs.outlineStyle} ${cs.outlineWidth}`, shadow: cs.boxShadow };
        });
        if (r && !r.ok) bad.push(`tab ${i + 1}: ${r.id} outline=${r.outline} shadow=${r.shadow}`);
      }
      expect(bad, `focused without indicator:${fmt(bad)}`).toEqual([]);
    });

    test('9 UI transition speed', async ({ page }) => {
      await load(page, url, DESK);
      const bad = await page.evaluate(() => {
        const out = [];
        const toS = (s) => (s.trim().endsWith('ms') ? parseFloat(s) / 1000 : parseFloat(s));
        for (const el of document.querySelectorAll('a, button, .btn, .door, .lang-toggle, .motion-toggle')) {
          const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
          if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none') continue;
          const id = `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${el.textContent.trim().slice(0, 20)}"`;
          const durs = cs.transitionDuration.split(',').map(toS);
          const props = cs.transitionProperty.split(',').map((s) => s.trim());
          if (durs.some((d) => d > 0.3 + 1e-9)) out.push(`${id} duration=${cs.transitionDuration}`);
          if (props.includes('all') && durs.some((d) => d > 0)) out.push(`${id} transition-property includes all (${cs.transitionDuration})`);
        }
        return out;
      });
      expect(bad, `slow or transition:all:${fmt([...new Set(bad)])}`).toEqual([]);
    });
  });
}
