import { readFile, writeFile } from "node:fs/promises";
import { products } from "../src/data/products.ts";

const catalogue = JSON.parse(
  await readFile("research/raw/shop-image-candidates.json", "utf8"),
);
const browser = JSON.parse(
  await readFile("research/raw/browser-product-photos.json", "utf8"),
);
const old = JSON.parse(await readFile("src/data/photos.json", "utf8"));
const overrides = JSON.parse(
  await readFile("research/exact-photo-overrides.json", "utf8"),
);
const photos = {};
for (const p of products) {
  const evidence = browser.find((e) => e.id === p.id);
  const api = catalogue.find((e) => e.id === p.id);
  const structured = api?.ld?.find((e) => e["@type"] === "Product");
  const override = overrides[p.id];
  const candidate = evidence?.images?.find((i) =>
    /\.(?:jpg|jpeg|png|webp|avif)(?:\?|$)/i.test(i.src),
  );
  const structuredImage = Array.isArray(structured?.image)
    ? structured.image[0]
    : structured?.image;
  const original =
    override?.original ??
    (p.shop === "Strauss" ? structuredImage : null) ??
    candidate?.src ??
    api?.image ??
    structuredImage;
  if (!original || /placeholder|Bild-folgt|favicon/i.test(original))
    throw new Error("Missing exact photo: " + p.id);
  let remote = original;
  if (remote.includes("contents.mediadecathlon.com/")) {
    const u = new URL(remote);
    u.searchParams.set("f", "512x0");
    u.searchParams.set("quality", "70");
    remote = u.href;
  }
  if (remote.includes("cdn.shopify.com/")) {
    const u = new URL(remote);
    u.searchParams.set("width", "512");
    remote = u.href;
  }
  if (remote.includes("asset.action.com/"))
    remote = remote.replace("/w_1080/", "/w_512/");
  // Keep four already licensed packshots of the same model; replace the historical MT900 photo.
  const local = old[p.id]?.source.includes("visuals.gripgrab.com")
    ? old[p.id]
    : null;
  photos[p.id] = {
    ...(local ?? {}),
    delivery: local ? "local-press" : "official-embed",
    ...(local ? {} : { remote }),
    alt:
      local?.alt ??
      override?.alt ??
      candidate?.alt ??
      `${p.brand} ${p.name}, Original-Produktfoto`,
    credit:
      local?.credit ??
      override?.credit ??
      `Foto: ${p.brand === "GripGrab" ? "GripGrab" : p.shop}`,
    source: local?.source ?? override?.source ?? p.url,
    productUrl: p.url,
    original: local?.original ?? original,
    reference: override?.reference ?? api?.sku ?? p.url,
    sourceTitle:
      override?.sourceTitle ??
      evidence?.heading ??
      structured?.name ??
      api?.sourceTitle ??
      api?.title,
    permission:
      local?.permission ??
      "Direkte Einbettung des frei erreichbaren Originalbildes vom offiziellen Hersteller-/Händlerserver; keine lokale Kopie und keine Behauptung einer erteilten Bildlizenz. Keine Umgehung von Einbettungssperren.",
    variant:
      local?.variant ??
      (structured?.color
        ? `Gezeigte Farbe: ${structured.color}.`
        : "Gezeigte Variante aus der Hauptgalerie der exakt verlinkten Produktseite; andere Farben und Größen im Shop prüfen."),
    checked: "2026-10-12",
  };
}
await writeFile("src/data/photos.json", JSON.stringify(photos, null, 2) + "\n");
console.log(
  JSON.stringify({
    products: products.length,
    photos: Object.keys(photos).length,
    local: Object.values(photos).filter((p) => p.delivery === "local-press")
      .length,
    remote: Object.values(photos).filter((p) => p.delivery === "official-embed")
      .length,
  }),
);
