import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Page } from "../lib/Page";
import { useFontsReady } from "../lib/fonts";
import "../styles.css";
import { StakeBand } from "../bands/bands";
import { StakingNotes } from "../lib/modules";

function App() {
  useFontsReady(["700 1em Inter", "500 1em Inter"]);
  return (
    <Page current="earn.html" title="Earn" standfirst="Rewards for staking the proof-of-stake assets you hold: the rate, the waiting period to unstake, and what the account earns now.">
      <StakeBand />
      <StakingNotes />
    </Page>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
