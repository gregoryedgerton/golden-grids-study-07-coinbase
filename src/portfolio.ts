import { ASSETS, META, type Point, type Range } from "./data";

/**
 * The account. Everything here is FICTIONAL: a demonstration portfolio for
 * a layout study of a signed-in exchange, valued at real prices. The
 * quantities, cost bases, transactions and staking positions are invented
 * and belong to no one. Nothing can be bought, sold or moved from this
 * page, and the page says so.
 */
export const ACCOUNT = { name: "Greg", initial: "G", since: "2021", cashSymbol: "USDC" };

export interface Holding { symbol: string; qty: number; cost: number; staked?: number }
export const HOLDINGS: Holding[] = [
  { symbol: "BTC", qty: 0.4215, cost: 31420.0 },
  { symbol: "ETH", qty: 3.08, cost: 6980.5, staked: 2.0 },
  { symbol: "SOL", qty: 41.5, cost: 4150.0, staked: 41.5 },
  { symbol: "XRP", qty: 1850, cost: 1110.0 },
  { symbol: "LINK", qty: 120, cost: 1740.0 },
];
export const CASH = 2340.55;

/** Rewards rates shown on the Earn page. Indicative, not an offer. */
export const STAKING: { symbol: string; apy: number; lockup: string; min: string }[] = [
  { symbol: "ETH", apy: 2.1, lockup: "Unstaking takes days to weeks, set by the network", min: "No minimum" },
  { symbol: "SOL", apy: 5.4, lockup: "Two to three days", min: "No minimum" },
  { symbol: "ADA", apy: 2.3, lockup: "None", min: "No minimum" },
  { symbol: "DOT", apy: 10.8, lockup: "About 28 days", min: "1 DOT" },
  { symbol: "AVAX", apy: 4.6, lockup: "About 14 days", min: "No minimum" },
];

export interface Tx { date: string; kind: "Buy" | "Sell" | "Convert" | "Reward" | "Deposit" | "Send"; symbol: string; qty: number; usd: number; note?: string }
export const TRANSACTIONS: Tx[] = [
  { date: "2026-10-06", kind: "Reward", symbol: "SOL", qty: 0.0613, usd: 7.19, note: "Staking reward" },
  { date: "2026-10-05", kind: "Reward", symbol: "ETH", qty: 0.00115, usd: 2.96, note: "Staking reward" },
  { date: "2026-10-03", kind: "Buy", symbol: "BTC", qty: 0.0115, usd: 1000.0, note: "Recurring buy" },
  { date: "2026-10-01", kind: "Deposit", symbol: "USDC", qty: 1500, usd: 1500.0, note: "From bank" },
  { date: "2026-09-26", kind: "Buy", symbol: "BTC", qty: 0.0092, usd: 1000.0, note: "Recurring buy" },
  { date: "2026-09-22", kind: "Convert", symbol: "LINK", qty: 20, usd: 290.4, note: "From USDC" },
  { date: "2026-09-19", kind: "Buy", symbol: "XRP", qty: 350, usd: 528.5 },
  { date: "2026-09-12", kind: "Sell", symbol: "ETH", qty: 0.25, usd: 712.3 },
  { date: "2026-09-05", kind: "Buy", symbol: "BTC", qty: 0.0098, usd: 1000.0, note: "Recurring buy" },
  { date: "2026-08-29", kind: "Send", symbol: "BTC", qty: 0.02, usd: 2210.4, note: "To hardware wallet" },
];

export interface Position extends Holding { name: string; price: number; value: number; gain: number; gainPct: number; share: number; change24: number }

export function positions(): Position[] {
  const rows = HOLDINGS.map((h) => {
    const a = ASSETS[h.symbol];
    const value = h.qty * a.price;
    return { ...h, name: a.name, price: a.price, value, gain: value - h.cost, gainPct: ((value - h.cost) / h.cost) * 100, share: 0, change24: h.qty * (a.price - a.open24) };
  });
  const total = rows.reduce((s, r) => s + r.value, 0) + CASH;
  for (const r of rows) r.share = (r.value / total) * 100;
  return rows.sort((a, b) => b.value - a.value);
}

export function totals() {
  const pos = positions();
  const invested = pos.reduce((s, r) => s + r.value, 0);
  const balance = invested + CASH;
  const change24 = pos.reduce((s, r) => s + r.change24, 0);
  const cost = pos.reduce((s, r) => s + r.cost, 0);
  const open = invested - change24 + CASH;
  return { balance, invested, cash: CASH, cashShare: (CASH / balance) * 100, change24, change24Pct: (change24 / open) * 100, cost, gain: invested - cost, gainPct: ((invested - cost) / cost) * 100 };
}

/**
 * The balance over a range, valuing today's holdings at each point's
 * prices: the series the reference draws under "Your balance", with the
 * simplification that quantities are held constant. Points align on the
 * BTC series' timestamps; other assets take their nearest earlier close.
 */
export function balanceSeries(range: Range): Point[] {
  const base = ASSETS.BTC.series[range] ?? [];
  const cursors: Record<string, number> = {};
  return base.map((p) => {
    let v = CASH;
    for (const h of HOLDINGS) {
      const s = ASSETS[h.symbol].series[range] ?? [];
      let i = cursors[h.symbol] ?? 0;
      while (i + 1 < s.length && s[i + 1].t <= p.t) i++;
      cursors[h.symbol] = i;
      v += h.qty * (s[i]?.c ?? ASSETS[h.symbol].price);
    }
    return { t: p.t, c: v };
  });
}

export const SNAPSHOT_NOTE = `Prices as of ${new Date(META.asOf * 1000).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" })}.`;
