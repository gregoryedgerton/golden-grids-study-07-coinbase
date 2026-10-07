import market from "./data/market.json";

/**
 * The market data behind every number on the page, fetched by
 * captures/data.py from Coinbase's public Exchange API (prices, candles,
 * 24-hour stats), CoinGecko (market capitalisation, supply, all-time high)
 * and Wikipedia (the asset summaries). It is a snapshot: `meta.asOf` is
 * the time of the newest five-minute candle, and the page says so.
 */
export interface Point { t: number; c: number; v?: number }
export type Range = "1D" | "1W" | "1M" | "1Y" | "ALL";
export interface Wiki { title: string; url: string; extract: string; revision?: string; timestamp?: string }
export interface Asset {
  symbol: string; name: string; product: string; price: number; asOf: number;
  open24: number; high24: number; low24: number; volume24: number; volume30d: number;
  marketCap: number | null; supply: number | null; maxSupply: number | null; ath: number | null; athDate: string; rank: number | null;
  series: Partial<Record<Range, Point[]>>; wiki: Wiki | null;
}

export const ASSETS = market.assets as unknown as Record<string, Asset>;
export const META = market.meta as { fetched: string; asOf: number; usdc: { price: number; marketCap: number } };
export const LEARN = market.learn as Record<string, Wiki>;
export const SYMBOLS = Object.keys(ASSETS);

/** Assets with a page of their own; the file name is the page. */
export const PAGES: Record<string, string> = { BTC: "bitcoin", ETH: "ethereum", SOL: "solana", XRP: "xrp" };

export const asOfDate = new Date(META.asOf * 1000);

export function change24(a: Asset) { return a.price - a.open24; }
export function changePct24(a: Asset) { return ((a.price - a.open24) / a.open24) * 100; }

/** Money, as the reference prints it: two decimals above a dollar, more below. */
export function usd(n: number, opts: { compact?: boolean; sign?: boolean } = {}) {
  const sign = opts.sign && n > 0 ? "+" : "";
  if (opts.compact && Math.abs(n) >= 1e6) {
    const units: [number, string][] = [[1e12, "T"], [1e9, "B"], [1e6, "M"]];
    const [u, s] = units.find(([u]) => Math.abs(n) >= u)!;
    return `${sign}$${(n / u).toFixed(2)}${s}`;
  }
  const abs = Math.abs(n);
  const digits = abs >= 1 ? 2 : abs >= 0.01 ? 4 : 6;
  return `${sign}${n < 0 ? "-" : ""}$${abs.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}
export function pct(n: number, digits = 2) { return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`; }
export function qty(n: number, symbol: string) {
  const digits = n >= 1000 ? 0 : n >= 1 ? 4 : 6;
  return `${n.toLocaleString("en-US", { maximumFractionDigits: digits })} ${symbol}`;
}
export function units(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(0);
}
export function when(t: number) {
  return new Date(t * 1000).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" });
}
export function day(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** Change over a range: first close of the series to the last. */
export function rangeChange(pts: Point[]) {
  if (pts.length < 2) return { abs: 0, pct: 0 };
  const a = pts[0].c, b = pts[pts.length - 1].c;
  return { abs: b - a, pct: ((b - a) / a) * 100 };
}
