import { test } from "node:test";
import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { products } from "../src/data/products.ts";
import { photoFor, productPhotos } from "../src/data/photos.ts";
import { filteredProducts, compareAllowed } from "../src/lib/logic.ts";
import { renderingPolicy } from "../src/lib/experience.ts";
import type { Filters } from "../src/types.ts";
const base: Filters = {
  region: "all",
  tier: "all",
  maxPrice: null,
  search: "",
  weather: [],
  vehicle: "bike",
  shift: "medium",
  sort: "price",
  favoritesOnly: false,
};
test("weak devices and reduced motion never automatically load WebGL", () => {
  for (const hints of [
    { saveData: true },
    { effectiveType: "2g" },
    { memory: 4 },
    { cores: 4 },
    { coarse: true },
    { reducedMotion: true },
  ])
    assert.equal(renderingPolicy(hints).auto3d, false);
  assert.equal(renderingPolicy({ memory: 8, cores: 8 }).auto3d, true);
  assert.equal(renderingPolicy({ reducedMotion: true }).animate, false);
  assert.equal(renderingPolicy({}).maxFps, 24);
});
test("pogies have their own group and are excluded for scooters", () => {
  const pogies = filteredProducts(products, { ...base, group: "pogie" }, []);
  assert.equal(pogies.length, 2);
  assert.ok(
    pogies.every((p) => p.compatibility === "flatbar" && p.region === "haende"),
  );
  assert.equal(
    filteredProducts(
      products,
      { ...base, group: "pogie", vehicle: "scooter" },
      [],
    ).length,
    0,
  );
  assert.ok(
    compareAllowed(
      [pogies[0]],
      products.find((p) => p.group === "glove")!,
    ),
  );
});
test("every real photo matches a sourced model, has a local file and provenance", () => {
  for (const [id, photo] of Object.entries(productPhotos)) {
    assert.ok(
      products.some((p) => p.id === id),
      id,
    );
    assert.ok(photoFor(id));
    assert.ok(photo.alt && photo.credit && photo.variant && photo.permission);
    assert.match(
      photo.source,
      /^https:\/\/(einblicke\.decathlon\.de\/presse|visuals\.gripgrab\.com\/)/,
    );
    const bytes = statSync("public/product-images/" + photo.file).size;
    assert.ok(bytes > 1000 && bytes <= 250000);
  }
  const list = filteredProducts(products, { ...base, photoOnly: true }, []);
  assert.equal(list.length, Object.keys(productPhotos).length);
  assert.ok(list.every((p) => photoFor(p.id)));
  assert.ok(
    filteredProducts(
      products,
      { ...base, photoOnly: true, maxPrice: 50 },
      [],
    ).every((p) => p.price! <= 50),
  );
});
