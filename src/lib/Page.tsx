import type { ReactNode } from "react";
import { Tools } from "./tools";
import { StudyBanner, StudyDisclosure } from "./study";
import { ACCOUNT, SNAPSHOT_NOTE } from "../portfolio";
import { ASSETS, PAGES, SYMBOLS } from "../data";

/**
 * The signed-in shell, after the reference's: a left rail of sections at
 * desktop (a top bar and a bottom tab bar at phone width), a search field,
 * a Buy & sell control and the account. GIFbase is a fictional exchange;
 * the prices are real and the account is not.
 */
export const NAV: [string, string][] = [["index.html", "Home"], ["assets.html", "My assets"], ["trade.html", "Trade"], ["earn.html", "Earn"], ["transactions.html", "Transactions"], ["learn.html", "Learn"]];

export function Page({ current, title, standfirst, back, children }: { current: string; title: string; standfirst?: string; back?: { href: string; label: string }; children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#content">Skip to content</a>
      <StudyBanner />
      <Tools />
      <div className="app">
        <nav className="rail" aria-label="Sections">
          <a className="wordmark" href="./index.html"><span className="wordmark__dot" aria-hidden="true" />GIFbase</a>
          <ul>
            {NAV.map(([href, label]) => (
              <li key={href}>
                <a href={`./${href}`} aria-current={href === current ? "page" : undefined}><span className="rail__glyph" aria-hidden="true">{label[0]}</span>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="frame">
          <header className="topbar">
            <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="q" className="visually-hidden">Search assets</label>
              <input id="q" type="search" placeholder="Search for an asset" list="assets" autoComplete="off" />
              <datalist id="assets">{SYMBOLS.map((s) => <option key={s} value={ASSETS[s].name} />)}</datalist>
            </form>
            <a className="btn btn--primary topbar__buy" href="./trade.html#trade">Buy &amp; sell</a>
            <p className="account" aria-label={`Signed in as ${ACCOUNT.name}`}><span className="account__avatar" aria-hidden="true">{ACCOUNT.initial}</span><span className="account__name">{ACCOUNT.name}</span></p>
          </header>
          <main id="content">
            <header className="masthead">
              {back && <p className="masthead__back"><a href={back.href}><span aria-hidden="true">←</span> {back.label}</a></p>}
              <h1 className="masthead__title">{title}</h1>
              {standfirst && <p className="masthead__standfirst">{standfirst}</p>}
              <p className="masthead__asof">{SNAPSHOT_NOTE}</p>
            </header>
            {children}
          </main>
        </div>
      </div>
      <StudyDisclosure />
      <nav className="tabbar" aria-label="Sections, phone">
        {NAV.slice(0, 5).map(([href, label]) => <a key={href} href={`./${href}`} aria-current={href === current ? "page" : undefined}>{label}</a>)}
      </nav>
    </>
  );
}

export function assetHref(symbol: string) { return PAGES[symbol] ? `./${PAGES[symbol]}.html` : `./trade.html#${symbol}`; }
