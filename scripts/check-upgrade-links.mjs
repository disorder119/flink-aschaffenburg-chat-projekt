import { build } from "esbuild";
import { writeFile } from "node:fs/promises";
await build({
  entryPoints: ["src/data/products.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "qa/catalogue-check.mjs",
});
const { products } = await import("../qa/catalogue-check.mjs");
const selected = products.filter(
  (p) =>
    p.id.includes("pogies") ||
    [
      "gg-trailblazer-flat-pedal-mtb-shoe-covers",
      "gg-arctic-2-waterproof-deep-winter-road-shoe-covers",
      "gg-explr-waterproof-lightweight-jacket",
    ].includes(p.id),
);
const results = await Promise.all(
  selected.map(async (p) => {
    try {
      const r = await fetch(p.url, { signal: AbortSignal.timeout(20000) });
      const body = await r.text();
      const blocked =
        [403, 429].includes(r.status) ||
        /Access Denied|captcha|Just a moment/i.test(body.slice(0, 30000));
      return {
        id: p.id,
        url: p.url,
        status: r.status,
        finalUrl: r.url,
        result: blocked
          ? "automated-access-blocked"
          : r.ok
            ? "http-ok"
            : "http-error",
      };
    } catch (e) {
      return {
        id: p.id,
        url: p.url,
        result: "not-verifiable",
        error: e.message,
      };
    }
  }),
);
await writeFile(
  "qa/upgrade-links.json",
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      results,
      note: "Alle fünf konkreten Modelle und Preise zusätzlich in offiziellen Produktseiten über die Web-Recherche geprüft. HTTP allein bestätigt weder Lagerbestand noch Preis.",
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(results, null, 2));
