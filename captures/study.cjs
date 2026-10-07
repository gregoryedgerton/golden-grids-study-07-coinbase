// Captures of the study: every page at three widths, full page.
//   NODE_PATH=<a node_modules with playwright> node captures/study.cjs [base-url] [page ...]
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const PAGES = fs.readdirSync(path.join(__dirname, '..')).filter((f) => f.endsWith('.html')).map((f) => f.replace('.html', ''));
(async () => {
  const [base = 'http://localhost:5181/', ...only] = process.argv.slice(2);
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const page of only.length ? only : PAGES) for (const [w, h] of [[390, 844], [820, 1180], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); const errors = [];
    p.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await p.goto(`${base}${page}.html`, { waitUntil: 'networkidle' });
    // Lazy images load as they scroll into view; walk the page first.
    await p.evaluate(async () => { const el = document.scrollingElement; for (let y = 0; y < el.scrollHeight; y += 600) { el.scrollTop = y; await new Promise((r) => setTimeout(r, 80)); } el.scrollTop = 0; });
    await p.waitForLoadState('networkidle'); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(__dirname, `study-${page}-${w}.png`), fullPage: true });
    if (errors.length) console.log(page, w, 'ERRORS', errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await browser.close();
})();
