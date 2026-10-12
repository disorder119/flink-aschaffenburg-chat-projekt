import { test } from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/data/products.ts";
import { kits } from "../src/data/kits.ts";
import {
  compareAllowed,
  filteredProducts,
  scoreOf,
  totalOf,
  weights,
  regions,
  shoppingList,
} from "../src/lib/logic.ts";
import type { Filters, Product } from "../src/types.ts";
const base: Filters = {
  region: "all",
  tier: "all",
  maxPrice: null,
  search: "",
  weather: [],
  vehicle: "bike",
  shift: "medium",
  sort: "relevance",
  favoritesOnly: false,
};
test("catalogue has at least 45 distinct sourced models, complete cards and three tiers per region", () => {
  assert.ok(products.length >= 45);
  assert.equal(new Set(products.map((p) => p.id)).size, products.length);
  assert.equal(new Set(products.map((p) => p.url)).size, products.length);
  for (const p of products) {
    assert.match(p.url, /^https:\/\//);
    assert.equal(p.pros.length, 3, p.id);
    assert.ok(p.cons.length >= 2);
    assert.ok(p.material && p.use && p.waterNote && p.warmthNote);
    assert.ok(['2026-10-11','2026-10-12'].includes(p.checked));
    assert.ok(p.price === null || p.price > 0);
    assert.ok(!/[?&](awc|utm_|ref=|affiliate)/.test(p.url));
    if (p.shop === "Action") assert.ok(p.retailOnly);
  }
  for (const r of regions)
    for (const tier of ["budget", "value", "premium"])
      assert.ok(
        products.filter((p) => p.region === r.id && p.tier === tier).length >=
          3,
        `${r.id} ${tier}`,
      );
});
test("all category weights sum to 100 and uncertain products remain unscored", () => {
  for (const w of Object.values(weights))
    assert.equal(
      w.reduce<number>((a, b) => a + (b ?? 0), 0),
      100,
    );
  for (const p of products) {
    const s = scoreOf(p);
    if (s.score !== null) {
      assert.ok(s.coverage >= 80);
      assert.ok(s.score >= 0 && s.score <= 100);
      assert.equal(s.score % 5, 0);
    }
  }
  assert.equal(
    scoreOf(products.find((p) => p.id === "action-rain")!).score,
    null,
  );
  const sparse = {
    ...products[0],
    assessment: [5, null, null, null, null, null, null, null],
  } as Product;
  assert.equal(scoreOf(sparse).score, null);
});
test("heavy rain excludes DWR, unknown Action variants and plain layers", () => {
  const list = filteredProducts(products, { ...base, weather: ["heavy"] }, []);
  assert.ok(list.length > 0);
  assert.ok(list.every((p) => p.water === "waterproof"));
  assert.ok(!list.some((p) => p.id === "action-rain"));
  assert.ok(
    !list.some(
      (p) => p.id === "gg-nordic-2-windproof-deep-winter-lobster-gloves",
    ),
  );
});
test("compound rain/frost filter excludes mild-temperature EDR gloves", () => {
  const list = filteredProducts(
    products,
    { ...base, region: "haende", weather: ["heavy", "frost"] },
    [],
  );
  assert.ok(list.every((p) => p.warmth === 3 && p.water === "waterproof"));
  assert.ok(!list.some((p) => p.id === "dec-edr-gloves"));
  assert.ok(list.some((p) => p.id === "gg-polaris-2-waterproof-winter-gloves"));
});
test("exact price cap uses article/pack gross prices, excluding unknown values", () => {
  const list = filteredProducts(products, { ...base, maxPrice: 3 }, []);
  assert.ok(list.every((p) => p.price !== null && p.price <= 3));
  assert.ok(list.some((p) => p.id === "action-socks"));
  assert.ok(
    !filteredProducts(products, { ...base, maxPrice: 1 }, []).some(
      (p) => p.id === "action-socks",
    ),
  );
  assert.ok(
    !filteredProducts(products, { ...base, maxPrice: 1000 }, []).some(
      (p) => p.price === null,
    ),
  );
  const ordered = filteredProducts(
    [...products, { ...products[0], id: "unknown-price-fixture", price: null }],
    { ...base, sort: "price" },
    [],
  );
  assert.equal(ordered.at(-1)?.price, null);
  for (let i = 1; i < ordered.length; i++)
    assert.ok(
      (ordered[i - 1].price ?? Infinity) <= (ordered[i].price ?? Infinity),
    );
});
test("scooter removes pedal systems, searches include merchants and regions, favorites filter locally", () => {
  const scooter = filteredProducts(
    products,
    { ...base, vehicle: "scooter" },
    [],
  );
  assert.ok(scooter.every((p) => !p.compatibility && p.group !== "liner"));
  assert.ok(
    filteredProducts(products, { ...base, search: "Strauss" }, []).every((p) =>
      p.brand.includes("Strauss"),
    ),
  );
  assert.ok(
    filteredProducts(products, { ...base, search: "Hände" }, []).every(
      (p) => p.region === "haende",
    ),
  );
  assert.deepEqual(
    filteredProducts(products, { ...base, favoritesOnly: true }, [
      "action-socks",
    ]).map((p) => p.id),
    ["action-socks"],
  );
});
test("comparison limits distinct articles to three in same group and region", () => {
  const gloves = products.filter((p) => p.group === "glove");
  assert.equal(compareAllowed(gloves.slice(0, 2), gloves[2]), null);
  assert.ok(compareAllowed(gloves.slice(0, 3), gloves[3]));
  assert.ok(
    compareAllowed([gloves[0]], products.find((p) => p.group === "pants")!),
  );
  const torso = products.find(
    (p) => p.group === "base" && p.region === "oberkoerper",
  )!;
  const legs = products.find(
    (p) => p.group === "base" && p.region === "beine",
  )!;
  assert.ok(compareAllowed([torso], legs));
});
test("kits reference real region-correct products and count integer cents", () => {
  for (const kit of kits) {
    for (const r of regions) {
      const p = products.find((p) => p.id === kit.outfit.primary[r.id]);
      assert.ok(p);
      assert.equal(p.region, r.id);
    }
    const ids = [...Object.values(kit.outfit.primary), ...kit.outfit.extras];
    assert.equal(new Set(ids).size, ids.length);
    const selected = ids.map((id) => products.find((p) => p.id === id)!);
    assert.ok(selected.every(Boolean));
    assert.equal(
      totalOf(selected).amount,
      selected.reduce((sum, p) => sum + Math.round(p.price! * 100), 0) / 100,
    );
    assert.ok(totalOf(selected).complete);
  }
  const mixed = [products[0], { ...products[1], price: null }];
  assert.equal(totalOf(mixed).complete, false);
  assert.ok(shoppingList(mixed, (p) => p.url).includes("Bekannte Teilsumme"));
  assert.equal(
    totalOf([
      { ...products[0], price: 0.1 },
      { ...products[1], price: 0.2 },
    ]).amount,
    0.3,
  );
});
