import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Page } from "../lib/Page";
import { useFontsReady } from "../lib/fonts";
import "../styles.css";
import { AllocationBand } from "../bands/bands";
import { AssetsTable, Promos } from "../lib/modules";

function App() {
  useFontsReady(["700 1em Inter", "500 1em Inter"]);
  return (
    <Page current="assets.html" title="My assets" standfirst="Every position in the account, its share of the balance, and how it has done against what was paid for it.">
      <AllocationBand />
      <AssetsTable />
      <Promos />
    </Page>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
