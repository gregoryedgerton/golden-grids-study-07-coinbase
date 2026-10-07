// Measures the reference page's visible tokens (colours, type) so the study's
// register is declared from measurement, not memory.
//   NODE_PATH=<node_modules with playwright> node captures/tokens.cjs <url>
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  const out = await page.evaluate(() => {
    const tally = {};
    const add = (k, v) => { if (!v || v === 'rgba(0, 0, 0, 0)' || v === 'none') return; tally[k] ??= {}; tally[k][v] = (tally[k][v] || 0) + 1; };
    for (const e of document.querySelectorAll('body *')) {
      const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) continue;
      const s = getComputedStyle(e);
      add('bg', s.backgroundColor); add('color', s.color); add('font', s.fontFamily.split(',')[0]);
      if (e.childElementCount === 0 && (e.textContent || '').trim()) add('size', `${s.fontSize}/${s.fontWeight}/${s.lineHeight}`);
      if (s.borderTopWidth !== '0px') add('border', `${s.borderTopWidth} ${s.borderTopColor}`);
      if (s.borderRadius !== '0px') add('radius', s.borderRadius);
    }
    const top = (k, n = 12) => Object.entries(tally[k] || {}).sort((a, b) => b[1] - a[1]).slice(0, n);
    return { bg: top('bg'), color: top('color'), font: top('font', 6), size: top('size', 24), border: top('border', 8), radius: top('radius', 6), header: (() => { const h = document.querySelector('header, #global-nav, .global-nav, nav'); if (!h) return null; const s = getComputedStyle(h); return { bg: s.backgroundColor, h: h.getBoundingClientRect().height }; })() };
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
