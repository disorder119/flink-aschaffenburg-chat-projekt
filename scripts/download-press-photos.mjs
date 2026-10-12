import { readFile, mkdir, writeFile } from "node:fs/promises";
const entries = JSON.parse(await readFile("src/data/photos.json", "utf8"));
await mkdir("public/product-images", { recursive: true });
const report = [];
for (const [id, photo] of Object.entries(entries)) {
  const r = await fetch(photo.original, {
    signal: AbortSignal.timeout(25000),
    headers: { Accept: "image/jpeg" },
  });
  const body = Buffer.from(await r.arrayBuffer());
  if (!r.ok || !r.headers.get("content-type")?.startsWith("image/"))
    throw new Error(`Image ${id}: HTTP ${r.status}`);
  if (body.length > 250000)
    throw new Error(`Image ${id} exceeds mobile budget: ${body.length}`);
  await writeFile("public/product-images/" + photo.file, body);
  report.push({
    id,
    source: photo.source,
    original: photo.original,
    bytes: body.length,
    mime: r.headers.get("content-type"),
    checked: "2026-10-12",
  });
}
await writeFile("qa/photo-check.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
