import { readFile } from "node:fs/promises";
const { products } = JSON.parse(
  await readFile("research/raw/gripgrab-products.json", "utf8"),
);
const terms = process.argv.slice(2);
const selected = terms.length
  ? products.filter((p) => terms.some((t) => p.handle.includes(t)))
  : products.filter((p) =>
      /winter|waterproof|merino|balaclava|thermo/i.test(p.title),
    );
console.log(
  JSON.stringify(
    selected.map((p) => ({
      name: p.title,
      handle: p.handle,
      prices: [...new Set(p.variants.map((v) => v.price))],
      available: p.variants.some((v) => v.available),
      ...(terms.length
        ? {
            description: p.body_html
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " "),
          }
        : {}),
    })),
    null,
    2,
  ),
);
