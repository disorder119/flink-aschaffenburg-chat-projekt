import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
const base = "https://disorder119.github.io/flink-aschaffenburg-chat-projekt/";
const photos = JSON.parse(await readFile("src/data/photos.json", "utf8"));
if (!process.argv[2]) throw new Error("Pass a freshly checked GitHub workflow JSON path.");
const workflow = JSON.parse(await readFile(process.argv[2], "utf8"));
const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (workflow.headSha !== head) throw new Error("Workflow is not for the current commit.");
if (workflow.status !== "completed" || workflow.conclusion !== "success")
  throw new Error("Workflow not confirmed successful");
const localIndex = await readFile("dist/index.html", "utf8");
const remote = await fetch(base, { signal: AbortSignal.timeout(20000) });
const html = await remote.text();
if (!remote.ok) throw new Error("Live index HTTP " + remote.status);
const expectedAssets = [
  ...localIndex.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g),
].map((m) => m[1]);
if (expectedAssets.some((asset) => !html.includes(asset)))
  throw new Error("Live HTML does not reference current build assets");
const sha = (body) => createHash("sha256").update(body).digest("hex");
const queue = Object.entries(photos);
const results = [];
async function checkPhotos() {
  while (queue.length) {
    const [id, p] = queue.shift();
    const url =
      p.delivery === "official-embed"
        ? p.remote
        : base + "product-images/" + p.file;
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const body = Buffer.from(await r.arrayBuffer());
    const identical =
      p.delivery === "official-embed"
        ? null
        : sha(body) === sha(await readFile("public/product-images/" + p.file));
    if (
      !r.ok ||
      !r.headers.get("content-type")?.startsWith("image/") ||
      identical === false
    )
      throw new Error(
        `Photo ${id}: live verification failed, HTTP ${r.status}`,
      );
    results.push({
      id,
      url,
      status: r.status,
      bytes: body.length,
      mime: r.headers.get("content-type"),
      matchesLocalFile: identical,
    });
  }
}
await Promise.all(Array.from({ length: 4 }, checkPhotos));
const report = {
  checkedAt: new Date().toISOString(),
  url: base,
  https: true,
  indexStatus: remote.status,
  buildAssetsMatch: true,
  workflow: {
    url: workflow.url,
    commit: workflow.headSha,
    status: workflow.status,
    conclusion: workflow.conclusion,
    jobs: workflow.jobs.map((j) => ({
      name: j.name,
      conclusion: j.conclusion,
    })),
  },
  photos: results,
  note: "Browser rendering separately documented in EXACT-PHOTOS-2026-10-12.md. External photos may later change or become unavailable.",
};
await writeFile(
  process.argv[3] ?? "qa/screenshots/exact-photo-live.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify({url:base,indexStatus:remote.status,buildAssetsMatch:true,commit:head,workflow:workflow.conclusion,photos:results.length,passed:results.filter(p=>p.status===200).length}, null, 2));
