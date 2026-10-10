import { useState, type FormEvent } from "react";
import { ASSETS, SYMBOLS, usd, pct, qty, units, changePct24 } from "../data";
import { positions, totals, TRANSACTIONS, CASH, STAKING } from "../portfolio";
import { Sparkline } from "./charts";
import { assetHref } from "./Page";
import { rangeChange } from "../data";

/**
 * The flat modules the signed-in reference places between its grids: the
 * Buy / Sell / Convert panel, the subscription and recurring-buy
 * promotions, the transactions list, the assets table. Lists and forms
 * stay lists and forms. The exchange is fictional; nothing here executes.
 */
export function TradePanel({ symbol = "BTC" }: { symbol?: string }) {
  const [mode, setMode] = useState<"Buy" | "Sell" | "Convert">("Buy");
  const [sym, setSym] = useState(symbol);
  const [amount, setAmount] = useState("100");
  const [previewed, setPreviewed] = useState(false);
  const a = ASSETS[sym];
  const n = Math.max(0, parseFloat(amount) || 0);
  const fee = Math.max(0.99, n * 0.0149);
  const gets = n > fee ? (n - fee) / a.price : 0;
  const onSubmit = (e: FormEvent) => { e.preventDefault(); setPreviewed(true); };
  return (
    <section className="panel" id="trade" aria-labelledby="trade-title">
      <h2 id="trade-title" className="visually-hidden">Trade</h2>
      <div className="panel__tabs" role="tablist" aria-label="Order type">
        {(["Buy", "Sell", "Convert"] as const).map((m) => <button key={m} type="button" role="tab" aria-selected={m === mode} className="tab tab--panel" onClick={() => { setMode(m); setPreviewed(false); }}>{m}</button>)}
      </div>
      <form className="order" onSubmit={onSubmit} aria-describedby="order-note">
        <label className="order__amount">
          <span className="order__label">{mode === "Sell" ? "Sell" : "Spend"}</span>
          <span className="order__input"><span className="order__cur" aria-hidden="true">$</span><input inputMode="decimal" value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^\d.]/g, "")); setPreviewed(false); }} aria-label={`Amount in US dollars to ${mode.toLowerCase()}`} /></span>
          <span className="order__quick">{["25", "100", "500", "1000"].map((q) => <button key={q} type="button" onClick={() => { setAmount(q); setPreviewed(false); }}>${q}</button>)}</span>
        </label>
        <label className="order__asset">
          <span className="order__label">{mode === "Convert" ? "To" : "Asset"}</span>
          <select value={sym} onChange={(e) => { setSym(e.target.value); setPreviewed(false); }}>{SYMBOLS.map((s) => <option key={s} value={s}>{ASSETS[s].name} ({s})</option>)}</select>
        </label>
        <dl className="order__sum">
          <div><dt>{sym} price</dt><dd>{usd(a.price)}</dd></div>
          <div><dt>Fee</dt><dd>{n ? usd(fee) : "—"}</dd></div>
          <div><dt>{mode === "Sell" ? "You receive" : "You get"}</dt><dd>{n ? (mode === "Sell" ? usd(n - fee) : qty(gets, sym)) : "—"}</dd></div>
          <div><dt>Pay with</dt><dd>{mode === "Convert" ? "USDC balance" : `USDC balance · ${usd(CASH)}`}</dd></div>
        </dl>
        <button type="submit" className="btn btn--primary btn--wide">{previewed ? `${mode} ${qty(gets, sym)}` : `Preview ${mode.toLowerCase()}`}</button>
        <p id="order-note" className="note" aria-live="polite">{previewed ? "A preview only: this is a layout study and no order is placed." : "Orders here are not real; the panel is part of a layout study."}</p>
      </form>
    </section>
  );
}

export function Promos() {
  return (
    <section className="promos" aria-label="Offers">
      <article className="promo">
        <p className="promo__kicker">GIFbase One</p>
        <h2 className="promo__title">Zero trading fees, boosted rewards</h2>
        <p className="promo__pitch">A subscription for people who trade often: no fee on buys and sells up to $10,000 a month, a higher rate on USDC balances, and priority support. {usd(29.99)} a month after a thirty-day trial.</p>
        <button type="button" className="btn">Start the trial</button>
        <p className="note">A fictional subscription for a layout study; the button does nothing.</p>
      </article>
      <article className="promo">
        <p className="promo__kicker">Recurring buys</p>
        <h2 className="promo__title">Buy a little every week</h2>
        <p className="promo__pitch">Set an amount and a day and the purchase repeats, whatever the price. The three recent Bitcoin buys in Transactions are a $1,000 weekly order.</p>
        <button type="button" className="btn btn--ghost">Set up a recurring buy</button>
      </article>
      <article className="promo">
        <p className="promo__kicker">Earn</p>
        <h2 className="promo__title">Stake what you hold</h2>
        <p className="promo__pitch">Ethereum and Solana in this account are staked and earning; Cardano, Polkadot and Avalanche can be. Rates are on the Earn page.</p>
        <a className="btn btn--ghost" href="./earn.html">See rewards rates</a>
      </article>
    </section>
  );
}

export function TransactionsList({ limit, title = "Recent transactions" }: { limit?: number; title?: string }) {
  const rows = limit ? TRANSACTIONS.slice(0, limit) : TRANSACTIONS;
  return (
    <section className="list-band" id="transactions" aria-labelledby="tx-title">
      <div className="band__row"><h2 id="tx-title" className="band__title">{title}</h2>{limit && <a className="band__aside" href="./transactions.html">All transactions</a>}</div>
      <ul className="list">
        {rows.map((t, i) => (
          <li key={i} className="tx">
            <span className={`tx__kind tx__kind--${t.kind.toLowerCase()}`} aria-hidden="true">{t.kind[0]}</span>
            <span className="tx__main"><strong>{t.kind} {ASSETS[t.symbol]?.name ?? t.symbol}</strong><span className="tx__sub">{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}{t.note ? ` · ${t.note}` : ""}</span></span>
            <span className="tx__amt"><strong>{t.kind === "Sell" || t.kind === "Send" ? "−" : "+"}{qty(t.qty, t.symbol)}</strong><span className="tx__sub">{usd(t.usd)}</span></span>
          </li>
        ))}
      </ul>
      <p className="note">Transactions are invented for the study and are not a record of anyone's account.</p>
    </section>
  );
}

export function AssetsTable() {
  const pos = positions();
  const t = totals();
  return (
    <section className="list-band" aria-labelledby="holdings-title">
      <h2 id="holdings-title" className="band__title">Your assets</h2>
      <table className="table">
        <thead><tr><th scope="col">Asset</th><th scope="col">Balance</th><th scope="col">Price</th><th scope="col">24h</th><th scope="col">Allocation</th><th scope="col">All time</th></tr></thead>
        <tbody>
          {pos.map((p) => (
            <tr key={p.symbol}>
              <th scope="row"><a href={assetHref(p.symbol)}>{p.name}</a> <span className="muted">{p.symbol}{p.staked ? " · staked" : ""}</span></th>
              <td><strong>{usd(p.value)}</strong><br /><span className="muted">{qty(p.qty, p.symbol)}</span></td>
              <td>{usd(p.price)}</td>
              <td className={changePct24(ASSETS[p.symbol]) >= 0 ? "is-up" : "is-down"}>{pct(changePct24(ASSETS[p.symbol]))}</td>
              <td>{p.share.toFixed(1)}%</td>
              <td className={p.gain >= 0 ? "is-up" : "is-down"}>{usd(p.gain, { sign: true })}<br /><span className="muted">{pct(p.gainPct, 1)}</span></td>
            </tr>
          ))}
          <tr><th scope="row">USDC <span className="muted">cash</span></th><td><strong>{usd(CASH)}</strong></td><td>$1.00</td><td>—</td><td>{t.cashShare.toFixed(1)}%</td><td>—</td></tr>
        </tbody>
      </table>
    </section>
  );
}

export function PricesTable() {
  const rows = SYMBOLS.map((s) => ASSETS[s]).sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
  return (
    <section className="list-band" aria-labelledby="prices-title">
      <h2 id="prices-title" className="band__title">All assets</h2>
      <table className="table">
        <thead><tr><th scope="col">#</th><th scope="col">Asset</th><th scope="col">Price</th><th scope="col">24h</th><th scope="col">Market cap</th><th scope="col">Volume (24h)</th><th scope="col">Week</th></tr></thead>
        <tbody>
          {rows.map((a, i) => {
            const spark = a.series["1W"] ?? [];
            return (
              <tr key={a.symbol} id={a.symbol}>
                <td className="muted">{i + 1}</td>
                <th scope="row"><a href={assetHref(a.symbol)}>{a.name}</a> <span className="muted">{a.symbol}</span></th>
                <td>{usd(a.price)}</td>
                <td className={changePct24(a) >= 0 ? "is-up" : "is-down"}>{pct(changePct24(a))}</td>
                <td>{a.marketCap ? usd(a.marketCap, { compact: true }) : "—"}</td>
                <td>{units(a.volume24)} {a.symbol}</td>
                <td className="table__spark"><Sparkline pts={spark} up={rangeChange(spark).abs >= 0} label={`${a.name}, past week`} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export function StakingNotes() {
  return (
    <section className="list-band" aria-labelledby="staking-title">
      <h2 id="staking-title" className="band__title">How staking works here</h2>
      <ul className="list list--plain">
        <li><strong>What it is.</strong> Proof-of-stake networks pay holders who lock their coins to help validate transactions. The exchange runs the validators; you keep ownership of the coins.</li>
        <li><strong>Rates.</strong> The figures above are what the networks have paid recently, net of a 25% commission on rewards. They move with network conditions and are not guaranteed.</li>
        <li><strong>Unstaking.</strong> Each network sets its own waiting period, from none to several weeks; coins cannot be sold while they wait.</li>
        <li><strong>Risk.</strong> Staked coins carry the price risk of the asset, and a validator penalty ("slashing") can reduce a position. The exchange covers slashing caused by its own validators.</li>
        <li><strong>Tax.</strong> Rewards are generally income when received; the Transactions page lists each one with its value that day.</li>
      </ul>
      <p className="note">Describes a fictional exchange for a layout study. Nothing here is advice. {STAKING.length} assets are listed on the Earn page.</p>
    </section>
  );
}
