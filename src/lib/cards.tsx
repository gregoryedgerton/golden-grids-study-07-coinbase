import { useState, type ReactNode } from "react";
import { Fit } from "./fit";
import { Fact } from "./boxes";
import type { ExpandGroup } from "./expand";
import { LineChart, Sparkline } from "./charts";
import { usd, pct, rangeChange, type Asset, type Point, type Range, type Wiki, changePct24 } from "../data";
import { assetHref } from "./Page";

/**
 * What goes inside a square. Only a direct GoldenBox counts as a GoldenGrid
 * child, so these return the INSIDE of the box and the band wraps each in
 * <GoldenBox>.
 *
 *   ChartBox  — the reference's balance or price header: a label, the
 *               number fitted to the square, the change over the range, the
 *               line, and the range tabs. State is the range.
 *   AssetCard — one asset: name, fitted price, 24-hour change, a sparkline;
 *               the whole square is a link to the asset's page.
 *   StatCard  — a market statistic: label, fitted figure, a line of context.
 *   LearnCard — a topic: fitted title, the opening of its summary, More for
 *               the whole summary and the source.
 */
export const RANGES: Range[] = ["1D", "1W", "1M", "1Y", "ALL"];

export function ChartBox({ label, series, value, name, tone }: { label: string; series: Partial<Record<Range, Point[]>>; value: number; name: string; tone?: string }) {
  const available = RANGES.filter((r) => (series[r]?.length ?? 0) > 1);
  const [range, setRange] = useState<Range>(available.includes("1D") ? "1D" : available[0]);
  const pts = series[range] ?? [];
  const ch = rangeChange(pts);
  const up = ch.abs >= 0;
  const spoken = `${name}: ${usd(value)}, ${up ? "up" : "down"} ${usd(Math.abs(ch.abs))} (${pct(ch.pct)}) over ${RANGE_WORDS[range]}`;
  return (
    <div className={`box box--chart${tone ? ` box--${tone}` : ""}`}>
      <p className="box__label">{label}</p>
      <div className="box__fit box__fit--num"><Fit as="p" className="fit--num" min={8} max={120} ariaLabel={spoken}>{usd(value)}</Fit></div>
      <p className={`box__change ${up ? "is-up" : "is-down"}`}><span className="box__arrow" aria-hidden="true">{up ? "▲" : "▼"}</span> {usd(Math.abs(ch.abs))} ({pct(ch.pct)}) <span className="box__range">{RANGE_WORDS[range]}</span></p>
      <div className="box__chart"><LineChart pts={pts} up={up} label={`${name} over ${RANGE_WORDS[range]}: from ${usd(pts[0]?.c ?? 0)} to ${usd(pts[pts.length - 1]?.c ?? 0)}`} /></div>
      <div className="tabs" role="tablist" aria-label="Range">
        {available.map((r) => <button key={r} type="button" role="tab" aria-selected={r === range} className="tab" onClick={() => setRange(r)}>{r}</button>)}
      </div>
    </div>
  );
}
const RANGE_WORDS: Record<Range, string> = { "1D": "the past day", "1W": "the past week", "1M": "the past month", "1Y": "the past year", "ALL": "all time" };

export function AssetCard({ a, holding }: { a: Asset; holding?: string }) {
  const ch = changePct24(a);
  const up = ch >= 0;
  const spark = a.series["1W"] ?? [];
  return (
    <a className="box box--asset" href={assetHref(a.symbol)} aria-label={`${a.name}, ${usd(a.price)}, ${pct(ch)} in 24 hours${holding ? `; you hold ${holding}` : ""}`}>
      <p className="box__label"><span className="box__name">{a.name}</span> <span className="box__sym">{a.symbol}</span></p>
      <div className="box__fit box__fit--num"><Fit as="p" className="fit--num" min={8} max={120} ariaLabel={usd(a.price)}>{usd(a.price)}</Fit></div>
      <p className={`box__change ${up ? "is-up" : "is-down"}`}><span className="box__arrow" aria-hidden="true">{up ? "▲" : "▼"}</span> {pct(ch)} <span className="box__range">24h</span>{holding && <span className="box__holding">{holding}</span>}</p>
      <div className="box__spark"><Sparkline pts={spark} up={rangeChange(spark).abs >= 0} label={`${a.name}, past week`} /></div>
    </a>
  );
}

export function StatCard({ label, value, body, long, tone, spoken, x, slotKey }: { label: string; value: string; body?: ReactNode; long?: ReactNode; tone?: string; spoken?: string; x?: ExpandGroup; slotKey?: string }) {
  return (
    <Fact
      label={label}
      fitClass="fit--num"
      max={120}
      tone={tone}
      spoken={spoken}
      body={body ? <><div className="box__body--short">{body}</div><div className="box__body--long">{body}{long}</div></> : undefined}
      expand={long && x && slotKey ? { group: x, slotKey, title: label, full: <div className="cell__body"><p className="cell__line">{value}</p>{body}{long}</div> } : undefined}
    >
      {value}
    </Fact>
  );
}

export function LearnCard({ w, title, x, slotKey }: { w: Wiki; title: string; x: ExpandGroup; slotKey: string }) {
  const first = w.extract.split(/(?<=\.)\s/)[0];
  return (
    <Fact
      label="Learn"
      fitClass="fit--head"
      max={120}
      body={<><p className="box__body--short">{first}</p><p className="box__body--long">{w.extract.split(/(?<=\.)\s/).slice(0, 3).join(" ")}</p></>}
      expand={{
        group: x, slotKey, title,
        full: <div className="cell__body"><p>{w.extract}</p><p className="cell__source">From Wikipedia, <a href={w.url}>{w.title}</a>, CC BY-SA 4.0.</p></div>,
      }}
    >
      {title}
    </Fact>
  );
}
