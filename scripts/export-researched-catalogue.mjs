import { readFile, writeFile, mkdir } from "node:fs/promises";
const { products } = JSON.parse(
  await readFile("research/raw/gripgrab-products.json", "utf8"),
);
const handles = [
  "thermo-windproof-winter-headband",
  "aquashield-waterproof-cycling-cap",
  "merino-blend-lightweight-beanie",
  "belgian-style-thermal-windproof-winter-cycling-cap",
  "multifunctional-merino-neck-warmer",
  "thermal-winter-balaclava",
  "aviator-windproof-deep-winter-skull-cap",
  "skull-cap",
  "ride-2-windproof-winter-gloves",
  "ride-2-waterproof-winter-gloves",
  "ride-2-windproof-spring-autumn-gloves",
  "polaris-2-waterproof-winter-gloves",
  "nordic-2-windproof-deep-winter-lobster-gloves",
  "waterproof-knitted-winter-gloves",
  "primavera-2-merino-spring-autumn-gloves",
  "merino-wool-liner-gloves",
  "pacr-winter-jacket",
  "ride-winter-jacket",
  "ride-waterproof-lightweight-jacket",
  "ride-winter-long-sleeve-base-layer",
  "merino-blend-thermal-long-sleeve-base-layer",
  "explr-waterproof-lightweight-pants",
  "arctic-2-waterproof-deep-winter-gravel-shoe-covers",
  "aquaseal-waterproof-cycling-gaiter",
  "alpine-merino-high-cut-winter-socks",
  "dryfoot-waterproof-everyday-shoe-covers-2",
  "thermo-sl-winter-socks",
  "merino-lined-waterproof-winter-socks",
  "racethermo-waterproof-winter-road-shoe-covers",
  "merino-winter-sock",
];
const selected = Object.fromEntries(
  handles.map((handle) => {
    const p = products.find((p) => p.handle === handle);
    if (!p) throw new Error(handle);
    return [
      handle,
      {
        name: p.title,
        price: Math.min(...p.variants.map((v) => Number(v.price))),
        from: new Set(p.variants.map((v) => v.price)).size > 1,
        url: `https://www.gripgrab.com/products/${handle}`,
        checked: "2026-10-11",
        currency: "EUR",
        available: p.variants.some((v) => v.available),
        source: "https://www.gripgrab.com/products.json?limit=250",
      },
    ];
  }),
);
await mkdir("src/data", { recursive: true });
await writeFile(
  "src/data/gripgrab-source.json",
  JSON.stringify(selected, null, 2) + "\n",
);
console.log(
  `Exported ${handles.length} individually selected, researched models`,
);
