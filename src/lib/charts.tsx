import type { Point } from "../data";
import { usd } from "../data";

/**
 * The figures: a price line, a sparkline and an allocation ring, drawn as
 * inline SVG from the data in src/data, in the page's own inks. Each one
 * carries a label that says what it shows, since the shape alone does not.
 */
function path(pts: Point[], w: number, h: number, pad = 2) {
  if (pts.length < 2) return { d: "", area: "", lo: 0, hi: 0 };
  const cs = pts.map((p) => p.c);
  const lo = Math.min(...cs), hi = Math.max(...cs);
  const span = hi - lo || 1;
  const x = (i: number) => pad + (i / (pts.length - 1)) * (w - pad * 2);
  const y = (c: number) => pad + (1 - (c - lo) / span) * (h - pad * 2);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(2)} ${y(p.c).toFixed(2)}`).join(" ");
  const area = `${d} L${x(pts.length - 1).toFixed(2)} ${h} L${x(0).toFixed(2)} ${h} Z`;
  return { d, area, lo, hi };
}

export function LineChart({ pts, label, up, grid = true }: { pts: Point[]; label: string; up: boolean; grid?: boolean }) {
  const w = 600, h = 300;
  const { d, area, lo, hi } = path(pts, w, h, 6);
  const tone = up ? "var(--up)" : "var(--down)";
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label={label}>
      {grid && [0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} className="chart__grid" />)}
      <path d={area} fill={tone} opacity="0.12" />
      <path d={d} fill="none" stroke={tone} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <text x="6" y="16" className="chart__tick">{usd(hi)}</text>
      <text x="6" y={h - 8} className="chart__tick">{usd(lo)}</text>
    </svg>
  );
}

export function Sparkline({ pts, up, label }: { pts: Point[]; up: boolean; label: string }) {
  const w = 120, h = 40;
  const { d } = path(pts, w, h, 2);
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <path d={d} fill="none" stroke={up ? "var(--up)" : "var(--down)"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Allocation ring: one arc per position, cash last, the largest share printed in the middle. */
export function Donut({ parts, label, centre, sub }: { parts: { name: string; share: number; tone: string }[]; label: string; centre: string; sub: string }) {
  const r = 42, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg className="donut" viewBox="0 0 120 120" role="img" aria-label={label}>
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--line)" strokeWidth="14" />
      {parts.map((p) => {
        const len = (p.share / 100) * c;
        const el = <circle key={p.name} cx="60" cy="60" r={r} fill="none" stroke={p.tone} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />;
        offset += len;
        return el;
      })}
      <text x="60" y="58" textAnchor="middle" className="donut__centre">{centre}</text>
      <text x="60" y="74" textAnchor="middle" className="donut__sub">{sub}</text>
    </svg>
  );
}

export const TONES = ["var(--blue)", "var(--t2)", "var(--t3)", "var(--t4)", "var(--t5)", "var(--muted)"];
