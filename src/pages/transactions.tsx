import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Page } from "../lib/Page";
import { useFontsReady } from "../lib/fonts";
import "../styles.css";
import { TransactionsList } from "../lib/modules";

function App() {
  useFontsReady(["700 1em Inter", "500 1em Inter"]);
  return (
    <Page current="transactions.html" title="Transactions" standfirst="Buys, sells, conversions, deposits, sends and staking rewards, newest first, each valued on the day.">
      <TransactionsList title="All transactions" />
    </Page>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
