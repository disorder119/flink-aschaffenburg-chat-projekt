import { mkdir, writeFile, readFile } from "node:fs/promises";
import { products } from "../src/data/products.ts";

const results = [];
await mkdir("research/raw", { recursive: true });
const gripResponse = await fetch(
  "https://www.gripgrab.com/products.json?limit=250",
  { signal: AbortSignal.timeout(20000) },
);
const grip = await gripResponse.json();
await writeFile(
  "research/raw/gripgrab-images-current.json",
  JSON.stringify(grip, null, 2),
);
for (const p of products.filter((p) => p.brand === "GripGrab")) {
  const match = grip.products?.find((x) => p.url.endsWith("/" + x.handle));
  results.push({
    id: p.id,
    name: p.name,
    url: p.url,
    status: gripResponse.status,
    sourceTitle: match?.title,
    shopifyId: match?.id,
    sku: match?.variants?.[0]?.sku,
    image: match?.images?.[0]?.src,
    imageAlt: match?.images?.[0]?.alt,
    images: match?.images
      ?.slice(0, 3)
      .map((i) => ({ src: i.src, alt: i.alt, variants: i.variant_ids })),
    method: "official-public-catalogue",
  });
}
const remaining = products.filter((p) => p.brand !== "GripGrab");
for (let i = 0; i < remaining.length; i += 3) {
  const batch = await Promise.all(
    remaining.slice(i, i + 3).map(async (p) => {
      try {
        const r = await fetch(p.url, { signal: AbortSignal.timeout(20000) });
        const html = await r.text();
        await writeFile(`research/raw/photo-${p.id}.html`, html);
        const title = html
          .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
          ?.trim();
        const image =
          html.match(
            /<meta[^>]*(?:property|name)=["']og:image["'][^>]*content=["']([^"']+)/i,
          )?.[1] ??
          html.match(
            /<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']og:image/i,
          )?.[1];
        const ld = [
          ...html.matchAll(
            /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
          ),
        ].flatMap((m) => {
          try {
            return [JSON.parse(m[1])];
          } catch {
            return [];
          }
        });
        return {
          id: p.id,
          name: p.name,
          url: p.url,
          finalUrl: r.url,
          status: r.status,
          title,
          image: image?.replaceAll("&amp;", "&"),
          ld,
        };
      } catch (e) {
        return { id: p.id, name: p.name, url: p.url, error: e.message };
      }
    }),
  );
  results.push(...batch);
}
await writeFile(
  "research/raw/shop-image-candidates.json",
  JSON.stringify(results, null, 2),
);
console.log(
  JSON.stringify(
    results.map(({ ld, images, ...r }) => r),
    null,
    2,
  ),
);
