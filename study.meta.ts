import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

/**
 * Every page of a study says what it is in its metadata, from one source.
 * `src/study.json` holds the study's number, the reference's name, the
 * one-sentence notice and a label for each HTML entry; this plugin writes
 * them into every entry's <head>, in development and in the build:
 *
 *   <title>      {Page} · {Reference} · Golden Grids layout study {NN}
 *   description  the notice, word for word, which is also the sticky banner
 *   og:*         the same title and notice
 *   icon         /favicon.svg, or the file `icon` names in study.json
 *
 * Whatever title, description or icon an entry's HTML already carries is
 * replaced, so the entries cannot drift from each other or from the banner.
 */
interface StudyMeta { number: string; name: string; notice: string; pages?: Record<string, string>; icon?: string }
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function studyTitle(study: StudyMeta, file: string): string {
  const page = study.pages?.[file];
  return [page && page !== study.name ? page : null, study.name, `Golden Grids layout study ${study.number}`].filter(Boolean).join(" · ");
}

export function studyMeta(): Plugin {
  const study: StudyMeta = JSON.parse(readFileSync(new URL("./src/study.json", import.meta.url), "utf8"));
  return {
    name: "study-meta",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        const file = ctx.path.replace(/^.*\//, "").replace(/\.html$/, "") || "index";
        const title = studyTitle(study, file);
        const cleaned = html
          .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
          .replace(/<meta\s+name="description"[^>]*>\s*/gi, "")
          .replace(/<meta\s+property="og:(title|description|type|site_name)"[^>]*>\s*/gi, "")
          .replace(/<link\s+rel="icon"[^>]*>\s*/gi, "")
          .replace(/<!--\s*STUDY:[\s\S]*?-->\s*/g, "");
        const head = [
          `<title>${esc(title)}</title>`,
          `<meta name="description" content="${esc(study.notice)}" />`,
          `<meta property="og:title" content="${esc(title)}" />`,
          `<meta property="og:description" content="${esc(study.notice)}" />`,
          `<meta property="og:type" content="website" />`,
          `<meta property="og:site_name" content="Golden Grids layout studies" />`,
          study.icon
            ? `<link rel="icon" href="/${esc(study.icon)}" />`
            : `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`,
        ].join("\n    ");
        return cleaned.replace(/<\/head>/i, `    ${head}\n  </head>`);
      },
    },
  };
}
