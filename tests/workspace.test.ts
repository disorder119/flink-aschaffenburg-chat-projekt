import { test } from "node:test";
import assert from "node:assert/strict";
import { products } from "../src/data/products.ts";
import {
  workspaceViewOf,
  currentProduct,
  adjacentProduct,
} from "../src/lib/workspace.ts";
test("workspace hash routes share the fixed studio, information pages remain accessible", () => {
  assert.equal(workspaceViewOf(""), "products");
  assert.equal(workspaceViewOf("ausruestung"), "products");
  assert.equal(workspaceViewOf("filter"), "filters");
  assert.equal(workspaceViewOf("outfit"), "outfit");
  assert.equal(workspaceViewOf("merkliste"), "favorites");
  assert.equal(workspaceViewOf("sets"), "kits");
  for (const route of [
    "wissen",
    "methodik",
    "impressum",
    "datenschutz",
    "unknown",
    "constructor",
    "toString",
    "__proto__",
  ])
    assert.equal(workspaceViewOf(route), null);
});
test("selection survives favorite updates and safely falls back when filters remove a product", () => {
  const list = products.slice(0, 4);
  assert.equal(currentProduct(list, list[2].id)?.id, list[2].id);
  assert.equal(currentProduct(list.slice(0, 2), list[2].id)?.id, list[0].id);
  assert.equal(currentProduct([], "missing"), null);
  assert.equal(currentProduct(list, "missing")?.id, list[0].id);
});
test("tap browsing stays within the result set, including empty and single-item results", () => {
  const list = products.slice(0, 4);
  assert.equal(adjacentProduct(list, list[0].id, -1)?.id, list[0].id);
  assert.equal(adjacentProduct(list, list[0].id, 1)?.id, list[1].id);
  assert.equal(adjacentProduct(list, list[3].id, 1)?.id, list[3].id);
  assert.equal(adjacentProduct(list, list[3].id, -1)?.id, list[2].id);
  assert.equal(adjacentProduct([list[0]], list[0].id, 1)?.id, list[0].id);
  assert.equal(adjacentProduct([], "", 1), null);
});
