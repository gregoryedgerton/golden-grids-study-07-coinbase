import type React from "react";
import { GoldenGrid, GoldenBox } from "@gifcommit/golden-grids";
import type { PlacementValue } from "@gifcommit/golden-grids";
import { useViewport, pick, type Viewport } from "../lib/viewport";
import { useExpandGroup } from "../lib/expand";
import { Fact, Figure, LinkBox } from "../lib/boxes";
import { ChartBox, AssetCard, StatCard, LearnCard } from "../lib/cards";
import { Donut, TONES } from "../lib/charts";
import { Band } from "./Band";
import { ASSETS, LEARN, SYMBOLS, usd, pct, qty, units, day, changePct24, type Asset } from "../data";
import { positions, totals, balanceSeries, HOLDINGS, STAKING, CASH } from "../portfolio";
import { assetHref } from "../lib/Page";

/**
 * The bands. Each is one small-range grid with one editorial job, after a
 * module of the signed-in reference: the balance header, the watchlist,
 * the movers, the allocation ring, an asset's price header and its market
 * statistics, the staking rates, and the Learn cards. Orientation is a
 * desktop and a mobile pair per band, by parity: an even count is
 * landscape as right/left, an odd count as top/bottom.
 */
type O = [PlacementValue, boolean];
const orient = (v: Viewport, desktop: O, mobile: O) => pick<O>(v, { mobile, tablet: desktop, desktop });

/**
 * One grid, or below desktop two stacked: a run of five or six squares at
 * 390px leaves its smallest square 43–68px wide, and at 820px 35–73px, too
 * small for a price, so the boxes are dealt into a three and a two (or two
 * threes), each square at least 114px. Children are already in largest-to-smallest order, so
 * the first chunk takes the larger items. The band's note says which.
 */
function Grids({ boxes, placement, cw, split }: { boxes: React.ReactNode[]; placement: PlacementValue; cw: boolean; split: boolean }) {
  if (!split || boxes.length < 5) return <GoldenGrid from={1} to={boxes.length} placement={placement} clockwise={cw}>{boxes}</GoldenGrid>;
  const first = 3, rest = boxes.length - first;
  return (
    <div className="stack">
      <GoldenGrid from={1} to={first} placement="top" clockwise={cw}>{boxes.slice(0, first)}</GoldenGrid>
      <GoldenGrid from={1} to={rest} placement={rest % 2 ? "bottom" : "right"} clockwise={!cw}>{boxes.slice(first)}</GoldenGrid>
    </div>
  );
}
const noteFor = (v: Viewport, n: number, placement: PlacementValue, cw: boolean) => v !== "desktop" && n >= 5 ? `two grids: from=1 to=3 · placement="top" / from=1 to=${n - 3}` : `from=1 to=${n} · placement="${placement}" · clockwise=${cw}`;

/** Home: "Your balance", the number and the chart, with the day's figures beside it. */
export function BalanceBand() {
  const v = useViewport();
  const [placement, cw] = orient(v, ["top", true], ["right", true]);
  const t = totals();
  const series = Object.fromEntries((["1D", "1W", "1M", "1Y"] as const).map((r) => [r, balanceSeries(r)]));
  const best = positions().sort((a, b) => b.change24 - a.change24)[0];
  return (
    <Band id="balance" title="Your balance" lesson={`${usd(t.balance)} across ${HOLDINGS.length} assets and cash, ${t.change24 >= 0 ? "up" : "down"} ${usd(Math.abs(t.change24))} today. Figures update with the market; holdings are shown at the last price.`} note={noteFor(v, 5, placement, cw)}>
      <Grids placement={placement} cw={cw} split={v !== "desktop"} boxes={[
        <GoldenBox key="chart"><ChartBox label="Your balance" series={series} value={t.balance} name="Your balance" /></GoldenBox>,
        <GoldenBox key="today"><StatCard label="Today" value={usd(t.change24, { sign: true })} tone={t.change24 >= 0 ? "up" : "down"} body={<p>{pct(t.change24Pct)} on the day across every holding; cash does not move.</p>} /></GoldenBox>,
        <GoldenBox key="return"><StatCard label="All-time return" value={pct(t.gainPct, 1)} body={<p>{usd(t.gain, { sign: true })} against {usd(t.cost)} paid for the five positions.</p>} /></GoldenBox>,
        <GoldenBox key="best"><StatCard label="Best today" value={best.symbol} spoken={`${best.name}, ${usd(best.change24, { sign: true })} today`} body={<p>{usd(best.change24, { sign: true })}</p>} /></GoldenBox>,
        <GoldenBox key="cash"><StatCard label="Cash" value={usd(CASH)} body={<p>USDC, available to trade.</p>} /></GoldenBox>,
      ]} />
    </Band>
  );
}

/** Home: the watchlist, six assets with a price, the day's change and a week's line. */
export function WatchlistBand({ symbols, id = "watchlist", title = "Watchlist", lesson }: { symbols: string[]; id?: string; title?: string; lesson?: string }) {
  const v = useViewport();
  const [placement, cw] = orient(v, ["right", true], ["top", true]);
  const held = Object.fromEntries(HOLDINGS.map((h) => [h.symbol, h.qty]));
  return (
    <Band id={id} title={title} lesson={lesson ?? "Six assets, priced from Coinbase's public market data. The line is the past week; the change is against the price twenty-four hours ago."} note={noteFor(v, symbols.length, placement, cw)} aside={{ href: "./trade.html", label: "All assets" }}>
      <Grids placement={placement} cw={cw} split={v !== "desktop"} boxes={symbols.map((s) => <GoldenBox key={s}><AssetCard a={ASSETS[s]} holding={held[s] ? qty(held[s], s) : undefined} /></GoldenBox>)} />
    </Band>
  );
}

/** Home: the day's biggest moves, up or down, from the twelve assets listed. */
export function MoversBand() {
  const v = useViewport();
  const [placement, cw] = orient(v, ["bottom", false], ["left", false]);
  const movers = SYMBOLS.map((s) => ASSETS[s]).sort((a, b) => Math.abs(changePct24(b)) - Math.abs(changePct24(a))).slice(0, 5);
  const words = movers.map((a) => `${a.name} ${pct(changePct24(a))}`).join(", ");
  return (
    <Band id="movers" title="Top movers" lesson={`The five largest moves of the past twenty-four hours among the assets listed here: ${words}. A move is measured from the price at the same time yesterday.`} note={noteFor(v, 5, placement, cw)}>
      <Grids placement={placement} cw={cw} split={v !== "desktop"} boxes={movers.map((a) => <GoldenBox key={a.symbol}><AssetCard a={a} /></GoldenBox>)} />
    </Band>
  );
}

/** Home and Learn: topics, each a Wikipedia summary behind a fitted title. */
export function LearnBand({ keys, id = "learn", title = "Learn", lesson, flip }: { keys: [string, string][]; id?: string; title?: string; lesson?: string; flip?: boolean }) {
  const v = useViewport();
  const x = useExpandGroup();
  const n = keys.length;
  const [placement, cw] = n % 2 === 0 ? orient(v, ["left", false], ["bottom", false]) : flip ? orient(v, ["bottom", true], ["left", true]) : orient(v, ["top", false], ["right", false]);
  return (
    <Band id={id} title={title} lesson={lesson ?? "Short accounts of the ideas behind the assets on this page, from Wikipedia. Each opens to its full summary and its source."} note={`from=1 to=${n} · placement="${placement}" · clockwise=${cw}`} aside={{ href: "./learn.html", label: "All topics" }}>
      <GoldenGrid from={1} to={n} placement={placement} clockwise={cw}>
        {keys.map(([k, title]) => <GoldenBox key={k} {...x.boxProps(k)}><LearnCard w={LEARN[k] ?? ASSETS[k].wiki!} title={title} x={x} slotKey={k} /></GoldenBox>)}
      </GoldenGrid>
    </Band>
  );
}

/** My assets: the allocation ring and each position's share. */
export function AllocationBand() {
  const v = useViewport();
  const [placement, cw] = orient(v, ["left", true], ["bottom", true]);
  const pos = positions();
  const t = totals();
  const parts = [...pos.map((p, i) => ({ name: p.name, share: p.share, tone: TONES[i] })), { name: "Cash", share: t.cashShare, tone: TONES[5] }];
  return (
    <Band id="allocation" title="Allocation" lesson={`${usd(t.balance)} in total: ${pos.map((p) => `${p.share.toFixed(0)}% ${p.name}`).join(", ")} and ${t.cashShare.toFixed(0)}% cash. The ring is the same figures drawn.`} note={noteFor(v, 6, placement, cw)}>
      <Grids placement={placement} cw={cw} split={v !== "desktop"} boxes={[
        <GoldenBox key="ring">
          <Figure label="Allocation" caption={`${pos[0].name} is ${pos[0].share.toFixed(0)}% of the balance; cash ${t.cashShare.toFixed(0)}%.`}>
            <Donut parts={parts} label={`Allocation: ${parts.map((p) => `${p.name} ${p.share.toFixed(0)}%`).join(", ")}`} centre={`${pos[0].share.toFixed(0)}%`} sub={pos[0].symbol} />
          </Figure>
        </GoldenBox>,
        ...pos.map((p, i) => (
          <GoldenBox key={p.symbol}>
            <StatCard label={p.name} value={`${p.share.toFixed(p.share < 10 ? 1 : 0)}%`} spoken={`${p.name}, ${p.share.toFixed(1)} percent of the balance, ${usd(p.value)}`} body={<p style={{ borderLeft: `4px solid ${TONES[i]}`, paddingLeft: "0.5em" }}>{usd(p.value)} · {qty(p.qty, p.symbol)} · {pct(p.gainPct, 1)} all time</p>} />
          </GoldenBox>
        )),
      ]} />
    </Band>
  );
}

/** An asset's page: its price header, your position, and the day's figures. */
export function PriceBand({ a }: { a: Asset }) {
  const v = useViewport();
  const [placement, cw] = orient(v, ["top", true], ["right", true]);
  const h = HOLDINGS.find((x) => x.symbol === a.symbol);
  const ch = a.price - a.open24;
  return (
    <Band id="price" title={`${a.name} price`} lesson={`${usd(a.price)} per ${a.symbol}, ${ch >= 0 ? "up" : "down"} ${usd(Math.abs(ch))} (${pct(changePct24(a))}) in twenty-four hours, between a low of ${usd(a.low24)} and a high of ${usd(a.high24)}. Volume on the ${a.product} book was ${units(a.volume24)} ${a.symbol}.`} note={noteFor(v, 5, placement, cw)}>
      <Grids placement={placement} cw={cw} split={v !== "desktop"} boxes={[
        <GoldenBox key="chart"><ChartBox label={`${a.name} · ${a.symbol}`} series={a.series} value={a.price} name={a.name} /></GoldenBox>,
        <GoldenBox key="yours">
          {h ? <StatCard label={`Your ${a.symbol}`} value={usd(h.qty * a.price)} body={<p>{qty(h.qty, a.symbol)}{h.staked ? `, ${qty(h.staked, a.symbol)} staked` : ""}; paid {usd(h.cost)}, {pct(((h.qty * a.price - h.cost) / h.cost) * 100, 1)} all time.</p>} />
             : <StatCard label={`Your ${a.symbol}`} value="None" body={<p>You do not hold {a.name}. Buy, or set a recurring buy, from the panel below.</p>} />}
        </GoldenBox>,
        <GoldenBox key="change"><StatCard label="24h change" value={pct(changePct24(a))} tone={ch >= 0 ? "up" : "down"} body={<p>{usd(ch, { sign: true })} since the same time yesterday.</p>} /></GoldenBox>,
        <GoldenBox key="cap"><StatCard label="Market cap" value={a.marketCap ? usd(a.marketCap, { compact: true }) : "—"} body={<p>Rank {a.rank ?? "—"} by market capitalisation.</p>} /></GoldenBox>,
        <GoldenBox key="vol"><StatCard label="24h volume" value={units(a.volume24)} spoken={`${units(a.volume24)} ${a.symbol}`} body={<p>{a.symbol}; {usd(a.volume24 * a.price, { compact: true })} at the last price.</p>} /></GoldenBox>,
      ]} />
    </Band>
  );
}

/** An asset's page: market statistics in six squares. */
export function StatsBand({ a }: { a: Asset }) {
  const v = useViewport();
  const x = useExpandGroup();
  const [placement, cw] = orient(v, ["right", false], ["top", false]);
  const fromAth = a.ath ? ((a.price - a.ath) / a.ath) * 100 : null;
  return (
    <Band id="stats" title="Market stats" lesson={`Circulating supply ${a.supply ? units(a.supply) : "—"}${a.maxSupply ? ` of a maximum ${units(a.maxSupply)}` : ""}. All-time high ${a.ath ? usd(a.ath) : "—"}${a.athDate ? ` on ${day(a.athDate)}` : ""}${fromAth !== null ? `, ${pct(fromAth, 1)} from here` : ""}. Thirty-day volume ${units(a.volume30d)} ${a.symbol} on the ${a.product} book.`} note={noteFor(v, 6, placement, cw)}>
      <Grids placement={placement} cw={cw} split={v !== "desktop"} boxes={[
        <GoldenBox key="ath" {...x.boxProps("ath")}><StatCard x={x} slotKey="ath" label="All-time high" value={a.ath ? usd(a.ath) : "—"} body={<p>{a.athDate ? day(a.athDate) : ""}{fromAth !== null ? `; the price is ${pct(fromAth, 1)} from it.` : ""}</p>} long={<p>The all-time high is the highest price CoinGecko records across the exchanges it tracks, which can differ by a little from the high on any one book.</p>} /></GoldenBox>,
        <GoldenBox key="supply" {...x.boxProps("supply")}><StatCard x={x} slotKey="supply" label="Circulating supply" value={a.supply ? units(a.supply) : "—"} spoken={a.supply ? `${Math.round(a.supply).toLocaleString()} ${a.symbol}` : undefined} body={<p>{a.maxSupply ? `Of a maximum ${units(a.maxSupply)} ${a.symbol}.` : `${a.symbol} has no fixed maximum supply.`}</p>} long={<p>Circulating supply counts units that can be traded; market capitalisation is this figure multiplied by the price.</p>} /></GoldenBox>,
        <GoldenBox key="high"><StatCard label="24h high" value={usd(a.high24)} /></GoldenBox>,
        <GoldenBox key="low"><StatCard label="24h low" value={usd(a.low24)} /></GoldenBox>,
        <GoldenBox key="v30"><StatCard label="30d volume" value={units(a.volume30d)} spoken={`${units(a.volume30d)} ${a.symbol} in thirty days`} /></GoldenBox>,
        <GoldenBox key="rank"><StatCard label="Rank" value={a.rank ? `#${a.rank}` : "—"} /></GoldenBox>,
      ]} />
    </Band>
  );
}

/** An asset's page: the summary, and where it continues. */
export function AboutBand({ a }: { a: Asset }) {
  const v = useViewport();
  const x = useExpandGroup();
  const [placement, cw] = orient(v, ["bottom", true], ["left", true]);
  const w = a.wiki!;
  const sentences = w.extract.split(/(?<=\.)\s/);
  return (
    <Band id="about" title={`About ${a.name}`} lesson={sentences[0]} note={`from=1 to=3 · placement="${placement}" · clockwise=${cw}`}>
      <GoldenGrid from={1} to={3} placement={placement} clockwise={cw}>
        <GoldenBox {...x.boxProps("about")}>
          <Fact label="About" fitClass="fit--head" max={120}
            body={<><p className="box__body--short">{sentences.slice(0, 2).join(" ")}</p><p className="box__body--long">{sentences.slice(0, 4).join(" ")}</p></>}
            expand={{ group: x, slotKey: "about", title: w.title, full: <div className="cell__body"><p>{w.extract}</p><p className="cell__source">From Wikipedia, <a href={w.url}>{w.title}</a>, CC BY-SA 4.0.</p></div> }}>
            {a.name}
          </Fact>
        </GoldenBox>
        <GoldenBox><LinkBox label="Resources" href={w.url}>Read more on Wikipedia</LinkBox></GoldenBox>
        <GoldenBox><LinkBox label="Trade" href="#trade">Buy, sell or convert {a.symbol}</LinkBox></GoldenBox>
      </GoldenGrid>
    </Band>
  );
}

/** Earn: the rewards rate for each stakeable asset. */
export function StakeBand() {
  const v = useViewport();
  const [placement, cw] = orient(v, ["top", false], ["left", false]);
  const held = Object.fromEntries(HOLDINGS.map((h) => [h.symbol, h]));
  return (
    <Band id="stake" title="Rewards rates" lesson="Indicative annual rates for staking each asset, net of the exchange's commission, as the networks have paid them recently; rates change with each network's conditions and are not promised. Rewards accrue to the balance and show in Transactions." note={noteFor(v, 5, placement, cw)}>
      <Grids placement={placement} cw={cw} split={v !== "desktop"} boxes={STAKING.map((s) => {
          const h = held[s.symbol];
          return (
            <GoldenBox key={s.symbol}>
              <StatCard label={`${ASSETS[s.symbol].name} · ${s.symbol}`} value={`${s.apy.toFixed(1)}%`} spoken={`${ASSETS[s.symbol].name}, ${s.apy.toFixed(1)} percent a year`}
                body={<p>{h?.staked ? `${qty(h.staked, s.symbol)} staked, about ${usd(h.staked * ASSETS[s.symbol].price * s.apy / 100)} a year at today's price. ` : ""}Unstaking: {s.lockup.toLowerCase()}. {s.min}.</p>} />
            </GoldenBox>
          );
        })} />
    </Band>
  );
}

export { assetHref };
