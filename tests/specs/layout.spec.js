import { test, expect } from '@playwright/test';
import { PAGES, VIEWPORTS, load, openMenu, raf2, fmt } from './helpers.js';

for (const url of PAGES) {
  for (const vp of VIEWPORTS) {
    test.describe(`${url} @ ${vp.w}x${vp.h}`, () => {
      test.beforeEach(async ({ page }) => load(page, url, vp));

      test('1 no sideways scroll', async ({ page }) => {
        const r = await page.evaluate(() => {
          const sw = document.documentElement.scrollWidth, iw = window.innerWidth;
          const off = [];
          if (sw > iw + 1) {
            for (const el of document.querySelectorAll('body *')) {
              const b = el.getBoundingClientRect();
              if (b.width && b.right > iw + 1) off.push({ tag: el.tagName.toLowerCase(), cls: String(el.className?.baseVal ?? el.className), right: Math.round(b.right) });
            }
            off.sort((a, b) => b.right - a.right);
          }
          return { sw, iw, off: off.slice(0, 8) };
        });
        expect(r.sw, `scrollWidth ${r.sw} > innerWidth ${r.iw}; widest:${fmt(r.off)}`).toBeLessThanOrEqual(r.iw + 1);
      });

      test('2 phone menu alignment', async ({ page }) => {
        test.skip(vp.w > 600, 'phone only');
        await openMenu(page);
        const r = await page.evaluate(() => {
          const rows = [...document.querySelectorAll('#nav-links > li')];
          const lefts = [];
          const vis = (e) => { const c = getComputedStyle(e), r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; };
          for (const li of rows) {
            const ctl = [...li.querySelectorAll('a, button')].find(vis);
            let left = null;
            if (ctl) {
              const cs = getComputedStyle(ctl);
              const border = ['Top', 'Right', 'Bottom', 'Left'].some((d) => parseFloat(cs['border' + d + 'Width']) > 0 && cs['border' + d + 'Style'] !== 'none' && !/rgba\(.*,\s*0\)$/.test(cs['border' + d + 'Color']));
              const bg = cs.backgroundColor !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(cs.backgroundColor);
              if (border || bg) left = ctl.getBoundingClientRect().left;
              else {
                const w = document.createTreeWalker(ctl, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
                let n;
                while ((n = w.nextNode())) {
                  if (n.nodeType === 1) {
                    if (/^(I|SVG|IMG)$/i.test(n.tagName) && vis(n)) { left = n.getBoundingClientRect().left; break; }
                  } else if (n.textContent.trim() && vis(n.parentElement)) {
                    const rg = document.createRange(); rg.selectNodeContents(n);
                    const bb = rg.getBoundingClientRect();
                    if (bb.width) { left = bb.left; break; }
                  }
                }
              }
            }
            if (left !== null) lefts.push({ row: li.textContent.trim().slice(0, 20), left });
          }
          return { lefts };
        });
        const base = r.lefts[0]?.left;
        const bad = r.lefts.filter((x) => Math.abs(x.left - base) > 1);
        expect(bad, `row text left edges differ from first (${base}):${fmt(bad)}`).toEqual([]);
      });

      test('3 text centred in controls', async ({ page }) => {
        if (vp.w <= 600) await openMenu(page);
        const bad = await page.evaluate(() => {
          const sels = ['.lang-toggle span', '.motion-toggle', '.nav-toggle', '.btn', '.corner-3d', '#nav-links a'];
          const out = [];
          for (const s of sels) {
            for (const el of document.querySelectorAll(s)) {
              const er = el.getBoundingClientRect(), cs = getComputedStyle(el);
              if (!er.width || !er.height || cs.visibility === 'hidden' || cs.display === 'none') continue;
              const rg = document.createRange();
              const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
              let n, top = Infinity, bottom = -Infinity, any = false;
              while ((n = w.nextNode())) {
                if (!n.textContent.trim()) continue;
                rg.selectNodeContents(n);
                for (const q of rg.getClientRects()) { if (!q.height) continue; any = true; top = Math.min(top, q.top); bottom = Math.max(bottom, q.bottom); }
              }
              if (!any) continue;
              const gt = top - er.top, gb = er.bottom - bottom;
              if (Math.abs(gt - gb) > 2) out.push({ sel: s, text: el.textContent.trim().slice(0, 20), top: +gt.toFixed(2), bottom: +gb.toFixed(2) });
            }
          }
          return out;
        });
        expect(bad, `text not vertically centred (gaps px):${fmt(bad)}`).toEqual([]);
      });

      test('4 target size', async ({ page }) => {
        await openMenu(page);
        const bad = await page.evaluate((vw) => {
          const out = [];
          const inline = (el) => {
            const blk = el.closest('p, figcaption, td, li');
            if (!blk) return false;
            if (blk.tagName === 'LI' && (!blk.closest('article, main') || blk.closest('nav, .nav'))) return false;
            const rest = blk.textContent.replace(el.textContent, '').trim();
            return rest.length > 0 && getComputedStyle(el).display === 'inline';
          };
          for (const el of document.querySelectorAll('a, button, [role=button], summary, input, select')) {
            const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
            if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none') continue;
            if (el.matches('input[type=hidden]')) continue;
            const label = (el.textContent.trim() || el.getAttribute('aria-label') || '').slice(0, 24);
            const id = `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${label}"`;
            const size = `${r.width.toFixed(1)}x${r.height.toFixed(1)}`;
            if (!inline(el) && (r.height < 24 - 0.01 || r.width < 24 - 0.01)) out.push(`<24px: ${id} ${size}`);
            if (vw <= 1024 && (el.closest('.nav') || el.matches('.btn')) && r.height < 44 - 0.01) out.push(`<44px tall: ${id} ${size}`);
          }
          return out;
        }, vp.w);
        expect(bad, `undersized targets:${fmt(bad)}`).toEqual([]);
      });

      test('5 netlify badge corner free', async ({ page }) => {
        await openMenu(page);
        const bad = [];
        for (const p of ['top', 'middle', 'bottom']) {
          await page.evaluate((p) => {
            const max = document.documentElement.scrollHeight - innerHeight;
            window.scrollTo(0, p === 'top' ? 0 : p === 'middle' ? max / 2 : max);
          }, p);
          await raf2(page);
          const hits = await page.evaluate((p) => {
            const x0 = innerWidth - 240, y0 = innerHeight - 72, out = [];
            const pinned = (el) => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const ps = getComputedStyle(e).position; if (ps === 'fixed' || ps === 'sticky') return ps; } return null; };
            for (const el of document.querySelectorAll('a, button, input, select, summary, [role=button]')) {
              const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
              if (!r.width || !r.height || cs.visibility === 'hidden' || cs.display === 'none') continue;
              if (!(r.right > x0 && r.left < innerWidth && r.bottom > y0 && r.top < innerHeight)) continue;
              const pin = pinned(el);
              if (pin || p === 'bottom') out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} "${el.textContent.trim().slice(0, 20)}" ${pin ? 'pinned=' + pin : 'in-flow'} rect=${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`);
            }
            return out;
          }, p);
          for (const h of hits) bad.push(`[${p}] ${h}`);
        }
        expect(bad, `interactive elements in bottom-right 240x72 (fixed/sticky at any scroll, any element at page bottom):${fmt(bad)}`).toEqual([]);
      });

      test('10 lang and 3D always visible', async ({ page }) => {
        const r = await page.evaluate(() => {
          const rc = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
          const q = (s) => rc(document.querySelector(s));
          return { iw: innerWidth, ih: innerHeight, lang: q('.corner-stack > .lang-toggle'), pill: q('.corner-3d'), nav: q('.nav'), brand: q('.nav-brand'), resume: q('.nav-resume'), burger: q('.nav-toggle'), langInNav: !!document.querySelector('.nav .lang-toggle') };
        });
        const inter = (a, b) => a && b && a.w > 0 && b.w > 0 && a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
        for (const [name, el] of [['lang', r.lang], ['pill', r.pill]]) {
          expect(el, `${name} missing`).not.toBeNull();
          expect(el.w > 0 && el.h > 0, `${name} has no size`).toBe(true);
          expect(el.l >= 0 && el.t >= 0 && el.r <= r.iw + 0.5 && el.b <= r.ih + 0.5, `${name} outside viewport ${fmt(el)}`).toBe(true);
          expect(el.h, `${name} height`).toBeGreaterThanOrEqual(43.5);
        }
        const zone = { l: r.iw - 240, t: r.ih - 72, r: r.iw, b: r.ih, w: 240, h: 72 };
        for (const [name, el] of [['lang', r.lang], ['pill', r.pill]]) {
          expect(inter(el, zone), `${name} in netlify corner`).toBeFalsy();
          expect(inter(el, r.nav), `${name} overlaps nav`).toBeFalsy();
        }
        expect(inter(r.lang, r.pill), 'lang intersects pill').toBeFalsy();
        expect(r.lang.b, 'lang above pill').toBeLessThanOrEqual(r.pill.t + 0.5);
        expect(r.langInNav, 'lang toggle still in nav').toBe(false);
      });
    });
  }
}
