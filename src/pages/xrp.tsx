import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Page } from "../lib/Page";
import { useFontsReady } from "../lib/fonts";
import "../styles.css";
import { PriceBand, StatsBand, AboutBand, WatchlistBand } from "../bands/bands";
import { TradePanel } from "../lib/modules";
import { ASSETS, usd, pct, changePct24 } from "../data";
const a = ASSETS.XRP;

function App() {
  useFontsReady(["700 1em Inter", "500 1em Inter"]);
  return (
    <Page current="trade.html" back={{ href: "./trade.html", label: "Back to Trade" }} title={`${a.name} (${a.symbol})`} standfirst={`${usd(a.price)}, ${pct(changePct24(a))} in the past twenty-four hours. Your position, the market, and what ${a.name} is.`}>
      <PriceBand a={a} />
      <TradePanel symbol="XRP" />
      <StatsBand a={a} />
      <AboutBand a={a} />
      <WatchlistBand id="similar" title="Also on GIFbase" symbols={["BTC","ETH","SOL","LTC","BCH","DOGE"]} lesson="Six other assets listed here, priced the same way; each opens its own page or its row on the Trade page." />
    </Page>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
