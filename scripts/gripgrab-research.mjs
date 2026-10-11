import { mkdir, writeFile } from "node:fs/promises";
const r = await fetch("https://www.gripgrab.com/products.json?limit=250", {
  signal: AbortSignal.timeout(20000),
});
if (!r.ok) throw new Error(`GripGrab returned ${r.status}`);
const data = await r.json();
await mkdir("research/raw", { recursive: true });
await writeFile(
  "research/raw/gripgrab-products.json",
  JSON.stringify(data, null, 2),
);
const products = data.products.filter((p) =>
  /winter|waterproof|windproof|merino|balaclava|thermal|thermo|neoprene/i.test(
    p.title,
  ),
);
console.log(
  JSON.stringify(
    products.map((p) => ({
      name: p.title,
      url: `https://www.gripgrab.com/products/${p.handle}`,
      prices: [...new Set(p.variants.map((v) => v.price))],
      available: p.variants.some((v) => v.available),
      description: p.body_html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 2200),
    })),
    null,
    2,
  ),
);
