import { mkdir, writeFile } from "node:fs/promises";
import { products } from "../src/data/products.ts";

const origin = "https://visuals.gripgrab.com";
const queue = [{ url: origin + "/gripgrab_media", depth: 0 }];
const visited = new Set();
const images = [];
const pages = [];
const decode = (s) =>
  s.replaceAll("&amp;", "&").replaceAll("&#39;", "'").replaceAll("&quot;", '"');
while (queue.length && visited.size < 70) {
  const { url, depth } = queue.shift();
  if (visited.has(url)) continue;
  visited.add(url);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const html = await response.text();
    pages.push({ url, status: response.status });
    if (response.status === 429) break;
    if (!response.ok) continue;
    for (const m of html.matchAll(/<img\b([^>]+)>/gi)) {
      const caption = decode(m[1].match(/alt="([^"]*)"/i)?.[1] ?? "");
      const src = m[1].match(/src="([^"]*)"/i)?.[1];
      if (caption && src?.startsWith("/img/"))
        images.push({
          caption,
          original: new URL(src, origin).href,
          source: url,
        });
    }
    if (depth < 3) {
      for (const m of html.matchAll(
        /<a\b[^>]*class="pv-inner"[^>]*href="([^"]+)"/gi,
      )) {
        const path = decode(m[1]);
        if (
          path.startsWith("/") &&
          !path.startsWith("/img/") &&
          !/\/h[0-9a-f]+$/i.test(path)
        )
          queue.push({ url: new URL(path, origin).href, depth: depth + 1 });
      }
    }
  } catch (e) {
    pages.push({ url, error: e.message });
  }
}
await mkdir("research/raw", { recursive: true });
await writeFile(
  "research/raw/exact-press-photos.json",
  JSON.stringify({ pages, images }, null, 2),
);
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const matches = products
  .filter((p) => p.brand === "GripGrab")
  .map((p) => ({
    id: p.id,
    name: p.name,
    candidates: images
      .filter((i) => norm(i.caption).includes(norm(p.name)))
      .slice(0, 5),
  }));
console.log(
  JSON.stringify(
    { pages: pages.length, images: images.length, matches },
    null,
    2,
  ),
);
