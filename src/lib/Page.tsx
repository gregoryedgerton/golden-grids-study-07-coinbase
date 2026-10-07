import type { ReactNode } from "react";
import { Tools } from "./tools";
import { ACCOUNT, SNAPSHOT_NOTE } from "../portfolio";
import { ASSETS, PAGES, SYMBOLS } from "../data";

/**
 * The signed-in shell, after the reference's: a left rail of sections at
 * desktop (a top bar and a bottom tab bar at phone width), a search field,
 * a Buy & sell control and the account. GIFcommit is a fictional exchange;
 * the prices are real and the account is not.
 */
export const NAV: [string, string][] = [["index.html", "Home"], ["assets.html", "My assets"], ["trade.html", "Trade"], ["earn.html", "Earn"], ["transactions.html", "Transactions"], ["learn.html", "Learn"]];

export function Page({ current, title, standfirst, children }: { current: string; title: string; standfirst?: string; children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#content">Skip to content</a>
      <Tools />
      <div className="app">
        <nav className="rail" aria-label="Sections">
          <a className="wordmark" href="./index.html"><span className="wordmark__dot" aria-hidden="true" />GIFcommit</a>
          <ul>
            {NAV.map(([href, label]) => (
              <li key={href}>
                <a href={`./${href}`} aria-current={href === current ? "page" : undefined}><span className="rail__glyph" aria-hidden="true">{label[0]}</span>{label}</a>
              </li>
            ))}
          </ul>
          <p className="rail__foot">A layout study. Nothing here is advice, an offer, or an account.</p>
        </nav>
        <div className="frame">
          <header className="topbar">
            <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="q" className="visually-hidden">Search assets</label>
              <input id="q" type="search" placeholder="Search for an asset" list="assets" autoComplete="off" />
              <datalist id="assets">{SYMBOLS.map((s) => <option key={s} value={ASSETS[s].name} />)}</datalist>
            </form>
            <a className="btn btn--primary topbar__buy" href="#trade">Buy &amp; sell</a>
            <p className="account" aria-label={`Signed in as ${ACCOUNT.name}`}><span className="account__avatar" aria-hidden="true">{ACCOUNT.initial}</span><span className="account__name">{ACCOUNT.name}</span></p>
          </header>
          <main id="content">
            <header className="masthead">
              <h1 className="masthead__title">{title}</h1>
              {standfirst && <p className="masthead__standfirst">{standfirst}</p>}
              <p className="masthead__asof">{SNAPSHOT_NOTE}</p>
            </header>
            {children}
          </main>
          <footer className="colophon">
            <p>
              A layout study of the signed-in Coinbase web app, built from its known structure without a capture
              (the public pages sit behind a bot check the study did not cross). GIFcommit is a fictional exchange
              and the account on this page is invented: its holdings, cost bases, transactions and rewards belong to
              no one, and nothing can be bought, sold, staked or sent from here. Prices and candles are from the{" "}
              <a href="https://docs.cdp.coinbase.com/exchange/reference">Coinbase Exchange public API</a>; market
              capitalisation, supply and all-time highs from <a href="https://www.coingecko.com/">CoinGecko</a>; asset
              and topic summaries from Wikipedia under{" "}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>, linked where they appear.
              Nothing from Coinbase's pages, marks or copy is reproduced. Not investment advice. Built with{" "}
              <a href="https://github.com/gregoryedgerton/golden-grids">Golden Grids</a> ·{" "}
              <a href="https://www.npmjs.com/package/@gifcommit/golden-grids">npm</a> ·{" "}
              <a href="https://gregoryedgerton.github.io/golden-grids/">generator</a>.
            </p>
          </footer>
        </div>
      </div>
      <nav className="tabbar" aria-label="Sections, phone">
        {NAV.slice(0, 5).map(([href, label]) => <a key={href} href={`./${href}`} aria-current={href === current ? "page" : undefined}>{label}</a>)}
      </nav>
    </>
  );
}

export function assetHref(symbol: string) { return PAGES[symbol] ? `./${PAGES[symbol]}.html` : `./trade.html#${symbol}`; }
