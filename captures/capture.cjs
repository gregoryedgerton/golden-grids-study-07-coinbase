// Full-page reference captures at the program's three widths.
//   NODE_PATH=<a node_modules with playwright> node captures/capture.cjs <url> <prefix>
// Signed out, en-US, device scale 1. Cookie banners are declined, never accepted.
// Also writes <prefix>-<width>.json: the page's headed sections and the
// measured boxes of its rows, which is what the block inventory is derived from.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [url, prefix = 'reference', only] = process.argv.slice(2);
  const out = __dirname;
  const widths = only ? [Number(only)] : [390, 820, 1440];
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, locale: 'en-US' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(5000);
    for (const sel of ['button:has-text("Reject")', 'button:has-text("Decline")', 'button:has-text("Reject all")']) {
      try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 600 })) { await b.click({ timeout: 1200 }); await page.waitForTimeout(600); } } catch {}
    }
    await page.evaluate(async () => {
      const el = document.scrollingElement;
      for (let y = 0; y < el.scrollHeight; y += 500) { el.scrollTop = y; await new Promise(r => setTimeout(r, 150)); }
      el.scrollTop = 0;
    });
    await page.waitForTimeout(1500);
    const info = await page.evaluate(() => {
      const box = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
      const text = (e) => (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      const headings = [...document.querySelectorAll('h1,h2,h3')].filter(e => e.offsetParent).map(e => ({ tag: e.tagName, text: text(e), ...box(e) }));
      const images = [...document.querySelectorAll('img')].filter(e => e.offsetParent && e.getBoundingClientRect().width > 40).map(e => ({ alt: (e.alt || '').slice(0, 40), ...box(e) }));
      const tiles = [...document.querySelectorAll('li, [role="listitem"]')].map(e => ({ e, r: e.getBoundingClientRect() })).filter(o => o.r.width > 80 && o.r.height > 80).map(o => ({ text: text(o.e).slice(0, 40), ...box(o.e) }));
      return { tiles, url: location.href, title: document.title, width: innerWidth, height: document.scrollingElement.scrollHeight, headings, images };
    });
    fs.writeFileSync(path.join(out, `${prefix}-${w}.json`), JSON.stringify(info, null, 1));
    await page.screenshot({ path: path.join(out, `${prefix}-${w}.png`), fullPage: true });
    console.log(w, info.url, info.height, 'h:', info.headings.length, 'img:', info.images.length);
    await ctx.close();
  }
  await browser.close();
})();
