import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Page } from "../lib/Page";
import { useFontsReady } from "../lib/fonts";
import "../styles.css";
import { LearnBand } from "../bands/bands";

function App() {
  useFontsReady(["700 1em Inter", "500 1em Inter"]);
  return (
    <Page current="learn.html" title="Learn" standfirst="Short accounts of the ideas behind the assets here, from Wikipedia, with the sources linked.">
      <LearnBand id="learn-basics" title="The ground" keys={[["blockchain", "What a blockchain is"], ["BTC", "What is Bitcoin?"], ["ETH", "What is Ethereum?"]]} lesson="The ground: the ledger, and the two networks most of this account is in. Each is a Wikipedia summary that opens to its full text and source." />
      <LearnBand id="learn-further" title="Further" flip keys={[["staking", "How staking pays"], ["stablecoin", "What a stablecoin is"], ["defi", "What DeFi is"]]} lesson="Three ideas the Earn page, the cash balance and the Trade page rest on." />
    </Page>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
