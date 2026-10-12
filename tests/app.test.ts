import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { products } from "../src/data/products.ts";
import { extras } from "../src/data/extras.ts";
import { filteredProducts, scoreOf } from "../src/lib/logic.ts";
import { addProductToOutfit } from "../src/lib/outfit.ts";
import { translateWith } from "../src/i18n/core.ts";
import { workerSource } from "../src/lib/worker-source.ts";
import type { Filters } from "../src/types.ts";
const json = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const filters: Filters = {
  region: "all",
  tier: "all",
  maxPrice: null,
  search: "",
  weather: [],
  vehicle: "bike",
  shift: "medium",
  sort: "price",
  favoritesOnly: false,
  supplementsOnly: true,
};
test("extras retain genuine pack prices, remain unscored and do not promise rain protection", () => {
  assert.equal(extras.length, 10);
  assert.equal(filteredProducts(products, filters, []).length, 10);
  assert.equal(
    filteredProducts(products, { ...filters, group: "warmer" }, []).length,
    8,
  );
  assert.equal(
    filteredProducts(products, { ...filters, maxPrice: 1 }, []).length,
    2,
  );
  assert.equal(
    products.find((p) => p.id === "action-thermofect-warmer")?.price,
    0.99,
  );
  assert.equal(products.find((p) => p.id === "heat-hand-warmer")?.price, 1.99);
  for (const p of extras) {
    assert.equal(p.supplement, true);
    assert.equal(scoreOf(p).score, null);
  }
  assert.ok(
    !filteredProducts(products, { ...filters, weather: ["heavy"] }, []).some(
      (p) => p.group === "warmer",
    ),
  );
});
test("warmers supplement empty and filled outfits without replacing shoes or gloves", () => {
  const warmer = extras.find((p) => p.region === "fuesse")!;
  const empty = { primary: {}, extras: [] };
  const added = addProductToOutfit(empty, warmer);
  assert.deepEqual(added.primary, {});
  assert.deepEqual(added.extras, [warmer.id]);
  const existing = { primary: { fuesse: "vaude-minaki" }, extras: [] };
  const result = addProductToOutfit(existing, warmer);
  assert.deepEqual(result.primary, existing.primary);
  assert.strictEqual(addProductToOutfit(result, warmer), result);
});
test("all published product facts and audited UI keys exist in all three translations", () => {
  const keys = [
    ...json("src/i18n/source-human.json"),
    ...json("src/i18n/source-products.json"),
  ];
  for (const lang of ["en", "ar", "hi"]) {
    const dictionary = json(`src/i18n/locales/${lang}.json`);
    for (const key of keys) {
      assert.ok(dictionary[key], `${lang}: ${key}`);
      const placeholders = (key.match(/\{[^}]+\}/g) ?? []).sort();
      assert.deepEqual(
        (dictionary[key].match(/\{[^}]+\}/g) ?? []).sort(),
        placeholders,
        `${lang}: placeholders ${key}`,
      );
    }
    assert.equal(
      translateWith("Artikel {0} von {1}", dictionary, {
        "0": 2,
        "1": 10,
      }).includes("{"),
      false,
    );
  }
});
test("Home Screen manifest uses portable scope and appropriately sized PNG icons", () => {
  const manifest = json("public/manifest.webmanifest");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.scope, "./");
  assert.ok(manifest.start_url.startsWith("./#"));
  for (const icon of manifest.icons) {
    const bytes = readFileSync("public/" + icon.src.replace(/^\.\//, ""));
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.equal(
      `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`,
      icon.sizes,
    );
  }
  assert.match(
    readFileSync("index.html", "utf8"),
    /apple-mobile-web-app-capable.*yes/,
  );
});
test("offline worker serves stored shell and isolates other Pages projects and external photos", async () => {
  const handlers: Record<string, Function> = {};
  const deleted: string[] = [];
  const stored = new Map<string, unknown>([
    ["index.html", { body: "offline shell" }],
    [
      "https://example.github.io/rider/assets/app.js",
      { body: "cached module" },
    ],
  ]);
  let installed: string[] = [];
  let claimed = false;
  const cache = {
    addAll: async (urls: string[]) => {
      installed = urls;
    },
    match: async (
      key: string | { url: string },
      options: { ignoreVary: boolean },
    ) =>
      options?.ignoreVary
        ? stored.get(typeof key === "string" ? key : key.url)
        : undefined,
    put: async (key: string, value: unknown) => {
      stored.set(key, value);
    },
  };
  runInNewContext(workerSource("v2", ["./", "index.html"]), {
    URL,
    self: {
      registration: { scope: "https://example.github.io/rider/" },
      location: { origin: "https://example.github.io" },
      clients: {
        claim: async () => {
          claimed = true;
        },
      },
      addEventListener: (name: string, fn: Function) => {
        handlers[name] = fn;
      },
    },
    caches: {
      open: async () => cache,
      keys: async () => [
        "flink-ab-shell::/rider/::v1",
        "flink-ab-shell::/rider/::v2",
        "flink-ab-shell::/other/::v1",
        "another-app",
      ],
      delete: async (key: string) => {
        deleted.push(key);
      },
    },
    fetch: async () => {
      throw new Error("offline");
    },
  });
  let waiting: Promise<unknown> | undefined;
  handlers.install({
    waitUntil: (p: Promise<unknown>) => {
      waiting = p;
    },
  });
  await waiting;
  assert.deepEqual([...installed], ["./", "index.html"]);
  handlers.activate({
    waitUntil: (p: Promise<unknown>) => {
      waiting = p;
    },
  });
  await waiting;
  assert.deepEqual(deleted, ["flink-ab-shell::/rider/::v1"]);
  assert.equal(claimed, true);
  let response: Promise<unknown> | undefined;
  const respondWith = (p: Promise<unknown>) => {
    response = p;
  };
  handlers.fetch({
    request: {
      method: "GET",
      mode: "navigate",
      url: "https://example.github.io/rider/",
    },
    respondWith,
  });
  assert.deepEqual(await response, { body: "offline shell" });
  handlers.fetch({
    request: {
      method: "GET",
      url: "https://example.github.io/rider/assets/app.js",
    },
    respondWith,
  });
  assert.deepEqual(await response, { body: "cached module" });
  response = undefined;
  handlers.fetch({
    request: { method: "GET", url: "https://shop.example/photo.jpg" },
    respondWith,
  });
  assert.equal(response, undefined);
  handlers.fetch({
    request: {
      method: "GET",
      url: "https://example.github.io/other/index.html",
    },
    respondWith,
  });
  assert.equal(response, undefined);
});
