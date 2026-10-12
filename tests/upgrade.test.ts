import { test } from "node:test";
import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { products } from "../src/data/products.ts";
import { photoFor, productPhotos, photoSrc } from "../src/data/photos.ts";
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
test("every recommendation has an exact-model photo and documented source", () => {
  assert.equal(Object.keys(productPhotos).length, products.length);
  const originals = new Set<string>();
  for (const [id, photo] of Object.entries(productPhotos)) {
    const product = products.find((p) => p.id === id)!;
    assert.ok(product, id);
    assert.equal(photo.productUrl, product.url, id);
    assert.ok(photoFor(id));
    assert.ok(
      photo.alt &&
        photo.credit &&
        photo.variant &&
        photo.permission &&
        photo.reference &&
        photo.sourceTitle,
    );
    assert.ok(!originals.has(photo.original), `Reused photo: ${id}`);
    originals.add(photo.original);
    if (photo.delivery === "local-press") {
      assert.match(photo.source, /^https:\/\/visuals\.gripgrab\.com\//);
      const bytes = statSync("public/product-images/" + photo.file).size;
      assert.ok(bytes > 1000 && bytes <= 250000);
      assert.equal(
        photoSrc(photo, "/project/"),
        `/project/product-images/${photo.file}`,
      );
    } else {
      assert.equal(photo.delivery, "official-embed");
      assert.match(
        photo.source,
        /^https:\/\/(www\.(gripgrab|decathlon|action|strauss|lidl|vaude|bike-discount|endurasport|theheatcompany)\.(com|de)|bike\.shimano\.com)\//,
      );
      assert.ok(photo.remote);
      assert.match(
        photo.remote!,
        /^https:\/\/(contents\.mediadecathlon\.com|cdn\.shopify\.com|asset\.action\.com|cdn\.strauss\.com|www\.lidl\.de|www\.vaude\.com|www\.endurasport\.com|dassets\.shimano\.com|d3m1gwy11l97op\.cloudfront\.net)\//,
      );
      assert.equal(photoSrc(photo, "/project/"), photo.remote);
      assert.doesNotMatch(
        photo.remote!,
        /placeholder|favicon|doubleclick|tracking/i,
      );
    }
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
test("City 940 and City 900 photos use the exact distinct retailer variants", () => {
  assert.match(productPhotos["dec-city940-pogies"].productUrl, /8797364/);
  assert.match(productPhotos["dec-city940-pogies"].original, /p3100863/);
  assert.match(productPhotos["dec-city900-pogies"].productUrl, /8735752/);
  assert.match(productPhotos["dec-city900-pogies"].original, /p3222422/);
  assert.notEqual(
    photoSrc(productPhotos["dec-city940-pogies"], "/"),
    photoSrc(productPhotos["dec-city900-pogies"], "/"),
  );
});
