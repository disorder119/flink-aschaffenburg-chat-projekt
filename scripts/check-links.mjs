import { readFile, writeFile, mkdir } from "node:fs/promises";
import { build } from "esbuild";
await mkdir("qa", { recursive: true });
await build({
  entryPoints: ["src/data/products.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "qa/catalogue-check.mjs",
});
const { products } = await import("../qa/catalogue-check.mjs");
const pending = [...products];
const results = [];
async function worker() {
  while (pending.length) {
    const p = pending.shift();
    try {
      const r = await fetch(p.url, {
        signal: AbortSignal.timeout(20000),
        headers: { "User-Agent": "RiderKit-LinkCheck/1.0" },
      });
      const body = await r.text();
      const blocked =
        r.status === 403 ||
        r.status === 429 ||
        /Just a moment|Access Denied|captcha/i.test(body.slice(0, 30000));
      results.push({
        id: p.id,
        url: p.url,
        status: r.status,
        finalUrl: r.url,
        result: blocked
          ? "automated-access-blocked"
          : r.ok
            ? "http-ok"
            : "http-error",
        checkedAt: new Date().toISOString(),
      });
    } catch (e) {
      results.push({
        id: p.id,
        url: p.url,
        result: "not-verifiable",
        error: e.message,
        checkedAt: new Date().toISOString(),
      });
    }
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
results.sort((a, b) => a.id.localeCompare(b.id));
await writeFile("qa/link-check.json", JSON.stringify(results, null, 2) + "\n");
const summary = Object.fromEntries(
  [...new Set(results.map((r) => r.result))].map((result) => [
    result,
    results.filter((r) => r.result === result).length,
  ]),
);
console.log(
  JSON.stringify(
    {
      total: results.length,
      summary,
      failures: results.filter(
        (r) => r.result === "http-error" || r.result === "not-verifiable",
      ),
    },
    null,
    2,
  ),
);
// HTTP success alone does not verify stock, price, or semantic identity. Manual checks documented separately.
