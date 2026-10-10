# Layout study — the signed-in Coinbase web app, as GIFbase

**Live:** [`https://gregoryedgerton.github.io/golden-grids-study-07-coinbase/`](https://gregoryedgerton.github.io/golden-grids-study-07-coinbase/)

An unaffiliated layout study. It rebuilds the structure of Coinbase's
signed-in web app — the home with its balance chart, trade panel,
watchlist and movers; My assets; Trade; Earn; Transactions; Learn; and an
asset's page — as ten pages of stacked golden grids for GIFbase, a
fictional exchange, with an invented account valued at real prices. The
reference was not captured: its public pages sit behind a bot check the
study did not cross, so the structure is rebuilt from how the app is known
to be organised, and the README says what that cost. Nothing from
Coinbase — pages, marks, copy — is reproduced. Built with
[Golden Grids](https://github.com/gregoryedgerton/golden-grids) from the
[study template](https://github.com/gregoryedgerton/golden-grids-study-template).

## Reference

The signed-in Coinbase web app, as of 2026: a left rail of sections (Home,
My assets, Trade, Earn, Transactions, Learn), a top bar with search, a Buy
& sell control and the account; a home that leads with "Your balance", a
line chart with range tabs and a Buy / Sell / Convert panel beside it,
then a watchlist, top movers, promotions, recent transactions and Learn
cards; an asset page that leads with the price and chart, the user's
position, market statistics and an About section. No capture exists in
`captures/`; the register (white cards with 16px radii on a cool grey
ground, one saturated blue, green and red for change, Inter standing in for
the proprietary face, a near-black dark scheme) is from the app's published
design system, not measured. This is the first study in the series without
a side-by-side, and the first whose content is live market data.

## Approach

The signed-in app shows a balance, then each position, then each statistic, in cards and tables of even weight. The study sets each of those groups as one grid: a chart or the leading figure in the largest square, single figures in the smallest, with type fitted to each square.

## The pages

Ten Vite entries, no router, plain relative links; `src/lib/Page.tsx` is
the shell. Bands below with the grid's measured width×height at 390 / 820
/ 1440; below desktop a five- or six-square band is dealt into two stacked
grids (a three and a two, or two threes) so no square falls under 114px,
which is the lever this study adds to the series. Flat modules — the trade
panel, promotions, transactions, the assets and prices tables, staking
notes — are forms, lists and tables. Breakpoints live in
[`src/lib/viewport.ts`](src/lib/viewport.ts).

| Page · band | Range · placement · clockwise (desktop) | Measured | What it holds |
| --- | --- | --- | --- |
| Home · Your balance | 1–5 · top · cw | 332×221+166 / 762×508+381 / 1126×704 | Balance with chart and range tabs; today, all-time return, best today, cash |
| Home · Watchlist | 1–6 · right · cw | 2×(332×221) / 2×(762×508) / 1126×693 | Six assets: price, 24h change, week line, holding |
| Home · Top movers | 1–5 · bottom · ccw | 332×221+166 / 762×508+381 / 1126×704 | The five largest 24h moves among twelve assets |
| Home · Learn | 1–4 · left · ccw | 332×553 / 762×457 / 1126×676 | Four topics; More opens the Wikipedia summary |
| My assets · Allocation | 1–6 · left · cw | 2×(332×221) / 2×(762×508) / 1126×693 | The allocation ring; each position's share |
| Earn · Rewards rates | 1–5 · top · ccw | 332×221+166 / 762×508+381 / 1126×704 | Five stakeable assets: rate, unstaking period, what the account earns |
| Learn · The ground / Further | 1–3 · top · ccw / bottom · cw | 332×498 / 762×508 / 1126×751 | Three topics each |
| Asset · Price | 1–5 · top · cw | 332×221+166 / 762×508+381 / 1126×704 | Price with chart (1D 1W 1M 1Y ALL); your position, 24h, market cap, volume |
| Asset · Market stats | 1–6 · right · ccw | 2×(332×221) / 2×(762×508) / 1126×693 | All-time high, supply, 24h high and low, 30d volume, rank |
| Asset · About | 1–3 · bottom · cw | 332×498 / 762×508 / 1126×751 | The summary with More; links to the source and the trade panel |
| Asset · Also on GIFbase | 1–6 · right · cw | 2×(332×221) / 2×(762×508) / 1126×693 | Six other assets |

All eight placement × direction orientations appear at desktop.

## The data

`captures/data.py` writes `src/data/market.json`: for twelve assets, the
last price and 24-hour open, high, low and volume, and five-minute, hourly,
six-hourly and daily closes (daily back to listing for the four with pages),
from the Coinbase Exchange public API; market capitalisation, circulating
and maximum supply, all-time high and rank from CoinGecko; and summaries of
Bitcoin, Ethereum, Solana, the XRP Ledger, blockchains, stablecoins,
proof of stake, wallets and DeFi from Wikipedia (CC BY-SA 4.0, linked
where shown). The snapshot is dated on every page (`meta.asOf`, the newest
candle). Re-run the script to move the snapshot; nothing is edited by hand.

The account is fictional: `src/portfolio.ts` holds five positions with
cost bases, two of them staked, a USDC balance, ten transactions and five
indicative rewards rates. The balance chart values today's quantities at
each point's prices. Every module that could be mistaken for an account or
an offer says it is not; the trade panel previews an order and places
nothing.

## How it works

- Numbers are `StatCard`s (`Fact` from [`src/lib/boxes.tsx`](src/lib/boxes.tsx)
  with the line fitted by [`src/lib/fit.tsx`](src/lib/fit.tsx), capped at
  120px); `ChartBox` ([`src/lib/cards.tsx`](src/lib/cards.tsx)) fits the
  number, gives the rest of the square to the line, and holds the range;
  `AssetCard` is a whole square as a link. Body copy is removed under 300px
  of height, the change line and sparkline under 200px, the label under 64px.
- Figures ([`src/lib/charts.tsx`](src/lib/charts.tsx)) are inline SVG from
  the data: the price line with its high and low, the sparkline, the
  allocation ring; each has a label that reads the figure aloud.
- The statistics with a longer note and every Learn and About card expand
  in place ([`src/lib/expand.tsx`](src/lib/expand.tsx)).
- Light is the app's; dark is the app's dark scheme, by device preference;
  the blue, green and red have a text token per scheme.
- [`captures/scan.cjs`](captures/scan.cjs), Chrome and WebKit, 390 / 820 /
  1440, light and dark, all ten pages: nothing overflows, no fitted line
  under 12px, axe (WCAG 2.0/2.1/2.2 A/AA, best practice) clean with a More
  open. No screen-reader user has tested it.

## Notes for review

Observations for whoever reviews this study, recorded without a verdict. Whether the layout suits the page is assessed separately, after every study has been reviewed.

- **No capture.** There is no side-by-side and no measured colour or type; the structure is from knowledge of the app.
- **Five and six squares at 820.** In one grid the smallest square would be 35px, so those bands are two stacked grids below desktop.
- **Fitted type.** With the 120px cap, a number alone in the largest square of a landscape five-square grid leaves room around it at 1440.
- **Two change figures.** The 1D balance change and the 24h change measure different windows and can differ by tens of dollars; both are labelled.
- **Rewards rates.** They are indicative figures, not a feed.

## Disclosure

Every page says what it is in three places, all read from
[`src/study.json`](src/study.json): its title and description, a sticky notice
at the top, and a disclosure at the very end listing the pages reviewed, what
is real, what is invented or changed, and where each kind of asset came from.

## Study tools

A floating panel (top right) toggles grid outlines (`g`), band notes (`n`,
which carry each band's range and placement) and reduced motion (`m`).

## Running and deploying

```bash
npm install
python3 captures/data.py   # refresh the snapshot
npm run dev
```

`npm run build` type-checks and builds to `dist/`; pushing to `main` deploys
to GitHub Pages. The library is consumed from npm at its published version,
never linked locally.
