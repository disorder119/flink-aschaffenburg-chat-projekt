import { readFile, writeFile } from "node:fs/promises";
const photos = JSON.parse(await readFile("src/data/photos.json", "utf8"));
const queue = Object.entries(photos);
const results = [];
async function worker() {
  while (queue.length) {
    const [id, p] = queue.shift();
    const url =
      p.delivery === "official-embed"
        ? p.remote
        : "https://disorder119.github.io/flink-aschaffenburg-chat-projekt/product-images/" +
          p.file;
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
      const data = await r.arrayBuffer();
      results.push({
        id,
        url,
        status: r.status,
        mime: r.headers.get("content-type"),
        bytes: data.byteLength,
        cors: r.headers.get("access-control-allow-origin"),
        resourcePolicy: r.headers.get("cross-origin-resource-policy"),
        passed:
          r.ok &&
          r.headers.get("content-type")?.startsWith("image/") &&
          data.byteLength > 1000,
      });
    } catch (e) {
      results.push({ id, url, error: e.message, passed: false });
    }
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
const report = {
  checkedAt: new Date().toISOString(),
  count: results.length,
  passed: results.filter((r) => r.passed).length,
  failed: results.filter((r) => !r.passed),
  largest: results
    .toSorted((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0))
    .slice(0, 8),
  results,
};
await writeFile(
  process.argv[2] ?? "qa/exact-photo-check.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      count: report.count,
      passed: report.passed,
      failed: report.failed,
      largest: report.largest.map(
        ({ id, bytes, mime, cors, resourcePolicy }) => ({
          id,
          bytes,
          mime,
          cors,
          resourcePolicy,
        }),
      ),
    },
    null,
    2,
  ),
);
if (report.failed.length) process.exitCode = 1;
