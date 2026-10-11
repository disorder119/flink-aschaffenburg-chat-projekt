import { writeFile } from "node:fs/promises";
const url = "https://disorder119.github.io/flink-aschaffenburg-chat-projekt/";
const index = await fetch(url, { signal: AbortSignal.timeout(20000) });
const html = await index.text();
if (!index.ok) throw new Error(`Live index HTTP ${index.status}`);
const resources = [
  ...new Set(
    [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css|svg))"/g)].map(
      (m) => new URL(m[1], url).href,
    ),
  ),
];
const results = await Promise.all(
  resources.map(async (url) => {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const bytes = await response.arrayBuffer();
    return { url, status: response.status, bytes: bytes.byteLength };
  }),
);
if (results.some((r) => r.status !== 200))
  throw new Error("A production resource is not reachable");
const report = {
  checkedAt: new Date().toISOString(),
  url,
  indexStatus: index.status,
  https: true,
  resources: results,
  note: "HTTP asset check only. Check GitHub Actions separately; this script does not infer workflow status, browser rendering or product availability.",
};
await writeFile("qa/live-assets.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
