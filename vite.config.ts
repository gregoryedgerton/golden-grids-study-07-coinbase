import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The Pages base path derives from the repository name so a fork never edits
// this file. GitHub Actions sets GITHUB_REPOSITORY="owner/repo"; a user or
// organisation site (owner.github.io) is served from the root instead.
// Locally the variable is unset and the app serves from "/".
function pagesBase(): string {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
  if (!repo || repo.endsWith(".github.io")) return "/";
  return `/${repo}/`;
}

// Several pages, no router: each HTML file is its own entry and links to the
// others with plain relative hrefs, as the reference's sections do.
const pages = ['index', 'assets', 'trade', 'earn', 'transactions', 'learn', 'bitcoin', 'ethereum', 'solana', 'xrp'];

export default defineConfig({
  base: pagesBase(),
  plugins: [react()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((p) => [p, resolve(__dirname, `${p}.html`)])),
    },
  },
});
